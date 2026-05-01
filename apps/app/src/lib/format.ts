import { dayjs, type DateInput } from './dates';

export function formatDate(input: DateInput, locale: string = 'en'): string {
  return dayjs(input).locale(locale).format('LL');
}

export function formatDateTime(input: DateInput, locale: string = 'en'): string {
  return dayjs(input).locale(locale).format('LLL');
}

export function formatTime(input: DateInput, locale: string = 'en'): string {
  return dayjs(input).locale(locale).format('HH:mm');
}

/**
 * Thai Buddhist Era date — uses BBBB year (Gregorian + 543).
 */
export function formatBE(input: DateInput): string {
  return dayjs(input).locale('th').format('D MMM BBBB');
}

export function formatRelative(input: DateInput, locale: string = 'en'): string {
  return dayjs(input).locale(locale).fromNow();
}

const CURRENCY_FORMATTERS = {
  th: new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }),
  en: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB' }),
} as const;

export function formatCurrency(amount: number, locale: 'th' | 'en' = 'en'): string {
  // eslint-disable-next-line security/detect-object-injection
  return CURRENCY_FORMATTERS[locale].format(amount);
}

const NUMBER_FORMATTERS = {
  th: new Intl.NumberFormat('th-TH'),
  en: new Intl.NumberFormat('en-US'),
} as const;

export function formatNumber(n: number, locale: 'th' | 'en' = 'en'): string {
  // eslint-disable-next-line security/detect-object-injection
  return NUMBER_FORMATTERS[locale].format(n);
}

export { displayPhone, normalizePhone } from './phone';
