import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { Locale } from './site-config';
import { localeFromPath } from './locale-utils';
import { DICTS, makeT, type Dict, type TFunction } from './i18n-dict';

export type { TFunction, Dict } from './i18n-dict';

export interface ResolvedLocale {
  locale: Locale;
  t: TFunction;
  /** Typed access to the locale JSON tree — use for arrays / structured data
   *  the string-only t-function can't return. */
  dict: Dict;
}

/**
 * Resolve the active locale from the URL pathname (`/en/...` or `/th/...`)
 * and return a synchronous `t` function bound to that locale.
 *
 * Routes use literal `/en` + `/th` paths (not `/:locale` params) so
 * vite-react-ssg can prerender them by name. That means `useParams` returns
 * an empty object — we read `useLocation().pathname` instead.
 *
 * We bypass `i18next`'s reactive language switch because SSG renders happen
 * during a single React pass: `i18n.changeLanguage` is effectively async
 * and doesn't update the active `t` returned by `useTranslation` within
 * the same render. Reading from a static dict keeps the prerendered HTML
 * deterministic.
 */
export function useResolvedLocale(): ResolvedLocale {
  const { pathname } = useLocation();
  const locale = localeFromPath(pathname);
  const t = useMemo<TFunction>(() => makeT(locale), [locale]);
  // eslint-disable-next-line security/detect-object-injection -- locale is the constant union 'en' | 'th'
  const dict = DICTS[locale];
  return { locale, t, dict };
}

/**
 * Thin wrapper that returns just the locale, useful for components that
 * only need to know the current language (e.g. for `<html lang>` or for
 * formatters keyed off locale).
 */
export function useLocale(): Locale {
  return useResolvedLocale().locale;
}
