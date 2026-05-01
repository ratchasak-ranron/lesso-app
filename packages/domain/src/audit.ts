import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common';

export const AuditActionSchema = z.enum([
  'patient.create',
  'patient.update',
  'patient.delete',
  'patient.export',
  'appointment.create',
  'appointment.update',
  'appointment.cancel',
  'walkIn.create',
  'walkIn.complete',
  'walkIn.delete',
  'course.create',
  'course.decrement',
  'course.delete',
  'receipt.create',
  'receipt.void',
  'loyalty.earn',
  'loyalty.redeem',
  'inventory.create',
  'inventory.movement',
  'consent.capture',
  'consent.withdraw',
  'ai.copy',
]);
export type AuditAction = z.infer<typeof AuditActionSchema>;

export const AuditLogSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  branchId: IdSchema.optional(),
  userId: IdSchema.optional(),
  userName: z.string().max(120).optional(),
  action: AuditActionSchema,
  resourceType: z.string().min(1).max(40),
  resourceId: IdSchema.optional(),
  // metadata MUST be PII-redacted before storage. Caller responsibility.
  metadata: z.record(z.unknown()).optional(),
  createdAt: IsoDateSchema,
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

export const AuditLogCreateSchema = z.object({
  branchId: IdSchema.optional(),
  action: AuditActionSchema,
  resourceType: z.string().min(1).max(40),
  resourceId: IdSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type AuditLogCreateInput = z.infer<typeof AuditLogCreateSchema>;
