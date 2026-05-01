type Level = 'debug' | 'info' | 'warn' | 'error';

const isDev = import.meta.env.DEV;

/**
 * Field names that may contain PII / PHI under PDPA. Stripped from `ctx` before
 * the entry reaches `console.*`. List is conservative — extend as new domain
 * fields land. Never log raw patient data; pass IDs only.
 */
const PII_FIELD_NAMES = new Set<string>([
  // Personal identifiers
  'name',
  'firstName',
  'lastName',
  'fullName',
  'phone',
  'phoneNumber',
  'phoneDigits',
  'phoneDisplay',
  'email',
  'address',
  'lineId',
  'nationalId',
  'idNumber',
  'birthDate',
  'dateOfBirth',
  'dob',
  // Clinical / health
  'notes',
  'medicalNotes',
  'visitNotes',
  'diagnosis',
  'photoUrl',
  'beforePhotoUrl',
  'afterPhotoUrl',
  // Financial / commercial (added A3 review M4)
  'amount',
  'balance',
  'lifetimeEarned',
  'total',
  'subtotal',
  'tip',
  'discount',
  'unitCost',
  'unitPrice',
  'baseAmount',
  'rate',
  'pricePaid',
  'totalAmount',
]);

const REDACTED = '[redacted]';

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 4) return REDACTED;
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((v) => sanitize(v, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // Keys come from `Object.entries` of a plain object — not external input.
      // eslint-disable-next-line security/detect-object-injection
      out[k] = PII_FIELD_NAMES.has(k) ? REDACTED : sanitize(v, depth + 1);
    }
    return out;
  }
  return value;
}

function log(level: Level, msg: string, ctx?: Record<string, unknown>): void {
  const safeCtx = ctx ? (sanitize(ctx) as Record<string, unknown>) : undefined;
  const entry = { level, msg, ts: new Date().toISOString(), ...(safeCtx ?? {}) };
  if (level === 'error') {
    if (isDev) console.error(entry);
    // In prod: forward to Sentry/Datadog (Phase A7+). Drop until then.
    return;
  }
  if (level === 'warn') {
    if (isDev) console.warn(entry);
    return;
  }
  if (isDev) console.log(entry);
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => log('debug', msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log('error', msg, ctx),
};
