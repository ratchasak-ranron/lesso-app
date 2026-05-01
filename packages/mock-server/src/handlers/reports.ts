import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import type { Id } from '@lesso/domain';
import { resolveContext } from '../context';
import { aggregateByDimension, type ReportDimension } from '../repositories/_aggregators';
import { getBranches, getUsers } from '../seed';
import { badRequest, noTenant, parseDateParam, parseEnumParam, parseIdParam } from './_shared';

const DimensionSchema = z.enum(['doctor', 'service', 'branch']);

export const reportHandlers = [
  http.get('/v1/reports/by-dimension', ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const url = new URL(request.url);
    const dimension = parseEnumParam(url.searchParams.get('dimension'), DimensionSchema);
    if (!dimension) return badRequest('VALIDATION', 'Missing or invalid dimension');
    const branchId = parseIdParam(url.searchParams.get('branchId'));
    const fromDate = parseDateParam(url.searchParams.get('from'));
    const toDate = parseDateParam(url.searchParams.get('to'));
    if (branchId === null || fromDate === null || toDate === null) {
      return badRequest('VALIDATION', 'Invalid filter parameter');
    }
    const doctorMap = new Map<Id, string>();
    for (const u of getUsers()) {
      if (u.role === 'doctor') doctorMap.set(u.id, u.name);
    }
    const branchMap = new Map<Id, string>();
    for (const b of getBranches()) {
      if (b.tenantId === tenantId) branchMap.set(b.id, b.name);
    }
    const data = aggregateByDimension(
      tenantId,
      dimension as ReportDimension,
      doctorMap,
      branchMap,
      branchId,
      fromDate ?? undefined,
      toDate ?? undefined,
    );
    return HttpResponse.json({ data, meta: { dimension } });
  }),
];
