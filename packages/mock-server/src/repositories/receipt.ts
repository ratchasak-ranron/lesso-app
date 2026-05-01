import { z } from 'zod';
import {
  ReceiptSchema,
  type Id,
  type Receipt,
  type ReceiptCreateInput,
} from '@lesso/domain';
import { storage } from '../storage';

const KEY = (tenantId: Id) => `lesso:tenant:${tenantId}:receipts`;
const COUNTER_KEY = (tenantId: Id) => `lesso:tenant:${tenantId}:receipts:counter`;

function readAll(tenantId: Id): Receipt[] {
  return storage.read(KEY(tenantId), z.array(ReceiptSchema)) ?? [];
}

function writeAll(tenantId: Id, items: Receipt[]): void {
  storage.write(KEY(tenantId), items);
}

function nextNumber(tenantId: Id): string {
  const counterSchema = z.object({ value: z.number().int().nonnegative() });
  const current = storage.read(COUNTER_KEY(tenantId), counterSchema)?.value ?? 0;
  const next = current + 1;
  storage.write(COUNTER_KEY(tenantId), { value: next });
  return next.toString().padStart(5, '0');
}

export interface ReceiptFilter {
  branchId?: Id;
  patientId?: Id;
  fromIso?: string;
  toIso?: string;
}

function inRange(iso: string, fromIso?: string, toIso?: string): boolean {
  if (fromIso && iso < fromIso) return false;
  if (toIso && iso > toIso) return false;
  return true;
}

export const receiptRepo = {
  findAll(tenantId: Id, filter: ReceiptFilter = {}): Receipt[] {
    return readAll(tenantId).filter((r) => {
      if (filter.branchId && r.branchId !== filter.branchId) return false;
      if (filter.patientId && r.patientId !== filter.patientId) return false;
      if (!inRange(r.createdAt, filter.fromIso, filter.toIso)) return false;
      return true;
    });
  },
  findById(tenantId: Id, id: Id): Receipt | null {
    return readAll(tenantId).find((r) => r.id === id) ?? null;
  },
  create(tenantId: Id, input: ReceiptCreateInput): Receipt {
    const now = new Date().toISOString();
    const subtotal = input.lineItems.reduce((sum, li) => sum + li.amount, 0);
    const total = Math.max(0, subtotal + (input.tip ?? 0) - (input.discount ?? 0));
    const next: Receipt = {
      id: crypto.randomUUID(),
      tenantId,
      branchId: input.branchId,
      patientId: input.patientId,
      appointmentId: input.appointmentId,
      walkInId: input.walkInId,
      number: nextNumber(tenantId),
      lineItems: input.lineItems,
      subtotal,
      tip: input.tip ?? 0,
      discount: input.discount ?? 0,
      total,
      status: 'paid',
      paidAt: now,
      paymentMethod: input.paymentMethod,
      createdAt: now,
      updatedAt: now,
    };
    writeAll(tenantId, [...readAll(tenantId), next]);
    return next;
  },
};
