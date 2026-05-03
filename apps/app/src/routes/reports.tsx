/* eslint-disable security/detect-object-injection -- map keys are constant union literals (status / accent / dimension enum) */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  Activity,
  AlertTriangle,
  Coins,
  Package,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { ReportDimension } from '@reinly/api-client';
import type { CommissionStatus } from '@reinly/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select } from '@/components/ui/select';
import { FormError, FormStatus } from '@/components/ui/form-feedback';
import { useDevToolbar } from '@/store/dev-toolbar';
import {
  monthRangeToDates,
  useDimensionReport,
  useMonthlyReport,
} from '@/features/report';
import { formatCurrency, formatNumber } from '@/lib/format';
import { monthsForLocale } from '@/lib/locale-months';
import { useLocale } from '@/lib/use-locale';
import { PageHeader } from '@/components/page-header';
import { TenantGate } from '@/components/tenant-gate';
import { cn } from '@/lib/utils';

export function ReportsPage() {
  const { t } = useTranslation();
  const locale = useLocale();
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
          eyebrow={t('nav.reports')}
          accent="zinc"
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

        {report.isError ? (
          <FormError className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
            {`${t('common.error')}: ${report.error.message}`}
          </FormError>
        ) : null}

        {report.data?.partialFailures.length ? (
          <FormStatus className="rounded-md border border-amber/40 bg-amber-soft px-3 py-2 text-xs text-amber-ink">
            {`${t('report.partialFailures')}: ${report.data.partialFailures.join('; ')}`}
          </FormStatus>
        ) : null}

        {/* KPI strip — 4 tiles for the selected month */}
        {report.isLoading ? (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : report.data ? (
          <section
            aria-label={t('report.title')}
            className="grid grid-cols-2 gap-2 lg:grid-cols-4"
          >
            <KpiCard
              label={t('report.revenue')}
              value={formatCurrency(report.data.totalRevenue, locale)}
              hint={`${formatNumber(report.data.visitCount, locale)} ${t('report.receipts')}`}
              icon={TrendingUp}
              accent="indigo"
            />
            <KpiCard
              label={t('report.visits')}
              value={formatNumber(report.data.visitCount, locale)}
              icon={Users}
              accent="sky"
            />
            <KpiCard
              label={t('report.loyaltyOutstanding')}
              value={formatNumber(report.data.loyaltyTotalOutstanding, locale)}
              hint={`${formatNumber(report.data.loyaltyAccountCount, locale)} ${t('report.activeMembers')}`}
              icon={Coins}
              accent="violet"
            />
            <KpiCard
              label={t('report.lowStockAlerts')}
              value={formatNumber(report.data.lowStockItems.length, locale)}
              icon={AlertTriangle}
              accent={report.data.lowStockItems.length > 0 ? 'amber' : 'zinc'}
            />
          </section>
        ) : null}

        {/* Breakdown — full-width with dimension pill toggle and bar list */}
        {report.data ? (
          <Card className="overflow-hidden p-0">
            <CardHeader className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t('report.breakdown')}
              </CardTitle>
              <DimensionPills dimension={dimension} setDimension={setDimension} t={t} />
            </CardHeader>
            <CardContent className="p-0">
              {dimensionReport.isLoading ? (
                <div className="space-y-1 p-5">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : dimensionReport.isError ? (
                <div className="p-5">
                  <FormError>{t('common.error')}</FormError>
                </div>
              ) : !dimensionReport.data || dimensionReport.data.length === 0 ? (
                <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                  {t('report.noBreakdown')}
                </p>
              ) : (
                <BreakdownList rows={dimensionReport.data} locale={locale} t={t} />
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* Two-col supporting cards: commissions + low stock */}
        {report.data ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden p-0">
              <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border p-5">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <Stethoscope className="size-4" aria-hidden="true" />
                  {t('report.commissionByDoctor')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {report.data.commissionSummary.length === 0 ? (
                  <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                    {t('report.noCommission')}
                  </p>
                ) : (
                  <ul className="divide-y divide-border" role="list">
                    {report.data.commissionSummary.map((s) => (
                      <li
                        key={s.doctorId}
                        className="flex items-center justify-between gap-3 px-5 py-3"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            {s.doctorName}
                          </div>
                          <div className="text-xs text-muted-foreground tabular-nums">
                            {formatNumber(s.visitCount, locale)} {t('report.receipts')}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                              COMMISSION_PILL[s.status],
                            )}
                          >
                            {t(`commission.status.${s.status}`)}
                          </span>
                          <span className="font-mono text-base font-semibold tabular-nums">
                            {formatCurrency(s.totalAmount, locale)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden p-0">
              <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border p-5">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <Package className="size-4" aria-hidden="true" />
                  {t('report.lowStockAlerts')}
                </CardTitle>
                {report.data.lowStockItems.length > 0 ? (
                  <span className="rounded-full bg-amber-soft px-2.5 py-0.5 text-[11px] font-medium text-amber-ink tabular-nums">
                    {report.data.lowStockItems.length}
                  </span>
                ) : null}
              </CardHeader>
              <CardContent className="p-0">
                {report.data.lowStockItems.length === 0 ? (
                  <p className="flex items-center gap-2 px-5 py-12 text-center text-sm text-muted-foreground">
                    <Activity className="size-4 text-emerald-ink" aria-hidden="true" />
                    {t('report.lowStockAlerts')}: 0
                  </p>
                ) : (
                  <ul className="divide-y divide-border" role="list">
                    {report.data.lowStockItems.map((it) => (
                      <li
                        key={it.id}
                        className="flex items-center justify-between gap-3 px-5 py-3"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            {it.name}
                          </div>
                          <div className="text-xs text-muted-foreground">{it.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm font-semibold tabular-nums text-amber-ink">
                            {it.currentStock}
                            <span className="text-muted-foreground"> / {it.minStock}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </TenantGate>
  );
}

/* -------------------------------------------------------------------------- */
/*  KpiCard                                                                   */
/* -------------------------------------------------------------------------- */

type Accent = 'indigo' | 'sky' | 'violet' | 'amber' | 'zinc';

const KPI_BG: Record<Accent, string> = {
  indigo: 'bg-indigo-soft text-indigo-ink',
  sky: 'bg-sky-soft text-sky-ink',
  violet: 'bg-violet-soft text-violet-ink',
  amber: 'bg-amber-soft text-amber-ink',
  zinc: 'bg-muted text-foreground',
};

const KPI_DOT: Record<Accent, string> = {
  indigo: 'bg-indigo',
  sky: 'bg-sky',
  violet: 'bg-violet',
  amber: 'bg-amber',
  zinc: 'bg-foreground',
};

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof TrendingUp;
  accent: Accent;
}) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-hover">
      <div className="flex items-start justify-between gap-3 pb-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className={cn('size-1.5 rounded-full', KPI_DOT[accent])} />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        </div>
        <span
          aria-hidden="true"
          className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', KPI_BG[accent])}
        >
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>
      </div>
      <p className="font-heading text-2xl font-semibold tabular-nums leading-none tracking-tight text-foreground">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  DimensionPills                                                            */
/* -------------------------------------------------------------------------- */

function DimensionPills({
  dimension,
  setDimension,
  t,
}: {
  dimension: ReportDimension;
  setDimension: (d: ReportDimension) => void;
  t: TFunction;
}) {
  const items: Array<{ key: ReportDimension; labelKey: string }> = [
    { key: 'doctor', labelKey: 'report.dimension.doctor' },
    { key: 'service', labelKey: 'report.dimension.service' },
    { key: 'branch', labelKey: 'report.dimension.branch' },
  ];
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1" role="tablist" aria-label={t('report.dimension.label')}>
      {items.map((it) => {
        const active = dimension === it.key;
        return (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setDimension(it.key)}
            className={cn(
              'cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t(it.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  BreakdownList — bar chart by row                                          */
/* -------------------------------------------------------------------------- */

interface BreakdownRow {
  key: string;
  label: string;
  revenue: number;
  visitCount: number;
}

function BreakdownList({
  rows,
  locale,
  t,
}: {
  rows: BreakdownRow[];
  locale: 'en' | 'th';
  t: TFunction;
}) {
  const sorted = [...rows].sort((a, b) => b.revenue - a.revenue);
  const top = sorted[0]?.revenue ?? 0;
  return (
    <ul className="divide-y divide-border" role="list">
      {sorted.map((r) => {
        const percent = top > 0
          ? Math.max(2, Math.min(100, Math.round((r.revenue / top) * 100)))
          : 0;
        return (
          <li key={r.key} className="px-5 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-medium text-foreground">{r.label}</span>
              <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(r.revenue, locale)}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={r.label}
              >
                <span
                  aria-hidden="true"
                  className="block h-full bg-foreground/85 transition-[width] duration-200"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                {formatNumber(r.visitCount, locale)} {t('report.receipts')}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/*  Status pill colour map                                                    */
/* -------------------------------------------------------------------------- */

// CommissionSummary status extends CommissionStatus with a "mixed" rollup
// for doctors with both paid + accrued entries.
type CommissionSummaryStatus = CommissionStatus | 'mixed';

const COMMISSION_PILL: Record<CommissionSummaryStatus, string> = {
  accrued: 'bg-muted text-muted-foreground',
  paid: 'bg-emerald-soft text-emerald-ink',
  voided: 'bg-rose-soft text-rose-ink',
  mixed: 'bg-amber-soft text-amber-ink',
};
