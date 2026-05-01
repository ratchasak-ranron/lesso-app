import { http, HttpResponse } from 'msw';
import { CommissionStatusSchema, type Id } from '@lesso/domain';
import { resolveContext } from '../context';
import { commissionRepo, type CommissionFilter } from '../repositories/commission';
import { getUsers } from '../seed';
import {
  badRequest,
  noTenant,
  notFound,
  parseDateParam,
  parseEnumParam,
  parseIdParam,
} from './_shared';

export const commissionHandlers = [
  http.get('/v1/commissions', ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const url = new URL(request.url);
    const doctorId = parseIdParam(url.searchParams.get('doctorId'));
    const branchId = parseIdParam(url.searchParams.get('branchId'));
    const status = parseEnumParam(url.searchParams.get('status'), CommissionStatusSchema);
    const fromDate = parseDateParam(url.searchParams.get('from'));
    const toDate = parseDateParam(url.searchParams.get('to'));
    if (
      doctorId === null ||
      branchId === null ||
      status === null ||
      fromDate === null ||
      toDate === null
    ) {
      return badRequest('VALIDATION', 'Invalid filter parameter');
    }
    const filter: CommissionFilter = {
      doctorId,
      branchId,
      status,
      fromIso: fromDate ? `${fromDate}T00:00:00.000Z` : undefined,
      toIso: toDate ? `${toDate}T23:59:59.999Z` : undefined,
    };
    const data = commissionRepo.findAll(tenantId, filter);
    return HttpResponse.json({ data, meta: { total: data.length } });
  }),

  http.get('/v1/commissions/summary', ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const url = new URL(request.url);
    const branchId = parseIdParam(url.searchParams.get('branchId'));
    const fromDate = parseDateParam(url.searchParams.get('from'));
    const toDate = parseDateParam(url.searchParams.get('to'));
    if (branchId === null || fromDate === null || toDate === null) {
      return badRequest('VALIDATION', 'Invalid filter parameter');
    }
    // Tenant-filter — prevents cross-tenant doctor name leak.
    const doctorMap = new Map<Id, string>();
    for (const u of getUsers().filter((u) => u.tenantId === tenantId)) {
      if (u.role === 'doctor') doctorMap.set(u.id, u.name);
    }
    const data = commissionRepo.summaryByDoctor(tenantId, doctorMap, {
      branchId,
      fromIso: fromDate ? `${fromDate}T00:00:00.000Z` : undefined,
      toIso: toDate ? `${toDate}T23:59:59.999Z` : undefined,
    });
    return HttpResponse.json({ data });
  }),

  http.patch('/v1/commissions/:id/pay', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const updated = commissionRepo.markPaid(tenantId, params.id as Id);
    if (!updated) return notFound(`Commission not found`);
    return HttpResponse.json({ data: updated });
  }),
];
