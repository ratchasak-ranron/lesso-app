import { http, HttpResponse } from 'msw';
import { PatientCreateSchema, PatientUpdateSchema, type Id } from '@lesso/domain';
import { resolveContext } from '../context';
import { auditRepo } from '../repositories/audit';
import { patientRepo } from '../repositories/patient';
import { getUsers } from '../seed';
import { actorFromContext, badRequest, noTenant, notFound, readJson } from './_shared';

const actor = (tenantId: Id, userId: Id | null) =>
  actorFromContext(tenantId, userId, getUsers);

export const patientHandlers = [
  http.get('/v1/patients', ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const url = new URL(request.url);
    const rawQ = url.searchParams.get('q') ?? '';
    if (rawQ.length > 200) {
      return badRequest('VALIDATION', 'Query too long');
    }
    const data = rawQ ? patientRepo.search(tenantId, rawQ) : patientRepo.findAll(tenantId);
    return HttpResponse.json({ data, meta: { total: data.length } });
  }),

  http.get('/v1/patients/:id', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const patient = patientRepo.findById(tenantId, params.id as Id);
    if (!patient) return notFound(`Patient ${params.id as string} not found`);
    return HttpResponse.json({ data: patient });
  }),

  http.post('/v1/patients', async ({ request }) => {
    const { tenantId, userId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = PatientCreateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid patient', parsed.error.flatten());
    const created = patientRepo.create(tenantId, parsed.data);
    auditRepo.append(
      tenantId,
      { action: 'patient.create', resourceType: 'patient', resourceId: created.id },
      actor(tenantId, userId),
    );
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.patch('/v1/patients/:id', async ({ request, params }) => {
    const { tenantId, userId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = PatientUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid patch', parsed.error.flatten());
    const updated = patientRepo.update(tenantId, params.id as Id, parsed.data);
    if (!updated) return notFound(`Patient ${params.id as string} not found`);
    auditRepo.append(
      tenantId,
      { action: 'patient.update', resourceType: 'patient', resourceId: updated.id },
      actor(tenantId, userId),
    );
    return HttpResponse.json({ data: updated });
  }),

  http.delete('/v1/patients/:id', ({ request, params }) => {
    const { tenantId, userId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const ok = patientRepo.delete(tenantId, params.id as Id);
    if (!ok) return notFound(`Patient ${params.id as string} not found`);
    auditRepo.append(
      tenantId,
      { action: 'patient.delete', resourceType: 'patient', resourceId: params.id as Id },
      actor(tenantId, userId),
    );
    return new HttpResponse(null, { status: 204 });
  }),
];
