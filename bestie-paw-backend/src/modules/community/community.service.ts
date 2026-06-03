import { Prisma } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';

const assertPost = async (postId: string) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new AppError('NOT_FOUND', 'Post not found', 404);
  }
  return post;
};

export const listPosts = async (page = 1, limit = 20) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));

  const [items, total] = await prisma.$transaction([
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true }
        }
      }
    }),
    prisma.post.count()
  ]);

  return { items, total, page: safePage, limit: safeLimit };
};

export const createPost = async (authorId: string, content: string, images: string[]) =>
  prisma.post.create({
    data: {
      authorId,
      content,
      images
    }
  });

export const getPost = async (postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } }
        }
      },
      author: { select: { id: true, username: true, avatarUrl: true } }
    }
  });

  if (!post) {
    throw new AppError('NOT_FOUND', 'Post not found', 404);
  }

  return post;
};

export const deletePost = async (postId: string, userId: string) => {
  const post = await assertPost(postId);
  if (post.authorId !== userId) {
    throw new AppError('FORBIDDEN', 'Not allowed', 403);
  }

  await prisma.comment.deleteMany({ where: { postId } });
  await prisma.postLike.deleteMany({ where: { postId } });
  await prisma.post.delete({ where: { id: postId } });
};

export const likePost = async (postId: string, userId: string) => {
  await assertPost(postId);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.postLike.create({ data: { postId, userId } });
      await tx.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } }
      });
    });

    return { liked: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { liked: false };
    }

    throw err;
  }
};

export const unlikePost = async (postId: string, userId: string) => {
  await assertPost(postId);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.postLike.delete({ where: { postId_userId: { postId, userId } } });
      await tx.post.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } }
      });
    });

    return { liked: false };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return { liked: false }; // already not liked
    }

    throw err;
  }
};

export const createComment = async (postId: string, userId: string, content: string) => {
  await assertPost(postId);

  return prisma.comment.create({
    data: {
      postId,
      authorId: userId,
      content
    }
  });
};

export const deleteComment = async (
  postId: string,
  commentId: string,
  userId: string
) => {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, postId }
  });

  if (!comment) {
    throw new AppError('NOT_FOUND', 'Comment not found', 404);
  }

  if (comment.authorId !== userId) {
    throw new AppError('FORBIDDEN', 'Not allowed', 403);
  }

  await prisma.comment.delete({ where: { id: commentId } });
};
