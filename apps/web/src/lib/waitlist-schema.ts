import { z } from 'zod';
import { siteConfig } from './site-config';

/**
 * Pilot waitlist input schema. Client-only — the prototype submission
 * channel is a pre-filled `mailto:` link; nothing hits a server.
 *
 * Error messages are translation KEYS (e.g. `'fullNameRequired'`); the form
 * passes them through `t('pilot.errors.<key>')`. Never ship raw English Zod
 * messages to the UI.
 *
 * `message` is capped at 1500 chars to keep the assembled mailto URL under
 * the ~2000-char browser address-bar limit (subject + name + clinic + boilerplate
 * leave ~400 chars headroom).
 */
export const WaitlistInputSchema = z.object({
  fullName: z.string().min(2, 'fullNameRequired').max(120, 'fullNameTooLong'),
  clinic: z.string().min(2, 'clinicRequired').max(120, 'clinicTooLong'),
  email: z.string().email('emailInvalid').max(120, 'emailTooLong'),
  branches: z.coerce
    .number({ invalid_type_error: 'branchesInvalid' })
    .int('branchesInvalid')
    .min(1, 'branchesInvalid')
    .max(50, 'branchesInvalid'),
  phone: z
    .string()
    .min(8, 'phoneInvalid')
    .max(20, 'phoneInvalid')
    .regex(/^[\d+\-\s()]+$/, 'phoneInvalid'),
  lineId: z.string().max(60, 'lineIdTooLong').optional().or(z.literal('')),
  message: z.string().max(1500, 'messageTooLong').optional().or(z.literal('')),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'consentRequired' }),
  }),
  locale: z.enum(siteConfig.locales),
});

export type WaitlistInput = z.infer<typeof WaitlistInputSchema>;
