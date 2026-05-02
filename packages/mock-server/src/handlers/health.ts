import { http, HttpResponse } from 'msw';
import type { Health } from '@reinly/domain';
import { IdSchema } from '@reinly/domain';
import { getTenantContext } from '../context';

function headerOrNull(value: string | null): string | null {
  if (!value) return null;
  const parsed = IdSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export const healthHandlers = [
  http.get('/v1/health', ({ request }) => {
    // Prefer explicit headers from the api-client RequestContext.
    // Fall back to localStorage-backed dev-toolbar for legacy callers.
    const headerCtx = {
      tenantId: headerOrNull(request.headers.get('X-Reinly-Tenant')),
      branchId: headerOrNull(request.headers.get('X-Reinly-Branch')),
      userId: headerOrNull(request.headers.get('X-Reinly-User')),
    };
    const fallback = getTenantContext();
    const ctx = {
      tenantId: headerCtx.tenantId ?? fallback.tenantId,
      branchId: headerCtx.branchId ?? fallback.branchId,
      userId: headerCtx.userId ?? fallback.userId,
    };
    const body: { data: Health } = {
      data: {
        status: 'ok',
        tenantId: ctx.tenantId,
        branchId: ctx.branchId,
        userId: ctx.userId,
        serverTime: new Date().toISOString(),
      },
    };
    return HttpResponse.json(body);
  }),
];
