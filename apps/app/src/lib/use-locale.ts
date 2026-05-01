import { useTranslation } from 'react-i18next';

export type Locale = 'th' | 'en';

/**
 * Single source of truth for the runtime locale used by formatters
 * (`formatCurrency`, `formatDate`, `formatNumber`, etc). Narrows
 * `i18n.language` (which is a wide string at the type level) to the
 * `'th' | 'en'` union the formatters expect.
 */
export function useLocale(): Locale {
  const { i18n } = useTranslation();
  return i18n.language === 'th' ? 'th' : 'en';
}
