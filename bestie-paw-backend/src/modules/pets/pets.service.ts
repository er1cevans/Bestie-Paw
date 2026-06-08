import { prisma } from '../../utils/prisma';
import { sendMail } from '../../utils/mailer';
import { env } from '../../config/env';
import { deleteUploadedFile } from '../../middleware/upload';
import { assertPetOwnership } from '../../utils/petOwnership';
import type { PetCreateInput, PetUpdateInput } from './pets.schema';

export const listPets = async (userId: string) =>
  prisma.pet.findMany({ where: { ownerId: userId } });

export const createPet = async (userId: string, input: PetCreateInput) => {
  const existingCount = await prisma.pet.count({ where: { ownerId: userId } });

  const data = {
    ...input,
    ownerId: userId,
    birthday: input.birthday ? new Date(input.birthday) : undefined
  };

  const pet = await prisma.pet.create({ data });

  if (existingCount === 0) {
    const owner = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true }
    });

    if (owner) {
      sendMail({
        to: owner.email,
        subject: '欢迎加入 Bestie Paw 🐾',
        html: buildWelcomeEmail(owner.username, pet.name)
      }).catch((err) => {
        console.error('欢迎邮件发送失败：', err);
      });
    }
  }

  return pet;
};

function buildWelcomeEmail(username: string, petName: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:2rem;">
      <h2 style="color:#FF7043;">欢迎加入 Bestie Paw 🐾</h2>
      <p>你好 ${escapeHtml(username)}，</p>
      <p>恭喜你成功为 <strong>${escapeHtml(petName)}</strong> 建立了健康档案！</p>
      <p>现在你可以：</p>
      <ul>
        <li>记录疫苗接种和体检报告</li>
        <li>设置用药和复诊提醒</li>
        <li>阅读养宠好文，学习科学养宠知识</li>
      </ul>
      <a href="${env.FRONTEND_URL}"
         style="display:inline-block;margin-top:1rem;padding:0.75rem 1.5rem;
                background:#FF7043;color:#fff;border-radius:8px;text-decoration:none;">
        前往首页
      </a>
      <p style="margin-top:2rem;color:#999;font-size:0.85rem;">
        © 2026 Bestie Paw
      </p>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const getPetDetail = async (userId: string, petId: string) => {
  await assertPetOwnership(userId, petId);

  return prisma.pet.findUnique({
    where: { id: petId },
    include: {
      healthRecords: {
        orderBy: { date: 'desc' },
        take: 3
      },
      reminders: {
        where: { dueDate: { gte: new Date() } },
        orderBy: { dueDate: 'asc' },
        take: 3
      }
    }
  });
};

export const updatePet = async (
  userId: string,
  petId: string,
  input: PetUpdateInput
) => {
  await assertPetOwnership(userId, petId);

  const data = {
    ...input,
    birthday: input.birthday ? new Date(input.birthday) : undefined
  };

  return prisma.pet.update({
    where: { id: petId },
    data
  });
};

export const deletePet = async (userId: string, petId: string) => {
  await assertPetOwnership(userId, petId);
  await prisma.pet.delete({ where: { id: petId } });
};

export const updatePetAvatar = async (userId: string, petId: string, avatarUrl: string) => {
  const pet = await assertPetOwnership(userId, petId);
  const updated = await prisma.pet.update({ where: { id: petId }, data: { avatarUrl } });

  if (pet.avatarUrl && pet.avatarUrl !== avatarUrl) {
    deleteUploadedFile(pet.avatarUrl);
  }

  return updated;
};
