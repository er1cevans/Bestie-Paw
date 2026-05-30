import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { avatarUpload } from '../../middleware/upload';
import {
  changePasswordHandler,
  deleteMe,
  getMe,
  updateMe,
  uploadAvatarHandler
} from './users.controller';

const router = Router();

/**
 * GET /api/users/me
 * Get current user profile. Auth: yes.
 */
router.get('/me', authMiddleware, getMe);

/**
 * PATCH /api/users/me
 * Update current user profile. Auth: yes.
 */
router.patch('/me', authMiddleware, updateMe);

/**
 * POST /api/users/me/avatar
 * Upload user avatar. Auth: yes.
 */
router.post('/me/avatar', authMiddleware, avatarUpload.single('avatar'), uploadAvatarHandler);

/**
 * POST /api/users/me/password
 * Change current user password. Auth: yes.
 */
router.post('/me/password', authMiddleware, changePasswordHandler);

/**
 * DELETE /api/users/me
 * Soft delete user account. Auth: yes.
 */
router.delete('/me', authMiddleware, deleteMe);

export default router;
