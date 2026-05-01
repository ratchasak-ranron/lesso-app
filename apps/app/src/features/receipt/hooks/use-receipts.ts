import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Id, Receipt, ReceiptCreateInput } from '@lesso/domain';
import { apiClient } from '@/lib/api';
import { useCtx } from '@/features/_shared/use-ctx';

interface ReceiptListQueryArgs {
  branchId?: Id;
  patientId?: Id;
  from?: string;
  to?: string;
}

export function receiptsKey(tenantId: Id | null, query?: ReceiptListQueryArgs) {
  return [
    'receipts',
    tenantId,
    query?.branchId ?? null,
    query?.patientId ?? null,
    query?.from ?? null,
    query?.to ?? null,
  ] as const;
}

export function useReceipts(query: ReceiptListQueryArgs = {}) {
  const ctx = useCtx();
  return useQuery({
    queryKey: receiptsKey(ctx.tenantId, query),
    queryFn: () => apiClient.receipts.list(ctx, query),
    enabled: ctx.tenantId !== null,
  });
}

export function useCreateReceipt() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<Receipt, Error, ReceiptCreateInput>({
    mutationFn: (input) => apiClient.receipts.create(ctx, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['receipts', ctx.tenantId] });
      void qc.invalidateQueries({ queryKey: ['commissions', ctx.tenantId] });
      void qc.invalidateQueries({ queryKey: ['loyalty', ctx.tenantId] });
    },
  });
}
