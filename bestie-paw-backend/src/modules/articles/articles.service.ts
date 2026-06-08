import { Article, Prisma, Role } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import type { ArticleCreateInput, ArticleUpdateInput } from './articles.schema';

type AnnotatedArticle = Article & { liked: boolean; favorited: boolean };

const isAdmin = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  return user?.role === Role.ADMIN;
};

/**
 * Attach the current user's `liked` / `favorited` flags to a page of articles
 * with two batched lookups (no N+1).
 */
const annotateForUser = async (
  userId: string,
  articles: Article[]
): Promise<AnnotatedArticle[]> => {
  const articleIds = articles.map((a) => a.id);

  const [likes, favorites] = await Promise.all([
    prisma.articleLike.findMany({
      where: { userId, articleId: { in: articleIds } },
      select: { articleId: true }
    }),
    prisma.articleFavorite.findMany({
      where: { userId, articleId: { in: articleIds } },
      select: { articleId: true }
    })
  ]);

  const likedIds = new Set(likes.map((l) => l.articleId));
  const favoritedIds = new Set(favorites.map((f) => f.articleId));

  return articles.map((article) => ({
    ...article,
    liked: likedIds.has(article.id),
    favorited: favoritedIds.has(article.id)
  }));
};

/**
 * Assert the article exists and is visible to a regular user (published).
 * Used by like/favorite endpoints so a normal user can only interact with
 * content they can actually see. Unpublished or missing → 404.
 */
const assertPublishedArticle = async (articleId: string): Promise<Article> => {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article || !article.published) {
    throw new AppError('NOT_FOUND', 'Article not found', 404);
  }
  return article;
};

export const listArticles = async (
  userId: string,
  options: { category?: string; page?: number; limit?: number; includeUnpublished?: boolean }
) => {
  const safePage = Math.max(1, options.page ?? 1);
  const safeLimit = Math.min(50, Math.max(1, options.limit ?? 20));

  // ?includeUnpublished=true only takes effect for ADMIN; ignored otherwise.
  const showUnpublished = options.includeUnpublished ? await isAdmin(userId) : false;

  const where: Prisma.ArticleWhereInput = {
    ...(showUnpublished ? {} : { published: true }),
    ...(options.category ? { category: options.category } : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit
    }),
    prisma.article.count({ where })
  ]);

  return {
    items: await annotateForUser(userId, items),
    total,
    page: safePage,
    limit: safeLimit
  };
};

export const getArticle = async (userId: string, articleId: string) => {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) {
    throw new AppError('NOT_FOUND', 'Article not found', 404);
  }

  // Unpublished drafts are visible to ADMIN only.
  if (!article.published && !(await isAdmin(userId))) {
    throw new AppError('NOT_FOUND', 'Article not found', 404);
  }

  const [annotated] = await annotateForUser(userId, [article]);
  return annotated;
};

export const listFavorites = async (userId: string, page = 1, limit = 20) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));

  const [favorites, total] = await prisma.$transaction([
    prisma.articleFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      include: { article: true }
    }),
    prisma.articleFavorite.count({ where: { userId } })
  ]);

  const articles = favorites.map((f) => f.article);

  return {
    items: await annotateForUser(userId, articles),
    total,
    page: safePage,
    limit: safeLimit
  };
};

export const likeArticle = async (articleId: string, userId: string) => {
  await assertPublishedArticle(articleId);

  try {
    const likes = await prisma.$transaction(async (tx) => {
      await tx.articleLike.create({ data: { articleId, userId } });
      const updated = await tx.article.update({
        where: { id: articleId },
        data: { likes: { increment: 1 } },
        select: { likes: true }
      });
      return updated.likes;
    });

    return { liked: true, likes };
  } catch (err) {
    // Already liked — idempotent: no side effect, report current count.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const current = await prisma.article.findUnique({
        where: { id: articleId },
        select: { likes: true }
      });
      return { liked: true, likes: current?.likes ?? 0 };
    }
    throw err;
  }
};

export const unlikeArticle = async (articleId: string, userId: string) => {
  await assertPublishedArticle(articleId);

  try {
    const likes = await prisma.$transaction(async (tx) => {
      await tx.articleLike.delete({
        where: { articleId_userId: { articleId, userId } }
      });
      const updated = await tx.article.update({
        where: { id: articleId },
        data: { likes: { decrement: 1 } },
        select: { likes: true }
      });
      return updated.likes;
    });

    return { liked: false, likes };
  } catch (err) {
    // Not liked — idempotent: no side effect, report current count.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      const current = await prisma.article.findUnique({
        where: { id: articleId },
        select: { likes: true }
      });
      return { liked: false, likes: current?.likes ?? 0 };
    }
    throw err;
  }
};

export const favoriteArticle = async (articleId: string, userId: string) => {
  await assertPublishedArticle(articleId);

  try {
    await prisma.articleFavorite.create({ data: { articleId, userId } });
  } catch (err) {
    // Already favorited — idempotent.
    if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002')) {
      throw err;
    }
  }

  return { favorited: true };
};

export const unfavoriteArticle = async (articleId: string, userId: string) => {
  await assertPublishedArticle(articleId);

  try {
    await prisma.articleFavorite.delete({
      where: { articleId_userId: { articleId, userId } }
    });
  } catch (err) {
    // Not favorited — idempotent.
    if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025')) {
      throw err;
    }
  }

  return { favorited: false };
};

export const createArticle = async (input: ArticleCreateInput): Promise<Article> => {
  const published = input.published ?? true;

  return prisma.article.create({
    data: {
      title: input.title,
      content: input.content,
      summary: input.summary,
      coverImageUrl: input.coverImageUrl,
      authorName: input.authorName,
      category: input.category,
      published,
      publishedAt: published ? new Date() : null
    }
  });
};

export const updateArticle = async (
  articleId: string,
  input: ArticleUpdateInput
): Promise<Article> => {
  const existing = await prisma.article.findUnique({ where: { id: articleId } });
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Article not found', 404);
  }

  const data: Prisma.ArticleUpdateInput = { ...input };

  // First time an article goes published, stamp publishedAt.
  if (input.published === true && !existing.publishedAt) {
    data.publishedAt = new Date();
  }

  return prisma.article.update({ where: { id: articleId }, data });
};

export const deleteArticle = async (articleId: string): Promise<void> => {
  const existing = await prisma.article.findUnique({ where: { id: articleId } });
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Article not found', 404);
  }

  // ArticleLike / ArticleFavorite cascade-delete via the FK onDelete: Cascade.
  await prisma.article.delete({ where: { id: articleId } });
};
