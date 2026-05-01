import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, type LoyaltyRedeemInput } from '@lesso/api-client';
import type { Id, LoyaltyAccount, LoyaltyTransaction } from '@lesso/domain';
import { apiClient } from '@/lib/api';
import { useCtx } from '@/features/_shared/use-ctx';

export function loyaltyAccountKey(tenantId: Id | null, patientId: Id | undefined) {
  return ['loyalty', tenantId, 'account', patientId ?? null] as const;
}

export function useLoyaltyAccount(patientId: Id | undefined) {
  const ctx = useCtx();
  return useQuery<LoyaltyAccount | null>({
    queryKey: loyaltyAccountKey(ctx.tenantId, patientId),
    queryFn: async () => {
      try {
        return await apiClient.loyalty.accountByPatient(ctx, patientId as Id);
      } catch (err) {
        // 404 = patient with zero history has no account → render zero balance.
        // Propagate everything else (auth, network, 5xx) so the UI shows
        // an error state instead of a misleading zero balance.
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    enabled: ctx.tenantId !== null && !!patientId,
  });
}

export function useRedeemPoints() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<
    { account: LoyaltyAccount; transaction: LoyaltyTransaction },
    Error,
    LoyaltyRedeemInput
  >({
    mutationFn: (input) => apiClient.loyalty.redeem(ctx, input),
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: loyaltyAccountKey(ctx.tenantId, vars.patientId) });
      void qc.invalidateQueries({ queryKey: ['loyalty', ctx.tenantId] });
      void qc.invalidateQueries({ queryKey: ['audit', ctx.tenantId] });
    },
  });
}
