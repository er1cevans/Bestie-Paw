import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AppError } from './errorHandler';

/**
 * Authorizes ADMIN-only routes. Must run *after* `authMiddleware`, which sets
 * `req.user`.
 *
 * Role is read fresh from the database rather than carried in the JWT: admin
 * write operations are infrequent, the DB read is the most reliable source of
 * truth, and a role change (grant/revoke) takes effect immediately instead of
 * waiting for the access token to expire.
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 'Missing access token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true }
    });

    if (!user || user.role !== Role.ADMIN) {
      throw new AppError('FORBIDDEN', 'Admin only', 403);
    }

    return next();
  } catch (err) {
    return next(err);
  }
};
