/* eslint-disable security/detect-object-injection -- locale is a constant union and key paths are matched against a known dict */
import en from '@/locales/en.json';
import th from '@/locales/th.json';
import type { Locale } from './site-config';

export const DICTS = { en, th } as const;

const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}

export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Look up a dotted-path key in a locale dict and substitute `{{var}}`
 * placeholders. Substituted values are HTML-escaped so caller-supplied
 * strings (e.g. user input from a future B3 form) cannot inject markup.
 * Returns the key itself when the lookup misses — the standard i18next
 * fallback behaviour.
 */
export function makeT(locale: Locale): TFunction {
  const dict = DICTS[locale] as Record<string, unknown>;
  return (key, vars) => {
    const value = lookup(dict, key);
    if (typeof value !== 'string') return key;
    if (!vars) return value;
    return value.replace(/{{(\w+)}}/g, (_, name: string) => {
      const v = vars[name];
      if (v === undefined) return '';
      return escapeHtml(String(v));
    });
  };
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
