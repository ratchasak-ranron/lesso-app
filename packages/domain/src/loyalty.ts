import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common';

export const LoyaltyTransactionTypeSchema = z.enum(['earn', 'redeem', 'adjust', 'expire']);
export type LoyaltyTransactionType = z.infer<typeof LoyaltyTransactionTypeSchema>;

/** 1 baht spent = 1 point. 100 points = ฿100 redemption. */
export const POINTS_PER_BAHT = 1;
export const REDEMPTION_RATE_BAHT_PER_POINT = 1;

export const LoyaltyAccountSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  patientId: IdSchema,
  balance: z.number().int().nonnegative(),
  lifetimeEarned: z.number().int().nonnegative(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type LoyaltyAccount = z.infer<typeof LoyaltyAccountSchema>;

export const LoyaltyTransactionSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  patientId: IdSchema,
  accountId: IdSchema,
  type: LoyaltyTransactionTypeSchema,
  amount: z.number().int(),
  balanceAfter: z.number().int().nonnegative(),
  receiptId: IdSchema.optional(),
  reason: z.string().max(200).optional(),
  createdAt: IsoDateSchema,
});
export type LoyaltyTransaction = z.infer<typeof LoyaltyTransactionSchema>;
