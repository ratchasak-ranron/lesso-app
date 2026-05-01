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

describe('vite-react-ssg build output', () => {
  it('prerenders /en.html with English content + correct html lang', () => {
    const html = read('en.html');
    expect(html).toMatch(/<html[^>]+lang="en"/);
    expect(html).toContain('Hello, Lesso');
    // hreflang alternates link both locales
    expect(html).toMatch(/rel="alternate"[^>]+hreflang="th"/);
    expect(html).toMatch(/rel="alternate"[^>]+hreflang="en"/);
    expect(html).toMatch(/hreflang="x-default"/);
    // schema.org Organization payload is rendered inline
    expect(html).toContain('"@type":"Organization"');
  });

  it('prerenders /th.html with Thai content + th lang attr', () => {
    const html = read('th.html');
    expect(html).toMatch(/<html[^>]+lang="th"/);
    expect(html).toContain('สวัสดี Lesso');
  });

  it('emits sitemap.xml with both locales', () => {
    const xml = read('sitemap.xml');
    expect(xml).toContain('https://lesso.clinic/en');
    expect(xml).toContain('https://lesso.clinic/th');
  });

  it('emits robots.txt referencing the sitemap', () => {
    const robots = read('robots.txt');
    expect(robots).toContain('Sitemap: https://lesso.clinic/sitemap.xml');
  });
});
