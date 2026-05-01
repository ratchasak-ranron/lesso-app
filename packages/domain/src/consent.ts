import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common';

export const ConsentScopeSchema = z.enum([
  'medical_records',
  'recall_contact',
  'photo_marketing',
]);
export type ConsentScope = z.infer<typeof ConsentScopeSchema>;

export const REQUIRED_CONSENT_SCOPES: ConsentScope[] = ['medical_records', 'recall_contact'];

export const ConsentRecordSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  patientId: IdSchema,
  scopes: z.array(ConsentScopeSchema).min(1),
  capturedAt: IsoDateSchema,
  expiresAt: IsoDateSchema.optional(),
  capturedByUserId: IdSchema.optional(),
  withdrawnAt: IsoDateSchema.optional(),
  withdrawalReason: z.string().max(500).optional(),
});
export type ConsentRecord = z.infer<typeof ConsentRecordSchema>;

export const ConsentCaptureInputSchema = z.object({
  patientId: IdSchema,
  scopes: z.array(ConsentScopeSchema).min(1),
  durationMonths: z.number().int().positive().max(120).optional(),
});
export type ConsentCaptureInput = z.infer<typeof ConsentCaptureInputSchema>;

export const ConsentWithdrawInputSchema = z.object({
  consentId: IdSchema,
  reason: z.string().max(500).optional(),
});
export type ConsentWithdrawInput = z.infer<typeof ConsentWithdrawInputSchema>;
