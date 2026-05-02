import { useTranslation } from 'react-i18next';
import { AlertTriangle, Building2, Stethoscope } from 'lucide-react';
import type { BranchSummary } from '@reinly/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';

interface BranchSummaryCardProps {
  summary: BranchSummary;
}

export function BranchSummaryCard({ summary }: BranchSummaryCardProps) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="size-5 text-primary" aria-hidden="true" />
          {summary.branchName}
        </CardTitle>
        {summary.city ? (
          <p className="text-xs text-muted-foreground">{summary.city}</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">{t('report.revenue')}</span>
          <span className="font-heading text-2xl font-semibold tabular-nums">
            {formatCurrency(summary.revenue, locale)}
          </span>
        </div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">{t('report.visits')}</span>
          <span className="font-medium tabular-nums">
            {formatNumber(summary.visitCount, locale)}
          </span>
        </div>
        {summary.topDoctorAmount > 0 ? (
          <div className="flex items-center gap-2 text-sm">
            <Stethoscope className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">{t('branch.topDoctor')}:</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(summary.topDoctorAmount, locale)}
            </span>
          </div>
        ) : null}
        {summary.lowStockCount > 0 ? (
          <Badge variant="warning" className="inline-flex items-center gap-1">
            <AlertTriangle className="size-3" aria-hidden="true" />
            {t('branch.lowStockCount', { count: summary.lowStockCount })}
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}
