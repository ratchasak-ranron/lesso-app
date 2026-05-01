import { useQuery } from '@tanstack/react-query';
import type { Id } from '@lesso/domain';
import { apiClient } from '@/lib/api';
import { useCtx } from '@/features/_shared/use-ctx';

export interface MonthlyReportRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  branchId: Id | null;
}

export function monthRangeToDates(year: number, month: number): { from: string; to: string } {
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  const dd = String(lastDay).padStart(2, '0');
  return { from: `${year}-${mm}-01`, to: `${year}-${mm}-${dd}` };
}

export function useMonthlyReport(range: MonthlyReportRange) {
  const ctx = useCtx();
  const { from, to, branchId } = range;
  return useQuery({
    queryKey: ['report', ctx.tenantId, branchId, from, to] as const,
    queryFn: async () => {
      const [receipts, summary, loyalty, lowStock] = await Promise.all([
        apiClient.receipts.list(ctx, { branchId: branchId ?? undefined, from, to }),
        apiClient.commissions.summary(ctx, { branchId: branchId ?? undefined, from, to }),
        apiClient.loyalty.listAccounts(ctx),
        apiClient.inventory.listItems(ctx, {
          branchId: branchId ?? undefined,
          lowStockOnly: true,
        }),
      ]);
      const totalRevenue = receipts.reduce((sum, r) => sum + r.total, 0);
      const visitCount = receipts.length;
      return {
        receipts,
        totalRevenue,
        visitCount,
        commissionSummary: summary,
        loyaltyTotalOutstanding: loyalty.totalOutstanding,
        loyaltyAccountCount: loyalty.accounts.length,
        lowStockItems: lowStock,
      };
    },
    enabled: ctx.tenantId !== null,
  });
}
