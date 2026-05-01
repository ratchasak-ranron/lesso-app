/* eslint-disable security/detect-object-injection -- locale is a constant union literal */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import sitemap from 'vite-plugin-sitemap';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { siteConfig, type Locale } from './src/lib/site-config';
import { localeFromPath } from './src/lib/locale-utils';
import enLocale from './src/locales/en.json';
import thLocale from './src/locales/th.json';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DICTS = { en: enLocale, th: thLocale } as const;
const OG_LOCALE: Record<Locale, string> = { en: 'en_US', th: 'th_TH' };

/**
 * Page registry. `meta.<pageKey>.title` and `meta.<pageKey>.description`
 * keys must exist in every locale JSON. New B2 pages add a row here +
 * matching keys in en/th.json — no other code change required.
 */
type PageKey = 'home' | 'notFound';

interface PageEntry {
  pageKey: PageKey;
  /** Path relative to the locale prefix, e.g. '/' for the home page. */
  relPath: string;
  /** Whether the page should be indexed (controls canonical/alternate emission). */
  index: boolean;
}

function pageForRoute(route: string): PageEntry {
  // route is the rendered path — `/en`, `/th`, `/en/whatever`, ...
  const stripped = route.replace(/^\/(en|th)/, '') || '/';
  if (stripped === '/' || stripped === '') {
    return { pageKey: 'home', relPath: '/', index: true };
  }
  // Wildcard or unknown subpath — treat as 404.
  return { pageKey: 'notFound', relPath: '/404', index: false };
}

function lookup(dict: unknown, key: string): string | undefined {
  let cur: unknown = dict;
  for (const part of key.split('.')) {
    if (typeof cur !== 'object' || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : undefined;
}

interface SeoData {
  fullTitle: string;
  description: string;
  canonical: string;
  alternates: Array<{ hreflang: string; href: string }>;
  ogLocale: string;
  ogImage: string;
  jsonLd: Record<string, unknown>;
  index: boolean;
}

function buildSeo(route: string): SeoData {
  const locale = localeFromPath(route);
  const dict = DICTS[locale];
  const { pageKey, relPath, index } = pageForRoute(route);
  const title = lookup(dict, `meta.${pageKey}.title`) ?? siteConfig.name;
  const description = lookup(dict, `meta.${pageKey}.description`) ?? siteConfig.tagline;
  const fullTitle = title === siteConfig.name ? siteConfig.name : `${title} · ${siteConfig.name}`;
  const canonical = `${siteConfig.hostname}/${locale}${relPath}`;
  const alternates = index
    ? [
        ...siteConfig.locales.map((l) => ({
          hreflang: l,
          href: `${siteConfig.hostname}/${l}${relPath}`,
        })),
        {
          hreflang: 'x-default',
          href: `${siteConfig.hostname}/${siteConfig.defaultLocale}${relPath}`,
        },
      ]
    : [];
  return {
    fullTitle,
    description,
    canonical,
    alternates,
    ogLocale: OG_LOCALE[locale],
    ogImage: `${siteConfig.hostname}/og/default.png`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.hostname,
      slogan: siteConfig.tagline,
      inLanguage: [...siteConfig.locales],
    },
    index,
  };
}

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

function renderSeoTags(seo: SeoData): string {
  const lines = [
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`,
    ...seo.alternates.map(
      (a) =>
        `<link rel="alternate" hreflang="${escapeHtml(a.hreflang)}" href="${escapeHtml(a.href)}" />`,
    ),
    `<meta property="og:title" content="${escapeHtml(seo.fullTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(seo.canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="${escapeHtml(seo.ogLocale)}" />`,
    `<meta property="og:image" content="${escapeHtml(seo.ogImage)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    seo.index ? '' : `<meta name="robots" content="noindex" />`,
    `<script type="application/ld+json">${JSON.stringify(seo.jsonLd)}</script>`,
  ].filter(Boolean);
  return lines.join('\n    ');
}

/**
 * Set `<html lang="...">` defensively. Three cases the regex must cover:
 *   1. Template ships `<html lang="en">` — replace the value.
 *   2. Template ships `<html>` (lang attr lost in a future refactor) —
 *      inject the attr.
 *   3. Capture group must keep any other attrs intact (`<html data-x>`).
 */
function setHtmlLang(html: string, locale: Locale): string {
  return html.replace(/<html\b([^>]*)>/i, (_match, attrs: string) => {
    const cleaned = attrs.replace(/\s+lang="[^"]*"/i, '');
    return `<html${cleaned} lang="${locale}">`;
  });
}

export default defineConfig({
  // Order matters: `mdx()` must come before `react()` so JSX inside `.mdx`
  // is transformed correctly.
  plugins: [
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    }),
    react(),
    sitemap({
      hostname: siteConfig.hostname,
      i18n: {
        languages: [...siteConfig.locales],
        defaultLanguage: siteConfig.defaultLocale,
      },
      dynamicRoutes: [
        ...siteConfig.locales.map((l) => `/${l}`),
        ...siteConfig.locales.map((l) => `/${l}/`),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    host: '127.0.0.1',
  },
  build: {
    sourcemap: 'hidden',
  },
  optimizeDeps: {
    exclude: ['**/*.mdx'],
  },
  ssr: {
    noExternal: ['vite-react-ssg'],
  },
  // SEO meta + JSON-LD injected per route at build time. Reason:
  // `react-helmet-async` and `vite-react-ssg` ship two helmet copies that
  // split the React context, so `<Helmet>` payloads never reach the
  // prerendered HTML. The route registry above maps each rendered path to
  // a `pageKey` whose translations live in `src/locales/<lang>.json`.
  ssgOptions: {
    // Limit prerender to the locale roots only. The wildcard 404 route +
    // `/` index would otherwise emit `dist/index.html` as a duplicate of
    // `dist/en.html` (same canonical) — duplicate-content SEO issue.
    includedRoutes: () => siteConfig.locales.map((l) => `/${l}`),
    onPageRendered: (route, html) => {
      const locale = localeFromPath(route);
      const seo = buildSeo(route);
      const tags = renderSeoTags(seo);
      // Use a case-sensitive `<title>` regex — HTML parsers treat the tag
      // name case-sensitively.
      return setHtmlLang(html, locale)
        .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(seo.fullTitle)}</title>`)
        .replace('</head>', `    ${tags}\n  </head>`);
    },
  },
} as Parameters<typeof defineConfig>[0]);
