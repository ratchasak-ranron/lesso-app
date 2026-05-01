import { useQuery } from '@tanstack/react-query';
import type { BranchSummary } from '@lesso/api-client';
import { apiClient } from '@/lib/api';
import { useCtx } from '@/features/_shared/use-ctx';

export interface BranchesQuery {
  from?: string;
  to?: string;
}

export function branchesKey(tenantId: string | null, query?: BranchesQuery) {
  return ['branches', tenantId, query?.from ?? null, query?.to ?? null] as const;
}

export function useBranchesSummary(query?: BranchesQuery) {
  const ctx = useCtx();
  return useQuery<BranchSummary[]>({
    queryKey: branchesKey(ctx.tenantId, query),
    queryFn: () => apiClient.branches.summary(ctx, query),
    enabled: ctx.tenantId !== null,
  });
}
