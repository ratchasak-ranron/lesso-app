import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Id,
  WalkIn,
  WalkInCreateInput,
  WalkInStatus,
  WalkInUpdateInput,
} from '@reinly/domain';
import { apiClient } from '@/lib/api';
import { useCtx } from '@/features/_shared/use-ctx';

interface WalkInQuery {
  branchId?: Id;
  status?: WalkInStatus;
  date?: string;
}

export function walkInsKey(tenantId: Id | null, query?: WalkInQuery) {
  return [
    'walk-ins',
    tenantId,
    query?.branchId ?? null,
    query?.status ?? null,
    query?.date ?? null,
  ] as const;
}

export function useWalkIns(query?: WalkInQuery) {
  const ctx = useCtx();
  return useQuery({
    queryKey: walkInsKey(ctx.tenantId, query),
    queryFn: () => apiClient.walkIns.list(ctx, query),
    enabled: ctx.tenantId !== null,
  });
}

export function useTodaysWalkIns(branchId: Id | null) {
  const today = new Date().toISOString().slice(0, 10);
  return useWalkIns({
    branchId: branchId ?? undefined,
    date: today,
  });
}

export function useCreateWalkIn() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<WalkIn, Error, WalkInCreateInput>({
    mutationFn: (input) => apiClient.walkIns.create(ctx, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['walk-ins', ctx.tenantId] });
    },
  });
}

export function useUpdateWalkIn() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<WalkIn, Error, { id: Id; patch: WalkInUpdateInput }>({
    mutationFn: ({ id, patch }) => apiClient.walkIns.update(ctx, id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['walk-ins', ctx.tenantId] });
    },
  });
}
