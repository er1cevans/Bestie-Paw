import { Role } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import { compareValue, hashValue } from '../../utils/hash';
import { deleteUploadedFile } from '../../middleware/upload';

const sanitizeUser = (user: {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  emailVerified: boolean;
}) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  role: user.role,
  emailVerified: user.emailVerified
});

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null }
  });

  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }

  return sanitizeUser(user);
};

export const updateCurrentUser = async (
  userId: string,
  data: { username?: string; phone?: string }
) => {
  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: {
        username: data.username,
        deletedAt: null,
        NOT: { id: userId }
      }
    });

    if (existing) {
      throw new AppError('CONFLICT', 'Username already in use', 409);
    }
  }

  if (data.phone) {
    const phoneExists = await prisma.user.findFirst({
      where: { phone: data.phone, NOT: { id: userId }, deletedAt: null }
    });

    if (phoneExists) {
      throw new AppError('CONFLICT', '该手机号已被使用', 409);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data
  });

  return sanitizeUser(user);
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }

  const valid = await compareValue(currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError('INVALID_CREDENTIALS', '当前密码错误', 400);
  }

  const passwordHash = await hashValue(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  // Invalidate all sessions after a password change
  await prisma.refreshToken.deleteMany({ where: { userId } });
};

export const updateAvatar = async (userId: string, avatarUrl: string) => {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true }
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl }
  });

  if (existing?.avatarUrl && existing.avatarUrl !== avatarUrl) {
    deleteUploadedFile(existing.avatarUrl);
  }

  return sanitizeUser(user);
};

export const softDeleteUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() }
  });

  await prisma.refreshToken.deleteMany({ where: { userId } });
};
