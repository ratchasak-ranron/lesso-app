import { z } from 'zod';
import {
  ConsentRecordSchema,
  type ConsentCaptureInput,
  type ConsentRecord,
  type Id,
} from '@reinly/domain';
import { storage } from '../storage';

const KEY = (tenantId: Id) => `reinly:tenant:${tenantId}:consent-records`;

function readAll(tenantId: Id): ConsentRecord[] {
  return storage.read(KEY(tenantId), z.array(ConsentRecordSchema)) ?? [];
}

function writeAll(tenantId: Id, items: ConsentRecord[]): void {
  storage.write(KEY(tenantId), items);
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

export const consentRepo = {
  findByPatient(tenantId: Id, patientId: Id): ConsentRecord[] {
    return readAll(tenantId).filter((c) => c.patientId === patientId);
  },
  findActiveByPatient(tenantId: Id, patientId: Id): ConsentRecord | null {
    const now = new Date().toISOString();
    return (
      readAll(tenantId).find((c) => {
        if (c.patientId !== patientId) return false;
        if (c.withdrawnAt) return false;
        if (c.expiresAt && c.expiresAt < now) return false;
        return true;
      }) ?? null
    );
  },
  capture(
    tenantId: Id,
    input: ConsentCaptureInput,
    capturedByUserId?: Id,
  ): ConsentRecord {
    const now = new Date().toISOString();
    const next: ConsentRecord = {
      id: crypto.randomUUID(),
      tenantId,
      patientId: input.patientId,
      scopes: input.scopes,
      capturedAt: now,
      expiresAt: input.durationMonths ? addMonths(now, input.durationMonths) : undefined,
      capturedByUserId,
    };
    writeAll(tenantId, [...readAll(tenantId), next]);
    return next;
  },
  withdraw(tenantId: Id, consentId: Id, reason?: string): ConsentRecord | null {
    const all = readAll(tenantId);
    const idx = all.findIndex((c) => c.id === consentId);
    if (idx < 0) return null;
    const existing = all[idx]!;
    if (existing.withdrawnAt) return existing;
    const next: ConsentRecord = {
      ...existing,
      withdrawnAt: new Date().toISOString(),
      withdrawalReason: reason,
    };
    writeAll(
      tenantId,
      all.map((c, i) => (i === idx ? next : c)),
    );
    return next;
  },
};
