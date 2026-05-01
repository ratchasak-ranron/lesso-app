import { z } from 'zod';
import {
  WalkInSchema,
  type Id,
  type WalkIn,
  type WalkInCreateInput,
  type WalkInUpdateInput,
} from '@lesso/domain';
import { storage } from '../storage';

const KEY = (tenantId: Id) => `lesso:tenant:${tenantId}:walk-ins`;

function readAll(tenantId: Id): WalkIn[] {
  return storage.read(KEY(tenantId), z.array(WalkInSchema)) ?? [];
}

function writeAll(tenantId: Id, items: WalkIn[]): void {
  storage.write(KEY(tenantId), items);
}

export interface WalkInFilter {
  branchId?: Id;
  status?: WalkIn['status'];
  date?: string;
}

export const walkInRepo = {
  findAll(tenantId: Id, filter: WalkInFilter = {}): WalkIn[] {
    return readAll(tenantId).filter((w) => {
      if (filter.branchId && w.branchId !== filter.branchId) return false;
      if (filter.status && w.status !== filter.status) return false;
      if (filter.date && !w.arrivedAt.startsWith(filter.date)) return false;
      return true;
    });
  },
  findById(tenantId: Id, id: Id): WalkIn | null {
    return readAll(tenantId).find((w) => w.id === id) ?? null;
  },
  create(tenantId: Id, input: WalkInCreateInput): WalkIn {
    const now = new Date().toISOString();
    const next: WalkIn = {
      ...input,
      id: crypto.randomUUID(),
      tenantId,
      arrivedAt: now,
      status: 'waiting',
    };
    writeAll(tenantId, [...readAll(tenantId), next]);
    return next;
  },
  update(tenantId: Id, id: Id, patch: WalkInUpdateInput): WalkIn | null {
    const all = readAll(tenantId);
    const idx = all.findIndex((w) => w.id === id);
    if (idx < 0) return null;
    const existing = all[idx]!;
    const completedAt =
      patch.status === 'completed' && existing.status !== 'completed'
        ? new Date().toISOString()
        : existing.completedAt;
    const next: WalkIn = {
      ...existing,
      ...patch,
      completedAt,
    };
    writeAll(
      tenantId,
      all.map((w, i) => (i === idx ? next : w)),
    );
    return next;
  },
  delete(tenantId: Id, id: Id): boolean {
    const all = readAll(tenantId);
    const remaining = all.filter((w) => w.id !== id);
    if (remaining.length === all.length) return false;
    writeAll(tenantId, remaining);
    return true;
  },
};
