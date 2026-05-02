import { useQuery } from '@tanstack/react-query';
import type { DimensionBucket, ReportDimension } from '@reinly/api-client';
import type { DoctorCommissionSummary, Id, InventoryItem, Receipt } from '@reinly/domain';
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

interface MonthlyReportData {
  receipts: Receipt[];
  totalRevenue: number;
  visitCount: number;
  commissionSummary: DoctorCommissionSummary[];
  loyaltyTotalOutstanding: number;
  loyaltyAccountCount: number;
  lowStockItems: InventoryItem[];
  partialFailures: string[];
}

function settled<T>(
  result: PromiseSettledResult<T>,
  fallback: T,
  label: string,
  sink: string[],
): T {
  if (result.status === 'fulfilled') return result.value;
  sink.push(`${label}: ${result.reason instanceof Error ? result.reason.message : 'failed'}`);
  return fallback;
}

export function useMonthlyReport(range: MonthlyReportRange) {
  const ctx = useCtx();
  const { from, to, branchId } = range;
  return useQuery<MonthlyReportData>({
    queryKey: ['report', ctx.tenantId, branchId, from, to] as const,
    queryFn: async () => {
      const partialFailures: string[] = [];
      // Promise.allSettled — if one source fails (e.g. inventory unseeded for a
      // brand-new tenant), still render the rest of the dashboard and log
      // partial failures for the user.
      const [receiptsRes, summaryRes, loyaltyRes, lowStockRes] = await Promise.allSettled([
        apiClient.receipts.list(ctx, { branchId: branchId ?? undefined, from, to }),
        apiClient.commissions.summary(ctx, { branchId: branchId ?? undefined, from, to }),
        apiClient.loyalty.listAccounts(ctx),
        apiClient.inventory.listItems(ctx, {
          branchId: branchId ?? undefined,
          lowStockOnly: true,
        }),
      ]);

      const receipts = settled(receiptsRes, [] as Receipt[], 'receipts', partialFailures);
      const commissionSummary = settled(
        summaryRes,
        [] as DoctorCommissionSummary[],
        'commissions',
        partialFailures,
      );
      const loyalty = settled(
        loyaltyRes,
        { accounts: [], totalOutstanding: 0 },
        'loyalty',
        partialFailures,
      );
      const lowStockItems = settled(
        lowStockRes,
        [] as InventoryItem[],
        'inventory',
        partialFailures,
      );

      const totalRevenue = receipts.reduce((sum, r) => sum + r.total, 0);
      const visitCount = receipts.length;
      return {
        receipts,
        totalRevenue,
        visitCount,
        commissionSummary,
        loyaltyTotalOutstanding: loyalty.totalOutstanding,
        loyaltyAccountCount: loyalty.accounts.length,
        lowStockItems,
        partialFailures,
      };
    },
    enabled: ctx.tenantId !== null,
  });
}

export function dimensionKey(
  tenantId: Id | null,
  dimension: ReportDimension,
  branchId: Id | null,
  from: string,
  to: string,
) {
  return ['report', 'dimension', tenantId, dimension, branchId, from, to] as const;
}

export function useDimensionReport(dimension: ReportDimension, range: MonthlyReportRange) {
  const ctx = useCtx();
  return useQuery<DimensionBucket[]>({
    queryKey: dimensionKey(ctx.tenantId, dimension, range.branchId, range.from, range.to),
    queryFn: () =>
      apiClient.reports.byDimension(ctx, {
        dimension,
        branchId: range.branchId ?? undefined,
        from: range.from,
        to: range.to,
      }),
    enabled: ctx.tenantId !== null,
  });
}
