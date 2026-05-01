import { http, HttpResponse } from 'msw';
import {
  ConsentCaptureInputSchema,
  ConsentWithdrawInputSchema,
  type Id,
} from '@lesso/domain';
import { resolveContext } from '../context';
import { auditRepo } from '../repositories/audit';
import { consentRepo } from '../repositories/consent';
import { getUsers } from '../seed';
import { badRequest, noTenant, notFound, readJson } from './_shared';

function actorName(tenantId: Id, userId: Id | null): string | undefined {
  if (!userId) return undefined;
  return getUsers().filter((u) => u.tenantId === tenantId).find((u) => u.id === userId)?.name;
}

export const consentHandlers = [
  http.get('/v1/consent/by-patient/:patientId', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const patientId = params.patientId as Id;
    const data = consentRepo.findByPatient(tenantId, patientId);
    const active = consentRepo.findActiveByPatient(tenantId, patientId);
    return HttpResponse.json({ data, meta: { active } });
  }),

  http.post('/v1/consent', async ({ request }) => {
    const { tenantId, userId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = ConsentCaptureInputSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid consent', parsed.error.flatten());
    const created = consentRepo.capture(tenantId, parsed.data, userId ?? undefined);
    auditRepo.append(
      tenantId,
      {
        action: 'consent.capture',
        resourceType: 'consent',
        resourceId: created.id,
        // PII-safe metadata: scopes only, no patient name.
        metadata: { scopes: created.scopes, expiresAt: created.expiresAt },
      },
      { userId: userId ?? undefined, userName: actorName(tenantId, userId) },
    );
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.post('/v1/consent/withdraw', async ({ request }) => {
    const { tenantId, userId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = ConsentWithdrawInputSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid withdraw', parsed.error.flatten());
    const updated = consentRepo.withdraw(tenantId, parsed.data.consentId, parsed.data.reason);
    if (!updated) return notFound('Consent record not found');
    auditRepo.append(
      tenantId,
      {
        action: 'consent.withdraw',
        resourceType: 'consent',
        resourceId: updated.id,
        metadata: { reason: parsed.data.reason ?? null },
      },
      { userId: userId ?? undefined, userName: actorName(tenantId, userId) },
    );
    return HttpResponse.json({ data: updated });
  }),
];
