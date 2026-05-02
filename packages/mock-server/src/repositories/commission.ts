import { z } from 'zod';
import {
  CommissionEntrySchema,
  DEFAULT_COMMISSION_RATE,
  type CommissionEntry,
  type DoctorCommissionSummary,
  type Id,
  type LineItem,
  type Receipt,
} from '@reinly/domain';
import { storage } from '../storage';
import { inRange } from './_utils';

const KEY = (tenantId: Id) => `reinly:tenant:${tenantId}:commissions`;

function readAll(tenantId: Id): CommissionEntry[] {
  return storage.read(KEY(tenantId), z.array(CommissionEntrySchema)) ?? [];
}

function writeAll(tenantId: Id, items: CommissionEntry[]): void {
  storage.write(KEY(tenantId), items);
}

export interface CommissionFilter {
  doctorId?: Id;
  branchId?: Id;
  fromIso?: string;
  toIso?: string;
  status?: CommissionEntry['status'];
}

export const commissionRepo = {
  findAll(tenantId: Id, filter: CommissionFilter = {}): CommissionEntry[] {
    return readAll(tenantId).filter((c) => {
      if (filter.doctorId && c.doctorId !== filter.doctorId) return false;
      if (filter.branchId && c.branchId !== filter.branchId) return false;
      if (filter.status && c.status !== filter.status) return false;
      if (!inRange(c.createdAt, filter.fromIso, filter.toIso)) return false;
      return true;
    });
  },
  findById(tenantId: Id, id: Id): CommissionEntry | null {
    return readAll(tenantId).find((c) => c.id === id) ?? null;
  },
  /**
   * Accrue commissions for each line item that has a doctorId.
   * Skips course-redeem line items (no commission on session burn).
   */
  accrueFromReceipt(tenantId: Id, receipt: Receipt): CommissionEntry[] {
    const entries: CommissionEntry[] = [];
    for (const li of receipt.lineItems) {
      if (!li.doctorId) continue;
      if (li.isCourseRedeem) continue;
      if (li.amount <= 0) continue;
      entries.push(buildEntry(tenantId, receipt, li));
    }
    if (entries.length === 0) return [];
    writeAll(tenantId, [...readAll(tenantId), ...entries]);
    return entries;
  },
  markPaid(tenantId: Id, id: Id): CommissionEntry | null {
    const all = readAll(tenantId);
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return null;
    const existing = all[idx]!;
    if (existing.status !== 'accrued') return existing;
    const next: CommissionEntry = {
      ...existing,
      status: 'paid',
      paidAt: new Date().toISOString(),
    };
    writeAll(
      tenantId,
      all.map((c, i) => (i === idx ? next : c)),
    );
    return next;
  },
  summaryByDoctor(
    tenantId: Id,
    doctorIdToName: Map<Id, string>,
    filter: CommissionFilter = {},
  ): DoctorCommissionSummary[] {
    const filtered = this.findAll(tenantId, filter);
    const byDoc = new Map<
      Id,
      { totalAmount: number; receiptIds: Set<Id>; statuses: Set<CommissionEntry['status']> }
    >();
    for (const c of filtered) {
      const slot = byDoc.get(c.doctorId) ?? {
        totalAmount: 0,
        receiptIds: new Set<Id>(),
        statuses: new Set<CommissionEntry['status']>(),
      };
      slot.totalAmount += c.amount;
      slot.receiptIds.add(c.receiptId);
      slot.statuses.add(c.status);
      byDoc.set(c.doctorId, slot);
    }
    const summaries: DoctorCommissionSummary[] = [];
    byDoc.forEach((slot, doctorId) => {
      const status =
        slot.statuses.size === 1 ? Array.from(slot.statuses)[0]! : ('mixed' as const);
      summaries.push({
        doctorId,
        doctorName: doctorIdToName.get(doctorId) ?? doctorId,
        visitCount: slot.receiptIds.size,
        totalAmount: slot.totalAmount,
        status,
      });
    });
    summaries.sort((a, b) => b.totalAmount - a.totalAmount);
    return summaries;
  },
};

function buildEntry(tenantId: Id, receipt: Receipt, li: LineItem): CommissionEntry {
  const rate = DEFAULT_COMMISSION_RATE;
  return {
    id: crypto.randomUUID(),
    tenantId,
    branchId: receipt.branchId,
    doctorId: li.doctorId!,
    receiptId: receipt.id,
    patientId: receipt.patientId,
    serviceName: li.serviceName ?? li.description,
    baseAmount: li.amount,
    rate,
    amount: Math.round(li.amount * rate),
    status: 'accrued',
    createdAt: receipt.createdAt,
  };
}
