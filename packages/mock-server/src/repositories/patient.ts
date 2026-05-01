import { z } from 'zod';
import {
  PatientSchema,
  type Id,
  type Patient,
  type PatientCreateInput,
  type PatientUpdateInput,
} from '@lesso/domain';
import { storage } from '../storage';

const KEY = (tenantId: Id) => `lesso:tenant:${tenantId}:patients`;

function readAll(tenantId: Id): Patient[] {
  return storage.read(KEY(tenantId), z.array(PatientSchema)) ?? [];
}

function writeAll(tenantId: Id, patients: Patient[]): void {
  storage.write(KEY(tenantId), patients);
}

export const patientRepo = {
  findAll(tenantId: Id): Patient[] {
    return readAll(tenantId);
  },
  findById(tenantId: Id, id: Id): Patient | null {
    return readAll(tenantId).find((p) => p.id === id) ?? null;
  },
  search(tenantId: Id, query: string): Patient[] {
    const q = query.trim().toLowerCase();
    if (!q) return readAll(tenantId);
    const digits = q.replace(/\D/g, '');
    return readAll(tenantId).filter((p) => {
      if (p.fullName.toLowerCase().includes(q)) return true;
      if (digits && p.phoneDigits.includes(digits)) return true;
      if (p.lineId && p.lineId.toLowerCase().includes(q)) return true;
      if (p.nationalId && digits && p.nationalId.includes(digits)) return true;
      return false;
    });
  },
  create(tenantId: Id, input: PatientCreateInput): Patient {
    const now = new Date().toISOString();
    const next: Patient = {
      ...input,
      id: crypto.randomUUID(),
      tenantId,
      consentStatus: input.consentStatus ?? 'missing',
      createdAt: now,
      updatedAt: now,
    };
    writeAll(tenantId, [...readAll(tenantId), next]);
    return next;
  },
  update(tenantId: Id, id: Id, patch: PatientUpdateInput): Patient | null {
    const all = readAll(tenantId);
    const idx = all.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    const existing = all[idx]!;
    const next: Patient = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    writeAll(
      tenantId,
      all.map((p, i) => (i === idx ? next : p)),
    );
    return next;
  },
  delete(tenantId: Id, id: Id): boolean {
    const all = readAll(tenantId);
    const remaining = all.filter((p) => p.id !== id);
    if (remaining.length === all.length) return false;
    writeAll(tenantId, remaining);
    return true;
  },
};
