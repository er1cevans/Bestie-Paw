import cron from 'node-cron';
import { prisma } from '../../utils/prisma';
import { sendReminderEmail } from '../../utils/mailer';
import { logger } from '../../utils/logger';

export const startReminderCron = () => {
  const task = cron.schedule('0 8 * * *', async () => {
    const now = new Date();
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const reminders = await prisma.reminder.findMany({
      where: {
        notified: false,
        completedAt: null,
        dueDate: { gte: now, lte: nextDay }
      },
      include: {
        pet: {
          include: {
            owner: true
          }
        }
      }
    });

    for (const reminder of reminders) {
      try {
        await sendReminderEmail(
          reminder.pet.owner.email,
          reminder.pet.name,
          reminder.title,
          reminder.dueDate
        );

        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { notified: true }
        });
      } catch (err) {
        logger.error('Failed to send reminder email', err as Error);
      }
    }
  });

  task.start();
  return task;
};
