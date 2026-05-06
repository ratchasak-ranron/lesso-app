import { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Expense,
  ExpenseCreateInput,
  ExpenseUpdateInput,
  Id,
} from '@reinly/domain';
import { EXPENSE_STORE_KEY, EXPENSE_STORE_VERSION } from '@/lib/persist-keys';
import { useDevToolbar } from './dev-toolbar';

interface ExpenseState {
  expenses: Expense[];
  create: (input: ExpenseCreateInput, tenantId: Id) => Expense;
  update: (id: Id, patch: ExpenseUpdateInput) => Expense | null;
  remove: (id: Id) => void;
}

const SEEDED_TENANTS = new Set<string>();

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],
      create: (input, tenantId) => {
        const now = new Date().toISOString();
        const expense: Expense = {
          id: crypto.randomUUID(),
          tenantId,
          branchId: input.branchId ?? null,
          category: input.category,
          amount: input.amount,
          payee: input.payee,
          description: input.description,
          paidAt: input.paidAt,
          recurrence: input.recurrence ?? 'none',
          notes: input.notes,
          createdAt: now,
          updatedAt: now,
        };
        set({ expenses: [...get().expenses, expense] });
        return expense;
      },
      update: (id, patch) => {
        const now = new Date().toISOString();
        let updated: Expense | null = null;
        set({
          expenses: get().expenses.map((e) => {
            if (e.id !== id) return e;
            updated = { ...e, ...patch, updatedAt: now };
            return updated;
          }),
        });
        return updated;
      },
      remove: (id) => set({ expenses: get().expenses.filter((e) => e.id !== id) }),
    }),
    {
      name: EXPENSE_STORE_KEY,
      version: EXPENSE_STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

function startOfMonthIso(offsetMonths = 0, day = 1): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - offsetMonths);
  d.setDate(day);
  return d.toISOString();
}

const SEED_EXPENSES: ReadonlyArray<ExpenseCreateInput> = [
  {
    category: 'rent',
    amount: 45000,
    payee: 'Property landlord',
    description: 'Monthly clinic rent',
    paidAt: startOfMonthIso(0, 1),
    recurrence: 'monthly',
  },
  {
    category: 'doctor_fee',
    amount: 28000,
    payee: 'Dr. Wade Warren',
    description: 'Doctor fee — first half of the month',
    paidAt: startOfMonthIso(0, 14),
    recurrence: 'monthly',
  },
  {
    category: 'utilities',
    amount: 6800,
    payee: 'MEA / Water authority',
    description: 'Electricity + water',
    paidAt: startOfMonthIso(0, 5),
    recurrence: 'monthly',
  },
  {
    category: 'supplies',
    amount: 12500,
    payee: 'Aesthetic supplies vendor',
    description: 'Consumables restock',
    paidAt: startOfMonthIso(0, 8),
    recurrence: 'none',
  },
  {
    category: 'marketing',
    amount: 9800,
    payee: 'Meta Ads',
    description: 'Promo for May campaign',
    paidAt: startOfMonthIso(0, 10),
    recurrence: 'none',
  },
  {
    category: 'rent',
    amount: 45000,
    payee: 'Property landlord',
    description: 'Monthly clinic rent — last month',
    paidAt: startOfMonthIso(1, 1),
    recurrence: 'monthly',
  },
];

/**
 * Hook returning expenses scoped to the active tenant. Seeds a small
 * starter set on first sight of a tenant in mocking mode so the page
 * is never empty.
 */
export function useExpenses(): Expense[] {
  const tenantId = useDevToolbar((s) => s.tenantId);
  const expenses = useExpenseStore((s) => s.expenses);
  const createExpense = useExpenseStore((s) => s.create);

  const tenantExpenses = useMemo(
    () => expenses.filter((e) => e.tenantId === tenantId),
    [expenses, tenantId],
  );

  useEffect(() => {
    if (!tenantId) return;
    if (SEEDED_TENANTS.has(tenantId)) return;
    if (tenantExpenses.length > 0) {
      SEEDED_TENANTS.add(tenantId);
      return;
    }
    SEEDED_TENANTS.add(tenantId);
    SEED_EXPENSES.forEach((seed) => createExpense(seed, tenantId));
  }, [tenantId, tenantExpenses.length, createExpense]);

  return tenantExpenses;
}
