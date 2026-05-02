import { useQuery } from '@tanstack/react-query';
import type { AuditListQuery } from '@reinly/api-client';
import type { AuditLog } from '@reinly/domain';
import { apiClient } from '@/lib/api';
import { useCtx } from '@/features/_shared/use-ctx';

export function auditKey(tenantId: string | null, query?: AuditListQuery) {
  return [
    'audit',
    tenantId,
    query?.action ?? null,
    query?.resourceType ?? null,
    query?.userId ?? null,
    query?.from ?? null,
    query?.to ?? null,
  ] as const;
}

export function useAuditLog(query?: AuditListQuery) {
  const ctx = useCtx();
  return useQuery<AuditLog[]>({
    queryKey: auditKey(ctx.tenantId, query),
    queryFn: () => apiClient.audit.list(ctx, query),
    enabled: ctx.tenantId !== null,
  });
}
