import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import type { Patient } from '@lesso/domain';
import { Button } from '@/components/ui/button';
import { useDevToolbar } from '@/store/dev-toolbar';
import { usePatients } from '@/features/patient';
import { useTodaysAppointments, AppointmentList } from '@/features/appointment';
import { useTodaysWalkIns, WalkInQueue, CheckInFlow } from '@/features/walk-in';
import { useUpdateWalkIn } from '@/features/walk-in';

function HomePage() {
  const { t } = useTranslation();
  const branchId = useDevToolbar((s) => s.branchId);
  const tenantId = useDevToolbar((s) => s.tenantId);

  const [walkInOpen, setWalkInOpen] = useState(false);

  const appts = useTodaysAppointments(branchId);
  const walkIns = useTodaysWalkIns(branchId);
  const patients = usePatients('');
  const updateWalkIn = useUpdateWalkIn();

  const patientsById = useMemo(() => {
    const map = new Map<string, Patient>();
    (patients.data ?? []).forEach((p) => map.set(p.id, p));
    return map;
  }, [patients.data]);

  if (!tenantId) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">{t('common.noTenant')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">
          {t('home.greeting')}
        </h2>
        <Button onClick={() => setWalkInOpen(true)} className="cursor-pointer">
          <Plus className="size-4" aria-hidden="true" />
          {t('walkIn.newWalkIn')}
        </Button>
      </div>

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

      <CheckInFlow open={walkInOpen} onOpenChange={setWalkInOpen} />
    </div>
  );
}

export { HomePage };
