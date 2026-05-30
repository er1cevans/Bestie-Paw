import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';

/**
 * Authenticates a request from the Bearer access token.
 *
 * The JWT is cryptographically signed and carries `userId` and `email`, so we
 * trust the verified payload directly instead of re-reading the user row on
 * every request. Trade-off: a soft-deleted user's access token stays valid
 * until it expires (typically 15m). If immediate revocation is ever required,
 * add a short-TTL token blocklist rather than reinstating a DB lookup here.
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return sendError(res, 'UNAUTHORIZED', 'Missing access token', 401);
    }

    const token = header.slice('Bearer '.length);
    const payload = verifyAccessToken(token); // throws if invalid/expired
    req.user = { userId: payload.userId, email: payload.email };
    return next();
  } catch (err) {
    return next(err);
  }
};
