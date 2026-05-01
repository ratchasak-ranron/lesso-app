import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Patient } from '@lesso/domain';
import { useDevToolbar } from '@/store/dev-toolbar';
import { AppointmentList, useAppointments } from '@/features/appointment';
import { usePatients } from '@/features/patient';

export function AppointmentsPage() {
  const { t } = useTranslation();
  const branchId = useDevToolbar((s) => s.branchId);
  const tenantId = useDevToolbar((s) => s.tenantId);
  const today = new Date().toISOString().slice(0, 10);

  const { data, isLoading } = useAppointments({
    branchId: branchId ?? undefined,
    date: today,
  });
  const patients = usePatients('');
  const patientsById = useMemo(() => {
    const map = new Map<string, Patient>();
    (patients.data ?? []).forEach((p) => map.set(p.id, p));
    return map;
  }, [patients.data]);

  if (!tenantId) {
    return <p className="text-muted-foreground">{t('common.noTenant')}</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-3xl font-semibold tracking-tight">
        {t('appointment.title')}
      </h2>
      <AppointmentList
        appointments={data}
        isLoading={isLoading}
        patientsById={patientsById}
      />
    </div>
  );
}
