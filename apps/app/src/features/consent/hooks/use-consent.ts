import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ConsentCaptureInput,
  ConsentRecord,
  ConsentWithdrawInput,
  Id,
} from '@lesso/domain';
import { apiClient } from '@/lib/api';
import { useCtx } from '@/features/_shared/use-ctx';

export function consentByPatientKey(tenantId: Id | null, patientId: Id | undefined) {
  return ['consent', tenantId, 'by-patient', patientId ?? null] as const;
}

export function useConsentByPatient(patientId: Id | undefined) {
  const ctx = useCtx();
  return useQuery({
    queryKey: consentByPatientKey(ctx.tenantId, patientId),
    queryFn: () => apiClient.consent.byPatient(ctx, patientId as Id),
    enabled: ctx.tenantId !== null && !!patientId,
  });
}

export function useCaptureConsent() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<ConsentRecord, Error, ConsentCaptureInput>({
    mutationFn: (input) => apiClient.consent.capture(ctx, input),
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: consentByPatientKey(ctx.tenantId, vars.patientId) });
      // Patient's `consentStatus` is computed off these records; bust the
      // patient detail cache so the badge re-renders.
      void qc.invalidateQueries({ queryKey: ['patients', ctx.tenantId] });
      void qc.invalidateQueries({ queryKey: ['audit', ctx.tenantId] });
    },
  });
}

// Hook variables carry `patientId` so the success callback can invalidate the
// patient-scoped consent cache. The transport-level withdraw input does not.
export type WithdrawConsentVars = ConsentWithdrawInput & { patientId: Id };

export function useWithdrawConsent() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<ConsentRecord, Error, WithdrawConsentVars>({
    mutationFn: ({ consentId, reason }) =>
      apiClient.consent.withdraw(ctx, { consentId, reason }),
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: consentByPatientKey(ctx.tenantId, vars.patientId) });
      void qc.invalidateQueries({ queryKey: ['patients', ctx.tenantId] });
      void qc.invalidateQueries({ queryKey: ['audit', ctx.tenantId] });
    },
  });
}
