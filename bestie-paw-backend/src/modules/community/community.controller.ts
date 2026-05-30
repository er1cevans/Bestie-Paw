import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess } from '../../utils/response';
import { resolveFileUrl } from '../../middleware/upload';
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  getPost,
  likePost,
  listPosts,
  unlikePost
} from './community.service';

const createPostSchema = z.object({
  content: z.string().min(1).max(2000)
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(500)
});

export const listPostsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 20;
    const data = await listPosts(page, limit);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const createPostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const input = createPostSchema.parse(req.body);
    const files = req.files as Express.Multer.File[] | undefined;
    const images = files ? files.map((file) => resolveFileUrl(file.filename)) : [];

    const data = await createPost(req.user!.userId, input.content, images);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const getPostHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getPost(req.params.postId);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const deletePostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deletePost(req.params.postId, req.user!.userId);
    return sendSuccess(res, { message: 'Post deleted' });
  } catch (err) {
    return next(err);
  }
};

export const likePostHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await likePost(req.params.postId, req.user!.userId);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const unlikePostHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await unlikePost(req.params.postId, req.user!.userId);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const createCommentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const input = createCommentSchema.parse(req.body);
    const data = await createComment(req.params.postId, req.user!.userId, input.content);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const deleteCommentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteComment(req.params.postId, req.params.commentId, req.user!.userId);
    return sendSuccess(res, { message: 'Comment deleted' });
  } catch (err) {
    return next(err);
  }
};
