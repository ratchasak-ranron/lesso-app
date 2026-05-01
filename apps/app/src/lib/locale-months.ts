/**
 * Short-form month labels per locale. Used by `/reports` and `/branches`
 * month pickers. Eventual replacement is `Intl.DateTimeFormat({ month: 'short' })`
 * driven by `i18n.language`, but inline arrays keep the bundle smaller and avoid
 * Intl locale data overhead at MVP scale.
 */
export const MONTHS_TH = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
] as const;

export const MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function monthsForLocale(locale: 'th' | 'en'): ReadonlyArray<string> {
  return locale === 'th' ? MONTHS_TH : MONTHS_EN;
}
