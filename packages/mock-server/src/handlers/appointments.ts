import { http, HttpResponse } from 'msw';
import { AppointmentCreateSchema, AppointmentUpdateSchema, type Id } from '@lesso/domain';
import { resolveContext } from '../context';
import { appointmentRepo, type AppointmentFilter } from '../repositories/appointment';
import {
  badRequest,
  noTenant,
  notFound,
  parseDateParam,
  parseIdParam,
  readJson,
} from './_shared';

export const appointmentHandlers = [
  http.get('/v1/appointments', ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const url = new URL(request.url);
    const branchId = parseIdParam(url.searchParams.get('branchId'));
    const patientId = parseIdParam(url.searchParams.get('patientId'));
    const date = parseDateParam(url.searchParams.get('date'));
    if (branchId === null || patientId === null || date === null) {
      return badRequest('VALIDATION', 'Invalid filter parameter');
    }
    const filter: AppointmentFilter = { branchId, patientId, date };
    const data = appointmentRepo.findAll(tenantId, filter);
    return HttpResponse.json({ data, meta: { total: data.length } });
  }),

  http.get('/v1/appointments/:id', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const item = appointmentRepo.findById(tenantId, params.id as Id);
    if (!item) return notFound(`Appointment ${params.id as string} not found`);
    return HttpResponse.json({ data: item });
  }),

  http.post('/v1/appointments', async ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = AppointmentCreateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid appointment', parsed.error.flatten());
    const created = appointmentRepo.create(tenantId, parsed.data);
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.patch('/v1/appointments/:id', async ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = AppointmentUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid patch', parsed.error.flatten());
    const updated = appointmentRepo.update(tenantId, params.id as Id, parsed.data);
    if (!updated) return notFound(`Appointment ${params.id as string} not found`);
    return HttpResponse.json({ data: updated });
  }),

  http.delete('/v1/appointments/:id', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const ok = appointmentRepo.delete(tenantId, params.id as Id);
    if (!ok) return notFound(`Appointment ${params.id as string} not found`);
    return new HttpResponse(null, { status: 204 });
  }),
];
