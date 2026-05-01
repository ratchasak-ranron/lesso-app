import { http, HttpResponse } from 'msw';
import { ReceiptCreateSchema, type Id } from '@lesso/domain';
import { resolveContext } from '../context';
import { receiptRepo, type ReceiptFilter } from '../repositories/receipt';
import { commissionRepo } from '../repositories/commission';
import { loyaltyRepo } from '../repositories/loyalty';
import {
  badRequest,
  noTenant,
  notFound,
  parseDateParam,
  parseIdParam,
  readJson,
} from './_shared';

export const receiptHandlers = [
  http.get('/v1/receipts', ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const url = new URL(request.url);
    const branchId = parseIdParam(url.searchParams.get('branchId'));
    const patientId = parseIdParam(url.searchParams.get('patientId'));
    const fromDate = parseDateParam(url.searchParams.get('from'));
    const toDate = parseDateParam(url.searchParams.get('to'));
    if (branchId === null || patientId === null || fromDate === null || toDate === null) {
      return badRequest('VALIDATION', 'Invalid filter parameter');
    }
    const filter: ReceiptFilter = {
      branchId,
      patientId,
      fromIso: fromDate ? `${fromDate}T00:00:00.000Z` : undefined,
      toIso: toDate ? `${toDate}T23:59:59.999Z` : undefined,
    };
    const data = receiptRepo.findAll(tenantId, filter);
    return HttpResponse.json({ data, meta: { total: data.length } });
  }),

  http.get('/v1/receipts/:id', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const item = receiptRepo.findById(tenantId, params.id as Id);
    if (!item) return notFound(`Receipt not found`);
    return HttpResponse.json({ data: item });
  }),

  http.post('/v1/receipts', async ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = ReceiptCreateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid receipt', parsed.error.flatten());
    const created = receiptRepo.create(tenantId, parsed.data);
    // Side effects: accrue commissions + loyalty earn (atomic-per-key writes;
    // multi-key seam documented as A2/A3 known gap until A7 backend transaction).
    commissionRepo.accrueFromReceipt(tenantId, created);
    if (created.total > 0) {
      loyaltyRepo.earn(tenantId, created.patientId, created.total, created.id);
    }
    return HttpResponse.json({ data: created }, { status: 201 });
  }),
];
