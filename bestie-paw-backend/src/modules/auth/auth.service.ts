import { prisma } from '../../utils/prisma';
import { hashValue, compareValue } from '../../utils/hash';
import {
  refreshTokenExpiresAt,
  signAccessToken,
  signPasswordResetToken,
  signRefreshToken,
  verifyPasswordResetToken,
  verifyRefreshToken
} from '../../utils/jwt';
import { sendPasswordResetEmail, sendVerificationEmail } from '../../utils/mailer';
import { AppError } from '../../middleware/errorHandler';
import { env } from '../../config/env';
import type {
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput
} from './auth.schema';

const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sanitizeUser = (user: {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
}) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  emailVerified: user.emailVerified
});

const storeRefreshToken = async (userId: string, token: string) => {
  const tokenHash = await hashValue(token);
  const expiresAt = refreshTokenExpiresAt();

  if (env.REFRESH_SINGLE_DEVICE) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  await prisma.refreshToken.create({
    data: {
      userId,
      token: tokenHash,
      expiresAt
    }
  });
};

const findRefreshTokenRecord = async (userId: string, token: string) => {
  const records = await prisma.refreshToken.findMany({
    where: { userId },
    include: { user: true }
  });
  const now = new Date();

  for (const record of records) {
    if (record.expiresAt < now) {
      await prisma.refreshToken.delete({ where: { id: record.id } });
      continue;
    }

    const match = await compareValue(token, record.token);
    if (match) {
      return record;
    }
  }

  return null;
};

export const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      OR: [{ email: input.email }, { username: input.username }]
    }
  });

  if (existing) {
    throw new AppError('CONFLICT', 'Email or username already exists', 409);
  }

  if (input.phone) {
    const phoneExists = await prisma.user.findUnique({ where: { phone: input.phone } });
    if (phoneExists) {
      throw new AppError('PHONE_TAKEN', '该手机号已被注册', 409);
    }
  }

  const passwordHash = await hashValue(input.password);
  const code = generateVerificationCode();
  const codeHash = await hashValue(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      phone: input.phone,
      passwordHash,
      emailVerificationCodeHash: codeHash,
      emailVerificationExpiresAt: expiresAt,
      termsAcceptedAt: new Date(),
      termsVersion: env.TERMS_VERSION
    }
  });

  await sendVerificationEmail(user.email, code);

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id });
  await storeRefreshToken(user.id, refreshToken);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findFirst({
    where: { email: input.email, deletedAt: null }
  });

  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', '邮箱或密码错误', 401);
  }

  if (user.loginLockedUntil && user.loginLockedUntil > new Date()) {
    const remaining = Math.ceil((user.loginLockedUntil.getTime() - Date.now()) / 60000);
    throw new AppError('ACCOUNT_LOCKED', `账号已暂时锁定，请 ${remaining} 分钟后再试`, 423);
  }

  const valid = await compareValue(input.password, user.passwordHash);
  if (!valid) {
    const failCount = user.loginFailCount + 1;
    const shouldLock = failCount >= 5;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginFailCount: failCount,
        loginLockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null
      }
    });
    throw new AppError('INVALID_CREDENTIALS', '邮箱或密码错误', 401);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { loginFailCount: 0, loginLockedUntil: null }
  });

  if (!user.emailVerified) {
    throw new AppError('EMAIL_NOT_VERIFIED', '请先验证邮箱后再登录', 403, 'resend_verification');
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id });
  await storeRefreshToken(user.id, refreshToken);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  let payload: { userId: string };

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (_err) {
    throw new AppError('INVALID_REFRESH_TOKEN', 'Token 无效或已过期', 401);
  }

  const record = await findRefreshTokenRecord(payload.userId, refreshToken);
  if (!record) {
    throw new AppError('INVALID_REFRESH_TOKEN', 'Token 无效或已过期', 401);
  }

  await prisma.refreshToken.delete({ where: { id: record.id } });

  const accessToken = signAccessToken({ userId: record.userId, email: record.user.email });
  const newRefreshToken = signRefreshToken({ userId: record.userId });
  await storeRefreshToken(record.userId, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (userId: string) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
};

export const verifyEmail = async (input: VerifyEmailInput) => {
  const user = await prisma.user.findFirst({
    where: { email: input.email, deletedAt: null }
  });

  if (!user || !user.emailVerificationCodeHash || !user.emailVerificationExpiresAt) {
    throw new AppError('INVALID_CODE', 'Invalid verification code', 400);
  }

  if (user.emailVerificationExpiresAt < new Date()) {
    throw new AppError('CODE_EXPIRED', 'Verification code expired', 400);
  }

  const match = await compareValue(input.code, user.emailVerificationCodeHash);
  if (!match) {
    throw new AppError('INVALID_CODE', 'Invalid verification code', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationCodeHash: null,
      emailVerificationExpiresAt: null
    }
  });
};

export const resendVerificationEmail = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null, emailVerified: false }
  });
  if (!user) return; // silent — don't leak whether email exists

  const code = generateVerificationCode();
  const codeHash = await hashValue(code);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationCodeHash: codeHash,
      emailVerificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
    }
  });

  await sendVerificationEmail(email, code);
};

export const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null }
  });

  if (!user) {
    return;
  }

  const token = signPasswordResetToken({ userId: user.id });
  await sendPasswordResetEmail(user.email, token);
};

export const resetPassword = async (input: ResetPasswordInput) => {
  const payload = verifyPasswordResetToken(input.token);
  const user = await prisma.user.findFirst({
    where: { id: payload.userId, deletedAt: null }
  });

  if (!user) {
    throw new AppError('UNAUTHORIZED', 'User not found', 401);
  }

  const passwordHash = await hashValue(input.password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });

  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
};
