import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import {
  createWeightHandler,
  deleteWeightHandler,
  listWeightHandler
} from './weight.controller';

const router = Router({ mergeParams: true });

/**
 * GET /api/pets/:petId/weight
 * List weight records for a pet (newest first). Auth: yes. Optional ?limit=N.
 */
router.get('/', authMiddleware, listWeightHandler);

/**
 * POST /api/pets/:petId/weight
 * Add a weight record and sync the pet's current weight. Auth: yes.
 */
router.post('/', authMiddleware, createWeightHandler);

/**
 * DELETE /api/pets/:petId/weight/:recordId
 * Delete a weight record. Auth: yes.
 */
router.delete('/:recordId', authMiddleware, deleteWeightHandler);

export default router;
