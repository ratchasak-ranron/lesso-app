import type { WaitlistInput } from './waitlist-schema';

/** Conservative URL length budget for `mailto:` — most mail clients accept
 *  ~2000 chars, some IE-era stacks bail at 1500. We cap below 1900 so a
 *  schema regression that loosens `message`'s 1500-char ceiling can't
 *  silently produce truncated mail-client invocations. Dev-only warning;
 *  production never throws (the prototype must always submit). */
const MAILTO_MAX_LENGTH = 1900;

/**
 * Build a pre-filled `mailto:` URL for pilot waitlist submissions.
 *
 * RFC 6068 — encode each field via `encodeURIComponent`; CRLF (`\r\n`) for
 * line breaks (some Windows mail clients break on bare LF). Headers other
 * than `subject` and `body` are intentionally omitted because many mail
 * clients block them for security (e.g. silently dropping `cc`).
 *
 * Browser address-bar limit is ~2000 chars; the schema caps `message` at
 * 1500 to leave headroom for subject + boilerplate + other fields.
 */
export function buildWaitlistMailto(to: string, data: WaitlistInput): string {
  const subject = `Pilot application — ${data.fullName} · ${data.clinic}`;
  const lines: string[] = [
    `Name:     ${data.fullName}`,
    `Clinic:   ${data.clinic}`,
    `Email:    ${data.email}`,
    `Branches: ${data.branches}`,
    `Phone:    ${data.phone}`,
  ];
  if (data.lineId) lines.push(`LINE ID:  ${data.lineId}`);
  lines.push(`Locale:   ${data.locale}`, '');
  if (data.message) lines.push('Message:', data.message, '');
  lines.push('— Sent from lesso.clinic/pilot');

  const body = lines.join('\r\n');
  const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;

  // Guard rail for future schema drift (e.g. raising the message ceiling).
  // Dev-only — never break the user-facing submit path in production.
  if (url.length > MAILTO_MAX_LENGTH && import.meta.env?.DEV) {
    console.warn(
      `[buildWaitlistMailto] URL length ${url.length} exceeds ${MAILTO_MAX_LENGTH} — some mail clients may truncate. Tighten schema caps or shorten boilerplate.`,
    );
  }
  return url;
}
