import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/requireAdmin';
import {
  createArticleHandler,
  deleteArticleHandler,
  favoriteArticleHandler,
  getArticleHandler,
  likeArticleHandler,
  listArticlesHandler,
  listFavoritesHandler,
  unfavoriteArticleHandler,
  unlikeArticleHandler,
  updateArticleHandler
} from './articles.controller';

const router = Router();

/**
 * GET /api/articles
 * List published articles (?category=&page=&limit=). Auth: yes.
 * ADMIN may pass ?includeUnpublished=true to also see drafts.
 */
router.get('/', authMiddleware, listArticlesHandler);

/**
 * GET /api/articles/favorites
 * List the current user's favorited articles, newest favorite first. Auth: yes.
 * NOTE: must be registered before `/:id`, otherwise "favorites" is captured as :id.
 */
router.get('/favorites', authMiddleware, listFavoritesHandler);

/**
 * POST /api/articles
 * Create an article. Auth: ADMIN.
 */
router.post('/', authMiddleware, requireAdmin, createArticleHandler);

/**
 * GET /api/articles/:id
 * Get a single article (published; drafts visible to ADMIN only). Auth: yes.
 */
router.get('/:id', authMiddleware, getArticleHandler);

/**
 * PATCH /api/articles/:id
 * Update an article. Auth: ADMIN.
 */
router.patch('/:id', authMiddleware, requireAdmin, updateArticleHandler);

/**
 * DELETE /api/articles/:id
 * Delete an article (cascades likes/favorites). Auth: ADMIN.
 */
router.delete('/:id', authMiddleware, requireAdmin, deleteArticleHandler);

/**
 * POST /api/articles/:id/like
 * Like an article (idempotent). Auth: yes.
 */
router.post('/:id/like', authMiddleware, likeArticleHandler);

/**
 * DELETE /api/articles/:id/like
 * Unlike an article (idempotent). Auth: yes.
 */
router.delete('/:id/like', authMiddleware, unlikeArticleHandler);

/**
 * POST /api/articles/:id/favorite
 * Favorite an article (idempotent). Auth: yes.
 */
router.post('/:id/favorite', authMiddleware, favoriteArticleHandler);

/**
 * DELETE /api/articles/:id/favorite
 * Remove an article from favorites (idempotent). Auth: yes.
 */
router.delete('/:id/favorite', authMiddleware, unfavoriteArticleHandler);

export default router;
