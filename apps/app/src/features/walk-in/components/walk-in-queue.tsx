import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import type { Patient, WalkIn } from '@reinly/domain';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatTime } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';

interface WalkInQueueProps {
  walkIns: WalkIn[] | undefined;
  isLoading: boolean;
  patientsById?: Map<string, Patient>;
  onComplete?: (walkIn: WalkIn) => void;
}

export function WalkInQueue({ walkIns, isLoading, patientsById, onComplete }: WalkInQueueProps) {
  const { t } = useTranslation();
  const locale = useLocale();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }
  const active = (walkIns ?? []).filter((w) => w.status === 'waiting' || w.status === 'in_progress');
  if (active.length === 0) {
    return <EmptyState icon={UserPlus} title={t('home.noWalkInsToday')} />;
  }
  const sorted = [...active].sort((a, b) => a.arrivedAt.localeCompare(b.arrivedAt));

  return (
    <ul className="space-y-2" role="list">
      {sorted.map((w) => {
        const patient = patientsById?.get(w.patientId);
        return (
          <li key={w.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 sm:flex-nowrap">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {patient?.fullName ?? <span className="text-muted-foreground">…</span>}
                  </div>
                  <div className="truncate text-sm text-muted-foreground tabular-nums">
                    {t('walkIn.arrived', { time: formatTime(w.arrivedAt, locale) })}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={w.status === 'waiting' ? 'secondary' : 'success'}>
                    {t(`walkIn.status.${w.status}`)}
                  </Badge>
                  {onComplete && w.status !== 'completed' ? (
                    <Button size="sm" onClick={() => onComplete(w)}>
                      {t('walkIn.checkInFlow.complete')}
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
