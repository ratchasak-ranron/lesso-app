import { z } from 'zod';
import { IdSchema } from './common';

export const HealthSchema = z.object({
  status: z.enum(['ok', 'degraded', 'down']),
  tenantId: IdSchema.nullable(),
  branchId: IdSchema.nullable(),
  userId: IdSchema.nullable(),
  serverTime: z.string().datetime(),
});
export type Health = z.infer<typeof HealthSchema>;
