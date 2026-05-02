// Build-time OG + icon generator. Runs as `pnpm --filter @reinly/web run og:gen`,
// auto-invoked via the `prebuild` lifecycle script before `vite-react-ssg build`.
//
// Outputs to `apps/web/public/`:
//   - og/{home,pricing,features,about,pilot}-{en,th}.png  (10 files, 1200×630)
//   - apple-touch-icon.png  (180×180, iOS home screen)
//   - icon-192.png + icon-512.png  (PWA manifest icons)
//
// Reads page copy from the locale JSONs at gen time, so any future copy edit
// regenerates fresh OG images on the next deploy. Vercel cache invalidates
// automatically because the source dict bytes changed.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { ogTemplate, iconTemplate } from './og-template.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Hardcoded paths into `apps/web/node_modules/@fontsource/*` (pnpm symlinks).
// Companion safeguard: `package.json` pins each `@fontsource/*` to an exact
// version (no `^`). A minor `@fontsource` bump can rename internal `files/`
// entries — without exact pinning, Vercel `prebuild` would break silently
// on the next install. Existence assertion below fails loudly if the layout
// changes despite pinning, so the failure surfaces at gen time, not deploy.
const FONT_SPECS = [
  {
    name: 'Inter',
    path: resolve(ROOT, 'node_modules/@fontsource/inter/files/inter-latin-700-normal.woff'),
    weight: 700,
  },
  {
    name: 'Playfair Display',
    path: resolve(
      ROOT,
      'node_modules/@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff',
    ),
    weight: 700,
  },
  {
    // Thai-glyph fallback for `th` locale OG images. Without this, Thai
    // strings render as tofu boxes. Listed last so Satori only picks it
    // up for glyphs that Inter + Playfair don't cover.
    name: 'Noto Sans Thai',
    path: resolve(
      ROOT,
      'node_modules/@fontsource/noto-sans-thai/files/noto-sans-thai-thai-700-normal.woff',
    ),
    weight: 700,
  },
];

for (const spec of FONT_SPECS) {
  if (!existsSync(spec.path)) {
    throw new Error(
      `[og-gen] font missing: ${spec.path}\n` +
        `  → @fontsource layout likely changed; pin a known-good version in package.json or update the path.`,
    );
  }
}

const fonts = FONT_SPECS.map((spec) => ({
  name: spec.name,
  data: readFileSync(spec.path),
  weight: spec.weight,
  style: 'normal',
}));

// Locale dicts loaded as JSON (Node 22+ supports `with { type: 'json' }`).
const enLocale = JSON.parse(readFileSync(resolve(ROOT, 'src/locales/en.json'), 'utf8'));
const thLocale = JSON.parse(readFileSync(resolve(ROOT, 'src/locales/th.json'), 'utf8'));
const LOCALES = { en: enLocale, th: thLocale };

// Per-page key paths into the locale dict. `titleKey` is the dotted path
// to the OG-image headline; `eyebrowKey` is the small uppercase tag above.
const PAGES = [
  { key: 'home', titleKey: 'home.heroLine1', eyebrowKey: 'home.eyebrow' },
  { key: 'pricing', titleKey: 'pricing.intro.heading', eyebrowKey: 'pricing.intro.eyebrow' },
  { key: 'features', titleKey: 'features.intro.heading', eyebrowKey: 'features.intro.eyebrow' },
  { key: 'about', titleKey: 'about.intro.heading', eyebrowKey: 'about.intro.eyebrow' },
  { key: 'pilot', titleKey: 'pilot.intro.heading', eyebrowKey: 'pilot.intro.eyebrow' },
];

function lookup(dict, dottedKey) {
  return dottedKey.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), dict);
}

async function genOg({ key, titleKey, eyebrowKey }, locale) {
  const dict = LOCALES[locale];
  const title = lookup(dict, titleKey) ?? '';
  const eyebrow = lookup(dict, eyebrowKey) ?? '';
  const node = ogTemplate({ title, eyebrow });
  const svg = await satori(node, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  const out = resolve(ROOT, 'public/og', `${key}-${locale}.png`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, png);
  return out;
}

async function genIcon({ size, file }) {
  const node = iconTemplate({ size });
  const svg = await satori(node, { width: size, height: size, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
  writeFileSync(resolve(ROOT, 'public', file), png);
}

const startedAt = Date.now();
let count = 0;
for (const page of PAGES) {
  for (const loc of ['en', 'th']) {
    await genOg(page, loc);
    count++;
  }
}
for (const i of [
  { size: 180, file: 'apple-touch-icon.png' },
  { size: 192, file: 'icon-192.png' },
  { size: 512, file: 'icon-512.png' },
]) {
  await genIcon(i);
  count++;
}
console.log(`[og-gen] wrote ${count} PNGs in ${Date.now() - startedAt}ms`);
