import { HttpResponse } from 'msw';
import { z } from 'zod';
import { IdSchema, type Id } from '@lesso/domain';

export function notFound(message: string) {
  return HttpResponse.json({ code: 'NOT_FOUND', message }, { status: 404 });
}

export function badRequest(code: string, message: string, details?: unknown) {
  return HttpResponse.json({ code, message, details }, { status: 400 });
}

export function noTenant() {
  return HttpResponse.json(
    { code: 'NO_TENANT', message: 'Tenant context required' },
    { status: 400 },
  );
}

export function conflict(code: string, message: string) {
  return HttpResponse.json({ code, message }, { status: 409 });
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Parse an optional URL search param as a UUID. Returns the typed Id, undefined
 * (param absent), or null (param present but malformed — caller should 400).
 */
export function parseIdParam(value: string | null): Id | undefined | null {
  if (value === null) return undefined;
  const parsed = IdSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/**
 * Parse an optional URL search param against a Zod enum.
 * undefined = absent, null = malformed.
 */
export function parseEnumParam<T extends string>(
  value: string | null,
  schema: z.ZodEnum<[T, ...T[]]>,
): T | undefined | null {
  if (value === null) return undefined;
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

const DateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD');

export function parseDateParam(value: string | null): string | undefined | null {
  if (value === null) return undefined;
  const parsed = DateOnlySchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/**
 * Resolve actor name from tenant + userId for audit emission. Tenant-filtered
 * to prevent cross-tenant lookup. Used by every handler that emits audit
 * events. Lazy `getUsers` callback so this helper has no static dependency
 * on `seed.ts`.
 */
export function resolveActorName(
  tenantId: Id,
  userId: Id | null,
  getUsers: () => ReadonlyArray<{ id: Id; tenantId: Id; name: string }>,
): string | undefined {
  if (!userId) return undefined;
  return getUsers()
    .filter((u) => u.tenantId === tenantId)
    .find((u) => u.id === userId)?.name;
}
