import { http, HttpResponse } from 'msw';
import {
  WalkInCreateSchema,
  WalkInStatusSchema,
  WalkInUpdateSchema,
  type Id,
} from '@lesso/domain';
import { resolveContext } from '../context';
import { walkInRepo, type WalkInFilter } from '../repositories/walk-in';
import {
  badRequest,
  noTenant,
  notFound,
  parseDateParam,
  parseEnumParam,
  parseIdParam,
  readJson,
} from './_shared';

export const walkInHandlers = [
  http.get('/v1/walk-ins', ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const url = new URL(request.url);
    const branchId = parseIdParam(url.searchParams.get('branchId'));
    const status = parseEnumParam(url.searchParams.get('status'), WalkInStatusSchema);
    const date = parseDateParam(url.searchParams.get('date'));
    if (branchId === null || status === null || date === null) {
      return badRequest('VALIDATION', 'Invalid filter parameter');
    }
    const filter: WalkInFilter = { branchId, status, date };
    const data = walkInRepo.findAll(tenantId, filter);
    return HttpResponse.json({ data, meta: { total: data.length } });
  }),

  http.get('/v1/walk-ins/:id', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const item = walkInRepo.findById(tenantId, params.id as Id);
    if (!item) return notFound(`Walk-in ${params.id as string} not found`);
    return HttpResponse.json({ data: item });
  }),

  http.post('/v1/walk-ins', async ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = WalkInCreateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid walk-in', parsed.error.flatten());
    const created = walkInRepo.create(tenantId, parsed.data);
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.patch('/v1/walk-ins/:id', async ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = WalkInUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid patch', parsed.error.flatten());
    const updated = walkInRepo.update(tenantId, params.id as Id, parsed.data);
    if (!updated) return notFound(`Walk-in ${params.id as string} not found`);
    return HttpResponse.json({ data: updated });
  }),

  http.delete('/v1/walk-ins/:id', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const ok = walkInRepo.delete(tenantId, params.id as Id);
    if (!ok) return notFound(`Walk-in ${params.id as string} not found`);
    return new HttpResponse(null, { status: 204 });
  }),
];
