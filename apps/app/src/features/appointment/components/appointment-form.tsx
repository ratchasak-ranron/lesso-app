import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppointmentCreateInput, Patient } from '@reinly/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormError } from '@/components/ui/form-feedback';
import { useDevToolbar } from '@/store/dev-toolbar';
import { useDoctors } from '@/store/doctor-store';
import { usePatients } from '@/features/patient';
import { useCreateAppointment } from '../hooks/use-appointments';

interface AppointmentFormProps {
  patientId?: string;
  defaultDate?: string;
  onDone: () => void;
  onCancel: () => void;
}

const DEFAULT_DURATION_MIN = 30;

function defaultStart(date?: string): string {
  const d = date ? new Date(`${date}T09:00`) : nextHalfHour();
  return toLocalInput(d);
}

function nextHalfHour(): Date {
  const now = new Date();
  now.setMinutes(now.getMinutes() + (30 - (now.getMinutes() % 30)), 0, 0);
  return now;
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function addMinutes(value: string, minutes: number): string {
  const d = new Date(value);
  d.setMinutes(d.getMinutes() + minutes);
  return toLocalInput(d);
}

export function AppointmentForm({
  patientId,
  defaultDate,
  onDone,
  onCancel,
}: AppointmentFormProps) {
  const { t } = useTranslation();
  const branchId = useDevToolbar((s) => s.branchId);
  const create = useCreateAppointment();
  const submittingRef = useRef(false);

  const patients = usePatients('');
  const patientOptions = useMemo(() => {
    return (patients.data ?? []).map((p: Patient) => ({ value: p.id, label: p.fullName }));
  }, [patients.data]);

  const doctors = useDoctors();
  const doctorOptions = useMemo(
    () => [
      { value: '', label: t('appointment.unassignedDoctor') },
      ...doctors
        .filter((d) => d.active)
        .map((d) => ({
          value: d.id,
          label: d.specialty ? `${d.name} · ${d.specialty}` : d.name,
        })),
    ],
    [doctors, t],
  );

  const patientLocked = !!patientId;
  const [selectedPatient, setSelectedPatient] = useState<string>(
    patientId ?? patientOptions[0]?.value ?? '',
  );
  const [doctorId, setDoctorId] = useState<string>('');
  const [serviceName, setServiceName] = useState('');
  const [startAt, setStartAt] = useState<string>(defaultStart(defaultDate));
  const [endAt, setEndAt] = useState<string>(
    addMinutes(defaultStart(defaultDate), DEFAULT_DURATION_MIN),
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleStartChange(value: string) {
    setStartAt(value);
    if (new Date(endAt).getTime() <= new Date(value).getTime()) {
      setEndAt(addMinutes(value, DEFAULT_DURATION_MIN));
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);

    const pid = patientId ?? selectedPatient;
    if (!pid) {
      setError(t('appointment.errors.patientRequired'));
      return;
    }
    if (!branchId) {
      setError(t('appointment.errors.branchRequired'));
      return;
    }
    if (!serviceName.trim()) {
      setError(t('appointment.errors.serviceRequired'));
      return;
    }
    const startDate = new Date(startAt);
    const endDate = new Date(endAt);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setError(t('appointment.errors.timeInvalid'));
      return;
    }
    if (endDate.getTime() <= startDate.getTime()) {
      setError(t('appointment.errors.endBeforeStart'));
      return;
    }

    const input: AppointmentCreateInput = {
      branchId,
      patientId: pid,
      doctorId: doctorId || undefined,
      serviceName: serviceName.trim(),
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      notes: notes.trim() || undefined,
    };

    submittingRef.current = true;
    create.mutate(input, {
      onSuccess: () => {
        submittingRef.current = false;
        onDone();
      },
      onError: (err) => {
        submittingRef.current = false;
        setError(err.message);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!patientLocked ? (
        <div className="space-y-1.5">
          <Label htmlFor="appointment-patient">{t('appointment.patient')}</Label>
          <Select
            id="appointment-patient"
            options={patientOptions}
            value={selectedPatient}
            onValueChange={setSelectedPatient}
            placeholder={patients.isLoading ? t('common.loading') : undefined}
            disabled={patients.isLoading}
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="appointment-service">{t('appointment.service')}</Label>
        <Input
          id="appointment-service"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="appointment-doctor">{t('appointment.doctor')}</Label>
        <Select
          id="appointment-doctor"
          options={doctorOptions}
          value={doctorId}
          onValueChange={setDoctorId}
        />
        {doctors.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t('appointment.noDoctorsHint')}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="appointment-start">{t('appointment.startAt')}</Label>
          <Input
            id="appointment-start"
            type="datetime-local"
            value={startAt}
            onChange={(e) => handleStartChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="appointment-end">{t('appointment.endAt')}</Label>
          <Input
            id="appointment-end"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="appointment-notes">{t('appointment.notes')}</Label>
        <Textarea
          id="appointment-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <FormError>{error}</FormError>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={create.isPending}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
