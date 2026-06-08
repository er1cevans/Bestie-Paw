import { z } from 'zod';

export const articleCreateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  summary: z.string().max(500).optional(),
  coverImageUrl: z.string().url().optional(),
  authorName: z.string().min(1).max(100),
  category: z.string().max(50).optional(),
  published: z.boolean().optional()
});

export const articleUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  summary: z.string().max(500).optional(),
  coverImageUrl: z.string().url().optional(),
  authorName: z.string().min(1).max(100).optional(),
  category: z.string().max(50).optional(),
  published: z.boolean().optional()
});

export type ArticleCreateInput = z.infer<typeof articleCreateSchema>;
export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>;
