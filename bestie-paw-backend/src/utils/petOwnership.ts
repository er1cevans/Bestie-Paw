import type { Pet } from '@prisma/client';
import { prisma } from './prisma';
import { AppError } from '../middleware/errorHandler';

/**
 * Assert that `petId` exists and belongs to `userId`.
 * Single source of truth for pet-level authorization — shared by the pets,
 * health and reminders modules so ownership checks cannot drift apart
 * (the kind of drift that produced the reminder IDOR fixed in PR #16).
 *
 * @returns the owned Pet (callers may use it, e.g. to read the old avatar).
 * @throws AppError NOT_FOUND (404) if the pet does not exist,
 *         AppError FORBIDDEN (403) if it belongs to someone else.
 */
export const assertPetOwnership = async (userId: string, petId: string): Promise<Pet> => {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) {
    throw new AppError('NOT_FOUND', 'Pet not found', 404);
  }
  if (pet.ownerId !== userId) {
    throw new AppError('FORBIDDEN', 'Not allowed', 403);
  }
  return pet;
};
