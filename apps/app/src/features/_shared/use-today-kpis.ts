import { useMemo } from 'react';
import type { Appointment, Id, WalkIn } from '@reinly/domain';
import { useTodaysAppointments } from '@/features/appointment';
import { useTodaysWalkIns } from '@/features/walk-in';
import { useInventoryItems } from '@/features/inventory';

export interface TodayKpis {
  queueDepth: number;
  appointmentsBooked: number;
  walkInsCompleted: number;
  lowStockAlerts: number;
}

export interface TodayDashboard {
  appointments: Appointment[] | undefined;
  walkIns: WalkIn[] | undefined;
  isLoading: boolean;
  kpis: TodayKpis;
}

/**
 * Single-fetch dashboard data source for the Home route. Owns the three
 * underlying queries (appointments, walk-ins, low-stock items) so that the
 * caller does not subscribe to the same query twice. Returns both the raw
 * lists (for the two-pane content) and the derived KPI counts.
 */
export function useTodayDashboard(branchId: Id | null): TodayDashboard {
  const appts = useTodaysAppointments(branchId);
  const walkIns = useTodaysWalkIns(branchId);
  const lowStock = useInventoryItems(branchId, true);

  return useMemo<TodayDashboard>(() => {
    const walks = walkIns.data ?? [];
    const queueDepth = walks.filter(
      (w) => w.status === 'waiting' || w.status === 'in_progress',
    ).length;
    const walkInsCompleted = walks.filter((w) => w.status === 'completed').length;
    const appointmentsBooked = (appts.data ?? []).length;
    const lowStockAlerts = (lowStock.data ?? []).length;
    return {
      appointments: appts.data,
      walkIns: walkIns.data,
      isLoading: appts.isLoading || walkIns.isLoading || lowStock.isLoading,
      kpis: {
        queueDepth,
        appointmentsBooked,
        walkInsCompleted,
        lowStockAlerts,
      },
    };
  }, [
    appts.data,
    appts.isLoading,
    walkIns.data,
    walkIns.isLoading,
    lowStock.data,
    lowStock.isLoading,
  ]);
}
