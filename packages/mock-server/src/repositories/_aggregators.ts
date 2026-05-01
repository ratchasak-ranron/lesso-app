import type { Branch, Id, Receipt } from '@lesso/domain';
import { commissionRepo } from './commission';
import { inventoryRepo } from './inventory';
import { receiptRepo } from './receipt';

export interface BranchSummary {
  branchId: Id;
  branchName: string;
  city?: string;
  revenue: number;
  visitCount: number;
  topDoctorId: Id | null;
  topDoctorAmount: number;
  lowStockCount: number;
}

interface RangeArgs {
  fromIso?: string;
  toIso?: string;
}

function isoBounds(fromDate?: string, toDate?: string): RangeArgs {
  return {
    fromIso: fromDate ? `${fromDate}T00:00:00.000Z` : undefined,
    toIso: toDate ? `${toDate}T23:59:59.999Z` : undefined,
  };
}

export function aggregateByBranch(
  tenantId: Id,
  branches: ReadonlyArray<Branch>,
  doctorIdToName: Map<Id, string>,
  fromDate?: string,
  toDate?: string,
): BranchSummary[] {
  const { fromIso, toIso } = isoBounds(fromDate, toDate);
  const tenantBranches = branches.filter((b) => b.tenantId === tenantId);
  return tenantBranches.map((branch) => {
    const receipts = receiptRepo.findAll(tenantId, { branchId: branch.id, fromIso, toIso });
    const revenue = receipts.reduce((sum, r) => sum + r.total, 0);
    const visitCount = receipts.length;
    const summary = commissionRepo.summaryByDoctor(tenantId, doctorIdToName, {
      branchId: branch.id,
      fromIso,
      toIso,
    });
    const top = summary[0];
    const items = inventoryRepo.findAllItems(tenantId, { branchId: branch.id, lowStockOnly: true });
    return {
      branchId: branch.id,
      branchName: branch.name,
      city: branch.city,
      revenue,
      visitCount,
      topDoctorId: top?.doctorId ?? null,
      topDoctorAmount: top?.totalAmount ?? 0,
      lowStockCount: items.length,
    };
  });
}

export type ReportDimension = 'doctor' | 'service' | 'branch';

export interface DimensionBucket {
  key: string; // doctorId / serviceName / branchId
  label: string;
  visitCount: number;
  revenue: number;
}

function getServiceLabel(receipt: Receipt): string {
  return receipt.lineItems[0]?.serviceName ?? receipt.lineItems[0]?.description ?? 'Unknown';
}

export function aggregateByDimension(
  tenantId: Id,
  dimension: ReportDimension,
  doctorIdToName: Map<Id, string>,
  branchIdToName: Map<Id, string>,
  branchId: Id | undefined,
  fromDate?: string,
  toDate?: string,
): DimensionBucket[] {
  const { fromIso, toIso } = isoBounds(fromDate, toDate);
  const receipts = receiptRepo.findAll(tenantId, { branchId, fromIso, toIso });

  const buckets = new Map<string, { label: string; visitCount: number; revenue: number }>();

  function add(key: string, label: string, total: number): void {
    const existing = buckets.get(key) ?? { label, visitCount: 0, revenue: 0 };
    existing.visitCount += 1;
    existing.revenue += total;
    buckets.set(key, existing);
  }

  for (const r of receipts) {
    if (dimension === 'doctor') {
      // First line-item doctor as the attribution key (course-redeem skipped).
      const li = r.lineItems.find((x) => x.doctorId);
      const docId = li?.doctorId ?? '__unassigned';
      add(docId, doctorIdToName.get(docId) ?? 'Unassigned', r.total);
    } else if (dimension === 'service') {
      const label = getServiceLabel(r);
      add(label, label, r.total);
    } else {
      add(r.branchId, branchIdToName.get(r.branchId) ?? r.branchId, r.total);
    }
  }

  return Array.from(buckets.entries())
    .map(([key, v]) => ({ key, label: v.label, visitCount: v.visitCount, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}
