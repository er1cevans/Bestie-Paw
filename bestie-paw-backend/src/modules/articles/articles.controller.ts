import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import { articleCreateSchema, articleUpdateSchema } from './articles.schema';
import {
  createArticle,
  deleteArticle,
  favoriteArticle,
  getArticle,
  likeArticle,
  listArticles,
  listFavorites,
  unfavoriteArticle,
  unlikeArticle,
  updateArticle
} from './articles.service';

const parsePage = (value: unknown) => (typeof value === 'string' ? Number(value) : 1);
const parseLimit = (value: unknown) => (typeof value === 'string' ? Number(value) : 20);

export const listArticlesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await listArticles(req.user!.userId, {
      category: typeof req.query.category === 'string' ? req.query.category : undefined,
      page: parsePage(req.query.page),
      limit: parseLimit(req.query.limit),
      includeUnpublished: req.query.includeUnpublished === 'true'
    });
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const listFavoritesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await listFavorites(
      req.user!.userId,
      parsePage(req.query.page),
      parseLimit(req.query.limit)
    );
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const getArticleHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getArticle(req.user!.userId, req.params.id);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const likeArticleHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await likeArticle(req.params.id, req.user!.userId);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const unlikeArticleHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await unlikeArticle(req.params.id, req.user!.userId);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const favoriteArticleHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await favoriteArticle(req.params.id, req.user!.userId);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const unfavoriteArticleHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await unfavoriteArticle(req.params.id, req.user!.userId);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const createArticleHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = articleCreateSchema.parse(req.body);
    const data = await createArticle(input);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const updateArticleHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = articleUpdateSchema.parse(req.body);
    const data = await updateArticle(req.params.id, input);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const deleteArticleHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteArticle(req.params.id);
    return sendSuccess(res, { message: 'Article deleted' });
  } catch (err) {
    return next(err);
  }
};
