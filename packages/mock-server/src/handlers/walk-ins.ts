import { http, HttpResponse } from 'msw';
import {
  WalkInCreateSchema,
  WalkInStatusSchema,
  WalkInUpdateSchema,
  type Id,
} from '@reinly/domain';
import { resolveContext } from '../context';
import { auditRepo } from '../repositories/audit';
import { walkInRepo, type WalkInFilter } from '../repositories/walk-in';
import { getUsers } from '../seed';
import {
  actorFromContext,
  badRequest,
  noTenant,
  notFound,
  parseDateParam,
  parseEnumParam,
  parseIdParam,
  readJson,
} from './_shared';

const actor = (tenantId: Id, userId: Id | null) =>
  actorFromContext(tenantId, userId, getUsers);

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
    const { tenantId, userId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = WalkInCreateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid walk-in', parsed.error.flatten());
    const created = walkInRepo.create(tenantId, parsed.data);
    auditRepo.append(
      tenantId,
      {
        branchId: created.branchId,
        action: 'walkIn.create',
        resourceType: 'walkIn',
        resourceId: created.id,
      },
      actor(tenantId, userId),
    );
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.patch('/v1/walk-ins/:id', async ({ request, params }) => {
    const { tenantId, userId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = WalkInUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid patch', parsed.error.flatten());
    const updated = walkInRepo.update(tenantId, params.id as Id, parsed.data);
    if (!updated) return notFound(`Walk-in ${params.id as string} not found`);
    if (parsed.data.status === 'completed') {
      auditRepo.append(
        tenantId,
        {
          branchId: updated.branchId,
          action: 'walkIn.complete',
          resourceType: 'walkIn',
          resourceId: updated.id,
        },
        actor(tenantId, userId),
      );
    }
    return HttpResponse.json({ data: updated });
  }),

  http.delete('/v1/walk-ins/:id', ({ request, params }) => {
    const { tenantId, userId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const id = params.id as Id;
    const existing = walkInRepo.findById(tenantId, id);
    const ok = walkInRepo.delete(tenantId, id);
    if (!ok) return notFound(`Walk-in ${params.id as string} not found`);
    auditRepo.append(
      tenantId,
      {
        branchId: existing?.branchId,
        action: 'walkIn.delete',
        resourceType: 'walkIn',
        resourceId: id,
      },
      actor(tenantId, userId),
    );
    return new HttpResponse(null, { status: 204 });
  }),
];
