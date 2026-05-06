import { describe, expect, it } from 'vitest';
import {
  PromotionUpdateSchema,
  applyPromotion,
  expensesInRange,
  isBundle,
  isCoursePackage,
  isPromotionActive,
  summarizeExpenses,
  type Expense,
  type Product,
  type Promotion,
} from '@reinly/domain';

/* -------------------------------------------------------------------------- */
/*  applyPromotion                                                            */
/* -------------------------------------------------------------------------- */

describe('applyPromotion', () => {
  it('returns 0 for a free price', () => {
    expect(applyPromotion(0, { type: 'percent', value: 50 })).toBe(0);
    expect(applyPromotion(0, { type: 'amount', value: 200 })).toBe(0);
  });

  it('computes a percent discount rounded to 2 decimals', () => {
    expect(applyPromotion(1000, { type: 'percent', value: 15 })).toBe(150);
    expect(applyPromotion(99.99, { type: 'percent', value: 10 })).toBe(10);
  });

  it('clamps a percent discount value above 100 to 100', () => {
    expect(applyPromotion(500, { type: 'percent', value: 150 })).toBe(500);
  });

  it('clamps a negative percent discount to 0', () => {
    expect(applyPromotion(500, { type: 'percent', value: -10 })).toBe(0);
  });

  it('caps a fixed-amount discount to the price floor', () => {
    expect(applyPromotion(300, { type: 'amount', value: 500 })).toBe(300);
  });

  it('returns the fixed-amount discount when below the price', () => {
    expect(applyPromotion(1500, { type: 'amount', value: 250 })).toBe(250);
  });

  it('treats a negative amount as 0', () => {
    expect(applyPromotion(1000, { type: 'amount', value: -50 })).toBe(0);
  });
});

/* -------------------------------------------------------------------------- */
/*  isPromotionActive                                                         */
/* -------------------------------------------------------------------------- */

