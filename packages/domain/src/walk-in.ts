import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common';

export const WalkInStatusSchema = z.enum(['waiting', 'in_progress', 'completed', 'cancelled']);
export type WalkInStatus = z.infer<typeof WalkInStatusSchema>;

export const WalkInSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  branchId: IdSchema,
  patientId: IdSchema,
  arrivedAt: IsoDateSchema,
  status: WalkInStatusSchema,
  appointmentId: IdSchema.optional(),
  courseId: IdSchema.optional(),
  notes: z.string().max(500).optional(),
  completedAt: IsoDateSchema.optional(),
});
export type WalkIn = z.infer<typeof WalkInSchema>;

export const WalkInCreateSchema = z.object({
  branchId: IdSchema,
  patientId: IdSchema,
  courseId: IdSchema.optional(),
  notes: z.string().max(500).optional(),
});
export type WalkInCreateInput = z.infer<typeof WalkInCreateSchema>;

export const WalkInUpdateSchema = z.object({
  status: WalkInStatusSchema.optional(),
  notes: z.string().max(500).optional(),
  appointmentId: IdSchema.optional(),
  courseId: IdSchema.optional(),
});
export type WalkInUpdateInput = z.infer<typeof WalkInUpdateSchema>;
