import { Prisma, ReminderType } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import { assertPetOwnership } from '../../utils/petOwnership';

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

  // Scope by petId so a user who owns `petId` cannot mutate a reminder that
  // belongs to a different pet by passing an arbitrary reminderId (IDOR).
  try {
    return await prisma.reminder.update({
      where: { id: reminderId, petId },
      data: {
        ...data,
        type: data.type as ReminderType | undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      }
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new AppError('NOT_FOUND', 'Reminder not found', 404);
    }
    throw err;
  }
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

  // Scope by petId to prevent deleting another pet's reminder via reminderId (IDOR).
  try {
    await prisma.reminder.delete({ where: { id: reminderId, petId } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new AppError('NOT_FOUND', 'Reminder not found', 404);
    }
    throw err;
  }
};
