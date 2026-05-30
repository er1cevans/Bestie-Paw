import { Prisma, ReminderType } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';

const assertPetOwnership = async (userId: string, petId: string) => {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) {
    throw new AppError('NOT_FOUND', 'Pet not found', 404);
  }
  if (pet.ownerId !== userId) {
    throw new AppError('FORBIDDEN', 'Not allowed', 403);
  }
};

export const listReminders = async (
  userId: string,
  petId: string,
  upcoming?: boolean,
  includeCompleted = false
) => {
  await assertPetOwnership(userId, petId);

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return prisma.reminder.findMany({
    where: {
      petId,
      ...(includeCompleted ? {} : { completedAt: null }),
      ...(upcoming ? { dueDate: { gte: now, lte: nextWeek } } : {})
    },
    orderBy: { dueDate: 'asc' }
  });
};

export const createReminder = async (
  userId: string,
  petId: string,
  data: {
    title: string;
    description?: string;
    type: string;
    dueDate: string;
  }
) => {
  await assertPetOwnership(userId, petId);

  return prisma.reminder.create({
    data: {
      petId,
      title: data.title,
      description: data.description,
      type: data.type as ReminderType,
      dueDate: new Date(data.dueDate)
    }
  });
};

export const updateReminder = async (
  userId: string,
  petId: string,
  reminderId: string,
  data: {
    title?: string;
    description?: string;
    type?: string;
    dueDate?: string;
  }
) => {
  await assertPetOwnership(userId, petId);

  return prisma.reminder.update({
    where: { id: reminderId },
    data: {
      ...data,
      type: data.type as ReminderType | undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined
    }
  });
};

export const completeReminder = async (
  userId: string,
  petId: string,
  reminderId: string
) => {
  await assertPetOwnership(userId, petId);

  try {
    return await prisma.reminder.update({
      where: { id: reminderId, petId },
      data: { completedAt: new Date() }
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new AppError('NOT_FOUND', 'Reminder not found', 404);
    }

    throw err;
  }
};

export const deleteReminder = async (userId: string, petId: string, reminderId: string) => {
  await assertPetOwnership(userId, petId);
  await prisma.reminder.delete({ where: { id: reminderId } });
};
