import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import type { Appointment, Patient } from '@reinly/domain';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { SelectableCard } from '@/components/ui/selectable-card';
import { formatTime } from '@/lib/format';
import { useLocale } from '@/lib/use-locale';

interface AppointmentListProps {
  appointments: Appointment[] | undefined;
  isLoading: boolean;
  patientsById?: Map<string, Patient>;
  onSelect?: (appt: Appointment) => void;
}

export function AppointmentList({
  appointments,
  isLoading,
  patientsById,
  onSelect,
}: AppointmentListProps) {
  const { t } = useTranslation();
  const locale = useLocale();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }
  if (!appointments || appointments.length === 0) {
    return (
      <EmptyState icon={CalendarIcon} title={t('home.noAppointmentsToday')} />
    );
  }

  const sorted = [...appointments].sort((a, b) => a.startAt.localeCompare(b.startAt));

  return (
    <ul className="space-y-2" role="list">
      {sorted.map((a) => {
        const patient = patientsById?.get(a.patientId);
        const time = formatTime(a.startAt, locale);
        const name = patient?.fullName ?? '…';
        const status = t(`appointment.status.${a.status}`);
        const consentAlert =
          patient?.consentStatus === 'expired' || patient?.consentStatus === 'expiring_soon';
        const ariaLabel = `${time}, ${name}, ${a.serviceName}, ${status}${
          consentAlert ? `, ${t('patient.consent.alertLabel')}` : ''
        }`;
        return (
          <li key={a.id}>
            <SelectableCard ariaLabel={ariaLabel} onClick={() => onSelect?.(a)}>
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:flex-nowrap sm:gap-4">
                <div className="flex min-w-0 flex-1 items-baseline gap-3">
                  <span className="font-mono text-lg font-semibold tabular-nums">{time}</span>
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {patient?.fullName ?? <span className="text-muted-foreground">…</span>}
                    </div>
                    <div className="truncate text-sm text-muted-foreground">{a.serviceName}</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {consentAlert ? (
                    <AlertCircle
                      role="img"
                      className="size-4 text-warning"
                      aria-label={t('patient.consent.alertLabel')}
                    />
                  ) : null}
                  <StatusBadge status={a.status} t={t} />
                </div>
              </div>
            </SelectableCard>
          </li>
        );
      })}
    </ul>
  );
}

function StatusBadge({
  status,
  t,
}: {
  status: Appointment['status'];
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const variant =
    status === 'completed' || status === 'checked_in' || status === 'in_progress'
      ? 'success'
      : status === 'no_show' || status === 'cancelled'
        ? 'destructive'
        : 'secondary';
  return <Badge variant={variant}>{t(`appointment.status.${status}`)}</Badge>;
}
