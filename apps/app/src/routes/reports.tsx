import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, AlertTriangle, Coins, Stethoscope, Users } from 'lucide-react';
import type { ReportDimension } from '@lesso/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { KpiTile } from '@/components/ui/kpi-tile';
import { FormError, FormStatus } from '@/components/ui/form-feedback';
import { useDevToolbar } from '@/store/dev-toolbar';
import {
  monthRangeToDates,
  useDimensionReport,
  useMonthlyReport,
} from '@/features/report';
import { formatCurrency, formatNumber } from '@/lib/format';
import { monthsForLocale } from '@/lib/locale-months';
import { PageHeader } from '@/components/page-header';
import { TenantGate } from '@/components/tenant-gate';

export function ReportsPage() {
  const { t, i18n } = useTranslation();
  const branchId = useDevToolbar((s) => s.branchId);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [dimension, setDimension] = useState<ReportDimension>('doctor');

  const range = useMemo(() => {
    const dates = monthRangeToDates(year, month);
    return { ...dates, branchId };
  }, [year, month, branchId]);

  const report = useMonthlyReport(range);
  const dimensionReport = useDimensionReport(dimension, range);
  const locale = i18n.language === 'th' ? 'th' : 'en';
  const monthOptions = useMemo(
    () => monthsForLocale(locale).map((m, idx) => ({ value: String(idx + 1), label: m })),
    [locale],
  );
  const yearOptions = useMemo(
    () => [year - 1, year, year + 1].map((y) => ({ value: String(y), label: String(y) })),
    [year],
  );

  return (
    <TenantGate>
    <div className="space-y-6">
      <PageHeader
        title={t('report.title')}
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

      {report.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : null}

      {report.isError ? (
        <FormError className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
          {`${t('common.error')}: ${report.error.message}`}
        </FormError>
      ) : null}

      {report.data ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <KpiTile
              label={t('report.revenue')}
              value={formatCurrency(report.data.totalRevenue, locale)}
              icon={Activity}
              description={`${report.data.visitCount} ${t('report.receipts')}`}
            />
            <KpiTile
              label={t('report.visits')}
              value={formatNumber(report.data.visitCount, locale)}
              icon={Users}
            />
            <KpiTile
              label={t('report.loyaltyOutstanding')}
              value={formatNumber(report.data.loyaltyTotalOutstanding, locale)}
              icon={Coins}
              description={`${report.data.loyaltyAccountCount} ${t('report.activeMembers')}`}
            />
            <KpiTile
              label={t('report.lowStockAlerts')}
              value={report.data.lowStockItems.length}
              icon={AlertTriangle}
              status={report.data.lowStockItems.length > 0 ? 'warning' : 'default'}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="size-5 text-primary" aria-hidden="true" />
                {t('report.commissionByDoctor')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.data.commissionSummary.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('report.noCommission')}</p>
              ) : (
                <ul className="divide-y divide-border" role="list">
                  {report.data.commissionSummary.map((s) => (
                    <li key={s.doctorId} className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-medium">{s.doctorName}</div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {s.visitCount} {t('report.receipts')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            s.status === 'paid'
                              ? 'success'
                              : s.status === 'mixed'
                                ? 'warning'
                                : 'secondary'
                          }
                        >
                          {t(`commission.status.${s.status}`)}
                        </Badge>
                        <span className="font-mono text-lg font-semibold tabular-nums">
                          {formatCurrency(s.totalAmount, locale)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {report.data.lowStockItems.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="size-5 text-warning" aria-hidden="true" />
                  {t('report.lowStockAlerts')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border" role="list">
                  {report.data.lowStockItems.map((it) => (
                    <li key={it.id} className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {it.sku}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-warning tabular-nums">
                          {it.currentStock}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {t('inventory.minStock')}: {it.minStock}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
              <CardTitle className="text-base">{t('report.breakdown')}</CardTitle>
              <Select
                options={[
                  { value: 'doctor', label: t('report.dimension.doctor') },
                  { value: 'service', label: t('report.dimension.service') },
                  { value: 'branch', label: t('report.dimension.branch') },
                ]}
                value={dimension}
                onValueChange={(v) => setDimension(v as ReportDimension)}
                aria-label={t('report.dimension.label')}
              />
            </CardHeader>
            <CardContent>
              {dimensionReport.isLoading ? (
                <Skeleton className="h-24" />
              ) : null}
              {dimensionReport.isError ? <FormError>{t('common.error')}</FormError> : null}
              {dimensionReport.data && dimensionReport.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('report.noBreakdown')}</p>
              ) : null}
              {dimensionReport.data && dimensionReport.data.length > 0 ? (
                <ul className="divide-y divide-border" role="list">
                  {dimensionReport.data.map((b) => (
                    <li key={b.key} className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-medium">{b.label}</div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {b.visitCount} {t('report.receipts')}
                        </div>
                      </div>
                      <span className="font-mono text-lg font-semibold tabular-nums">
                        {formatCurrency(b.revenue, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>

          {report.data.partialFailures.length > 0 ? (
            <FormStatus className="text-xs">
              {`${t('report.partialFailures')}: ${report.data.partialFailures.join('; ')}`}
            </FormStatus>
          ) : null}
        </>
      ) : null}
    </div>
    </TenantGate>
  );
}
