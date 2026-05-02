/* eslint-disable security/detect-non-literal-fs-filename -- the test reads its own dist dir, not user input */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');

function read(rel: string): string {
  const full = resolve(distDir, rel);
  if (!existsSync(full)) throw new Error(`expected build artefact missing: ${rel}`);
  return readFileSync(full, 'utf8');
}

interface PageSpec {
  file: string;
  locale: 'en' | 'th';
  canonical: string;
  noindex: boolean;
}

const PAGES: ReadonlyArray<PageSpec> = [
  { file: 'en.html', locale: 'en', canonical: 'https://lesso.clinic/en/', noindex: false },
  { file: 'th.html', locale: 'th', canonical: 'https://lesso.clinic/th/', noindex: false },
  { file: 'en/pricing.html', locale: 'en', canonical: 'https://lesso.clinic/en/pricing', noindex: false },
  { file: 'th/pricing.html', locale: 'th', canonical: 'https://lesso.clinic/th/pricing', noindex: false },
  { file: 'en/features.html', locale: 'en', canonical: 'https://lesso.clinic/en/features', noindex: false },
  { file: 'th/features.html', locale: 'th', canonical: 'https://lesso.clinic/th/features', noindex: false },
  { file: 'en/about.html', locale: 'en', canonical: 'https://lesso.clinic/en/about', noindex: false },
  { file: 'th/about.html', locale: 'th', canonical: 'https://lesso.clinic/th/about', noindex: false },
  { file: 'en/pilot.html', locale: 'en', canonical: 'https://lesso.clinic/en/pilot', noindex: false },
  { file: 'th/pilot.html', locale: 'th', canonical: 'https://lesso.clinic/th/pilot', noindex: false },
  { file: 'en/privacy.html', locale: 'en', canonical: 'https://lesso.clinic/en/privacy', noindex: true },
  { file: 'th/privacy.html', locale: 'th', canonical: 'https://lesso.clinic/th/privacy', noindex: true },
  { file: 'en/terms.html', locale: 'en', canonical: 'https://lesso.clinic/en/terms', noindex: true },
  { file: 'th/terms.html', locale: 'th', canonical: 'https://lesso.clinic/th/terms', noindex: true },
];

const INDEXED_PAGES = PAGES.filter((p) => !p.noindex);

describe('vite-react-ssg build output — B2 + B3 pages', () => {
  it.each(PAGES)('emits $file with correct lang + canonical', ({ file, locale, canonical, noindex }) => {
    const html = read(file);
    // eslint-disable-next-line security/detect-non-literal-regexp -- locale is a constant union ('en' | 'th')
    expect(html).toMatch(new RegExp(`<html[^>]+lang="${locale}"`));
    expect(html).toContain(`<link rel="canonical" href="${canonical}"`);
    expect(html).toContain('"@type":"Organization"');
    if (noindex) {
      expect(html).toContain('<meta name="robots" content="noindex"');
      // noindex pages omit hreflang alternates (not meant for indexing).
      expect(html).not.toMatch(/rel="alternate"[^>]+hreflang/);
    } else {
      expect(html).not.toContain('<meta name="robots" content="noindex"');
      expect(html).toMatch(/rel="alternate"[^>]+hreflang="th"/);
      expect(html).toMatch(/rel="alternate"[^>]+hreflang="en"/);
      expect(html).toMatch(/hreflang="x-default"/);
    }
  });

  it('home pages include the editorial hero copy', () => {
    expect(read('en.html')).toContain('Less cost.');
    expect(read('th.html')).toContain('ลดต้นทุน');
  });

  it('pricing pages include Product schema + tier price', () => {
    for (const file of ['en/pricing.html', 'th/pricing.html']) {
      const html = read(file);
      expect(html).toContain('"@type":"Product"');
      expect(html).toContain('"@type":"Offer"');
      expect(html).toContain('"price":"2990"');
    }
  });

  it('home + pricing include FAQPage schema', () => {
    for (const file of ['en.html', 'th.html', 'en/pricing.html', 'th/pricing.html']) {
      expect(read(file)).toContain('"@type":"FAQPage"');
    }
  });

  it('features + about do NOT include FAQPage / Product schema', () => {
    for (const file of ['en/features.html', 'th/features.html', 'en/about.html', 'th/about.html']) {
      const html = read(file);
      expect(html).not.toContain('"@type":"Product"');
      expect(html).not.toContain('"@type":"FAQPage"');
    }
  });

  it('pilot page contains the form (Submit button + email field)', () => {
    for (const file of ['en/pilot.html', 'th/pilot.html']) {
      const html = read(file);
      // Hidden locale input is RHF-registered; visible email field labelled.
      expect(html).toContain('id="email"');
      expect(html).toContain('id="fullName"');
    }
  });

  it('legal pages render DRAFT banner', () => {
    for (const file of ['en/privacy.html', 'en/terms.html', 'th/privacy.html', 'th/terms.html']) {
      const html = read(file);
      expect(html).toContain('DRAFT');
      expect(html).toContain('role="note"');
    }
  });

  it('emits sitemap.xml with all indexable routes', () => {
    // Note: vite-react-ssg auto-includes every prerendered page in the
    // sitemap regardless of `dynamicRoutes`, so legal pages also appear.
    // The binding signal that keeps them out of search results is the
    // `noindex` <meta> tag in the rendered HTML (asserted per-page above).
    const xml = read('sitemap.xml');
    for (const p of INDEXED_PAGES) {
      const path = p.canonical.replace('https://lesso.clinic', '').replace(/\/$/, '');
      expect(xml).toContain(`https://lesso.clinic${path || `/${p.locale}`}`);
    }
  });

  it('emits Plausible script when VITE_PLAUSIBLE_DOMAIN is set', () => {
    if (!process.env.VITE_PLAUSIBLE_DOMAIN) return;
    for (const file of ['en.html', 'en/pilot.html']) {
      expect(read(file)).toContain('plausible.io/js/script.tagged-events.js');
    }
  });

  it('emits robots.txt referencing the sitemap', () => {
    const robots = read('robots.txt');
    expect(robots).toContain('Sitemap: https://lesso.clinic/sitemap.xml');
  });
});
