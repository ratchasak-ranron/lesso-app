import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common';

export const AppointmentStatusSchema = z.enum([
  'scheduled',
  'confirmed',
  'checked_in',
  'in_progress',
  'completed',
  'no_show',
  'cancelled',
]);
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

export const AppointmentSchema = z
  .object({
    id: IdSchema,
    tenantId: IdSchema,
    branchId: IdSchema,
    patientId: IdSchema,
    doctorId: IdSchema.optional(),
    serviceName: z.string().min(1).max(120),
    startAt: IsoDateSchema,
    endAt: IsoDateSchema,
    status: AppointmentStatusSchema,
    courseId: IdSchema.optional(),
    notes: z.string().max(2000).optional(),
    createdAt: IsoDateSchema,
    updatedAt: IsoDateSchema,
  })
  .refine((a) => new Date(a.endAt).getTime() > new Date(a.startAt).getTime(), {
    message: 'endAt must be after startAt',
    path: ['endAt'],
  });
export type Appointment = z.infer<typeof AppointmentSchema>;

export const AppointmentCreateSchema = z.object({
  branchId: IdSchema,
  patientId: IdSchema,
  doctorId: IdSchema.optional(),
  serviceName: z.string().min(1).max(120),
  startAt: IsoDateSchema,
  endAt: IsoDateSchema,
  status: AppointmentStatusSchema.optional(),
  courseId: IdSchema.optional(),
  notes: z.string().max(2000).optional(),
});
export type AppointmentCreateInput = z.infer<typeof AppointmentCreateSchema>;

export const AppointmentUpdateSchema = AppointmentCreateSchema.partial();
export type AppointmentUpdateInput = z.infer<typeof AppointmentUpdateSchema>;
