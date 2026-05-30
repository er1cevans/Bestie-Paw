import { Router } from 'express';
import {
  forgotPassword,
  login,
  refresh,
  register,
  resendVerification,
  resetPasswordHandler,
  verifyEmailAddress,
  logout
} from './auth.controller';
import { loginRateLimiter, registerLimiter } from '../../middleware/rateLimiter';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user. Auth: no.
 */
router.post('/register', registerLimiter, register);

/**
 * POST /api/auth/login
 * Login with email and password. Auth: no.
 */
router.post('/login', loginRateLimiter, login);

/**
 * POST /api/auth/refresh
 * Refresh access token. Auth: no.
 */
router.post('/refresh', refresh);

/**
 * POST /api/auth/logout
 * Logout and revoke refresh tokens. Auth: yes.
 */
router.post('/logout', authMiddleware, logout);

/**
 * POST /api/auth/verify-email
 * Verify email with code. Auth: no.
 */
router.post('/verify-email', verifyEmailAddress);

/**
 * POST /api/auth/resend-verification
 * Resend email verification code. Auth: no. Rate-limited.
 */
router.post('/resend-verification', registerLimiter, resendVerification);

/**
 * POST /api/auth/forgot-password
 * Send password reset email. Auth: no.
 */
router.post('/forgot-password', forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password with token. Auth: no.
 */
router.post('/reset-password', resetPasswordHandler);

export default router;
