import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Appointment,
  AppointmentCreateInput,
  AppointmentUpdateInput,
  Id,
} from '@reinly/domain';
import { apiClient } from '@/lib/api';
import { useCtx } from '@/features/_shared/use-ctx';

interface AppointmentQuery {
  branchId?: Id;
  patientId?: Id;
  date?: string;
}

export function appointmentsKey(tenantId: Id | null, query?: AppointmentQuery) {
  return [
    'appointments',
    tenantId,
    query?.branchId ?? null,
    query?.patientId ?? null,
    query?.date ?? null,
  ] as const;
}

export function useAppointments(query?: AppointmentQuery) {
  const ctx = useCtx();
  return useQuery({
    queryKey: appointmentsKey(ctx.tenantId, query),
    queryFn: () => apiClient.appointments.list(ctx, query),
    enabled: ctx.tenantId !== null,
  });
}

export function useTodaysAppointments(branchId: Id | null) {
  const today = new Date().toISOString().slice(0, 10);
  return useAppointments({
    branchId: branchId ?? undefined,
    date: today,
  });
}

export function useCreateAppointment() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<Appointment, Error, AppointmentCreateInput>({
    mutationFn: (input) => apiClient.appointments.create(ctx, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['appointments', ctx.tenantId] });
    },
  });
}

export function useUpdateAppointment() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<Appointment, Error, { id: Id; patch: AppointmentUpdateInput }>({
    mutationFn: ({ id, patch }) => apiClient.appointments.update(ctx, id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['appointments', ctx.tenantId] });
    },
  });
}
