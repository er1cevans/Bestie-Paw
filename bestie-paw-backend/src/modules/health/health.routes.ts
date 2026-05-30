import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { attachmentUpload } from '../../middleware/upload';
import {
  createHealthHandler,
  deleteHealthHandler,
  getHealthHandler,
  listHealthHandler,
  removeHealthAttachmentHandler,
  updateHealthHandler,
  uploadHealthAttachmentsHandler
} from './health.controller';

const router = Router({ mergeParams: true });

/**
 * GET /api/pets/:petId/health
 * List health records for a pet. Auth: yes.
 */
router.get('/', authMiddleware, listHealthHandler);

/**
 * POST /api/pets/:petId/health
 * Create a health record. Auth: yes.
 */
router.post('/', authMiddleware, createHealthHandler);

/**
 * GET /api/pets/:petId/health/:recordId
 * Get a single health record. Auth: yes.
 */
router.get('/:recordId', authMiddleware, getHealthHandler);

/**
 * PATCH /api/pets/:petId/health/:recordId
 * Update a health record. Auth: yes.
 */
router.patch('/:recordId', authMiddleware, updateHealthHandler);

/**
 * DELETE /api/pets/:petId/health/:recordId
 * Delete a health record. Auth: yes.
 */
router.delete('/:recordId', authMiddleware, deleteHealthHandler);

/**
 * POST /api/pets/:petId/health/:recordId/attachments
 * Upload health record attachments. Auth: yes.
 */
router.post(
  '/:recordId/attachments',
  authMiddleware,
  attachmentUpload.array('files', 5),
  uploadHealthAttachmentsHandler
);

/**
 * DELETE /api/pets/:petId/health/:recordId/attachments
 * Remove a single attachment from a health record. Auth: yes. Body: { url }.
 */
router.delete('/:recordId/attachments', authMiddleware, removeHealthAttachmentHandler);

export default router;
