/* eslint-disable security/detect-object-injection -- locale is a constant union and key paths are matched against a known dict */
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import en from '@/locales/en.json';
import th from '@/locales/th.json';
import { siteConfig, type Locale } from './site-config';

const SUPPORTED: ReadonlySet<string> = new Set<string>(siteConfig.locales);
const DICTS = { en, th } as const;

export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

export interface ResolvedLocale {
  locale: Locale;
  t: TFunction;
}

/**
 * Resolve the active locale from the URL pathname (`/en/...` or `/th/...`)
 * and return a synchronous `t` function bound to that locale.
 *
 * Routes use literal `/en` + `/th` paths (not `/:locale` params) so
 * vite-react-ssg can prerender them by name. That means `useParams` returns
 * an empty object — we read `useLocation().pathname` instead.
 *
 * We bypass `i18next`'s reactive language switch because SSG renders
 * happen during a single React pass: `i18n.changeLanguage` is effectively
 * async and doesn't update the active `t` returned by `useTranslation`
 * within the same render. Reading from a static dict keeps the prerendered
 * HTML deterministic.
 */
export function useResolvedLocale(): ResolvedLocale {
  const { pathname } = useLocation();
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  const resolved: Locale =
    firstSegment && SUPPORTED.has(firstSegment)
      ? (firstSegment as Locale)
      : siteConfig.defaultLocale;

  const t = useMemo<TFunction>(() => {
    const dict = DICTS[resolved] as Record<string, unknown>;
    return (key, vars) => {
      const value = lookup(dict, key);
      if (typeof value !== 'string') return key;
      if (!vars) return value;
      return value.replace(/{{(\w+)}}/g, (_, name: string) => {
        const v = vars[name];
        return v === undefined ? '' : String(v);
      });
    };
  }, [resolved]);

  return { locale: resolved, t };
}

function lookup(dict: Record<string, unknown>, key: string): unknown {
  const parts = key.split('.');
  let cur: unknown = dict;
  for (const p of parts) {
    if (typeof cur !== 'object' || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

/**
 * Thin wrapper that returns just the locale, useful for components that
 * only need to know the current language (e.g. for `<html lang>` or for
 * formatters keyed off locale).
 */
export function useLocale(): Locale {
  return useResolvedLocale().locale;
}
