import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2,
  Plus,
  Users,
} from 'lucide-react';
import type { Patient } from '@lesso/domain';
import { Button } from '@/components/ui/button';
import { KpiTile } from '@/components/ui/kpi-tile';
import { PageHeader } from '@/components/page-header';
import { TenantGate } from '@/components/tenant-gate';
import { useDevToolbar } from '@/store/dev-toolbar';
import { usePatients } from '@/features/patient';
import { useTodaysAppointments, AppointmentList } from '@/features/appointment';
import { useTodaysWalkIns, WalkInQueue, CheckInFlow } from '@/features/walk-in';
import { useUpdateWalkIn } from '@/features/walk-in';
import { useTodayKpis } from '@/features/_shared/use-today-kpis';

function HomePage() {
  const { t } = useTranslation();
  const branchId = useDevToolbar((s) => s.branchId);

  const [walkInOpen, setWalkInOpen] = useState(false);

  const appts = useTodaysAppointments(branchId);
  const walkIns = useTodaysWalkIns(branchId);
  const patients = usePatients('');
  const updateWalkIn = useUpdateWalkIn();
  const kpis = useTodayKpis(branchId);

  const patientsById = useMemo(() => {
    const map = new Map<string, Patient>();
    (patients.data ?? []).forEach((p) => map.set(p.id, p));
    return map;
  }, [patients.data]);

  return (
    <TenantGate>
      <div className="space-y-6">
        <PageHeader
          title={t('home.greeting')}
          actions={
            <Button onClick={() => setWalkInOpen(true)} className="cursor-pointer touch-target">
              <Plus className="size-5" aria-hidden="true" />
              {t('walkIn.newWalkIn')}
            </Button>
          }
        />

        <section
          aria-label={t('home.kpi.sectionLabel')}
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          <KpiTile
            label={t('home.kpi.queue')}
            value={kpis.queueDepth}
            icon={Users}
            description={t('home.kpi.queueHint')}
          />
          <KpiTile
            label={t('home.kpi.booked')}
            value={kpis.appointmentsBooked}
            icon={CalendarIcon}
            description={t('home.kpi.bookedHint')}
          />
          <KpiTile
            label={t('home.kpi.done')}
            value={kpis.walkInsCompleted}
            icon={CheckCircle2}
            description={t('home.kpi.doneHint')}
          />
          <KpiTile
            label={t('home.kpi.alerts')}
            value={kpis.lowStockAlerts}
            icon={AlertTriangle}
            description={t('home.kpi.alertsHint')}
            status={kpis.lowStockAlerts > 0 ? 'warning' : 'default'}
          />
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="space-y-3">
            <h3 className="font-heading text-xl font-semibold">{t('home.walkInQueue')}</h3>
            <WalkInQueue
              walkIns={walkIns.data}
              isLoading={walkIns.isLoading}
              patientsById={patientsById}
              onComplete={(w) =>
                updateWalkIn.mutate({ id: w.id, patch: { status: 'completed' } })
              }
            />
          </section>

          <section className="space-y-3">
            <h3 className="font-heading text-xl font-semibold">{t('home.todaysAppointments')}</h3>
            <AppointmentList
              appointments={appts.data}
              isLoading={appts.isLoading}
              patientsById={patientsById}
            />
          </section>
        </div>

        <CheckInFlow open={walkInOpen} onOpenChange={setWalkInOpen} />
      </div>
    </TenantGate>
  );
}

export { HomePage };
