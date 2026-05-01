import { z } from 'zod';
import {
  LoyaltyAccountSchema,
  LoyaltyTransactionSchema,
  POINTS_PER_BAHT,
  type Id,
  type LoyaltyAccount,
  type LoyaltyTransaction,
} from '@lesso/domain';
import { storage } from '../storage';

const ACCOUNTS_KEY = (tenantId: Id) => `lesso:tenant:${tenantId}:loyalty-accounts`;
const TRANSACTIONS_KEY = (tenantId: Id) => `lesso:tenant:${tenantId}:loyalty-transactions`;

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
  constructor(public readonly available: number, public readonly requested: number) {
    super(`Insufficient points: have ${available}, need ${requested}`);
    this.name = 'InsufficientPointsError';
  }
}

function getOrCreateAccount(tenantId: Id, patientId: Id): LoyaltyAccount {
  const all = readAccounts(tenantId);
  const found = all.find((a) => a.patientId === patientId);
  if (found) return found;
  const now = new Date().toISOString();
  const next: LoyaltyAccount = {
    id: crypto.randomUUID(),
    tenantId,
    patientId,
    balance: 0,
    lifetimeEarned: 0,
    createdAt: now,
    updatedAt: now,
  };
  writeAccounts(tenantId, [...all, next]);
  return next;
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
    const account = getOrCreateAccount(tenantId, patientId);
    if (account.balance < points) throw new InsufficientPointsError(account.balance, points);
    return this.applyDelta(tenantId, patientId, 'redeem', -points, receiptId);
  },
  applyDelta(
    tenantId: Id,
    patientId: Id,
    type: LoyaltyTransaction['type'],
    delta: number,
    receiptId?: Id,
    reason?: string,
  ): { account: LoyaltyAccount; transaction: LoyaltyTransaction } {
    const accounts = readAccounts(tenantId);
    let account = accounts.find((a) => a.patientId === patientId);
    if (!account) {
      account = getOrCreateAccount(tenantId, patientId);
    }
    const newBalance = account.balance + delta;
    if (newBalance < 0) throw new InsufficientPointsError(account.balance, -delta);
    const now = new Date().toISOString();
    const updatedAccount: LoyaltyAccount = {
      ...account,
      balance: newBalance,
      lifetimeEarned: delta > 0 ? account.lifetimeEarned + delta : account.lifetimeEarned,
      updatedAt: now,
    };
    const transaction: LoyaltyTransaction = {
      id: crypto.randomUUID(),
      tenantId,
      patientId,
      accountId: account.id,
      type,
      amount: delta,
      balanceAfter: newBalance,
      receiptId,
      reason,
      createdAt: now,
    };
    const refreshedAccounts = readAccounts(tenantId);
    const idx = refreshedAccounts.findIndex((a) => a.id === account!.id);
    writeAccounts(
      tenantId,
      idx >= 0
        ? refreshedAccounts.map((a, i) => (i === idx ? updatedAccount : a))
        : [...refreshedAccounts, updatedAccount],
    );
    writeTransactions(tenantId, [...readTransactions(tenantId), transaction]);
    return { account: updatedAccount, transaction };
  },
  totalOutstandingPoints(tenantId: Id): number {
    return readAccounts(tenantId).reduce((sum, a) => sum + a.balance, 0);
  },
};
