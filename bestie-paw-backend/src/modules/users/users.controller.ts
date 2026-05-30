import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess } from '../../utils/response';
import {
  changePassword,
  getCurrentUser,
  softDeleteUser,
  updateAvatar,
  updateCurrentUser
} from './users.service';
import { resolveFileUrl } from '../../middleware/upload';

const updateSchema = z.object({
  username: z.string().min(2).max(20).optional(),
  phone: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().regex(/^\d{11}$/).optional()
  )
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72)
});

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getCurrentUser(req.user!.userId);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateSchema.parse(req.body);
    const data = await updateCurrentUser(req.user!.userId, input);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const uploadAvatarHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return sendSuccess(res, { message: 'No file uploaded' });
    }

    const url = resolveFileUrl(req.file.filename);
    const data = await updateAvatar(req.user!.userId, url);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const changePasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const input = changePasswordSchema.parse(req.body);
    await changePassword(req.user!.userId, input.currentPassword, input.newPassword);
    return sendSuccess(res, { message: 'Password changed' });
  } catch (err) {
    return next(err);
  }
};

export const deleteMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await softDeleteUser(req.user!.userId);
    return sendSuccess(res, { message: 'Account scheduled for deletion' });
  } catch (err) {
    return next(err);
  }
};
