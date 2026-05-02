import { describe, it, expect } from 'vitest';
import { WaitlistInputSchema } from './waitlist-schema';

const valid = {
  fullName: 'Dr Somchai',
  clinic: 'Happy Smile',
  email: 'somchai@example.com',
  branches: 2,
  phone: '+66 81 234 5678',
  lineId: '@happysmile',
  message: 'Interested in pilot',
  consent: true as const,
  locale: 'th' as const,
};

function firstIssueKey(input: unknown): string | undefined {
  const r = WaitlistInputSchema.safeParse(input);
  if (r.success) return undefined;
  return r.error.issues[0]?.message;
}

describe('WaitlistInputSchema', () => {
  it('accepts a full valid payload', () => {
    const r = WaitlistInputSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it('rejects empty fullName with key', () => {
    expect(firstIssueKey({ ...valid, fullName: '' })).toBe('fullNameRequired');
  });

  it('rejects fullName over 120 chars', () => {
    expect(firstIssueKey({ ...valid, fullName: 'a'.repeat(121) })).toBe('fullNameTooLong');
  });

  it('rejects empty clinic', () => {
    expect(firstIssueKey({ ...valid, clinic: '' })).toBe('clinicRequired');
  });

  it('rejects invalid email', () => {
    expect(firstIssueKey({ ...valid, email: 'notanemail' })).toBe('emailInvalid');
  });

  it('rejects branches=0', () => {
    expect(firstIssueKey({ ...valid, branches: 0 })).toBe('branchesInvalid');
  });

  it('rejects branches=51', () => {
    expect(firstIssueKey({ ...valid, branches: 51 })).toBe('branchesInvalid');
  });

  it('rejects non-numeric branches via coerce', () => {
    expect(firstIssueKey({ ...valid, branches: 'abc' })).toBe('branchesInvalid');
  });

  it('coerces numeric string branches', () => {
    const r = WaitlistInputSchema.safeParse({ ...valid, branches: '3' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.branches).toBe(3);
  });

  it('rejects phone with letters', () => {
    expect(firstIssueKey({ ...valid, phone: 'abc12345' })).toBe('phoneInvalid');
  });

  it('rejects phone too short', () => {
    expect(firstIssueKey({ ...valid, phone: '1234567' })).toBe('phoneInvalid');
  });

  it('rejects lineId longer than 60 chars', () => {
    expect(firstIssueKey({ ...valid, lineId: 'x'.repeat(61) })).toBe('lineIdTooLong');
  });

  it('accepts empty lineId', () => {
    const r = WaitlistInputSchema.safeParse({ ...valid, lineId: '' });
    expect(r.success).toBe(true);
  });

  it('rejects message over 1500 chars', () => {
    expect(firstIssueKey({ ...valid, message: 'x'.repeat(1501) })).toBe('messageTooLong');
  });

  it('rejects unchecked consent', () => {
    expect(firstIssueKey({ ...valid, consent: false })).toBe('consentRequired');
  });

  it('rejects unknown locale', () => {
    const r = WaitlistInputSchema.safeParse({ ...valid, locale: 'fr' });
    expect(r.success).toBe(false);
  });
});
