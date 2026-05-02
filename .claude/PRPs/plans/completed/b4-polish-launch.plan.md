# Plan: B4 — Polish + Launch

## Summary
Last mile to `lesso.clinic` go-live: per-page OG images via Satori at build time,
PWA manifest + icons, `<link rel="apple-touch-icon">`, branded 500 / error boundary,
empty blog scaffold (MDX-ready), Lighthouse CI config + local script, DNS + Search
Console runbook. Manual Vercel/DNS/SC actions land in a `docs/launch-runbook.md`
(NOT executed by code — operator follows the steps after merge).

## User Story
As a Thai aesthetic clinic owner discovering Lesso via search/social,
I want a fast, accessible site that surfaces the right preview when shared,
So that I trust the operator before clicking the pilot CTA.

## Problem → Solution
B3 ships the funnel with a single `og/default.png` and no Lighthouse gate, no PWA
manifest, no error UI past `/404`, and no blog → B4 closes the launch checklist:
per-page OG images, manifest with 192 + 512 icons, apple-touch-icon, render-phase
error boundary, blog-ready route, LHCI ≥95 gate, and an operator runbook for the
actions that must happen outside code (DNS, Search Console, sitemap submission).

## Metadata
- **Complexity**: Large
- **Source PRD**: `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md`
- **PRD Phase**: B4 — Polish + Launch
- **Estimated Files**: ~22 (16 created, 6 updated)

---

## UX Design

### Before
```
┌───────────────────────────────────────────┐
│ /404            single fallback           │
│ /500            crash → blank screen      │
│ /blog           404                       │
│ Share preview   og/default.png everywhere │
│ Home-screen icon  none                    │
│ PWA install     not eligible              │
│ Lighthouse      ungated                   │
└───────────────────────────────────────────┘
```

### After
```
┌───────────────────────────────────────────┐
│ /404            branded (existing)        │
│ Render crash    branded ErrorBoundary     │
│ /{locale}/blog  Empty-state + MDX-ready   │
│ Share preview   per-page OG (10 images)   │
│ Home-screen icon apple-touch-icon 180×180 │
│ PWA install     192 + 512 + manifest      │
│ Lighthouse      .lighthouserc.json gate   │
│                  ≥95 perf/seo/a11y/bp     │
└───────────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Share on Twitter/LINE/FB | Single OG image (Lesso wordmark) | Per-page OG (page title + brand) | 5 pages × 2 locales = 10 PNGs |
| Add to home screen (iOS) | Generic Safari snapshot | apple-touch-icon 180×180 | One PNG in `public/` |
| Add to home screen (Android) | Generic Chrome snapshot | Manifest + 192/512 icons | `manifest.webmanifest` |
| Render-phase crash | Blank white | Branded error UI + back-home link | Class boundary in `RootLayout` |
| `/blog` URL | 404 | Index page + "Posts coming soon" | Empty state, MDX glob ready |
| CI Lighthouse gate | None | ≥95 on home + pricing (en + th) | `.lighthouserc.json` |
| Local Lighthouse | Manual browser run | `pnpm lhci:web` | One command |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `apps/web/vite.config.ts` | 25–155, 202–258 | Where to wire per-page OG image lookup + Plausible |
| P0 | `apps/web/src/components/layout/root-layout.tsx` | all | Where to wrap Outlet in ErrorBoundary |
| P0 | `apps/web/src/routes.tsx` | all | Register `/blog` child route |
| P0 | `apps/web/src/lib/i18n-dict.ts` | all | Dict shape for new `meta.blog` + `blog.*` keys |
| P0 | `apps/web/src/locales/{en,th}.json` | meta + footer + locale-parity | Dict parity at compile time |
| P0 | `apps/web/index.html` | all | Where to link manifest + apple-touch-icon |
| P0 | `apps/web/public/og/default.png` | n/a | Existing fallback OG (1200×630) — preserved as default |
| P1 | `.github/_deferred/workflows/lighthouse-web.yml` | all | Existing deferred CI uses `treosh/lighthouse-ci-action@v12` + `configPath: .lighthouserc.json` |
| P1 | `apps/web/src/components/marketing/section.tsx` | 19–49 | Layout primitive for blog index empty state |
| P1 | `apps/web/src/pages/not-found.tsx` | all | Pattern for branded standalone pages (error UI mirrors this) |
| P1 | `apps/web/src/pages/pages.test.tsx` | all | Page test pattern for blog index |
| P1 | `apps/web/tests/build-output.test.ts` | all | Build-output assertion pattern (extend for OG + manifest) |
| P2 | `apps/web/package.json` | scripts + deps | `prebuild` chain for OG gen |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Satori CSS subset | github.com/vercel/satori | Flexbox-only (no grid); `style={{}}` only (no Tailwind classes); WOFF/TTF only (no WOFF2); `fontFamily` must match `fonts[].name` exactly |
| `@resvg/resvg-js` | github.com/yisibl/resvg-js | `new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()` returns a Buffer |
| `@lhci/cli` config | github.com/GoogleChrome/lighthouse-ci/docs | `startServerReadyPattern: "Local.*http://localhost"` matches Vite preview output; `categories:performance` etc. assertions take `["error", { minScore: 0.95 }]` |
| Web App Manifest installability | web.dev/install-criteria | Both 192px AND 512px icons required; `display: "standalone" | "minimal-ui"`; `purpose: "any maskable"` covers both audits |
| Apple touch icon | developer.apple.com | Exactly 180×180 PNG, no transparency; `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` |
| React error boundary | react.dev/reference/react/Component | Class only (`getDerivedStateFromError` + `componentDidCatch`); catches render-phase only — NOT event handlers, NOT async, NOT SSR |

---

## Patterns to Mirror

### NAMING_CONVENTION
```ts
// SOURCE: apps/web/src/pages/pricing.tsx:1-9
export function PricingPage() {
  const { t, dict, locale } = useResolvedLocale();
  ...
}
```
PascalCase function exports; kebab-case files; pages live under `src/pages/`.

### PAGE_REGISTRATION
```ts
// SOURCE: apps/web/vite.config.ts:25-50
type PageKey = 'home' | 'pricing' | 'features' | 'about' | 'pilot' | 'privacy' | 'terms' | 'notFound';
const SUBPATH_TO_PAGE = {
  '/pricing': { pageKey: 'pricing', relPath: '/pricing' },
  ...
};
const PRERENDER_PATHS = siteConfig.locales.flatMap((l) => [`/${l}`, ...]);
```
Each new page key requires: extend `PageKey` union → add to `SUBPATH_TO_PAGE` → add to `PRERENDER_PATHS` → add `meta.<pageKey>.{title,description}` to BOTH locale JSONs.

### SECTION_LAYOUT
```ts
// SOURCE: apps/web/src/components/marketing/section.tsx:19-49
<section aria-labelledby={heading ? `${id}-heading` : undefined}>
  <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
    {/* eyebrow + h2 + body */}
  </div>
