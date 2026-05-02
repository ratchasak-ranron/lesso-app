import { http, HttpResponse } from 'msw';
import { AuditActionSchema, AuditLogCreateSchema } from '@reinly/domain';
import { resolveContext } from '../context';
import { auditRepo, type AuditFilter } from '../repositories/audit';
import { getUsers } from '../seed';
import {
  badRequest,
  noTenant,
  parseDateParam,
  parseEnumParam,
  parseIdParam,
  readJson,
  resolveActorName,
} from './_shared';

export const auditHandlers = [
  http.get('/v1/audit', ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const url = new URL(request.url);
    const action = parseEnumParam(url.searchParams.get('action'), AuditActionSchema);
    const userId = parseIdParam(url.searchParams.get('userId'));
    const fromDate = parseDateParam(url.searchParams.get('from'));
    const toDate = parseDateParam(url.searchParams.get('to'));
    if (action === null || userId === null || fromDate === null || toDate === null) {
      return badRequest('VALIDATION', 'Invalid filter parameter');
    }
    const filter: AuditFilter = {
      action,
      userId,
      resourceType: url.searchParams.get('resourceType') ?? undefined,
      fromIso: fromDate ? `${fromDate}T00:00:00.000Z` : undefined,
      toIso: toDate ? `${toDate}T23:59:59.999Z` : undefined,
    };
    const data = auditRepo.findAll(tenantId, filter);
    // Newest first
    data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return HttpResponse.json({ data, meta: { total: data.length } });
  }),

  http.post('/v1/audit', async ({ request }) => {
    const { tenantId, userId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = AuditLogCreateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid audit', parsed.error.flatten());
    const created = auditRepo.append(tenantId, parsed.data, {
      userId: userId ?? undefined,
      userName: resolveActorName(tenantId, userId, getUsers),
    });
    return HttpResponse.json({ data: created }, { status: 201 });
  }),
];
