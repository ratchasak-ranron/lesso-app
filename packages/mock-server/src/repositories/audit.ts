import { z } from 'zod';
import {
  AuditLogSchema,
  type AuditAction,
  type AuditLog,
  type AuditLogCreateInput,
  type Id,
} from '@lesso/domain';
import { storage } from '../storage';
import { inRange } from './_utils';

const KEY = (tenantId: Id) => `lesso:tenant:${tenantId}:audit-log`;

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
    writeAll(tenantId, [...readAll(tenantId), next]);
    return next;
  },
};
