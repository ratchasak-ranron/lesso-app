import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import {
  CourseCreateSchema,
  CourseStatusSchema,
  CourseUpdateSchema,
  IdSchema,
  type Id,
} from '@lesso/domain';
import { resolveContext } from '../context';
import { auditRepo } from '../repositories/audit';
import {
  CourseExhaustedError,
  CourseNotFoundError,
  courseRepo,
  type CourseFilter,
} from '../repositories/course';
import { getUsers } from '../seed';
import {
  actorFromContext,
  badRequest,
  conflict,
  noTenant,
  notFound,
  parseEnumParam,
  parseIdParam,
  readJson,
} from './_shared';

const actor = (tenantId: Id, userId: Id | null) =>
  actorFromContext(tenantId, userId, getUsers);

const DecrementBodySchema = z.object({
  branchId: IdSchema,
  performedByUserId: IdSchema.optional(),
  appointmentId: IdSchema.optional(),
  notes: z.string().max(1000).optional(),
});

export const courseHandlers = [
  http.get('/v1/courses', ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const url = new URL(request.url);
    const patientId = parseIdParam(url.searchParams.get('patientId'));
    const status = parseEnumParam(url.searchParams.get('status'), CourseStatusSchema);
    if (patientId === null || status === null) {
      return badRequest('VALIDATION', 'Invalid filter parameter');
    }
    const filter: CourseFilter = { patientId, status };
    const data = courseRepo.findAll(tenantId, filter);
    return HttpResponse.json({ data, meta: { total: data.length } });
  }),

  http.get('/v1/courses/:id', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const item = courseRepo.findById(tenantId, params.id as Id);
    if (!item) return notFound(`Course ${params.id as string} not found`);
    return HttpResponse.json({ data: item });
  }),

  http.get('/v1/courses/:id/sessions', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const data = courseRepo.sessions(tenantId, params.id as Id);
    return HttpResponse.json({ data, meta: { total: data.length } });
  }),

  http.post('/v1/courses', async ({ request }) => {
    const { tenantId, userId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = CourseCreateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid course', parsed.error.flatten());
    const created = courseRepo.create(tenantId, parsed.data);
    auditRepo.append(
      tenantId,
      { action: 'course.create', resourceType: 'course', resourceId: created.id },
      actor(tenantId, userId),
    );
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.patch('/v1/courses/:id', async ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = CourseUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid patch', parsed.error.flatten());
    const updated = courseRepo.update(tenantId, params.id as Id, parsed.data);
    if (!updated) return notFound(`Course ${params.id as string} not found`);
    return HttpResponse.json({ data: updated });
  }),

  http.post('/v1/courses/:id/decrement', async ({ request, params }) => {
    const { tenantId, userId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = DecrementBodySchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('VALIDATION', 'Invalid decrement', parsed.error.flatten());
    }
    try {
      const result = courseRepo.decrement(tenantId, params.id as Id, parsed.data);
      const decrementMetadata = {
        sessionsUsed: result.course.sessionsUsed,
        sessionsTotal: result.course.sessionsTotal,
      };
      auditRepo.append(
        tenantId,
        {
          branchId: parsed.data.branchId,
          action: 'course.decrement',
          resourceType: 'course',
          resourceId: result.course.id,
          metadata: decrementMetadata,
        },
        actor(tenantId, userId),
      );
      return HttpResponse.json({ data: result });
    } catch (err) {
      if (err instanceof CourseExhaustedError) return conflict('COURSE_EXHAUSTED', err.message);
      if (err instanceof CourseNotFoundError) return notFound(err.message);
      throw err;
    }
  }),

  http.delete('/v1/courses/:id', ({ request, params }) => {
    const { tenantId, userId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const id = params.id as Id;
    const ok = courseRepo.delete(tenantId, id);
    if (!ok) return notFound(`Course ${params.id as string} not found`);
    auditRepo.append(
      tenantId,
      { action: 'course.delete', resourceType: 'course', resourceId: id },
      actor(tenantId, userId),
    );
    return new HttpResponse(null, { status: 204 });
  }),
];
