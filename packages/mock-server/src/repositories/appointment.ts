import { z } from 'zod';
import {
  AppointmentSchema,
  type Appointment,
  type AppointmentCreateInput,
  type AppointmentUpdateInput,
  type Id,
} from '@reinly/domain';
import { storage } from '../storage';

const KEY = (tenantId: Id) => `reinly:tenant:${tenantId}:appointments`;

function readAll(tenantId: Id): Appointment[] {
  return storage.read(KEY(tenantId), z.array(AppointmentSchema)) ?? [];
}

function writeAll(tenantId: Id, items: Appointment[]): void {
  storage.write(KEY(tenantId), items);
}

function isSameDay(iso: string, day: string): boolean {
  return iso.slice(0, 10) === day;
}

export interface AppointmentFilter {
  branchId?: Id;
  patientId?: Id;
  date?: string; // YYYY-MM-DD
}

export const appointmentRepo = {
  findAll(tenantId: Id, filter: AppointmentFilter = {}): Appointment[] {
    return readAll(tenantId).filter((a) => {
      if (filter.branchId && a.branchId !== filter.branchId) return false;
      if (filter.patientId && a.patientId !== filter.patientId) return false;
      if (filter.date && !isSameDay(a.startAt, filter.date)) return false;
      return true;
    });
  },
  findById(tenantId: Id, id: Id): Appointment | null {
    return readAll(tenantId).find((a) => a.id === id) ?? null;
  },
  create(tenantId: Id, input: AppointmentCreateInput): Appointment {
    const now = new Date().toISOString();
    const next: Appointment = {
      ...input,
      id: crypto.randomUUID(),
      tenantId,
      status: input.status ?? 'scheduled',
      createdAt: now,
      updatedAt: now,
    };
    writeAll(tenantId, [...readAll(tenantId), next]);
    return next;
  },
  update(tenantId: Id, id: Id, patch: AppointmentUpdateInput): Appointment | null {
    const all = readAll(tenantId);
    const idx = all.findIndex((a) => a.id === id);
    if (idx < 0) return null;
    const existing = all[idx]!;
    const next: Appointment = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    writeAll(
      tenantId,
      all.map((a, i) => (i === idx ? next : a)),
    );
    return next;
  },
  delete(tenantId: Id, id: Id): boolean {
    const all = readAll(tenantId);
    const remaining = all.filter((a) => a.id !== id);
    if (remaining.length === all.length) return false;
    writeAll(tenantId, remaining);
    return true;
  },
};
