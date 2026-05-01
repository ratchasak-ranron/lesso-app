import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { BranchSummaryCard, useBranchesSummary } from '@/features/branch';
import { monthRangeToDates } from '@/features/report';
import { PageHeader } from '@/components/page-header';
import { TenantGate } from '@/components/tenant-gate';
import { FormError } from '@/components/ui/form-feedback';
import { formatCurrency, formatNumber } from '@/lib/format';
import { monthsForLocale } from '@/lib/locale-months';

export function BranchesPage() {
  const { t, i18n } = useTranslation();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const range = useMemo(() => monthRangeToDates(year, month), [year, month]);
  const { data, isLoading, isError, error } = useBranchesSummary(range);
  const locale = i18n.language === 'th' ? 'th' : 'en';
  const monthOptions = useMemo(
    () => monthsForLocale(locale).map((m, idx) => ({ value: String(idx + 1), label: m })),
    [locale],
  );
  const yearOptions = useMemo(
    () => [year - 1, year, year + 1].map((y) => ({ value: String(y), label: String(y) })),
    [year],
  );

  const combined = useMemo(() => {
    const items = data ?? [];
    return items.reduce(
      (acc, b) => ({
        revenue: acc.revenue + b.revenue,
        visits: acc.visits + b.visitCount,
        lowStock: acc.lowStock + b.lowStockCount,
      }),
      { revenue: 0, visits: 0, lowStock: 0 },
    );
  }, [data]);

  return (
    <TenantGate>
    <div className="space-y-6">
      <PageHeader
        title={t('branch.title')}
        actions={
          <div className="flex items-center gap-2">
            <Select
              options={monthOptions}
              value={String(month)}
              onValueChange={(v) => setMonth(Number(v))}
              aria-label={t('report.month')}
            />
            <Select
              options={yearOptions}
              value={String(year)}
              onValueChange={(v) => setYear(Number(v))}
              aria-label={t('report.year')}
            />
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : null}

      {isError ? (
        <FormError className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
          {`${t('common.error')}: ${error.message}`}
        </FormError>
      ) : null}

      {data && data.length === 0 && !isLoading ? (
        <EmptyState icon={Building2} title={t('branch.noBranches')} />
      ) : null}

      {data && data.length > 0 ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.map((b) => (
              <BranchSummaryCard key={b.branchId} summary={b} />
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('branch.combined')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div>
                <div className="text-xs text-muted-foreground">{t('report.revenue')}</div>
                <div className="font-heading text-2xl font-semibold tabular-nums">
                  {formatCurrency(combined.revenue, locale)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t('report.visits')}</div>
                <div className="font-heading text-2xl font-semibold tabular-nums">
                  {formatNumber(combined.visits, locale)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{t('report.lowStockAlerts')}</div>
                <div className="font-heading text-2xl font-semibold tabular-nums">
                  {formatNumber(combined.lowStock, locale)}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
    </TenantGate>
  );
}
