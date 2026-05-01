import { z } from 'zod';
import { IdSchema, type Id } from '@lesso/domain';
import { storage } from './storage';

export const DEV_TOOLBAR_KEY = 'lesso:dev-toolbar';
const EXPECTED_VERSION = 1;

const DevToolbarPersistedSchema = z.object({
  state: z.object({
    tenantId: IdSchema.nullable(),
    branchId: IdSchema.nullable(),
    userId: IdSchema.nullable(),
  }),
  version: z.literal(EXPECTED_VERSION),
});

export interface TenantContext {
  tenantId: Id | null;
  branchId: Id | null;
  userId: Id | null;
}

const EMPTY_CONTEXT: TenantContext = { tenantId: null, branchId: null, userId: null };

export function getTenantContext(): TenantContext {
  const persisted = storage.read(DEV_TOOLBAR_KEY, DevToolbarPersistedSchema);
  if (!persisted) return EMPTY_CONTEXT;
  return {
    tenantId: persisted.state.tenantId,
    branchId: persisted.state.branchId,
    userId: persisted.state.userId,
  };
}

function headerOrNull(value: string | null): Id | null {
  if (!value) return null;
  const parsed = IdSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/**
 * Resolve request context. Header values (forwarded by api-client RequestContext)
 * take precedence over the dev-toolbar fallback. Use this in every handler
 * instead of calling getTenantContext directly.
 */
export function resolveContext(request: Request): TenantContext {
  const fallback = getTenantContext();
  return {
    tenantId: headerOrNull(request.headers.get('X-Lesso-Tenant')) ?? fallback.tenantId,
    branchId: headerOrNull(request.headers.get('X-Lesso-Branch')) ?? fallback.branchId,
    userId: headerOrNull(request.headers.get('X-Lesso-User')) ?? fallback.userId,
  };
}
