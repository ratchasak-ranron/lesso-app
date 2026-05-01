import { http, HttpResponse } from 'msw';
import { PatientCreateSchema, PatientUpdateSchema, type Id } from '@lesso/domain';
import { resolveContext } from '../context';
import { patientRepo } from '../repositories/patient';
import { badRequest, noTenant, notFound, readJson } from './_shared';

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
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = PatientCreateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid patient', parsed.error.flatten());
    const created = patientRepo.create(tenantId, parsed.data);
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.patch('/v1/patients/:id', async ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = PatientUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid patch', parsed.error.flatten());
    const updated = patientRepo.update(tenantId, params.id as Id, parsed.data);
    if (!updated) return notFound(`Patient ${params.id as string} not found`);
    return HttpResponse.json({ data: updated });
  }),

  http.delete('/v1/patients/:id', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const ok = patientRepo.delete(tenantId, params.id as Id);
    if (!ok) return notFound(`Patient ${params.id as string} not found`);
    return new HttpResponse(null, { status: 204 });
  }),
];
