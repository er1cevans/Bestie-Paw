import { z } from 'zod';

const dateString = z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
  message: 'Invalid date'
});

export const weightCreateSchema = z.object({
  weightKg: z.number().min(0).max(200),
  note: z.string().max(200).optional(),
  recordedAt: dateString
});

export type WeightCreateInput = z.infer<typeof weightCreateSchema>;