describe('isPromotionActive', () => {
  const baseDate = new Date('2026-06-01T12:00:00Z');

  it('returns false when active flag is off', () => {
    expect(
      isPromotionActive(
        { active: false, startsAt: undefined, endsAt: undefined },
        baseDate,
      ),
    ).toBe(false);
  });

  it('returns true with no window and active flag on', () => {
    expect(
      isPromotionActive(
        { active: true, startsAt: undefined, endsAt: undefined },
        baseDate,
      ),
    ).toBe(true);
  });

  it('returns false before startsAt', () => {
    expect(
      isPromotionActive(
        {
          active: true,
          startsAt: '2026-07-01T00:00:00.000Z',
          endsAt: undefined,
        },
        baseDate,
      ),
    ).toBe(false);
  });

  it('returns false after endsAt', () => {
    expect(
      isPromotionActive(
        {
          active: true,
          startsAt: undefined,
          endsAt: '2026-05-01T00:00:00.000Z',
        },
        baseDate,
      ),
    ).toBe(false);
  });

  it('returns true within the [startsAt, endsAt] window', () => {
    expect(
      isPromotionActive(
        {
          active: true,
          startsAt: '2026-05-01T00:00:00.000Z',
          endsAt: '2026-07-01T00:00:00.000Z',
        },
        baseDate,
      ),
    ).toBe(true);
  });

  it('treats startsAt as inclusive at the exact tick', () => {
    const tick = new Date('2026-05-01T00:00:00.000Z');
    expect(
      isPromotionActive(
        {
          active: true,
          startsAt: '2026-05-01T00:00:00.000Z',
          endsAt: '2026-07-01T00:00:00.000Z',
        },
        tick,
      ),
    ).toBe(true);
  });

  it('treats endsAt as inclusive at the exact tick', () => {
    const tick = new Date('2026-07-01T00:00:00.000Z');
    expect(
      isPromotionActive(
        {
          active: true,
          startsAt: '2026-05-01T00:00:00.000Z',
          endsAt: '2026-07-01T00:00:00.000Z',
        },
        tick,
      ),
    ).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  isBundle                                                                  */
/* -------------------------------------------------------------------------- */

describe('isBundle', () => {
  const base: Pick<Product, 'bundleItems'> = { bundleItems: [] };

  it('returns false for a stand-alone product', () => {
    expect(isBundle(base)).toBe(false);
  });

  it('returns true when the product has at least one bundled child', () => {
    expect(
      isBundle({
        bundleItems: [{ productId: '00000000-0000-0000-0000-000000000001', quantity: 1 }],
      }),
    ).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  isCoursePackage                                                           */
/* -------------------------------------------------------------------------- */

describe('isCoursePackage', () => {
  it('returns false when sessionsIncluded is undefined', () => {
    expect(isCoursePackage({ sessionsIncluded: undefined })).toBe(false);
  });

  it('returns false when sessionsIncluded is 0 or negative', () => {
    expect(isCoursePackage({ sessionsIncluded: 0 })).toBe(false);
    expect(isCoursePackage({ sessionsIncluded: -1 })).toBe(false);
  });

  it('returns true when sessionsIncluded is a positive integer', () => {
    expect(isCoursePackage({ sessionsIncluded: 1 })).toBe(true);
    expect(isCoursePackage({ sessionsIncluded: 6 })).toBe(true);
    expect(isCoursePackage({ sessionsIncluded: 100 })).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  PromotionUpdateSchema retains the percent-cap refinement                  */
/* -------------------------------------------------------------------------- */

describe('PromotionUpdateSchema', () => {
  it('rejects a percent value above 100', () => {
    const result = PromotionUpdateSchema.safeParse({ type: 'percent', value: 150 });
    expect(result.success).toBe(false);
  });

  it('accepts a percent value at or below 100', () => {
    expect(PromotionUpdateSchema.safeParse({ type: 'percent', value: 100 }).success).toBe(true);
    expect(PromotionUpdateSchema.safeParse({ type: 'percent', value: 25 }).success).toBe(true);
  });

  it('accepts an amount value above 100', () => {
    const result = PromotionUpdateSchema.safeParse({ type: 'amount', value: 999 });
    expect(result.success).toBe(true);
  });

  it('accepts a partial patch that omits both type and value', () => {
    expect(PromotionUpdateSchema.safeParse({ name: 'Updated' }).success).toBe(true);
  });

  it('accepts a value-only patch when type is not provided', () => {
    // No type means we cannot decide if the percent cap applies — leave it
    // to a follow-up validation step that knows the existing record's type.
    expect(PromotionUpdateSchema.safeParse({ value: 150 }).success).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  summarizeExpenses + expensesInRange                                       */
/* -------------------------------------------------------------------------- */

function makeExpense(partial: Partial<Expense>): Expense {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    tenantId: '00000000-0000-0000-0000-0000000000aa',
    branchId: null,
    category: 'rent',
    amount: 0,
    payee: 'Test',
    paidAt: '2026-05-01T00:00:00.000Z',
    recurrence: 'none',
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    ...partial,
  } as Expense;
}

describe('summarizeExpenses', () => {
  it('returns zeros for an empty list', () => {
    const summary = summarizeExpenses([]);
    expect(summary.total).toBe(0);
    expect(summary.recurringCount).toBe(0);
    expect(summary.byCategory.rent).toBe(0);
    expect(summary.byCategory.other).toBe(0);
  });

  it('aggregates totals by category and counts recurring entries', () => {
    const summary = summarizeExpenses([
      makeExpense({ category: 'rent', amount: 45000, recurrence: 'monthly' }),
      makeExpense({ category: 'rent', amount: 1200, recurrence: 'none' }),
      makeExpense({ category: 'doctor_fee', amount: 28000, recurrence: 'monthly' }),
      makeExpense({ category: 'supplies', amount: 800, recurrence: 'none' }),
    ]);
    expect(summary.total).toBe(75000);
    expect(summary.byCategory.rent).toBe(46200);
    expect(summary.byCategory.doctor_fee).toBe(28000);
    expect(summary.byCategory.supplies).toBe(800);
    expect(summary.byCategory.salary).toBe(0);
    expect(summary.recurringCount).toBe(2);
  });
});

describe('expensesInRange', () => {
  const expenses = [
    makeExpense({ id: 'a', paidAt: '2026-04-15T10:00:00.000Z', amount: 100 }),
    makeExpense({ id: 'b', paidAt: '2026-05-01T00:00:00.000Z', amount: 200 }),
    makeExpense({ id: 'c', paidAt: '2026-05-31T23:59:59.000Z', amount: 300 }),
    makeExpense({ id: 'd', paidAt: '2026-06-01T00:00:00.000Z', amount: 400 }),
  ];

  it('includes the start tick and excludes the end tick', () => {
    const inMay = expensesInRange(
      expenses,
      '2026-05-01T00:00:00.000Z',
      '2026-06-01T00:00:00.000Z',
    );
    expect(inMay.map((e) => e.id)).toEqual(['b', 'c']);
  });

  it('returns an empty list when the range matches no entries', () => {
    expect(
      expensesInRange(expenses, '2027-01-01T00:00:00.000Z', '2027-02-01T00:00:00.000Z'),
    ).toEqual([]);
  });
});

/** Type sanity check — ensures the inferred Promotion type stays exported. */
const _typeCheck: Promotion | undefined = undefined;
void _typeCheck;
