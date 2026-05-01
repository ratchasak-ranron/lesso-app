import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { IdSchema, type Id } from '@lesso/domain';
import { resolveContext } from '../context';
import { InsufficientPointsError, loyaltyRepo } from '../repositories/loyalty';
import { badRequest, conflict, noTenant, notFound, readJson } from './_shared';

const RedeemSchema = z.object({
  patientId: IdSchema,
  points: z.number().int().positive(),
  receiptId: IdSchema.optional(),
  reason: z.string().max(200).optional(),
});

export const loyaltyHandlers = [
  http.get('/v1/loyalty/accounts', ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const data = loyaltyRepo.findAllAccounts(tenantId);
    const totalOutstanding = loyaltyRepo.totalOutstandingPoints(tenantId);
    return HttpResponse.json({
      data,
      meta: { total: data.length, totalOutstanding },
    });
  }),

  http.get('/v1/loyalty/accounts/by-patient/:patientId', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const account = loyaltyRepo.findAccountByPatient(tenantId, params.patientId as Id);
    if (!account) return notFound('Loyalty account not found');
    return HttpResponse.json({ data: account });
  }),

  http.get('/v1/loyalty/transactions/by-patient/:patientId', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const data = loyaltyRepo.findTransactionsByPatient(tenantId, params.patientId as Id);
    return HttpResponse.json({ data, meta: { total: data.length } });
  }),

  http.post('/v1/loyalty/redeem', async ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = RedeemSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid redeem', parsed.error.flatten());
    try {
      const result = loyaltyRepo.redeem(
        tenantId,
        parsed.data.patientId,
        parsed.data.points,
        parsed.data.receiptId,
      );
      return HttpResponse.json({ data: result });
    } catch (err) {
      if (err instanceof InsufficientPointsError) {
        return conflict('INSUFFICIENT_POINTS', err.message);
      }
      throw err;
    }
  }),
];
