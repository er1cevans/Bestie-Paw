import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import type { WeightCreateInput } from './weight.schema';

const assertPetOwnership = async (userId: string, petId: string) => {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) {
    throw new AppError('NOT_FOUND', 'Pet not found', 404);
  }
  if (pet.ownerId !== userId) {
    throw new AppError('FORBIDDEN', 'Not allowed', 403);
  }
  return pet;
};

export const listWeightRecords = async (userId: string, petId: string, limit = 50) => {
  await assertPetOwnership(userId, petId);

  const safeLimit = Math.min(200, Math.max(1, limit));

  return prisma.weightRecord.findMany({
    where: { petId },
    orderBy: { recordedAt: 'desc' },
    take: safeLimit
  });
};

export const addWeightRecord = async (
  userId: string,
  petId: string,
  input: WeightCreateInput
) => {
  await assertPetOwnership(userId, petId);

  const [record] = await prisma.$transaction([
    prisma.weightRecord.create({
      data: {
        petId,
        weightKg: input.weightKg,
        note: input.note,
        recordedAt: new Date(input.recordedAt)
      }
    }),
    prisma.pet.update({
      where: { id: petId },
      data: { weightKg: input.weightKg }
    })
  ]);

  return record;
};

export const deleteWeightRecord = async (
  userId: string,
  petId: string,
  recordId: string
) => {
  await assertPetOwnership(userId, petId);

  const record = await prisma.weightRecord.findFirst({ where: { id: recordId, petId } });
  if (!record) {
    throw new AppError('NOT_FOUND', 'Weight record not found', 404);
  }

  // Intentionally does NOT recompute pet.weightKg — the client refreshes if needed.
  await prisma.weightRecord.delete({ where: { id: recordId } });
};
