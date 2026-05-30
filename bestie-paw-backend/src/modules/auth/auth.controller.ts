import { Request, Response, NextFunction } from 'express';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema
} from './auth.schema';
import {
  loginUser,
  refreshAccessToken,
  registerUser,
  requestPasswordReset,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
  logoutUser
} from './auth.service';
import { sendSuccess } from '../../utils/response';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await registerUser(input);
    return sendSuccess(res, result, 201);
  } catch (err) {
    return next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = refreshSchema.parse(req.body);
    const result = await refreshAccessToken(input.refreshToken);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendSuccess(res, { message: 'Logged out' });
    }

    await logoutUser(req.user.userId);
    return sendSuccess(res, { message: 'Logged out' });
  } catch (err) {
    return next(err);
  }
};

export const verifyEmailAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const input = verifyEmailSchema.parse(req.body);
    await verifyEmail(input);
    return sendSuccess(res, { message: 'Email verified' });
  } catch (err) {
    return next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = forgotPasswordSchema.parse(req.body);
    await requestPasswordReset(input.email);
    return sendSuccess(res, { message: 'If the account exists, an email was sent.' });
  } catch (err) {
    return next(err);
  }
};

export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const input = resendVerificationSchema.parse(req.body);
    await resendVerificationEmail(input.email);
    return sendSuccess(res, {
      message: 'If the account exists and is unverified, a new code was sent.'
    });
  } catch (err) {
    return next(err);
  }
};

export const resetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const input = resetPasswordSchema.parse(req.body);
    await resetPassword(input);
    return sendSuccess(res, { message: 'Password reset successful' });
  } catch (err) {
    return next(err);
  }
};
