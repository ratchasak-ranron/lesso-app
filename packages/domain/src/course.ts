import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common';

export const CourseStatusSchema = z.enum(['active', 'completed', 'expired', 'refunded']);
export type CourseStatus = z.infer<typeof CourseStatusSchema>;

export const CourseSchema = z
  .object({
    id: IdSchema,
    tenantId: IdSchema,
    patientId: IdSchema,
    serviceName: z.string().min(1).max(120),
    sessionsTotal: z.number().int().positive().max(100),
    sessionsUsed: z.number().int().nonnegative(),
    pricePaid: z.number().nonnegative(),
    expiresAt: IsoDateSchema.optional(),
    status: CourseStatusSchema,
    createdAt: IsoDateSchema,
    updatedAt: IsoDateSchema,
  })
  .refine((c) => c.sessionsUsed <= c.sessionsTotal, {
    message: 'sessionsUsed cannot exceed sessionsTotal',
    path: ['sessionsUsed'],
  });
export type Course = z.infer<typeof CourseSchema>;

export const CourseCreateSchema = z.object({
  patientId: IdSchema,
  serviceName: z.string().min(1).max(120),
  sessionsTotal: z.number().int().positive().max(100),
  pricePaid: z.number().nonnegative(),
  expiresAt: IsoDateSchema.optional(),
});
export type CourseCreateInput = z.infer<typeof CourseCreateSchema>;

export const CourseUpdateSchema = z.object({
  serviceName: z.string().min(1).max(120).optional(),
  sessionsTotal: z.number().int().positive().max(100).optional(),
  pricePaid: z.number().nonnegative().optional(),
  expiresAt: IsoDateSchema.optional(),
  status: CourseStatusSchema.optional(),
});
export type CourseUpdateInput = z.infer<typeof CourseUpdateSchema>;

export const CourseSessionSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  branchId: IdSchema,
  courseId: IdSchema,
  patientId: IdSchema,
  appointmentId: IdSchema.optional(),
  performedAt: IsoDateSchema,
  performedByUserId: IdSchema.optional(),
  notes: z.string().max(1000).optional(),
});
export type CourseSession = z.infer<typeof CourseSessionSchema>;

export function sessionsRemaining(course: Pick<Course, 'sessionsTotal' | 'sessionsUsed'>): number {
  return Math.max(0, course.sessionsTotal - course.sessionsUsed);
}
