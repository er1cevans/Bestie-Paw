import { PrismaClient, PetType, Gender, NeuteredStatus, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Test1234!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'test@bestiepaw.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'test@bestiepaw.com',
      passwordHash,
      emailVerified: true
    }
  });

  await prisma.pet.createMany({
    data: [
      {
        ownerId: user.id,
        name: 'Milo',
        type: PetType.DOG,
        breed: 'Corgi',
        gender: Gender.MALE,
        weightKg: 12.5,
        neutered: NeuteredStatus.YES
      },
      {
        ownerId: user.id,
        name: 'Luna',
        type: PetType.CAT,
        breed: 'British Shorthair',
        gender: Gender.FEMALE,
        weightKg: 4.3,
        neutered: NeuteredStatus.NO
      }
    ],
    skipDuplicates: true
  });

  // Maintainer account for the articles module. Default credentials are
  // documented in the PR description for the Owner; the password is stored
  // hashed (never in plaintext in the codebase).
  const adminPasswordHash = await bcrypt.hash('Admin1234!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@bestiepaw.com' },
    update: { role: Role.ADMIN },
    create: {
      username: 'admin',
      email: 'admin@bestiepaw.com',
      passwordHash: adminPasswordHash,
      emailVerified: true,
      role: Role.ADMIN
    }
  });

  // Sample pet-care articles. Seeded only when the table is empty so re-running
  // the seed stays idempotent (Article has no natural unique key).
  const articleCount = await prisma.article.count();
  if (articleCount === 0) {
    const now = new Date();
    await prisma.article.createMany({
      data: [
        {
          title: '新手养狗的第一周：从接回家到安心入睡',
          summary: '把幼犬接回家的头几天最关键，这篇带你度过适应期。',
          content:
            '把一只幼犬接回家，前七天决定了它对新环境的信任。准备一个安静的角落、固定的喂食时间，以及一条不被打扰的睡觉路线。不要急着洗澡或带它见太多人，先让它熟悉气味与作息。夜里呜咽是分离焦虑，可以用旧衣物的气味安抚，逐步拉长独处时间。',
          coverImageUrl: 'https://images.bestiepaw.com/articles/puppy-first-week.jpg',
          authorName: 'Bestie Paw 编辑部',
          category: '狗狗',
          published: true,
          publishedAt: now
        },
        {
          title: '猫咪绝育前后的护理要点',
          summary: '绝育是常规手术，但术前术后的护理同样重要。',
          content:
            '绝育能降低生殖系统疾病风险并稳定性情。术前需禁食 8 小时、禁水 2 小时；术后佩戴伊丽莎白圈防止舔舐伤口，准备低矮、易进出的猫砂盆，减少跳跃。观察伤口是否红肿渗液，食欲在 24 小时内应逐步恢复，否则及时复诊。',
          coverImageUrl: 'https://images.bestiepaw.com/articles/cat-neuter-care.jpg',
          authorName: '王医生',
          category: '猫咪',
          published: true,
          publishedAt: now
        },
        {
          title: '读懂宠物体检报告：这几项指标别忽略',
          summary: '血常规、生化、影像，哪些数字值得你多看一眼？',
          content:
            '年度体检是早发现问题的最好方式。血常规关注白细胞与红细胞，提示炎症或贫血；生化里的肝肾指标反映代谢负担；中老年宠物建议加做甲状腺与心脏超声。把每年的报告留存对比，趋势比单次数值更有意义。',
          authorName: 'Bestie Paw 编辑部',
          category: '健康',
          published: true,
          publishedAt: now
        },
        {
          title: '科学喂养：如何为不同年龄段的宠物选粮',
          summary: '幼年、成年、老年，营养需求差别比你想的大。',
          content:
            '幼年期需要高蛋白、高热量支持快速生长；成年期重在维持体态、避免肥胖；老年期则要减脂、护关节并照顾消化。换粮要用 7 天过渡法，按比例逐步替换，观察粪便与食欲。任何阶段，干净的饮水都比"补品"更重要。',
          coverImageUrl: 'https://images.bestiepaw.com/articles/feeding-by-age.jpg',
          authorName: '李营养师',
          category: '营养',
          published: true,
          publishedAt: now
        }
      ]
    });
  }
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
