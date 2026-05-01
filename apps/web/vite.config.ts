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
import enLocale from './src/locales/en.json';
import thLocale from './src/locales/th.json';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPPORTED: ReadonlySet<string> = new Set<string>(siteConfig.locales);
const DICTS = { en: enLocale, th: thLocale } as const;
const OG_LOCALE: Record<Locale, string> = { en: 'en_US', th: 'th_TH' };

function localeFromRoute(route: string): Locale {
  const seg = route.split('/').filter(Boolean)[0];
  return seg && SUPPORTED.has(seg) ? (seg as Locale) : siteConfig.defaultLocale;
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
}

function buildSeo(route: string): SeoData {
  const locale = localeFromRoute(route);
  const dict = DICTS[locale];
  const isNotFound = false; // index/locale roots are the only prerendered routes for B1
  const titleKey = isNotFound ? 'meta.notFound.title' : 'meta.home.title';
  const descKey = isNotFound ? 'meta.notFound.description' : 'meta.home.description';
  const title = lookup(dict, titleKey) ?? siteConfig.name;
  const description = lookup(dict, descKey) ?? siteConfig.tagline;
  const fullTitle = title === siteConfig.name ? siteConfig.name : `${title} · ${siteConfig.name}`;
  const path = '/';
  const canonical = `${siteConfig.hostname}/${locale}${path}`;
  const alternates = [
    ...siteConfig.locales.map((l) => ({
      hreflang: l,
      href: `${siteConfig.hostname}/${l}${path}`,
    })),
    {
      hreflang: 'x-default',
      href: `${siteConfig.hostname}/${siteConfig.defaultLocale}${path}`,
    },
  ];
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
  };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

function renderSeoTags(seo: SeoData): string {
  const lines = [
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<link rel="canonical" href="${seo.canonical}" />`,
    ...seo.alternates.map(
      (a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`,
    ),
    `<meta property="og:title" content="${escapeHtml(seo.fullTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:url" content="${seo.canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="${seo.ogLocale}" />`,
    `<meta property="og:image" content="${seo.ogImage}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<script type="application/ld+json">${JSON.stringify(seo.jsonLd)}</script>`,
  ];
  return lines.join('\n    ');
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
  // `vite-react-ssg` and `react-helmet-async` ship two helmet copies that
  // split the React context, so `<Helmet>` payloads never reach the
  // prerendered HTML. We inject SEO meta + JSON-LD per route here, where
  // the route string is the source of truth and a stable static dict
  // carries the rest. `<html lang>` is rewritten in the same pass.
  ssgOptions: {
    onPageRendered: (route, html) => {
      const locale = localeFromRoute(route);
      const seo = buildSeo(route);
      const tags = renderSeoTags(seo);
      return html
        .replace(/<html\b[^>]*\blang="[^"]*"/i, `<html lang="${locale}"`)
        .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(seo.fullTitle)}</title>`)
        .replace('</head>', `    ${tags}\n  </head>`);
    },
  },
} as Parameters<typeof defineConfig>[0]);
