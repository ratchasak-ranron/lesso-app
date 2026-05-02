/* eslint-disable security/detect-object-injection -- locale + pageKey are constant union literals */
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
 * keys must exist in every locale JSON. Adding a B3 page only requires
 * extending this map + matching keys in en/th.json.
 */
type PageKey = 'home' | 'pricing' | 'features' | 'about' | 'notFound';

interface PageEntry {
  pageKey: PageKey;
  /** Path relative to the locale prefix, e.g. '/' for the home page. */
  relPath: string;
  /** Whether the page should be indexed (controls canonical/alternate emission). */
  index: boolean;
}

const SUBPATH_TO_PAGE: Readonly<Record<string, { pageKey: PageKey; relPath: string }>> = {
  '/pricing': { pageKey: 'pricing', relPath: '/pricing' },
  '/features': { pageKey: 'features', relPath: '/features' },
  '/about': { pageKey: 'about', relPath: '/about' },
};

function pageForRoute(route: string): PageEntry {
  const stripped = route.replace(/^\/(en|th)/, '') || '/';
  if (stripped === '/' || stripped === '') {
    return { pageKey: 'home', relPath: '/', index: true };
  }
  const known = SUBPATH_TO_PAGE[stripped];
  if (known) return { ...known, index: true };
  // Wildcard or unknown subpath — treat as 404.
  return { pageKey: 'notFound', relPath: '/404', index: false };
}

interface SeoData {
  fullTitle: string;
  description: string;
  canonical: string;
  alternates: Array<{ hreflang: string; href: string }>;
  ogLocale: string;
  ogImage: string;
  jsonLdBlocks: Array<Record<string, unknown>>;
  index: boolean;
}

function buildSeo(route: string): SeoData {
  const locale = localeFromPath(route);
  const dict = DICTS[locale];
  const { pageKey, relPath, index } = pageForRoute(route);
  // `dict.meta` is shape-checked against `PageKey` at compile time — every
  // `PageKey` requires a matching `meta.<pageKey>` entry. No cast needed.
  const meta = dict.meta[pageKey];
  const title = meta?.title ?? siteConfig.name;
  const description = meta?.description ?? siteConfig.tagline;
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

  const jsonLdBlocks: Array<Record<string, unknown>> = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.hostname,
      slogan: siteConfig.tagline,
      inLanguage: [...siteConfig.locales],
    },
  ];

  // Pricing → Product schema (one offer per tier).
  if (pageKey === 'pricing') {
    jsonLdBlocks.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: siteConfig.name,
      description: siteConfig.description[locale],
      brand: { '@type': 'Brand', name: siteConfig.name },
      offers: dict.pricing.tiers.map((tier) => {
        // schema.org/Offer.price expects a numeric string. Strip thousand
        // separators (comma in en, none in th) and assert the result parses
        // — fail loud at build time so a typo in the locale dict never
        // emits malformed JSON-LD silently.
        const numeric = tier.price.replace(/,/g, '');
        if (!Number.isFinite(Number(numeric))) {
          throw new Error(
            `[buildSeo] tier "${tier.id}" (${locale}) has non-numeric price "${tier.price}"`,
          );
        }
        return {
          '@type': 'Offer',
          name: tier.name,
          description: tier.description,
          price: numeric,
          priceCurrency: 'THB',
          availability: 'https://schema.org/InStock',
          url: `${siteConfig.hostname}/${locale}/pricing#${tier.id}`,
        };
      }),
    });
  }

  // Home + Pricing → FAQPage schema.
  const faqItems =
    pageKey === 'home' ? dict.home.faq.items : pageKey === 'pricing' ? dict.pricing.faq.items : null;
  if (faqItems) {
    jsonLdBlocks.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((it) => ({
        '@type': 'Question',
        name: it.q,
        acceptedAnswer: { '@type': 'Answer', text: it.a },
      })),
    });
  }

  return {
    fullTitle,
    description,
    canonical,
    alternates,
    ogLocale: OG_LOCALE[locale],
    ogImage: `${siteConfig.hostname}/og/default.png`,
    jsonLdBlocks,
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
    ...seo.jsonLdBlocks.map(
      // Escape `</script>` substrings so any future locale string with that
      // sequence cannot prematurely close the inline LD+JSON tag.
      (block) =>
        `<script type="application/ld+json">${JSON.stringify(block).replace(/<\/script>/gi, '<\\/script>')}</script>`,
    ),
  ].filter(Boolean);
  return lines.join('\n    ');
}

function setHtmlLang(html: string, locale: Locale): string {
  return html.replace(/<html\b([^>]*)>/i, (_match, attrs: string) => {
    const cleaned = attrs.replace(/\s+lang="[^"]*"/i, '');
    return `<html${cleaned} lang="${locale}">`;
  });
}

const PRERENDER_PATHS: ReadonlyArray<string> = siteConfig.locales.flatMap((l) => [
  `/${l}`,
  `/${l}/pricing`,
  `/${l}/features`,
  `/${l}/about`,
]);

export default defineConfig({
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
      dynamicRoutes: [...PRERENDER_PATHS],
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
    includedRoutes: () => [...PRERENDER_PATHS],
    onPageRendered: (route, html) => {
      const locale = localeFromPath(route);
      const seo = buildSeo(route);
      const tags = renderSeoTags(seo);
      return setHtmlLang(html, locale)
        .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(seo.fullTitle)}</title>`)
        .replace('</head>', `    ${tags}\n  </head>`);
    },
  },
} as Parameters<typeof defineConfig>[0]);
