import type { RequestContext } from '@lesso/api-client';
import { useDevToolbar } from '@/store/dev-toolbar';

/**
 * Returns the current request context (tenant, branch, user) from the
 * dev-toolbar store. All feature hooks consume this rather than reading
 * persisted state directly.
 */
export function useCtx(): RequestContext {
  const tenantId = useDevToolbar((s) => s.tenantId);
  const branchId = useDevToolbar((s) => s.branchId);
  const userId = useDevToolbar((s) => s.userId);
  return { tenantId, branchId, userId };
}
