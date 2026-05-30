import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { postImageUpload } from '../../middleware/upload';
import {
  createCommentHandler,
  createPostHandler,
  deleteCommentHandler,
  deletePostHandler,
  getPostHandler,
  likePostHandler,
  listPostsHandler,
  unlikePostHandler
} from './community.controller';

const router = Router();

/**
 * GET /api/community/posts
 * List community posts. Auth: yes.
 */
router.get('/posts', authMiddleware, listPostsHandler);

/**
 * POST /api/community/posts
 * Create a community post. Auth: yes.
 */
router.post(
  '/posts',
  authMiddleware,
  postImageUpload.array('images', 9),
  createPostHandler
);

/**
 * GET /api/community/posts/:postId
 * Get a single post with comments. Auth: yes.
 */
router.get('/posts/:postId', authMiddleware, getPostHandler);

/**
 * DELETE /api/community/posts/:postId
 * Delete a post (author only). Auth: yes.
 */
router.delete('/posts/:postId', authMiddleware, deletePostHandler);

/**
 * POST /api/community/posts/:postId/like
 * Like a post (idempotent). Auth: yes.
 */
router.post('/posts/:postId/like', authMiddleware, likePostHandler);

/**
 * DELETE /api/community/posts/:postId/like
 * Unlike a post (idempotent). Auth: yes.
 */
router.delete('/posts/:postId/like', authMiddleware, unlikePostHandler);

/**
 * POST /api/community/posts/:postId/comments
 * Create a comment. Auth: yes.
 */
router.post('/posts/:postId/comments', authMiddleware, createCommentHandler);

/**
 * DELETE /api/community/posts/:postId/comments/:commentId
 * Delete a comment (author only). Auth: yes.
 */
router.delete('/posts/:postId/comments/:commentId', authMiddleware, deleteCommentHandler);

export default router;
