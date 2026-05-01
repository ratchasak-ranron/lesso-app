import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common';

export const PaymentMethodSchema = z.enum(['cash', 'card', 'transfer', 'line_pay', 'course_redeem', 'mixed']);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const ReceiptStatusSchema = z.enum(['draft', 'paid', 'voided', 'refunded']);
export type ReceiptStatus = z.infer<typeof ReceiptStatusSchema>;

export const LineItemSchema = z.object({
  description: z.string().min(1).max(200),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().nonnegative(),
  amount: z.number().nonnegative(),
  courseId: IdSchema.optional(),
  serviceName: z.string().min(1).max(120).optional(),
  doctorId: IdSchema.optional(),
  isCourseRedeem: z.boolean().default(false),
});
export type LineItem = z.infer<typeof LineItemSchema>;

export const ReceiptSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  branchId: IdSchema,
  patientId: IdSchema,
  appointmentId: IdSchema.optional(),
  walkInId: IdSchema.optional(),
  number: z.string().min(1).max(40),
  lineItems: z.array(LineItemSchema).min(1),
  subtotal: z.number().nonnegative(),
  tip: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  status: ReceiptStatusSchema,
  paidAt: IsoDateSchema.optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type Receipt = z.infer<typeof ReceiptSchema>;

export const ReceiptCreateSchema = z.object({
  branchId: IdSchema,
  patientId: IdSchema,
  appointmentId: IdSchema.optional(),
  walkInId: IdSchema.optional(),
  lineItems: z.array(LineItemSchema).min(1),
  tip: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  paymentMethod: PaymentMethodSchema.optional(),
});
export type ReceiptCreateInput = z.infer<typeof ReceiptCreateSchema>;
