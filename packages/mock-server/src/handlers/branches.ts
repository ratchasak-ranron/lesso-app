import { http, HttpResponse } from 'msw';
import type { Id } from '@lesso/domain';
import { resolveContext } from '../context';
import { aggregateByBranch } from '../repositories/_aggregators';
import { getBranches, getUsers } from '../seed';
import { badRequest, noTenant, parseDateParam } from './_shared';

export const branchHandlers = [
  http.get('/v1/branches/summary', ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const url = new URL(request.url);
    const fromDate = parseDateParam(url.searchParams.get('from'));
    const toDate = parseDateParam(url.searchParams.get('to'));
    if (fromDate === null || toDate === null) {
      return badRequest('VALIDATION', 'Invalid date filter');
    }
    // Tenant-filter before building the doctor map. `getUsers()` returns all
    // tenants; filtering here prevents cross-tenant ID/name leak when the
    // pattern carries to A7 backend.
    const doctorMap = new Map<Id, string>();
    for (const u of getUsers().filter((u) => u.tenantId === tenantId)) {
      if (u.role === 'doctor') doctorMap.set(u.id, u.name);
    }
    const data = aggregateByBranch(
      tenantId,
      getBranches(),
      doctorMap,
      fromDate ?? undefined,
      toDate ?? undefined,
    );
    return HttpResponse.json({ data });
  }),
];
