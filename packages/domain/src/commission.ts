import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common';

export const CommissionStatusSchema = z.enum(['accrued', 'paid', 'voided']);
export type CommissionStatus = z.infer<typeof CommissionStatusSchema>;

export const DEFAULT_COMMISSION_RATE = 0.5; // 50% — flat default

export const CommissionEntrySchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  branchId: IdSchema,
  doctorId: IdSchema,
  receiptId: IdSchema,
  patientId: IdSchema,
  serviceName: z.string().min(1).max(120),
  baseAmount: z.number().nonnegative(),
  rate: z.number().min(0).max(1),
  amount: z.number().nonnegative(),
  status: CommissionStatusSchema,
  createdAt: IsoDateSchema,
  paidAt: IsoDateSchema.optional(),
});
export type CommissionEntry = z.infer<typeof CommissionEntrySchema>;

export interface DoctorCommissionSummary {
  doctorId: string;
  doctorName: string;
  visitCount: number;
  totalAmount: number;
  status: CommissionStatus | 'mixed';
}
