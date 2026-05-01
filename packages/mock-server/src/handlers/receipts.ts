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

    // Side-effect cascade. Each call is wrapped so a partial failure never
    // causes the receipt POST to fail with 5xx after the receipt is already
    // persisted. Surfaces failures in the response body so the caller knows
    // reconciliation is needed.
    // TODO A7: replace with a real DB transaction wrapping all three writes.
    const warnings: string[] = [];
    try {
      commissionRepo.accrueFromReceipt(tenantId, created);
    } catch (err) {
      warnings.push(`commission accrual failed: ${err instanceof Error ? err.message : 'unknown'}`);
    }
    if (created.total > 0) {
      // Course-redeem receipts have total=0 and intentionally do not earn points.
      try {
        loyaltyRepo.earn(tenantId, created.patientId, created.total, created.id);
      } catch (err) {
        warnings.push(`loyalty earn failed: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    }

    return HttpResponse.json(
      warnings.length > 0 ? { data: created, warnings } : { data: created },
      { status: 201 },
    );
  }),
];
