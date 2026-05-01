import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { IdSchema } from '@lesso/domain';
import { resolveContext } from '../context';
import { generateVisitSummary } from '../ai/visit-summary';
import { generateRecallMessage } from '../ai/recall-message';
import { suggestSlots } from '../ai/slot-suggestion';
import { tagPhoto } from '../ai/photo-tag';
import { badRequest, noTenant, readJson } from './_shared';

const LocaleSchema = z.enum(['th', 'en']);

const VisitSummarySchema = z.object({
  patientId: IdSchema,
  serviceName: z.string().min(1).max(120),
  sessionN: z.number().int().positive().max(1000),
  locale: LocaleSchema,
});

const RecallSchema = z.object({
  patientId: IdSchema,
  patientName: z.string().min(1).max(120),
  serviceName: z.string().min(1).max(120),
  weeksSinceLastVisit: z.number().int().nonnegative().max(520),
  remainingSessions: z.number().int().nonnegative().max(100),
  locale: LocaleSchema,
});

const SlotSchema = z.object({
  patientId: IdSchema,
  doctorId: IdSchema.optional(),
  serviceName: z.string().min(1).max(120),
  preferDays: z.array(z.number().int().min(0).max(6)).optional(),
  locale: LocaleSchema,
});

const PhotoTagSchema = z.object({
  patientId: IdSchema,
  photoId: z.string().min(1).max(80),
});

async function pretendThink(): Promise<void> {
  // Artificial delay so UI shows a pending state.
  await new Promise((r) => setTimeout(r, 60));
}

export const aiHandlers = [
  http.post('/v1/ai/visit-summary', async ({ request }) => {
    if (!resolveContext(request).tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = VisitSummarySchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid input', parsed.error.flatten());
    await pretendThink();
    return HttpResponse.json({ data: { text: generateVisitSummary(parsed.data) } });
  }),

  http.post('/v1/ai/recall-message', async ({ request }) => {
    if (!resolveContext(request).tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = RecallSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid input', parsed.error.flatten());
    await pretendThink();
    return HttpResponse.json({ data: { text: generateRecallMessage(parsed.data) } });
  }),

  http.post('/v1/ai/suggest-slots', async ({ request }) => {
    if (!resolveContext(request).tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = SlotSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid input', parsed.error.flatten());
    await pretendThink();
    return HttpResponse.json({ data: { slots: suggestSlots(parsed.data) } });
  }),

  http.post('/v1/ai/tag-photo', async ({ request }) => {
    if (!resolveContext(request).tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = PhotoTagSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid input', parsed.error.flatten());
    await pretendThink();
    return HttpResponse.json({ data: tagPhoto(parsed.data) });
  }),
];
