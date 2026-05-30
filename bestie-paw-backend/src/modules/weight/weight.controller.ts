import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import { weightCreateSchema } from './weight.schema';
import { addWeightRecord, deleteWeightRecord, listWeightRecords } from './weight.service';

export const listWeightHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 50;
    const data = await listWeightRecords(req.user!.userId, req.params.petId, limit);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const createWeightHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = weightCreateSchema.parse(req.body);
    const data = await addWeightRecord(req.user!.userId, req.params.petId, input);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const deleteWeightHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteWeightRecord(req.user!.userId, req.params.petId, req.params.recordId);
    return sendSuccess(res, { message: 'Weight record deleted' });
  } catch (err) {
    return next(err);
  }
};
