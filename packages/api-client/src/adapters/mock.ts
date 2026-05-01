import { z } from 'zod';
import {
  AppointmentSchema,
  CourseSchema,
  CourseSessionSchema,
  HealthSchema,
  PatientSchema,
  WalkInSchema,
  type Appointment,
  type AppointmentCreateInput,
  type AppointmentUpdateInput,
  type Course,
  type CourseCreateInput,
  type CourseSession,
  type CourseUpdateInput,
  type Health,
  type Id,
  type Patient,
  type PatientCreateInput,
  type PatientUpdateInput,
  type WalkIn,
  type WalkInCreateInput,
  type WalkInUpdateInput,
} from '@lesso/domain';
import { ApiError } from '../errors';
import type {
  ApiClient,
  ApiClientOptions,
  AppointmentListQuery,
  CourseDecrementInput,
  CourseListQuery,
  PatientListQuery,
  RequestContext,
  WalkInListQuery,
} from '../types';

const DEFAULT_BASE_URL = '/v1';

const EnvelopeSchema = <T extends z.ZodTypeAny>(data: T) => z.object({ data });
const ListEnvelopeSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    data: z.array(item),
    meta: z.object({ total: z.number() }).optional(),
  });
const DecrementResponseSchema = z.object({
  data: z.object({ course: CourseSchema, session: CourseSessionSchema }),
});

