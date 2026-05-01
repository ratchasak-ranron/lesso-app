import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { IdSchema, type Id } from '@lesso/domain';
import { resolveContext } from '../context';
import { auditRepo } from '../repositories/audit';
import { InsufficientPointsError, loyaltyRepo } from '../repositories/loyalty';
import { getUsers } from '../seed';
import { actorFromContext, badRequest, noTenant, notFound, readJson } from './_shared';

const actor = (tenantId: Id, userId: Id | null) =>
  actorFromContext(tenantId, userId, getUsers);

// Pilot rule: minimum 100-point redemption (matches the UI gate). Server-side
// floor prevents direct-API bypass of the LoyaltyCard threshold.
const REDEEM_MIN_POINTS = 100;

const RedeemSchema = z.object({
  patientId: IdSchema,
  points: z.number().int().min(REDEEM_MIN_POINTS),
  receiptId: IdSchema.optional(),
  reason: z.string().max(200).optional(),
});

function parsePatientIdParam(raw: unknown): Id | null {
  const parsed = IdSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

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
    const patientId = parsePatientIdParam(params.patientId);
    if (!patientId) return badRequest('VALIDATION', 'Invalid patientId');
    const account = loyaltyRepo.findAccountByPatient(tenantId, patientId);
    if (!account) return notFound('Loyalty account not found');
    return HttpResponse.json({ data: account });
  }),

  http.get('/v1/loyalty/transactions/by-patient/:patientId', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const patientId = parsePatientIdParam(params.patientId);
    if (!patientId) return badRequest('VALIDATION', 'Invalid patientId');
    const data = loyaltyRepo.findTransactionsByPatient(tenantId, patientId);
    return HttpResponse.json({ data, meta: { total: data.length } });
  }),

  http.post('/v1/loyalty/redeem', async ({ request }) => {
    const { tenantId, userId } = resolveContext(request);
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
      auditRepo.append(
        tenantId,
        {
          action: 'loyalty.redeem',
          resourceType: 'loyaltyAccount',
          resourceId: result.account.id,
          metadata: { points: parsed.data.points },
        },
        actor(tenantId, userId),
      );
      return HttpResponse.json({ data: result });
    } catch (err) {
      if (err instanceof InsufficientPointsError) {
        // Generic message + structured details so client can format locale-aware
        // text without echoing the available balance into error logs.
        return HttpResponse.json(
          {
            code: 'INSUFFICIENT_POINTS',
            message: err.message,
            details: { available: err.available, requested: err.requested },
          },
          { status: 409 },
        );
      }
      throw err;
    }
  }),
];
