/* eslint-disable security/detect-object-injection -- status is a constant union literal */
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkline } from '@/components/ui/sparkline';
import { cn } from '@/lib/utils';

type Status = 'default' | 'warning' | 'destructive';
type Accent = 'honey' | 'ink-blue' | 'sage' | 'leaf' | 'petal' | 'slate';

interface KpiTileProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: ReadonlyArray<number>;
  status?: Status;
  /** Section accent for left-border + icon. Status overrides accent. */
  accent?: Accent;
}

const STATUS_BORDER: Record<Status, string> = {
  default: 'border-l-border',
  warning: 'border-l-warning',
  destructive: 'border-l-destructive',
};

const STATUS_ICON: Record<Status, string> = {
  default: 'text-primary',
  warning: 'text-warning',
  destructive: 'text-destructive',
};

const ACCENT_BORDER: Record<Accent, string> = {
  honey: 'border-l-honey',
  'ink-blue': 'border-l-ink-blue',
  sage: 'border-l-secondary',
  leaf: 'border-l-leaf',
  petal: 'border-l-petal',
  slate: 'border-l-primary',
};

const ACCENT_ICON: Record<Accent, string> = {
  honey: 'text-honey-ink',
  'ink-blue': 'text-ink-blue',
  sage: 'text-secondary',
  leaf: 'text-leaf-ink',
  petal: 'text-petal-ink',
  slate: 'text-primary',
};

export function KpiTile({
  label,
  value,
  icon: Icon,
  description,
  trend,
  status = 'default',
  accent,
}: KpiTileProps) {
  const { t } = useTranslation();
  const useAccent = status === 'default' && accent !== undefined;
  const borderClass = useAccent ? ACCENT_BORDER[accent] : STATUS_BORDER[status];
  const iconClass = useAccent ? ACCENT_ICON[accent] : STATUS_ICON[status];
  return (
    <Card className={cn('border-l-4', borderClass)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={cn('size-5 shrink-0', iconClass)} aria-hidden="true" />
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <p className="font-heading text-3xl font-semibold tabular-nums leading-none">{value}</p>
        {/* Status is conveyed visually via border + icon colour. Surface the
            same signal to AT users so the badge is not colour-only (SC 1.4.1). */}
        {status !== 'default' ? (
          <span className="sr-only">{t(`kpi.status.${status}`)}</span>
        ) : null}
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
        {trend && trend.length >= 2 ? (
          <Sparkline data={trend} ariaLabel={`${label} trend`} variant={status} />
        ) : null}
      </CardContent>
    </Card>
  );
}
