import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common';

export const ConsentStatusSchema = z.enum(['valid', 'expiring_soon', 'expired', 'missing']);
export type ConsentStatus = z.infer<typeof ConsentStatusSchema>;

const PhoneDigitsSchema = z.string().regex(/^\d{8,15}$/, 'Phone must be 8-15 digits');

export const PatientSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  fullName: z.string().min(1).max(120),
  phoneDigits: PhoneDigitsSchema,
  phoneDisplay: z.string().min(1).max(40),
  lineId: z.string().max(80).optional(),
  nationalId: z.string().regex(/^\d{13}$/, 'National ID must be 13 digits').optional(),
  birthDate: z.string().date().optional(),
  notes: z.string().max(2000).optional(),
  consentStatus: ConsentStatusSchema.default('missing'),
  consentExpiresAt: IsoDateSchema.optional(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type Patient = z.infer<typeof PatientSchema>;

export const PatientCreateSchema = PatientSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  consentStatus: ConsentStatusSchema.optional(),
});
export type PatientCreateInput = z.infer<typeof PatientCreateSchema>;

export const PatientUpdateSchema = PatientCreateSchema.partial();
export type PatientUpdateInput = z.infer<typeof PatientUpdateSchema>;
