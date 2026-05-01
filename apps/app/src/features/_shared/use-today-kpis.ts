import { useMemo } from 'react';
import type { Id } from '@lesso/domain';
import { useTodaysAppointments } from '@/features/appointment';
import { useTodaysWalkIns } from '@/features/walk-in';
import { useInventoryItems } from '@/features/inventory';

export interface TodayKpis {
  queueDepth: number;
  appointmentsBooked: number;
  walkInsCompleted: number;
  lowStockAlerts: number;
  isLoading: boolean;
}

/**
 * Aggregates Home dashboard KPIs from existing query hooks. Sparkline data
 * is intentionally omitted in this iteration — server-side 7-day buckets
 * land in A7 alongside the real backend.
 */
export function useTodayKpis(branchId: Id | null): TodayKpis {
  const appts = useTodaysAppointments(branchId);
  const walkIns = useTodaysWalkIns(branchId);
  const lowStock = useInventoryItems(branchId, true);

  return useMemo<TodayKpis>(() => {
    const walks = walkIns.data ?? [];
    const queueDepth = walks.filter(
      (w) => w.status === 'waiting' || w.status === 'in_progress',
    ).length;
    const walkInsCompleted = walks.filter((w) => w.status === 'completed').length;
    const appointmentsBooked = (appts.data ?? []).length;
    const lowStockAlerts = (lowStock.data ?? []).length;
    return {
      queueDepth,
      appointmentsBooked,
      walkInsCompleted,
      lowStockAlerts,
      isLoading: appts.isLoading || walkIns.isLoading || lowStock.isLoading,
    };
  }, [appts.data, appts.isLoading, walkIns.data, walkIns.isLoading, lowStock.data, lowStock.isLoading]);
}
