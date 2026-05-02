import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Course,
  CourseCreateInput,
  CourseSession,
  CourseStatus,
  CourseUpdateInput,
  Id,
} from '@reinly/domain';
import type { CourseDecrementInput } from '@reinly/api-client';
import { apiClient } from '@/lib/api';
import { useCtx } from '@/features/_shared/use-ctx';

export function coursesKey(tenantId: Id | null, query?: { patientId?: Id; status?: CourseStatus }) {
  return ['courses', tenantId, query?.patientId ?? null, query?.status ?? null] as const;
}

export function useCourses(query?: { patientId?: Id; status?: CourseStatus }) {
  const ctx = useCtx();
  return useQuery({
    queryKey: coursesKey(ctx.tenantId, query),
    queryFn: () => apiClient.courses.list(ctx, query),
    enabled: ctx.tenantId !== null,
  });
}

export function useActiveCoursesForPatient(patientId: Id | undefined) {
  const ctx = useCtx();
  return useQuery({
    queryKey: coursesKey(ctx.tenantId, { patientId, status: 'active' }),
    queryFn: () => apiClient.courses.list(ctx, { patientId, status: 'active' }),
    enabled: ctx.tenantId !== null && !!patientId,
  });
}

export function useCreateCourse() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<Course, Error, CourseCreateInput>({
    mutationFn: (input) => apiClient.courses.create(ctx, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['courses', ctx.tenantId] });
    },
  });
}

export function useUpdateCourse() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<Course, Error, { id: Id; patch: CourseUpdateInput }>({
    mutationFn: ({ id, patch }) => apiClient.courses.update(ctx, id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['courses', ctx.tenantId] });
    },
  });
}

export function useDecrementCourse() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation<
    { course: Course; session: CourseSession },
    Error,
    { id: Id; input: CourseDecrementInput }
  >({
    mutationFn: ({ id, input }) => apiClient.courses.decrement(ctx, id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['courses', ctx.tenantId] });
    },
  });
}
