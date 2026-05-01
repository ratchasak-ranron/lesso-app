import { z } from 'zod';

export const IdSchema = z.string().uuid();
export type Id = z.infer<typeof IdSchema>;

export const IsoDateSchema = z.string().datetime();
export type IsoDate = z.infer<typeof IsoDateSchema>;

export function PaginatedResponseSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    data: z.array(item),
    meta: z.object({
      total: z.number().int().nonnegative(),
      page: z.number().int().positive().optional(),
      limit: z.number().int().positive().optional(),
    }),
  });
}

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});
export type ApiErrorPayload = z.infer<typeof ApiErrorSchema>;
