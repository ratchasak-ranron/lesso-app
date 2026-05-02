import { z } from 'zod';
import {
  AuditLogSchema,
  type AuditAction,
  type AuditLog,
  type AuditLogCreateInput,
  type Id,
} from '@reinly/domain';
import { storage } from '../storage';
import { inRange } from './_utils';

const KEY = (tenantId: Id) => `reinly:tenant:${tenantId}:audit-log`;

function readAll(tenantId: Id): AuditLog[] {
  return storage.read(KEY(tenantId), z.array(AuditLogSchema)) ?? [];
}

function writeAll(tenantId: Id, items: AuditLog[]): void {
  storage.write(KEY(tenantId), items);
}

export interface AuditFilter {
  action?: AuditAction;
  resourceType?: string;
  userId?: Id;
  fromIso?: string;
  toIso?: string;
}

export const auditRepo = {
  findAll(tenantId: Id, filter: AuditFilter = {}): AuditLog[] {
    return readAll(tenantId).filter((a) => {
      if (filter.action && a.action !== filter.action) return false;
      if (filter.resourceType && a.resourceType !== filter.resourceType) return false;
      if (filter.userId && a.userId !== filter.userId) return false;
      if (!inRange(a.createdAt, filter.fromIso, filter.toIso)) return false;
      return true;
    });
  },
  /**
   * Append-only insert. Caller MUST redact PII from `metadata` before passing.
   *
   * Atomicity: read + spread + write happen synchronously inside the JS event
   * loop, so concurrent MSW requests cannot interleave a half-applied append.
   * The pattern still matches the A3 H1 receipt counter — same TODO applies
   * for the real backend.
   *
   * TODO A7: replace with DB INSERT (Postgres). Under the real backend two
   * concurrent requests can race read-modify-write across DB connections
   * without explicit locking; use append-only insert + sequence column.
   */
  append(
    tenantId: Id,
    input: AuditLogCreateInput,
    actor: { userId?: Id; userName?: string },
  ): AuditLog {
    const next: AuditLog = {
      id: crypto.randomUUID(),
      tenantId,
      branchId: input.branchId,
      userId: actor.userId,
      userName: actor.userName,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      metadata: input.metadata,
      createdAt: new Date().toISOString(),
    };
    // Single read-modify-write in one synchronous block.
    const existing = readAll(tenantId);
    writeAll(tenantId, [...existing, next]);
    return next;
  },
};