const ApiErrorBodySchema = z.object({
  code: z.string().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

function contextHeaders(ctx?: RequestContext): HeadersInit {
  if (!ctx) return {};
  const headers: Record<string, string> = {};
  if (ctx.tenantId) headers['X-Lesso-Tenant'] = ctx.tenantId;
  if (ctx.branchId) headers['X-Lesso-Branch'] = ctx.branchId;
  if (ctx.userId) headers['X-Lesso-User'] = ctx.userId;
  return headers;
}

async function checkResponse(res: Response): Promise<void> {
  if (res.ok) return;
  let code = `HTTP_${res.status}`;
  let message = res.statusText || 'Request failed';
  try {
    const body = ApiErrorBodySchema.parse(await res.json());
    if (body.code) code = body.code;
    if (body.message) message = body.message;
    else if (body.error) message = body.error;
  } catch {
    /* body not JSON or unexpected shape — keep status defaults */
  }
  throw new ApiError(res.status, code, message);
}

function buildHeaders(ctx?: RequestContext, init?: RequestInit): HeadersInit {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...contextHeaders(ctx),
    ...(init?.headers ?? {}),
  };
}

async function fetchValidated<S extends z.ZodTypeAny>(
  url: string,
  schema: S,
  init: RequestInit = {},
  ctx?: RequestContext,
): Promise<z.infer<S>> {
  const res = await fetch(url, { ...init, headers: buildHeaders(ctx, init) });
  await checkResponse(res);
  const raw: unknown = await res.json();
  return schema.parse(raw) as z.infer<S>;
}

/**
 * For endpoints returning 204 No Content (delete-style operations).
 * Throws ApiError on non-2xx; resolves void on 2xx. No body parsing.
 */
async function fetchVoid(
  url: string,
  init: RequestInit = {},
  ctx?: RequestContext,
): Promise<void> {
  const res = await fetch(url, { ...init, headers: buildHeaders(ctx, init) });
  await checkResponse(res);
}

function buildQuery(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return '';
  const usp = new URLSearchParams();
  for (const [k, v] of entries) usp.set(k, v as string);
  return `?${usp.toString()}`;
}

export function createMockApiClient(opts: ApiClientOptions = {}): ApiClient {
  const baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;

  return {
    health: {
      async get(ctx?: RequestContext): Promise<Health> {
        const body = await fetchValidated(
          `${baseUrl}/health`,
          EnvelopeSchema(HealthSchema),
          {},
          ctx,
        );
        return body.data;
      },
    },

    patients: {
      async list(ctx: RequestContext, query: PatientListQuery = {}): Promise<Patient[]> {
        const qs = buildQuery({ q: query.q });
        const body = await fetchValidated(
          `${baseUrl}/patients${qs}`,
          ListEnvelopeSchema(PatientSchema),
          {},
          ctx,
        );
        return body.data;
      },
      async get(ctx: RequestContext, id: Id): Promise<Patient> {
        const body = await fetchValidated(
          `${baseUrl}/patients/${id}`,
          EnvelopeSchema(PatientSchema),
          {},
          ctx,
        );
        return body.data;
      },
      async create(ctx: RequestContext, input: PatientCreateInput): Promise<Patient> {
        const body = await fetchValidated(
          `${baseUrl}/patients`,
          EnvelopeSchema(PatientSchema),
          { method: 'POST', body: JSON.stringify(input) },
          ctx,
        );
        return body.data;
      },
      async update(ctx: RequestContext, id: Id, patch: PatientUpdateInput): Promise<Patient> {
        const body = await fetchValidated(
          `${baseUrl}/patients/${id}`,
          EnvelopeSchema(PatientSchema),
          { method: 'PATCH', body: JSON.stringify(patch) },
          ctx,
        );
        return body.data;
      },
      async delete(ctx: RequestContext, id: Id): Promise<void> {
        await fetchVoid(`${baseUrl}/patients/${id}`, { method: 'DELETE' }, ctx);
      },
    },

    appointments: {
      async list(ctx: RequestContext, query: AppointmentListQuery = {}): Promise<Appointment[]> {
        const qs = buildQuery({
          branchId: query.branchId,
          patientId: query.patientId,
          date: query.date,
        });
        const body = await fetchValidated(
          `${baseUrl}/appointments${qs}`,
          ListEnvelopeSchema(AppointmentSchema),
          {},
          ctx,
        );
        return body.data;
      },
      async get(ctx: RequestContext, id: Id): Promise<Appointment> {
        const body = await fetchValidated(
          `${baseUrl}/appointments/${id}`,
          EnvelopeSchema(AppointmentSchema),
          {},
          ctx,
        );
        return body.data;
      },
      async create(ctx: RequestContext, input: AppointmentCreateInput): Promise<Appointment> {
        const body = await fetchValidated(
          `${baseUrl}/appointments`,
          EnvelopeSchema(AppointmentSchema),
          { method: 'POST', body: JSON.stringify(input) },
          ctx,
        );
        return body.data;
      },
      async update(
        ctx: RequestContext,
        id: Id,
        patch: AppointmentUpdateInput,
      ): Promise<Appointment> {
        const body = await fetchValidated(
          `${baseUrl}/appointments/${id}`,
          EnvelopeSchema(AppointmentSchema),
          { method: 'PATCH', body: JSON.stringify(patch) },
          ctx,
        );
        return body.data;
      },
      async delete(ctx: RequestContext, id: Id): Promise<void> {
        await fetchVoid(`${baseUrl}/appointments/${id}`, { method: 'DELETE' }, ctx);
      },
    },

    courses: {
      async list(ctx: RequestContext, query: CourseListQuery = {}): Promise<Course[]> {
        const qs = buildQuery({ patientId: query.patientId, status: query.status });
        const body = await fetchValidated(
          `${baseUrl}/courses${qs}`,
          ListEnvelopeSchema(CourseSchema),
          {},
          ctx,
        );
        return body.data;
      },
      async get(ctx: RequestContext, id: Id): Promise<Course> {
        const body = await fetchValidated(
          `${baseUrl}/courses/${id}`,
          EnvelopeSchema(CourseSchema),
          {},
          ctx,
        );
        return body.data;
      },
      async sessions(ctx: RequestContext, id: Id): Promise<CourseSession[]> {
        const body = await fetchValidated(
          `${baseUrl}/courses/${id}/sessions`,
          ListEnvelopeSchema(CourseSessionSchema),
          {},
          ctx,
        );
        return body.data;
      },
      async create(ctx: RequestContext, input: CourseCreateInput): Promise<Course> {
        const body = await fetchValidated(
          `${baseUrl}/courses`,
          EnvelopeSchema(CourseSchema),
          { method: 'POST', body: JSON.stringify(input) },
          ctx,
        );
        return body.data;
      },
      async update(ctx: RequestContext, id: Id, patch: CourseUpdateInput): Promise<Course> {
        const body = await fetchValidated(
          `${baseUrl}/courses/${id}`,
          EnvelopeSchema(CourseSchema),
          { method: 'PATCH', body: JSON.stringify(patch) },
          ctx,
        );
        return body.data;
      },
      async decrement(
        ctx: RequestContext,
        id: Id,
        input: CourseDecrementInput,
      ): Promise<{ course: Course; session: CourseSession }> {
        const body = await fetchValidated(
          `${baseUrl}/courses/${id}/decrement`,
          DecrementResponseSchema,
          { method: 'POST', body: JSON.stringify(input) },
          ctx,
        );
        return body.data;
      },
      async delete(ctx: RequestContext, id: Id): Promise<void> {
        await fetchVoid(`${baseUrl}/courses/${id}`, { method: 'DELETE' }, ctx);
      },
    },

    walkIns: {
      async list(ctx: RequestContext, query: WalkInListQuery = {}): Promise<WalkIn[]> {
        const qs = buildQuery({
          branchId: query.branchId,
          status: query.status,
          date: query.date,
        });
        const body = await fetchValidated(
          `${baseUrl}/walk-ins${qs}`,
          ListEnvelopeSchema(WalkInSchema),
          {},
          ctx,
        );
        return body.data;
      },
      async get(ctx: RequestContext, id: Id): Promise<WalkIn> {
        const body = await fetchValidated(
          `${baseUrl}/walk-ins/${id}`,
          EnvelopeSchema(WalkInSchema),
          {},
          ctx,
        );
        return body.data;
      },
      async create(ctx: RequestContext, input: WalkInCreateInput): Promise<WalkIn> {
        const body = await fetchValidated(
          `${baseUrl}/walk-ins`,
          EnvelopeSchema(WalkInSchema),
          { method: 'POST', body: JSON.stringify(input) },
          ctx,
        );
        return body.data;
      },
      async update(ctx: RequestContext, id: Id, patch: WalkInUpdateInput): Promise<WalkIn> {
        const body = await fetchValidated(
          `${baseUrl}/walk-ins/${id}`,
          EnvelopeSchema(WalkInSchema),
          { method: 'PATCH', body: JSON.stringify(patch) },
          ctx,
        );
        return body.data;
      },
      async delete(ctx: RequestContext, id: Id): Promise<void> {
        await fetchVoid(`${baseUrl}/walk-ins/${id}`, { method: 'DELETE' }, ctx);
      },
    },
  };
}