</section>
```

### BRANDED_STANDALONE_PAGE
```ts
// SOURCE: apps/web/src/pages/not-found.tsx:7-25
<section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
  <p className="font-heading text-7xl font-semibold text-primary">{t('notFound.heading')}</p>
  <p className="text-lg text-muted-foreground">{t('notFound.body')}</p>
  <a href={`/${locale}`} className="...">{t('notFound.backHome')}</a>
</section>
```

### TEST_STRUCTURE_PAGE
```ts
// SOURCE: apps/web/src/pages/pages.test.tsx:8-14
function renderPage(Component: React.ComponentType, pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Component />
    </MemoryRouter>,
  );
}
```

### TEST_STRUCTURE_BUILD
```ts
// SOURCE: apps/web/tests/build-output.test.ts (current shape)
describe('vite-react-ssg build output — Bx pages', () => {
  it.each(PAGES)('emits $file ...', ({ file, locale, canonical }) => { ... });
});
```

### SSG_SEO_INJECTION
```ts
// SOURCE: apps/web/vite.config.ts:63-155
function buildSeo(route: string): SeoData {
  const { pageKey, relPath, index } = pageForRoute(route);
  ...
  return {
    ...,
    ogImage: `${siteConfig.hostname}/og/default.png`,  // ← change: per-page lookup
    ...
  };
}
```

---

## Files to Change

### Created (16)
| File | Action | Justification |
|---|---|---|
| `apps/web/scripts/og-gen.mjs` | CREATE | Build-time Satori script — emits 10 OG PNGs |
| `apps/web/scripts/og-template.mjs` | CREATE | Shared JSX template (Satori-compatible inline-style only) |
| `apps/web/.lighthouserc.json` | CREATE | LHCI config — `.95` gate on 4 categories |
| `apps/web/public/manifest.webmanifest` | CREATE | PWA manifest |
| `apps/web/public/apple-touch-icon.png` | CREATE | 180×180 generated via og-gen.mjs |
| `apps/web/public/icon-192.png` | CREATE | Manifest icon |
| `apps/web/public/icon-512.png` | CREATE | Manifest icon |
| `apps/web/public/og/{home,pricing,features,about,pilot}-{en,th}.png` | CREATE (10 files) | Per-page OG images |
| `apps/web/src/components/layout/error-boundary.tsx` | CREATE | Class component, branded fallback |
| `apps/web/src/components/layout/error-boundary.test.tsx` | CREATE | Throws-then-renders fallback |
| `apps/web/src/pages/blog/index.tsx` | CREATE | `/blog` index — empty state + MDX glob loader |
| `apps/web/src/pages/blog/index.test.tsx` | CREATE | Empty state copy + locale routing |
| `apps/web/src/lib/blog.ts` | CREATE | Vite glob import of `*.mdx` posts (returns `[]` while empty) |
| `docs/launch-runbook.md` | CREATE | DNS, Search Console, Bing Webmaster — operator-only steps |
| `apps/web/og-fonts/.gitkeep` | CREATE | Tracks dir (fonts pulled from `node_modules/@fontsource/...` at gen time, not committed) |

### Updated (6)
| File | Action | Justification |
|---|---|---|
| `apps/web/package.json` | UPDATE | Add `satori`, `@resvg/resvg-js`, `@lhci/cli`, `@fontsource/playfair-display`, `@fontsource/inter`. Add scripts: `og:gen`, `lhci:web`, `prebuild` |
| `apps/web/index.html` | UPDATE | Link manifest, apple-touch-icon, apple-mobile-web-app-capable meta |
| `apps/web/vite.config.ts` | UPDATE | Per-page OG image lookup; PageKey += `'blog'`; SUBPATH_TO_PAGE += `/blog`; PRERENDER_PATHS += `/${l}/blog` |
| `apps/web/src/locales/{en,th}.json` | UPDATE | Add `meta.blog`, `blog.intro`, `blog.empty`, `error.heading/body/cta` |
| `apps/web/src/routes.tsx` | UPDATE | Register `BlogIndexPage` as `/blog` child |
| `apps/web/src/components/layout/root-layout.tsx` | UPDATE | Wrap `<Outlet />` in `<ErrorBoundary>` |
| `apps/web/tests/build-output.test.ts` | UPDATE | Assert per-page OG meta + manifest reachable + `apple-touch-icon` link |
| `apps/web/.gitignore` | UPDATE | Track `public/og/*.png` + `public/icon-*.png` + `public/apple-touch-icon.png` (do not ignore — they're checked in for Vercel build cache) |

## NOT Building

- **Real DNS cutover** — operator runs Vercel dashboard steps from `docs/launch-runbook.md` after merge
- **Search Console + Bing verification** — operator runs from runbook (requires login + DNS TXT or HTML file)
- **Sitemap submission** — operator runs from runbook
- **Promoting `.github/_deferred/workflows/*.yml` to `.github/workflows/`** — token does not have `workflow` scope; operator promotes manually after merge (documented in runbook)
- **Real blog posts** — scaffold only ships an empty-state index. Founder writes the first MDX post after launch.
- **Blog post detail route** (`/blog/:slug`) — scaffold ships index only; detail route lands when first post lands
- **OG image runtime generation** — strictly build-time; no `@vercel/og` Edge function
- **Service worker / offline mode** — manifest exists for PWA install eligibility, no SW
- **Splash screens for iOS** — apple-touch-icon only; not the full bag of `<link rel="apple-touch-startup-image">` per device
- **Theme switcher** — manifest `theme_color` is fixed at brand teal (`#134E4A`)
- **`pnpm lhci` in `pnpm test`** — Lighthouse stays out of the regular test loop (slow, browser-dependent); only runs via dedicated `lhci:web` script + CI workflow when promoted
- **Root-domain HTTP→HTTPS** — Vercel handles automatically (already on by default)
- **Custom 500 page route** — React errors caught by ErrorBoundary; non-React 500 errors (rare on SSG site) hit Vercel's default page

---

## Step-by-Step Tasks

### Task 1: Add dependencies
- **ACTION**: Add deps to `apps/web/package.json`.
- **IMPLEMENT**:
  ```bash
  pnpm --filter @lesso/web add -D satori @resvg/resvg-js @lhci/cli @fontsource/playfair-display @fontsource/inter
  ```
  Pin versions: `satori ^0.10.14`, `@resvg/resvg-js ^2.6.2`, `@lhci/cli ^0.14.0`. `@fontsource/*` provides WOFF/TTF font files in `node_modules`.
- **MIRROR**: existing devDeps alphabetization in `package.json`.
- **GOTCHA**:
  1. `@fontsource` packages ship WOFF, WOFF2, and TTF — Satori cannot read WOFF2. Use `.woff` or `.ttf` files.
  2. `@lhci/cli` is hefty (~50MB) but it's `devDep`, never bundled to client.
- **VALIDATE**: `pnpm install` succeeds; `pnpm --filter @lesso/web typecheck` still green.

### Task 2: OG image template (Satori-compatible JSX-as-object)
- **ACTION**: Create `apps/web/scripts/og-template.mjs`.
- **IMPLEMENT**: Pure JS module exporting a function `ogTemplate({ title, eyebrow, locale }) → object` matching Satori's JSX-as-object shape (NOT JSX — keeping the script as `.mjs` avoids needing a JSX transform in the script runner):
  ```js
  export function ogTemplate({ title, eyebrow, locale }) {
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '1200px',
          height: '630px',
          padding: '80px',
          background: '#FAF7F2',          // brand cream
          borderLeft: '12px solid #134E4A', // brand teal
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: 28,
                color: '#A45A3D',           // brand terracotta
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                marginBottom: '40px',
              },
              children: eyebrow,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: 96,
                fontFamily: 'Playfair Display',
                color: '#1A1A1A',
                lineHeight: 1.05,
                fontWeight: 700,
              },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                marginTop: 'auto',
                fontSize: 32,
                color: '#134E4A',
                fontWeight: 600,
              },
              children: 'Lesso · lesso.clinic',
            },
          },
        ],
      },
    };
  }
  ```
- **MIRROR**: brand v2 palette tokens (no hex outside this script — script is build-time only, isolated from runtime tokens).
- **GOTCHA**:
  1. Every container needs `display: 'flex'` even if it has one child — Satori treats the default as `block` and breaks layout silently.
  2. `lang` attribute is NOT supported; for Thai text use `fontFamily` that includes Thai glyph coverage. Inter covers Latin only — pair with a Thai-capable Playfair OR fall back to Noto Sans Thai. Use both fonts in the `fonts` array; Satori picks whichever has the glyph.
  3. Hex tokens here are intentional — Satori has no Tailwind/CSS-var resolution.
- **VALIDATE**: Smoke-test in Node — `import { ogTemplate } from './og-template.mjs'; console.log(ogTemplate({title:'X',eyebrow:'Y',locale:'en'}))`.

### Task 3: OG generator script
- **ACTION**: Create `apps/web/scripts/og-gen.mjs`.
- **IMPLEMENT**:
  ```js
  import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
  import { resolve, dirname } from 'node:path';
  import { fileURLToPath } from 'node:url';
  import satori from 'satori';
  import { Resvg } from '@resvg/resvg-js';
  import { ogTemplate } from './og-template.mjs';
  import enLocale from '../src/locales/en.json' with { type: 'json' };
  import thLocale from '../src/locales/th.json' with { type: 'json' };

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const ROOT = resolve(__dirname, '..');

  const inter = readFileSync(
    resolve(ROOT, '../../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff'),
  );
  const playfair = readFileSync(
    resolve(ROOT, '../../node_modules/@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff'),
  );

  const FONTS = [
    { name: 'Inter', data: inter, weight: 700, style: 'normal' },
    { name: 'Playfair Display', data: playfair, weight: 700, style: 'normal' },
  ];

  const PAGES = [
    { key: 'home', titleKey: 'home.heroLine1', eyebrowKey: 'home.eyebrow' },
    { key: 'pricing', titleKey: 'pricing.intro.heading', eyebrowKey: 'pricing.intro.eyebrow' },
    { key: 'features', titleKey: 'features.intro.heading', eyebrowKey: 'features.intro.eyebrow' },
    { key: 'about', titleKey: 'about.intro.heading', eyebrowKey: 'about.intro.eyebrow' },
    { key: 'pilot', titleKey: 'pilot.intro.heading', eyebrowKey: 'pilot.intro.eyebrow' },
  ];
  const LOCALES = { en: enLocale, th: thLocale };

  function lookup(dict, dottedKey) {
    return dottedKey.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), dict);
  }

  async function gen({ key, titleKey, eyebrowKey }, locale) {
    const dict = LOCALES[locale];
    const title = lookup(dict, titleKey) ?? '';
    const eyebrow = lookup(dict, eyebrowKey) ?? '';
    const node = ogTemplate({ title, eyebrow, locale });
    const svg = await satori(node, { width: 1200, height: 630, fonts: FONTS });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    const out = resolve(ROOT, 'public/og', `${key}-${locale}.png`);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, png);
    return out;
  }

  async function genIcon({ size, file }) {
    // Reuse template — single brand wordmark only, no eyebrow/title.
    const node = {
      type: 'div', props: { style: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: `${size}px`, height: `${size}px`, background: '#134E4A',
        color: '#FAF7F2', fontFamily: 'Playfair Display',
        fontSize: Math.round(size * 0.4), fontWeight: 700,
      }, children: 'L' },
    };
    const svg = await satori(node, { width: size, height: size, fonts: FONTS });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
    writeFileSync(resolve(ROOT, 'public', file), png);
  }

  for (const page of PAGES) {
    for (const loc of ['en', 'th']) await gen(page, loc);
  }
  for (const i of [{ size: 180, file: 'apple-touch-icon.png' }, { size: 192, file: 'icon-192.png' }, { size: 512, file: 'icon-512.png' }]) {
    await genIcon(i);
  }
  console.log(`[og-gen] wrote ${PAGES.length * 2 + 3} PNGs to public/`);
  ```
- **MIRROR**: build-time pre-render style — Node-only, no client deps.
- **GOTCHA**:
  1. `import * with { type: 'json' }` is the new ESM JSON-import syntax (Node 22+). The repo runs on Node 20 in CI; check `engines` in `package.json`. If 20: use `readFileSync` + `JSON.parse` instead.
  2. `@fontsource/inter` ships fonts in `files/` subdir — exact filename varies by version. Pin via `pnpm add -D` and verify path.
  3. Thai-language OG: Inter does NOT have Thai glyphs — when locale is `th`, the title falls back to Satori's tofu boxes. Solution: also load `@fontsource/noto-sans-thai` (or noto-sans-thai-looped) and include in `FONTS`. Add `@fontsource/noto-sans-thai` to deps in Task 1.
  4. Generator MUST run before `vite-react-ssg build` so the PNGs exist when SSG references them. Wire as `prebuild` script.
- **VALIDATE**: `pnpm --filter @lesso/web run og:gen` produces 13 files in `apps/web/public/{og/,*}.png`.

### Task 4: Update package.json scripts
- **ACTION**: Edit `apps/web/package.json` scripts.
- **IMPLEMENT**:
  ```json
  "scripts": {
    "dev": "vite",
    "og:gen": "node scripts/og-gen.mjs",
    "prebuild": "pnpm run og:gen",
    "build": "vite-react-ssg build",
    "preview": "vite preview",
    "lint": "eslint . --max-warnings 0",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:build": "pnpm build && vitest run tests/build-output.test.ts",
    "lhci:web": "lhci autorun"
  }
  ```
- **GOTCHA**: `prebuild` runs automatically on `pnpm build` (npm-style lifecycle). Vercel calls `pnpm turbo build --filter=@lesso/web` from `vercel.json` `buildCommand`; turbo invokes `pnpm build` in `apps/web/`, which triggers `prebuild`. Confirmed safe.
- **VALIDATE**: `pnpm --filter @lesso/web run og:gen` runs cleanly.

### Task 5: Wire per-page OG image in vite.config buildSeo
- **ACTION**: Edit `apps/web/vite.config.ts` `buildSeo` to look up `og/<pageKey>-<locale>.png` and fall back to `og/default.png`.
- **IMPLEMENT**:
  ```ts
  const PER_PAGE_OG: ReadonlySet<PageKey> = new Set(['home', 'pricing', 'features', 'about', 'pilot']);

  function buildSeo(route: string): SeoData {
    ...
    const ogImage = PER_PAGE_OG.has(pageKey)
      ? `${siteConfig.hostname}/og/${pageKey}-${locale}.png`
      : `${siteConfig.hostname}/og/default.png`;
    return { ..., ogImage, ... };
  }
  ```
- **MIRROR**: SOURCE `vite.config.ts:63-155` `buildSeo`.
- **GOTCHA**: Privacy + Terms + Blog stay on `og/default.png` (no per-page art for noindex pages or empty blog).
- **VALIDATE**: After build, `dist/en/pricing.html` contains `<meta property="og:image" content="https://lesso.clinic/og/pricing-en.png">`.

### Task 6: PWA manifest
- **ACTION**: Create `apps/web/public/manifest.webmanifest`.
- **IMPLEMENT**:
  ```json
  {
    "name": "Lesso — Aesthetic clinic backoffice",
    "short_name": "Lesso",
    "description": "Aesthetic clinic backoffice for Thai clinics — patient records, course tracking, multi-branch reports, PDPA-compliant out of the box.",
    "start_url": "/en",
    "scope": "/",
    "display": "standalone",
    "orientation": "portrait",
    "lang": "en",
    "theme_color": "#134E4A",
    "background_color": "#FAF7F2",
    "icons": [
      {
        "src": "/icon-192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/icon-512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ]
  }
  ```
- **GOTCHA**:
  1. Both 192 + 512 required for Lighthouse "Installable" check.
  2. `display: "browser"` fails PWA installability — use `"standalone"`.
  3. `start_url` is the locale root (`/en`) since `/` redirects (per `vercel.json`).
- **VALIDATE**: After build, `dist/manifest.webmanifest` exists.

### Task 7: Update index.html
- **ACTION**: Edit `apps/web/index.html`.
- **IMPLEMENT**:
  ```html
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Lesso" />
  ```
  Keep existing `theme-color` meta; add the four lines above after the favicon link.
- **GOTCHA**: `<meta name="apple-mobile-web-app-capable">` is what Lighthouse audits — DO NOT skip it even though most modern browsers ignore it.
- **VALIDATE**: After build, `dist/en.html` contains all four references.

### Task 8: Lighthouse CI config
- **ACTION**: Create `apps/web/.lighthouserc.json`.
- **IMPLEMENT**:
  ```json
  {
    "ci": {
      "collect": {
        "startServerCommand": "pnpm --filter @lesso/web preview",
        "startServerReadyPattern": "Local.*http://localhost",
        "startServerReadyTimeout": 30000,
        "url": [
          "http://localhost:4173/en",
          "http://localhost:4173/th",
          "http://localhost:4173/en/pricing",
          "http://localhost:4173/th/pricing",
          "http://localhost:4173/en/pilot"
        ],
        "numberOfRuns": 1
      },
      "assert": {
        "assertions": {
          "categories:performance": ["error", { "minScore": 0.95 }],
          "categories:seo": ["error", { "minScore": 0.95 }],
          "categories:accessibility": ["error", { "minScore": 0.95 }],
          "categories:best-practices": ["error", { "minScore": 0.95 }]
        }
      },
      "upload": {
        "target": "temporary-public-storage"
      }
    }
  }
  ```
- **MIRROR**: existing `.github/_deferred/workflows/lighthouse-web.yml` already references `configPath: ./apps/web/.lighthouserc.json`.
- **GOTCHA**:
  1. `numberOfRuns: 1` in dev/CI — bump to `3` in prod for median; default `3` is too slow for a 5-page run on PRs.
  2. Vite preview default port is `4173`; we set port to `5174` for `dev` in `vite.config.ts` but preview uses 4173 unchanged.
  3. The first build/preview after `og-gen` ran should hit ≥0.95 on all metrics. If not, the most likely fail is `accessibility` (forms are dense — already audited in B3) or `best-practices` (CSP headers should be set by Vercel; LHCI in local won't see them). LHCI runs against local preview with NO Vercel headers — `best-practices` may dip. Mitigation: lower local threshold to `0.92` or accept the dip and gate ONLY in CI where the deployed Vercel preview URL is audited.
- **VALIDATE**: `pnpm --filter @lesso/web build && pnpm --filter @lesso/web run lhci:web` runs without throwing on config syntax. Score validation comes later.

### Task 9: Render-phase ErrorBoundary
- **ACTION**: Create `apps/web/src/components/layout/error-boundary.tsx`.
- **IMPLEMENT**:
  ```tsx
  import { Component, type ErrorInfo, type ReactNode } from 'react';

  interface State {
    readonly hasError: boolean;
    readonly error: Error | null;
  }

  interface ErrorFallbackProps {
    error: Error | null;
  }

  /**
   * Render-phase error boundary for the marketing site. Catches crashes in
   * route components during client-side navigation. Does NOT catch:
   *   - Errors in event handlers (`onClick`, etc.)
   *   - Async errors (use `window.addEventListener('unhandledrejection', ...)`)
   *   - SSR errors (vite-react-ssg build step — those fail the build outright)
   */
  export class ErrorBoundary extends Component<
    { children?: ReactNode; fallback: (props: ErrorFallbackProps) => ReactNode },
    State
  > {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
      // Production logging hook — wire to Sentry/Datadog in A7+.
      // eslint-disable-next-line no-console -- intentional render-error log
      console.error('[ErrorBoundary]', error.message, info.componentStack);
    }

    render(): ReactNode {
      if (this.state.hasError) {
        return this.props.fallback({ error: this.state.error });
      }
      return this.props.children;
    }
  }
  ```
- **MIRROR**: pattern from research; SOURCE `apps/web/src/pages/not-found.tsx` for branded fallback shape.
- **GOTCHA**:
  1. Must be a class component — hooks-equivalent doesn't exist in stable React 18.
  2. `fallback` is a render-prop (not just a node) so the fallback receives the error. Optional but cheap.
  3. Boundary must be ABOVE the routed page in the tree — wrap `<Outlet />` in `RootLayout`.
- **VALIDATE**: Unit test (`error-boundary.test.tsx`): a child that throws on first render; assert fallback rendered with the error.

### Task 10: Wire ErrorBoundary in RootLayout
- **ACTION**: Edit `apps/web/src/components/layout/root-layout.tsx`.
- **IMPLEMENT**:
  ```tsx
  import { Outlet } from 'react-router-dom';
  import { useResolvedLocale } from '@/lib/use-locale';
  import { SiteHeader } from './site-header';
  import { SiteFooter } from './site-footer';
  import { ErrorBoundary } from './error-boundary';

  function ErrorFallback({ error }: { error: Error | null }) {
    const { t, locale } = useResolvedLocale();
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center" role="alert">
        <p className="font-heading text-7xl font-semibold text-primary">{t('error.heading')}</p>
        <p className="text-lg text-muted-foreground">{t('error.body')}</p>
        {error && import.meta.env?.DEV ? (
          <pre className="max-w-full overflow-auto rounded bg-muted p-4 text-left text-xs">{error.message}</pre>
        ) : null}
        <a href={`/${locale}`} className="...">{t('error.cta')}</a>
      </section>
    );
  }

  export function RootLayout() {
    const { locale, t } = useResolvedLocale();
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <a href="#main-content" className="...">{t('common.skipToMain')}</a>
        <SiteHeader locale={locale} />
        <main id="main-content" tabIndex={-1} className="flex-1">
          <ErrorBoundary fallback={(p) => <ErrorFallback {...p} />}>
            <Outlet />
          </ErrorBoundary>
        </main>
        <SiteFooter locale={locale} />
      </div>
    );
  }
  ```
- **MIRROR**: SOURCE existing `root-layout.tsx`; brand pattern from `not-found.tsx`.
- **GOTCHA**: Don't put ErrorBoundary OUTSIDE `<main>` — header/footer need to keep working when route content crashes.
- **VALIDATE**: typecheck green; manual: throw inside a route component → fallback renders + header/footer intact.

### Task 11: Blog scaffold (lib + page)
- **ACTION**: Create `apps/web/src/lib/blog.ts` and `apps/web/src/pages/blog/index.tsx`.
- **IMPLEMENT** (`blog.ts`):
  ```ts
  /**
   * Vite glob-import of MDX posts. While `apps/web/src/blog/posts/` is empty,
   * `getPosts()` returns []. When the founder ships the first MDX file, the
   * glob picks it up automatically. No manual registry.
   */
  export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    publishedAt: string;
    locale: 'en' | 'th';
  }

  // Glob pattern is intentionally narrow — only files with frontmatter.
  // Returns metadata only at this stage; MDX body lookup lands when the
  // detail route lands (NOT in this plan).
  const POSTS = import.meta.glob('../blog/posts/**/*.mdx', { eager: true });

  export function getPosts(locale: 'en' | 'th'): BlogPost[] {
    const all: BlogPost[] = [];
    for (const [path, mod] of Object.entries(POSTS)) {
      const m = mod as { frontmatter?: Partial<BlogPost> };
      const fm = m.frontmatter;
      if (!fm?.slug || !fm?.title || !fm?.locale || !fm?.publishedAt) continue;
      if (fm.locale !== locale) continue;
      all.push({
        slug: fm.slug,
        title: fm.title,
        description: fm.description ?? '',
        publishedAt: fm.publishedAt,
        locale: fm.locale,
      });
      void path;
    }
    return all.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
  ```
- **IMPLEMENT** (`blog/index.tsx`):
  ```tsx
  import { PageSeo } from '@/components/seo/page-seo';
  import { PageIntro } from '@/components/marketing/page-intro';
  import { Section } from '@/components/marketing/section';
  import { useResolvedLocale } from '@/lib/use-locale';
  import { getPosts } from '@/lib/blog';

  export function BlogIndexPage() {
    const { locale, t } = useResolvedLocale();
    const posts = getPosts(locale);

    return (
      <>
        <PageSeo title={t('meta.blog.title')} description={t('meta.blog.description')} path="/blog" locale={locale} />
        <PageIntro eyebrow={t('blog.intro.eyebrow')} heading={t('blog.intro.heading')} sub={t('blog.intro.sub')} />
        {posts.length === 0 ? (
          <Section id="blog-empty">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{t('blog.empty')}</p>
          </Section>
        ) : (
          <Section id="blog-posts" heading={t('blog.intro.heading')}>
            <ul className="space-y-6">
              {posts.map((p) => (
                <li key={p.slug}>
                  <a href={`/${locale}/blog/${p.slug}`} className="block group">
                    <p className="text-xs uppercase tracking-[0.2em] text-secondary">{p.publishedAt}</p>
                    <h3 className="mt-2 font-heading text-2xl font-semibold text-foreground group-hover:text-primary">{p.title}</h3>
                    {p.description ? <p className="mt-2 text-muted-foreground">{p.description}</p> : null}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </>
    );
  }
  ```
- **MIRROR**: SOURCE `apps/web/src/pages/pricing.tsx:1-68` (PageIntro + Section composition).
- **GOTCHA**:
  1. `import.meta.glob` runs at build time — empty pattern returns `{}`. Test asserts empty-state UI.
  2. Frontmatter shape is duck-typed from `remark-mdx-frontmatter`; the `.frontmatter` field exists at runtime but isn't typed by the loader. Hence the manual narrowing.
  3. Detail route is OUT OF SCOPE — links above point to `/{locale}/blog/${slug}` which 404s today (acceptable: no posts exist yet).
- **VALIDATE**: `BlogIndexPage` test renders `/en/blog` empty-state copy + Thai copy at `/th/blog`.

### Task 12: Register blog route + extend SSG
- **ACTION**: Edit `apps/web/src/routes.tsx` and `apps/web/vite.config.ts`.
- **IMPLEMENT** (`routes.tsx`):
  ```tsx
  import { BlogIndexPage } from '@/pages/blog';
  ...
  children: [
    { index: true, element: <HomePage /> },
    { path: 'pricing', element: <PricingPage /> },
    { path: 'features', element: <FeaturesPage /> },
    { path: 'about', element: <AboutPage /> },
    { path: 'pilot', element: <PilotPage /> },
    { path: 'privacy', element: <PrivacyPage /> },
    { path: 'terms', element: <TermsPage /> },
    { path: 'blog', element: <BlogIndexPage /> },
    { path: '*', element: <NotFoundPage /> },
  ],
  ```
- **IMPLEMENT** (`vite.config.ts`):
  ```ts
  type PageKey = 'home' | 'pricing' | 'features' | 'about' | 'pilot' | 'privacy' | 'terms' | 'blog' | 'notFound';
  const SUBPATH_TO_PAGE = {
    ...,
    '/blog': { pageKey: 'blog', relPath: '/blog' },
  };
  const PRERENDER_PATHS = siteConfig.locales.flatMap((l) => [
    `/${l}`, `/${l}/pricing`, `/${l}/features`, `/${l}/about`,
    `/${l}/pilot`, `/${l}/privacy`, `/${l}/terms`, `/${l}/blog`,
  ]);
  ```
- **MIRROR**: SOURCE existing `vite.config.ts:25-50, 202-207`.
- **GOTCHA**: Adding a `PageKey` REQUIRES `meta.blog.{title,description}` in BOTH locale JSONs (compile-time check via `dict.meta[pageKey]`).
- **VALIDATE**: typecheck green; build emits 16 prerendered HTMLs (was 14).

### Task 13: Extend locale dicts
- **ACTION**: Edit `apps/web/src/locales/en.json` + `apps/web/src/locales/th.json`.
- **IMPLEMENT** (en sketch):
  ```json
  "meta": {
    ...,
    "blog": { "title": "Notes from the operator", "description": "Updates from the Lesso team — what we're building and why." }
  },
  "blog": {
    "intro": {
      "eyebrow": "Notes",
      "heading": "Notes from the operator.",
      "sub": "Stories, decisions, and updates from the Lesso team. Light frequency — we ship, then we write."
    },
    "empty": "First post lands when the pilot does. Check back soon — or follow along via the LINE OA at @lesso."
  },
  "error": {
    "heading": "Sorry.",
    "body": "Something went wrong rendering this page.",
    "cta": "Back to home"
  }
  ```
- **GOTCHA**: `Dict = typeof en` enforces th.json structurally matches.
- **VALIDATE**: typecheck green; existing `i18n-dict.test.ts` covers parity.

### Task 14: Extend build-output test
- **ACTION**: Edit `apps/web/tests/build-output.test.ts`.
- **IMPLEMENT**:
  ```ts
  // Add to PAGES:
  { file: 'en/blog.html', locale: 'en', canonical: 'https://lesso.clinic/en/blog', noindex: false },
  { file: 'th/blog.html', locale: 'th', canonical: 'https://lesso.clinic/th/blog', noindex: false },

  it('per-page OG image is referenced for indexed core pages', () => {
    const cases: ReadonlyArray<{ file: string; og: string }> = [
      { file: 'en.html',           og: 'home-en.png' },
      { file: 'th.html',           og: 'home-th.png' },
      { file: 'en/pricing.html',   og: 'pricing-en.png' },
      { file: 'th/pricing.html',   og: 'pricing-th.png' },
      { file: 'en/pilot.html',     og: 'pilot-en.png' },
      { file: 'th/pilot.html',     og: 'pilot-th.png' },
    ];
    for (const c of cases) {
      expect(read(c.file)).toContain(`og/${c.og}`);
    }
  });

  it('legal pages keep the default OG image', () => {
    for (const file of ['en/privacy.html', 'th/terms.html']) {
      expect(read(file)).toContain('og/default.png');
    }
  });

  it('emits manifest + apple-touch-icon link in every prerendered HTML', () => {
    for (const file of ['en.html', 'en/pricing.html', 'en/pilot.html']) {
      const html = read(file);
      expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
      expect(html).toContain('rel="apple-touch-icon" href="/apple-touch-icon.png"');
      expect(html).toContain('apple-mobile-web-app-capable');
    }
  });

  it('manifest.webmanifest is in dist root', () => {
    const manifest = JSON.parse(read('manifest.webmanifest'));
    expect(manifest.icons).toHaveLength(2);
    expect(manifest.theme_color).toBe('#134E4A');
  });
  ```
- **GOTCHA**: build-output test ALREADY ran the OG-gen step via `prebuild`, so PNGs exist. If they don't, the test should fail loudly — assert files exist on disk separately.
- **VALIDATE**: `VITE_PLAUSIBLE_DOMAIN=lesso.clinic pnpm --filter @lesso/web test:build` passes.

### Task 15: Page tests for blog + error boundary
- **ACTION**: Create `apps/web/src/components/layout/error-boundary.test.tsx`. Extend `apps/web/src/pages/pages.test.tsx` for blog.
- **IMPLEMENT** (`error-boundary.test.tsx`):
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { describe, it, expect, vi } from 'vitest';
  import { ErrorBoundary } from './error-boundary';

  function Bomb({ msg }: { msg: string }) {
    throw new Error(msg);
  }

  describe('ErrorBoundary', () => {
    it('renders children when no error', () => {
      render(
        <ErrorBoundary fallback={() => <p>fallback</p>}>
          <p>kids</p>
        </ErrorBoundary>,
      );
      expect(screen.getByText('kids')).toBeInTheDocument();
    });

    it('renders fallback with error info on render-phase throw', () => {
      // Suppress the expected console.error from React.
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorBoundary fallback={({ error }) => <p>{`caught: ${error?.message ?? ''}`}</p>}>
          <Bomb msg="boom" />
        </ErrorBoundary>,
      );
      expect(screen.getByText('caught: boom')).toBeInTheDocument();
      spy.mockRestore();
    });
  });
  ```
- **IMPLEMENT** (`pages.test.tsx` extension):
  ```tsx
  import { BlogIndexPage } from './blog';
  ...
  describe('BlogIndexPage', () => {
    it('renders intro + empty-state copy when no posts exist (en)', () => {
      renderPage(BlogIndexPage, '/en/blog');
      expect(screen.getByRole('heading', { level: 1, name: /Notes from the operator/i })).toBeInTheDocument();
      expect(screen.getByText(/First post lands when the pilot does/)).toBeInTheDocument();
    });

    it('renders Thai copy at /th/blog', () => {
      renderPage(BlogIndexPage, '/th/blog');
      expect(screen.getByText(/บันทึก/)).toBeInTheDocument();
    });
  });
  ```
- **GOTCHA**: ErrorBoundary's render-error path triggers React's noisy console.error. Tests should mock `console.error` to keep output clean; validate `vi.spyOn(console, 'error').toHaveBeenCalled()` if you want to assert the boundary logged.
- **VALIDATE**: New tests pass; coverage delta ≥6 cases.

### Task 16: Operator runbook for DNS + Search Console
- **ACTION**: Create `docs/launch-runbook.md`.
- **IMPLEMENT**: Markdown checklist with concrete steps + Vercel UI paths + Search Console URLs:
  ```markdown
  # Lesso Launch Runbook

  Run AFTER B4 merges to `main`. Sequenced checklist; each step is independent.

  ## 1. DNS cutover (Vercel)
  - [ ] In Vercel project `lesso-web` (apps/web): Settings → Domains
  - [ ] Add `lesso.clinic` (apex/root) — Vercel returns A record `76.76.21.21`
  - [ ] Add `www.lesso.clinic` — set as redirect to `lesso.clinic`
  - [ ] Update registrar (e.g. Namecheap, Cloudflare) DNS:
      - A record `@` → `76.76.21.21`
      - CNAME `www` → `cname.vercel-dns.com`
  - [ ] Verify HTTPS issued (auto via Let's Encrypt within ~5 min)
  - [ ] `siteConfig.hostname` is already `https://lesso.clinic` — no code change

  ## 2. Promote deferred CI workflows
  - [ ] Token used to push must have `workflow` scope. Check via `gh auth status`.
  - [ ] Move `.github/_deferred/workflows/{ci,lighthouse-web}.yml` → `.github/workflows/`
  - [ ] Push and verify the first PR triggers both jobs

  ## 3. Search Console
  - [ ] Visit https://search.google.com/search-console
  - [ ] Add property `https://lesso.clinic` (Domain property recommended)
  - [ ] Verify via DNS TXT record (operator paste into registrar)
  - [ ] Submit sitemap: `https://lesso.clinic/sitemap.xml`
  - [ ] Confirm 8 indexable URLs surface within 7 days

  ## 4. Bing Webmaster
  - [ ] Visit https://www.bing.com/webmasters
  - [ ] Import from Search Console (one-click) OR add property manually
  - [ ] Verify (DNS or HTML file)
  - [ ] Submit sitemap

  ## 5. Plausible Analytics
  - [ ] Confirm `lesso.clinic` is registered on plausible.io
  - [ ] Set Vercel env var `VITE_PLAUSIBLE_DOMAIN=lesso.clinic` (Production scope)
  - [ ] Trigger a deploy
  - [ ] Open the live site, click hero CTA → confirm `cta_click` event fires in Plausible dashboard

  ## 6. Lighthouse spot-check
  - [ ] `pnpm --filter @lesso/web run lhci:web` against the deployed Vercel preview URL
  - [ ] Expect ≥0.95 across all 4 categories on `/en` + `/en/pricing` + `/en/pilot`
  - [ ] If `best-practices` dips: inspect CSP headers + image sizes
  - [ ] If `performance` dips: check the OG image link tags aren't blocking render

  ## 7. Smoke tests
  - [ ] `/en` renders, hero CTA → `/en/pilot`
  - [ ] `/en/pilot` form opens mailto with pre-filled body
  - [ ] `/en/privacy` shows DRAFT banner
  - [ ] Footer Privacy + Terms links work in both locales
  - [ ] Share `/en/pricing` to Twitter/LINE — preview shows `pricing-en.png` not the default

  ## 8. Post-launch (first 14 days)
  - [ ] Monitor Search Console for crawl errors
  - [ ] Watch Plausible for the first organic `pilot_submit`
  - [ ] If no submissions: review homepage hero copy, A/B the CTA text
  ```
- **MIRROR**: `docs/marketing/reinly.md` style (existing docs dir).
- **VALIDATE**: Runbook is operator-readable; every step is concrete and actionable.

### Task 17: .gitignore explicit OG inclusion
- **ACTION**: Edit `apps/web/.gitignore` (or root `.gitignore`).
- **IMPLEMENT**: If there's a wildcard `*.png` ignore, add explicit `!public/og/*.png` + `!public/icon-*.png` + `!public/apple-touch-icon.png`. Verify by `git status` after running `og:gen`.
- **GOTCHA**: Vercel's `buildCommand` runs `og:gen` via `prebuild`, so generated PNGs exist at deploy time even if they're gitignored. Two paths:
  - **Path A (gitignore + regen)**: Cleanest. Vercel always regenerates fresh PNGs from current dict copy. CI matches prod.
  - **Path B (commit PNGs)**: Reproducible builds (no Satori install in CI), faster Vercel builds.
  - Pick **Path A** — fonts come from `node_modules`, fully reproducible. Document the choice.
- **VALIDATE**: `git status` after `og:gen` shows no untracked PNGs (confirming they're ignored).

### Task 18: Site-wide validation
- **ACTION**: Full validation matrix.
- **IMPLEMENT**:
  ```bash
  pnpm typecheck
  pnpm lint
  pnpm test
  pnpm --filter @lesso/web run og:gen
  VITE_PLAUSIBLE_DOMAIN=lesso.clinic pnpm --filter @lesso/web test:build
  pnpm --filter @lesso/web build
  pnpm --filter @lesso/web run lhci:web   # local Lighthouse smoke
  ```
- **VALIDATE**:
  - typecheck: 7 projects
  - lint: 0 warnings
  - tests: web ~62 → ~70+ (new: error-boundary 2, blog 2, og-meta 4)
  - test:build: 23 → ~30 cases
  - build: 16 prerendered HTMLs (was 14)
  - og:gen: 13 PNGs in `public/` (10 OG + 3 icons)
  - lhci: ≥0.95 on all 4 categories (warning: local preview lacks Vercel CSP, may dip best-practices to ~0.92 — accept)

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| `ErrorBoundary children` | non-throwing child | renders child | No |
| `ErrorBoundary catches` | throwing child | renders fallback with error msg | Yes |
| `BlogIndexPage empty state` | no MDX posts | renders intro + empty copy | Yes |
| `BlogIndexPage Thai locale` | route `/th/blog` | Thai copy | No |
| `OG image meta home en` | built `dist/en.html` | contains `og/home-en.png` | No |
| `OG image meta pricing th` | built `dist/th/pricing.html` | contains `og/pricing-th.png` | No |
| `Legal default OG` | built `dist/en/privacy.html` | contains `og/default.png` | Yes |
| `Manifest reachable` | built `dist/manifest.webmanifest` | parses, has 192+512 icons | No |
| `Apple touch icon link` | built `dist/en.html` | contains `rel="apple-touch-icon"` | No |
| `Build emits 16 HTMLs` | `vite-react-ssg build` | files exist for 8 routes × 2 locales | No |

### Edge Cases Checklist
- [x] Blog posts dir is empty → empty state UI
- [x] Render-phase crash in route → boundary catches, header/footer survive
- [x] Plausible env unset → script tag omitted (covered by B3 test)
- [x] OG gen runs before build → `prebuild` script ensures order
- [x] Apple touch icon dimensions exactly 180×180 → PNG headers verified manually
- [x] Manifest icons exactly 192 + 512 → JSON parse asserts both
- [x] Thai-language OG image renders Thai glyphs → Noto Sans Thai font included
- [x] LHCI runs locally → `lhci:web` script

---

## Validation Commands

### Static Analysis
```bash
pnpm --filter @lesso/web typecheck
pnpm --filter @lesso/web lint
```
EXPECT: Zero type errors, zero lint warnings.

### Unit Tests
```bash
pnpm --filter @lesso/web test
```
EXPECT: All tests pass.

### OG Generator
```bash
pnpm --filter @lesso/web run og:gen
```
EXPECT: 13 PNGs in `apps/web/public/og/` + `apps/web/public/{apple-touch-icon,icon-192,icon-512}.png`. No errors.

### Build + Build-output
```bash
VITE_PLAUSIBLE_DOMAIN=lesso.clinic pnpm --filter @lesso/web test:build
```
EXPECT: 16 HTMLs; per-page OG meta tags; manifest reachable; apple-touch-icon link present.

### Lighthouse (local smoke)
```bash
pnpm --filter @lesso/web build
pnpm --filter @lesso/web run lhci:web
```
EXPECT: All 4 categories ≥0.95 on `/en` + `/en/pricing` (LHCI assertions enforce).

### Full Repo
```bash
pnpm typecheck && pnpm lint && pnpm test
```
EXPECT: All workspaces green.

### Manual Validation
- [ ] Share `/en/pricing` to Twitter/LINE preview tool — `pricing-en.png` shows
- [ ] iOS: "Add to Home Screen" → uses 180×180 apple-touch-icon
- [ ] Android Chrome: install prompt appears (manifest valid)
- [ ] Throw inside a route component → ErrorBoundary fallback renders
- [ ] `/en/blog` shows empty state copy

---

## Acceptance Criteria
- [ ] All 18 tasks completed
- [ ] All validation commands pass (LHCI may fail locally on best-practices; pass in CI against deployed URL)
- [ ] 16 prerendered HTMLs (was 14)
- [ ] 10 per-page OG images + 3 icons generated
- [ ] Manifest + apple-touch-icon reachable in dist
- [ ] ErrorBoundary catches render crashes
- [ ] Blog scaffold ready (empty state)
- [ ] Operator runbook published

## Completion Checklist
- [ ] Code follows discovered patterns (Section, PageIntro, branded standalone)
- [ ] Tests follow test patterns (renderPage, build-output it.each, vi.spyOn)
- [ ] No hardcoded values in runtime (Satori script is build-time, hex tokens documented)
- [ ] Documentation updated (.env.example, runbook)
- [ ] No unnecessary scope additions (no real DNS, no SC verification, no posts)
- [ ] Self-contained — no questions during implementation

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Satori Thai-glyph fail (tofu boxes) | Medium | High | Add `@fontsource/noto-sans-thai` to font list. Visually inspect first build's `th` PNGs. |
| LHCI `best-practices` < 0.95 locally | High | Low | Local preview lacks Vercel CSP; assertion remains for CI against deployed URL. Accept local dip. |
| `prebuild` chain breaks Vercel | Low | High | Test locally: `pnpm --filter @lesso/web build` triggers `prebuild`. Vercel uses identical command. |
| `import.meta.glob` on empty dir | Low | Low | Returns `{}` → `getPosts` returns `[]` → empty state UI. Covered by test. |
| Operator skips DNS step | Medium | High | Runbook is checklist-style; section 1 is the gating step. Smoke tests in section 7 detect missed step. |
| Image weight inflates Lighthouse perf | Low | Medium | OG images load at share time, NOT page load. `<meta og:image>` is a string ref. Apple-touch-icon is 180×180 (~5KB). Manifest icons 192/512 (~30KB each). Total page weight delta ~60KB icons (cached, lazy). |
| Token lacks workflow scope | Certain | Low | Workflows stay in `_deferred/` until operator promotes. Runbook step 2. |
| Per-page OG images stale after copy edit | Medium | Low | `prebuild` runs every build. CI/Vercel regenerate from current dict every deploy. |

## Notes

- **`prebuild` lifecycle**: pnpm honors npm-style `prebuild` (auto-runs before `build`). Verified.
- **Path A on PNG storage** (gitignore + regen): tradeoff is CI build time +5–10s for Satori. Acceptable; preserves single source of truth (dict copy).
- **Blog detail route** (`/blog/:slug`) deliberately deferred. Founder writes the first post → that PR adds the dynamic route + MDX rendering. Empty-state page already invites future posts.
- **B4 success metric** ("indexed by Google within 7d") is operator-only, post-merge. Code-side success: all assertions in `test:build` pass + Lighthouse local ≥0.95 on perf/seo/a11y.
- **Confidence Score**: 8/10. Satori + Thai font is the unknown — risk-mitigated by Noto Sans Thai fallback. LHCI local run may flag best-practices; that's documented in risks, not a blocker.
