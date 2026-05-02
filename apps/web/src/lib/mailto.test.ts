import { describe, it, expect } from 'vitest';
import { buildWaitlistMailto } from './mailto';
import type { WaitlistInput } from './waitlist-schema';

const baseData: WaitlistInput = {
  fullName: 'Dr Somchai',
  clinic: 'Happy Smile',
  email: 'somchai@example.com',
  branches: 2,
  phone: '+66 81 234 5678',
  lineId: '@happysmile',
  message: 'Interested in pilot',
  consent: true,
  locale: 'th',
};

function decodeBody(url: string): string {
  const match = url.match(/[?&]body=([^&]+)/);
  if (!match || !match[1]) throw new Error('no body in mailto');
  return decodeURIComponent(match[1]);
}

function decodeSubject(url: string): string {
  const match = url.match(/[?&]subject=([^&]+)/);
  if (!match || !match[1]) throw new Error('no subject in mailto');
  return decodeURIComponent(match[1]);
}

describe('buildWaitlistMailto', () => {
  it('starts with mailto:', () => {
    expect(buildWaitlistMailto('hello@getreinly.com', baseData)).toMatch(/^mailto:/);
  });

  it('encodes the recipient', () => {
    const url = buildWaitlistMailto('hello+pilot@getreinly.com', baseData);
    expect(url).toContain('mailto:hello%2Bpilot%40getreinly.com');
  });

  it('subject contains name and clinic', () => {
    const subject = decodeSubject(buildWaitlistMailto('a@b.com', baseData));
    expect(subject).toContain('Dr Somchai');
    expect(subject).toContain('Happy Smile');
  });

  it('body contains every required field', () => {
    const body = decodeBody(buildWaitlistMailto('a@b.com', baseData));
    expect(body).toContain('Name:     Dr Somchai');
    expect(body).toContain('Clinic:   Happy Smile');
    expect(body).toContain('Email:    somchai@example.com');
    expect(body).toContain('Branches: 2');
    expect(body).toContain('Phone:    +66 81 234 5678');
    expect(body).toContain('LINE ID:  @happysmile');
    expect(body).toContain('Locale:   th');
    expect(body).toContain('Message:');
    expect(body).toContain('Interested in pilot');
  });

  it('omits empty optionals (lineId + message)', () => {
    const data: WaitlistInput = { ...baseData, lineId: '', message: '' };
    const body = decodeBody(buildWaitlistMailto('a@b.com', data));
    expect(body).not.toContain('LINE ID:');
    expect(body).not.toContain('Message:');
  });

  it('uses CRLF line breaks', () => {
    const body = decodeBody(buildWaitlistMailto('a@b.com', baseData));
    expect(body).toContain('\r\n');
    expect(body.split('\r\n').length).toBeGreaterThan(5);
  });

  it('handles special chars in clinic + Thai chars', () => {
    const data: WaitlistInput = {
      ...baseData,
      clinic: 'Smile & Co? #1',
      fullName: 'หมอสมชาย',
    };
    const url = buildWaitlistMailto('a@b.com', data);
    // URL-safe encoding — & ? # never appear raw inside subject/body params
    const subject = decodeSubject(url);
    const body = decodeBody(url);
    expect(subject).toContain('Smile & Co? #1');
    expect(subject).toContain('หมอสมชาย');
    expect(body).toContain('Smile & Co? #1');
    expect(body).toContain('หมอสมชาย');
  });
});
