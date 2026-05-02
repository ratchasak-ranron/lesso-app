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

const PAGES: ReadonlyArray<{ file: string; locale: 'en' | 'th'; canonical: string }> = [
  { file: 'en.html', locale: 'en', canonical: 'https://lesso.clinic/en/' },
  { file: 'th.html', locale: 'th', canonical: 'https://lesso.clinic/th/' },
  { file: 'en/pricing.html', locale: 'en', canonical: 'https://lesso.clinic/en/pricing' },
  { file: 'th/pricing.html', locale: 'th', canonical: 'https://lesso.clinic/th/pricing' },
  { file: 'en/features.html', locale: 'en', canonical: 'https://lesso.clinic/en/features' },
  { file: 'th/features.html', locale: 'th', canonical: 'https://lesso.clinic/th/features' },
  { file: 'en/about.html', locale: 'en', canonical: 'https://lesso.clinic/en/about' },
  { file: 'th/about.html', locale: 'th', canonical: 'https://lesso.clinic/th/about' },
];

describe('vite-react-ssg build output — B2 core pages', () => {
  it.each(PAGES)('emits $file with correct lang + canonical', ({ file, locale, canonical }) => {
    const html = read(file);
    // eslint-disable-next-line security/detect-non-literal-regexp -- locale is a constant union ('en' | 'th')
    expect(html).toMatch(new RegExp(`<html[^>]+lang="${locale}"`));
    expect(html).toMatch(/rel="alternate"[^>]+hreflang="th"/);
    expect(html).toMatch(/rel="alternate"[^>]+hreflang="en"/);
    expect(html).toMatch(/hreflang="x-default"/);
    expect(html).toContain(`<link rel="canonical" href="${canonical}"`);
    expect(html).toContain('"@type":"Organization"');
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

  it('emits sitemap.xml with all 8 prerendered routes', () => {
    const xml = read('sitemap.xml');
    for (const path of [
      '/en',
      '/th',
      '/en/pricing',
      '/th/pricing',
      '/en/features',
      '/th/features',
      '/en/about',
      '/th/about',
    ]) {
      expect(xml).toContain(`https://lesso.clinic${path}`);
    }
  });

  it('emits robots.txt referencing the sitemap', () => {
    const robots = read('robots.txt');
    expect(robots).toContain('Sitemap: https://lesso.clinic/sitemap.xml');
  });
});
