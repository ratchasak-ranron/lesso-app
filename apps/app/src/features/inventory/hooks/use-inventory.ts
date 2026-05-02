import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Id,
  InventoryItem,
  InventoryItemCreateInput,
  InventoryMovement,
  InventoryMovementCreateInput,
} from '@reinly/domain';
import { apiClient } from '@/lib/api';
import { useCtx } from '@/features/_shared/use-ctx';

export function inventoryItemsKey(tenantId: Id | null, branchId?: Id | null, lowStockOnly?: boolean) {
  return ['inventory', tenantId, branchId ?? null, lowStockOnly ? 'low' : 'all'] as const;
}

export function useInventoryItems(branchId?: Id | null, lowStockOnly?: boolean) {
  const ctx = useCtx();
  return useQuery({
    queryKey: inventoryItemsKey(ctx.tenantId, branchId, lowStockOnly),
    queryFn: () =>
      apiClient.inventory.listItems(ctx, {
        branchId: branchId ?? undefined,
        lowStockOnly,
      }),
    enabled: ctx.tenantId !== null,
  });
}

export function useApplyMovement() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<
    { item: InventoryItem; movement: InventoryMovement },
    Error,
    InventoryMovementCreateInput
  >({
    mutationFn: (input) => apiClient.inventory.applyMovement(ctx, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['inventory', ctx.tenantId] });
    },
  });
}

export function useCreateInventoryItem() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<InventoryItem, Error, InventoryItemCreateInput>({
    mutationFn: (input) => apiClient.inventory.createItem(ctx, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['inventory', ctx.tenantId] });
    },
  });
}
