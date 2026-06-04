import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess } from '../../utils/response';
import {
  addHealthAttachments,
  createHealthRecord,
  deleteHealthRecord,
  getHealthRecord,
  listHealthRecords,
  removeHealthAttachment,
  updateHealthRecord
} from './health.service';
import { healthCreateSchema, healthTypeEnum, healthUpdateSchema } from './health.schema';
import { deleteUploadedFile, resolveFileUrl } from '../../middleware/upload';

const removeAttachmentSchema = z.object({ url: z.string().min(1) });

export const listHealthHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type =
      typeof req.query.type === 'string' ? healthTypeEnum.parse(req.query.type) : undefined;
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 20;

    const data = await listHealthRecords(req.user!.userId, req.params.petId, type, page, limit);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const createHealthHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = healthCreateSchema.parse(req.body);
    const data = await createHealthRecord(req.user!.userId, req.params.petId, input);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const getHealthHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getHealthRecord(
      req.user!.userId,
      req.params.petId,
      req.params.recordId
    );
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const updateHealthHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = healthUpdateSchema.parse(req.body);
    const data = await updateHealthRecord(
      req.user!.userId,
      req.params.petId,
      req.params.recordId,
      input
    );
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const deleteHealthHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteHealthRecord(req.user!.userId, req.params.petId, req.params.recordId);
    return sendSuccess(res, { message: 'Record deleted' });
  } catch (err) {
    return next(err);
  }
};

export const uploadHealthAttachmentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files = req.files as Express.Multer.File[] | undefined;

  try {
    if (!files || files.length === 0) {
      return sendSuccess(res, { message: 'No files uploaded' });
    }

    const urls = files.map((file) => resolveFileUrl(file.filename));
    const data = await addHealthAttachments(
      req.user!.userId,
      req.params.petId,
      req.params.recordId,
      urls
    );

    return sendSuccess(res, data);
  } catch (err) {
    files?.forEach((file) => deleteUploadedFile(resolveFileUrl(file.filename)));
    return next(err);
  }
};

export const removeHealthAttachmentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { url } = removeAttachmentSchema.parse(req.body);
    const data = await removeHealthAttachment(
      req.user!.userId,
      req.params.petId,
      req.params.recordId,
      url
    );

    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};
