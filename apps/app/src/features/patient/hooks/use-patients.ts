import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Id,
  Patient,
  PatientCreateInput,
  PatientUpdateInput,
} from '@lesso/domain';
import { apiClient } from '@/lib/api';
import { useCtx } from '@/features/_shared/use-ctx';

/**
 * All patient queries share the `'patients'` root segment so prefix-based
 * invalidation reaches both list and detail caches.
 */
export function patientsKey(tenantId: Id | null, query: string) {
  return ['patients', tenantId, 'list', query] as const;
}

export function patientKey(tenantId: Id | null, id: Id | undefined) {
  return ['patients', tenantId, 'detail', id] as const;
}

export function usePatients(query: string = '') {
  const ctx = useCtx();
  return useQuery({
    queryKey: patientsKey(ctx.tenantId, query),
    queryFn: () => apiClient.patients.list(ctx, { q: query }),
    enabled: ctx.tenantId !== null,
  });
}

export function usePatient(id: Id | undefined) {
  const ctx = useCtx();
  return useQuery({
    queryKey: patientKey(ctx.tenantId, id),
    queryFn: () => apiClient.patients.get(ctx, id as Id),
    enabled: ctx.tenantId !== null && !!id,
  });
}

export function useCreatePatient() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<Patient, Error, PatientCreateInput>({
    mutationFn: (input) => apiClient.patients.create(ctx, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['patients', ctx.tenantId] });
    },
  });
}

export function useUpdatePatient() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<Patient, Error, { id: Id; patch: PatientUpdateInput }>({
    mutationFn: ({ id, patch }) => apiClient.patients.update(ctx, id, patch),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: ['patients', ctx.tenantId] });
      void qc.invalidateQueries({ queryKey: patientKey(ctx.tenantId, id) });
    },
  });
}

export function useDeletePatient() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<void, Error, Id>({
    mutationFn: (id) => apiClient.patients.delete(ctx, id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['patients', ctx.tenantId] });
    },
  });
}
