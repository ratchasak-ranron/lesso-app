import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Patient } from '@reinly/domain';
import { useDevToolbar } from '@/store/dev-toolbar';
import { AppointmentList, useAppointments } from '@/features/appointment';
import { usePatients } from '@/features/patient';
import { PageHeader } from '@/components/page-header';
import { TenantGate } from '@/components/tenant-gate';
import { DateNav } from '@/components/date-nav';
import { dayjs } from '@/lib/dates';

export function AppointmentsPage() {
  const { t } = useTranslation();
  const branchId = useDevToolbar((s) => s.branchId);
  const [date, setDate] = useState(() => dayjs().format('YYYY-MM-DD'));

  const { data, isLoading } = useAppointments({
    branchId: branchId ?? undefined,
    date,
  });
  const patients = usePatients('');
  const patientsById = useMemo(() => {
    const map = new Map<string, Patient>();
    (patients.data ?? []).forEach((p) => map.set(p.id, p));
    return map;
  }, [patients.data]);

  return (
    <TenantGate>
      <div className="space-y-4">
        <PageHeader
          title={t('appointment.title')}
          actions={<DateNav value={date} onChange={setDate} />}
        />
        <AppointmentList
          appointments={data}
          isLoading={isLoading}
          patientsById={patientsById}
        />
      </div>
    </TenantGate>
  );
}
