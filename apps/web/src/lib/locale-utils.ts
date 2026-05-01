import { siteConfig, type Locale } from './site-config';

const SUPPORTED: ReadonlySet<string> = new Set<string>(siteConfig.locales);

/**
 * Pure helper shared between build-time (`vite.config.ts → ssgOptions`) and
 * runtime (`useResolvedLocale`). Reads the first path segment and narrows it
 * to the supported `Locale` union; falls back to the default locale.
 *
 * Keep this module dependency-free so the Vite Node process can import it
 * without triggering bundler-only resolution.
 */
export function localeFromPath(path: string): Locale {
  const seg = path.split('/').filter(Boolean)[0];
  return seg && SUPPORTED.has(seg) ? (seg as Locale) : siteConfig.defaultLocale;
}

/**
 * Compute the URL of the same page in another locale. Strips the current
 * `/<from>` prefix and prepends `/<to>`. Returns `/${to}` for the locale
 * root, never an empty string.
 */
export function localeSwitchHref(pathname: string, from: Locale, to: Locale): string {
  // eslint-disable-next-line security/detect-non-literal-regexp -- `from` is a constant union ('en' | 'th'), not user input
  const stripPrefix = new RegExp(`^/${from}(/|$)`);
  const stripped = pathname.replace(stripPrefix, '/').replace(/^\/+$/, '/');
  return stripped === '/' ? `/${to}` : `/${to}${stripped}`;
}
