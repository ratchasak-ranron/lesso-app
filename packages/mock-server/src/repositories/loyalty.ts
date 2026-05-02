import { z } from 'zod';
import {
  LoyaltyAccountSchema,
  LoyaltyTransactionSchema,
  POINTS_PER_BAHT,
  type Id,
  type LoyaltyAccount,
  type LoyaltyTransaction,
} from '@reinly/domain';
import { storage } from '../storage';

const ACCOUNTS_KEY = (tenantId: Id) => `reinly:tenant:${tenantId}:loyalty-accounts`;
const TRANSACTIONS_KEY = (tenantId: Id) => `reinly:tenant:${tenantId}:loyalty-transactions`;

function readAccounts(tenantId: Id): LoyaltyAccount[] {
  return storage.read(ACCOUNTS_KEY(tenantId), z.array(LoyaltyAccountSchema)) ?? [];
}
function readTransactions(tenantId: Id): LoyaltyTransaction[] {
  return storage.read(TRANSACTIONS_KEY(tenantId), z.array(LoyaltyTransactionSchema)) ?? [];
}
function writeAccounts(tenantId: Id, items: LoyaltyAccount[]): void {
  storage.write(ACCOUNTS_KEY(tenantId), items);
}
function writeTransactions(tenantId: Id, items: LoyaltyTransaction[]): void {
  storage.write(TRANSACTIONS_KEY(tenantId), items);
}

export class InsufficientPointsError extends Error {
  constructor(
    public readonly available: number,
    public readonly requested: number,
  ) {
    // Public message intentionally generic — does NOT embed available/requested
    // (financial data shouldn't leak into HTTP error bodies). Caller-side has
    // structured fields for client-formatted messaging.
    super('Insufficient points');
    this.name = 'InsufficientPointsError';
  }
}

function buildNewAccount(tenantId: Id, patientId: Id, now: string): LoyaltyAccount {
  return {
    id: crypto.randomUUID(),
    tenantId,
    patientId,
    balance: 0,
    lifetimeEarned: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export const loyaltyRepo = {
  findAccountByPatient(tenantId: Id, patientId: Id): LoyaltyAccount | null {
    return readAccounts(tenantId).find((a) => a.patientId === patientId) ?? null;
  },
  findAllAccounts(tenantId: Id): LoyaltyAccount[] {
    return readAccounts(tenantId);
  },
  findTransactionsByPatient(tenantId: Id, patientId: Id): LoyaltyTransaction[] {
    return readTransactions(tenantId).filter((t) => t.patientId === patientId);
  },
  earn(
    tenantId: Id,
    patientId: Id,
    amountBaht: number,
    receiptId?: Id,
  ): { account: LoyaltyAccount; transaction: LoyaltyTransaction } {
    const points = Math.floor(amountBaht * POINTS_PER_BAHT);
    return this.applyDelta(tenantId, patientId, 'earn', points, receiptId);
  },
  redeem(
    tenantId: Id,
    patientId: Id,
    points: number,
    receiptId?: Id,
  ): { account: LoyaltyAccount; transaction: LoyaltyTransaction } {
    // Pre-check is redundant — applyDelta will throw InsufficientPointsError
    // if newBalance < 0. Removed pre-check to keep single read-modify-write.
    return this.applyDelta(tenantId, patientId, 'redeem', -points, receiptId);
  },
  /**
   * Single read-modify-write per key. The previous implementation read accounts
   * twice (once for the balance check, once after a write inside
   * `getOrCreateAccount`) which created a TOCTOU window where two concurrent
   * earns on the same patient could both see balance=0 and the second write
   * clobbered the first. Mirrors the A2 `courseRepo.decrement` pattern.
   */
  applyDelta(
    tenantId: Id,
    patientId: Id,
    type: LoyaltyTransaction['type'],
    delta: number,
    receiptId?: Id,
    reason?: string,
  ): { account: LoyaltyAccount; transaction: LoyaltyTransaction } {
    const now = new Date().toISOString();
    const accounts = readAccounts(tenantId);
    const idx = accounts.findIndex((a) => a.patientId === patientId);
    const baseAccount = idx >= 0 ? accounts[idx]! : buildNewAccount(tenantId, patientId, now);

    const newBalance = baseAccount.balance + delta;
    if (newBalance < 0) throw new InsufficientPointsError(baseAccount.balance, -delta);

    const updatedAccount: LoyaltyAccount = {
      ...baseAccount,
      balance: newBalance,
      lifetimeEarned:
        delta > 0 ? baseAccount.lifetimeEarned + delta : baseAccount.lifetimeEarned,
      updatedAt: now,
    };
    const transaction: LoyaltyTransaction = {
      id: crypto.randomUUID(),
      tenantId,
      patientId,
      accountId: updatedAccount.id,
      type,
      amount: delta,
      balanceAfter: newBalance,
      receiptId,
      reason,
      createdAt: now,
    };

    writeAccounts(
      tenantId,
      idx >= 0 ? accounts.map((a, i) => (i === idx ? updatedAccount : a)) : [...accounts, updatedAccount],
    );
    writeTransactions(tenantId, [...readTransactions(tenantId), transaction]);
    return { account: updatedAccount, transaction };
  },
  totalOutstandingPoints(tenantId: Id): number {
    return readAccounts(tenantId).reduce((sum, a) => sum + a.balance, 0);
  },
};
