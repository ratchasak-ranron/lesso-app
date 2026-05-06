import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common';

export const ExpenseCategorySchema = z.enum([
  'rent',
  'doctor_fee',
  'salary',
  'utilities',
  'supplies',
  'marketing',
  'equipment',
  'tax',
  'other',
]);
export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;

export const ExpenseRecurrenceSchema = z.enum([
  'none',
  'weekly',
  'monthly',
  'yearly',
]);
export type ExpenseRecurrence = z.infer<typeof ExpenseRecurrenceSchema>;

export const ExpenseSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  /** Optional branch attribution — `null` when the expense is clinic-wide. */
  branchId: IdSchema.nullable(),
  category: ExpenseCategorySchema,
  /** Amount in THB. Stored as a positive number; outflow is implicit. */
  amount: z.number().nonnegative(),
  payee: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  paidAt: IsoDateSchema,
  recurrence: ExpenseRecurrenceSchema.default('none'),
  notes: z.string().max(2000).optional(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type Expense = z.infer<typeof ExpenseSchema>;

export const ExpenseCreateSchema = ExpenseSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
}).partial({ branchId: true, description: true, recurrence: true, notes: true });
export type ExpenseCreateInput = z.infer<typeof ExpenseCreateSchema>;

export const ExpenseUpdateSchema = ExpenseCreateSchema.partial();
export type ExpenseUpdateInput = z.infer<typeof ExpenseUpdateSchema>;

export interface ExpenseSummary {
  total: number;
  byCategory: Record<ExpenseCategory, number>;
  recurringCount: number;
}

const EMPTY_BREAKDOWN: Record<ExpenseCategory, number> = {
  rent: 0,
  doctor_fee: 0,
  salary: 0,
  utilities: 0,
  supplies: 0,
  marketing: 0,
  equipment: 0,
  tax: 0,
  other: 0,
};

/**
 * Aggregate expenses by category and surface the recurring count so the
 * dashboard can build a KPI strip without re-iterating the list.
 */
export function summarizeExpenses(expenses: ReadonlyArray<Expense>): ExpenseSummary {
  const byCategory: Record<ExpenseCategory, number> = { ...EMPTY_BREAKDOWN };
  let total = 0;
  let recurringCount = 0;
  for (const e of expenses) {
    total += e.amount;
    byCategory[e.category] += e.amount;
    if (e.recurrence !== 'none') recurringCount += 1;
  }
  return { total, byCategory, recurringCount };
}

/** Filter helper — returns expenses whose paidAt falls in [start, end). */
export function expensesInRange(
  expenses: ReadonlyArray<Expense>,
  startIso: string,
  endIso: string,
): Expense[] {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return expenses.filter((e) => {
    const t = new Date(e.paidAt).getTime();
    return t >= start && t < end;
  });
}
