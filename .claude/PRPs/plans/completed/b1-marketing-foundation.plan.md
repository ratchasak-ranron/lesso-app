# Plan: B1 Marketing Foundation

## Summary
Scaffold the marketing site (`apps/web`) inside the existing pnpm + Turborepo
monorepo. Stack: Vite 6 + React 18 + TypeScript + `vite-react-ssg` for
build-time prerender of every route + `react-router-dom` v6 for routing +
`react-i18next` for th/en + `react-helmet-async` for per-page SEO + MDX
(`@mdx-js/rollup`) for content + `vite-plugin-sitemap` for sitemap.xml +
shadcn-style primitives consumed via `@lesso/ui-tokens`. Output is a
prerendered Hello-Lesso bilingual site that returns full HTML to `view-source`
and is ready for Vercel project B.

## User Story
As a clinic owner researching aesthetic-clinic backoffice tools, I want to
land on `lesso.clinic` and read a fast, indexable, bilingual marketing page so
I know what Lesso does before I sign up for the pilot.

## Problem → Solution
A6 ships the backoffice but has zero marketing surface — every prospect
needs a hand-off URL to read about Lesso. → `apps/web` scaffolded with
prerendered HTML, full SEO meta, Vercel project B wired, brand-token-shared
with `apps/app`. Content stubs for B2 to fill.

## Metadata
- **Complexity**: Large
- **Source PRD**: `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md`
- **PRD Phase**: B1 — Marketing Foundation
- **Estimated Files**: ~28 created, 3 modified

---

## UX Design

### Before
```
┌──────────────────────────────────────────┐
│  No marketing surface. Pilot prospects   │
│  receive a Notion link or DM screenshot. │
│  Zero SEO, zero waitlist.                │
└──────────────────────────────────────────┘
```

### After (B1 only — full content lands in B2)
```
┌──────────────────────────────────────────────┐
│  https://<vercel-preview>.vercel.app/th      │
│  ┌────────────────────────────────────────┐  │
│  │ Lesso                  [TH | EN]       │  │
│  ├────────────────────────────────────────┤  │
│  │   สวัสดี, Lesso  (Hello, Lesso)       │  │
│  │   Less cost. More care.                │  │
│  │   [Coming soon — pilot waitlist B3]    │  │
│  └────────────────────────────────────────┘  │
│  Footer  ·  © 2026 Lesso                     │
└──────────────────────────────────────────────┘
view-source: <html lang="th"><head><title>...
              full prerendered DOM, no spa-only `<div id="root"></div>`
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| `lesso.clinic/` | DNS not in use | Redirects to `/<browser-locale>` (or `/en` default) | DNS cutover deferred to B4 |
| `view-source` | N/A | Full prerendered HTML with locale meta + JSON-LD scaffold | SEO sanity check |
| Lang toggle | N/A | Anchor to `/th/...` ↔ `/en/...` (preserves path) | No JS state, a real link |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `apps/app/package.json` | all | Mirror Vite 6.4.2 + React 18.3 + TS 5.6 versions exactly to avoid root-lockfile churn |
| P0 | `apps/app/vite.config.ts` | 1-40 | Plugin order + path alias + sourcemap pattern to mirror |
| P0 | `apps/app/tailwind.config.ts` | all | Preset usage from `@lesso/ui-tokens/tailwind-preset` |
| P0 | `apps/app/components.json` | all | shadcn config; web copies same baseColor + style |
| P0 | `apps/app/vercel.json` | all | Vercel monorepo build/install/ignore commands + CSP headers — mirror with web-specific tweaks |
| P0 | `packages/ui-tokens/src/tailwind-preset.ts` | 1-60 | Color/font tokens that `apps/web` will consume |
| P0 | `packages/ui-tokens/src/css/tokens.css` | all | CSS variables shipped via `@import` in globals.css |
| P0 | `apps/app/src/lib/i18n.ts` | all | i18next + LanguageDetector wiring to mirror (with route-aware tweaks) |
| P0 | `apps/app/src/lib/utils.ts` | all | `cn` helper to copy verbatim |
| P0 | `apps/app/src/components/ui/button.tsx` | all | shadcn button primitive to copy |
| P0 | `apps/app/src/components/ui/card.tsx` | all | shadcn card primitive to copy |
| P0 | `apps/app/src/styles/globals.css` | 1-60 | CSS variable + `@layer base` setup to mirror |
| P1 | `tsconfig.base.json` | all | Strict TS settings inherited |
| P1 | `apps/app/.env.example` | all | Env-var convention (`VITE_` prefix, doc comments) |
| P1 | `apps/app/eslint.config.js` (root) | n/a — root | Already covers `apps/web` via the workspace ignore pattern |
| P1 | `turbo.json` | all | Existing tasks already inherit; verify B1 added correctly |
| P2 | `apps/app/index.html` | all | Lang attribute + theme-color + font preconnect pattern |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| `vite-react-ssg` | npm `vite-react-ssg` README | Replace `ReactDOM.createRoot` with `ViteReactSSG({ routes })`. Build cmd: `vite-react-ssg build`. Consumes a `RouteObject[]` directly — do NOT instantiate `<BrowserRouter>` yourself. |
| `react-helmet-async` | npm README | Wrap root in `<HelmetProvider>`. SSG renderer auto-serialises `<head>` tags into prerendered HTML. Concurrent-React-safe; deprecated `react-helmet` is NOT. |
| `vite-plugin-sitemap` | npm README | `{ hostname, dynamicRoutes, i18n: { locales, defaultLocale } }`. Runs in `closeBundle`; only fires on `vite build`. Generates `<xhtml:link rel="alternate">` entries per locale. |
| `@mdx-js/rollup` | mdxjs.com docs | Use this with Vite 6, NOT `vite-plugin-mdx` (unmaintained). Plugin must come BEFORE `@vitejs/plugin-react` in plugins array. Frontmatter: chain `remark-frontmatter` + `remark-mdx-frontmatter`. |
| `react-router-dom` v6 | reactrouter.com | `RouteObject[]` shape with `path`, `element`, `children`. `:locale` segment + `<Outlet />` for nested layouts. `useParams()` works in prerendered pages after hydration. |

GOTCHA digest:
- `vite-react-ssg` v0.10+ requires `react-router-dom` ≥ 6.4. With Vite 6.4 set
  `ssr.noExternal: ['vite-react-ssg']` if CJS/ESM interop errors appear.
- `@mdx-js/rollup` plugin order matters — before `@vitejs/plugin-react`.
  Add `'**/*.mdx'` to `optimizeDeps.exclude` to keep HMR sane.
- Sitemap plugin fires only on build; `dynamicRoutes` must resolve to plain
  strings at build time (no async fetch in plugin config).
- `HelmetProvider` MUST sit above any `Helmet` consumer — put in root layout,
  not inside individual pages.

---

## Patterns to Mirror

### NAMING_CONVENTION
```
// SOURCE: apps/app/package.json:1
{ "name": "@lesso/app", "version": "0.0.0", "private": true, "type": "module" }
// → apps/web/package.json: "name": "@lesso/web"
```

### TAILWIND_PRESET_CONSUMPTION
```ts
// SOURCE: apps/app/tailwind.config.ts:1-9
import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import { lessoPreset } from '@lesso/ui-tokens/tailwind-preset';

export default {
  presets: [lessoPreset],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  plugins: [animate],
} satisfies Config;
```

### PATH_ALIAS
```ts
// SOURCE: apps/app/vite.config.ts:24-27
resolve: {
  alias: {
    '@': resolve(__dirname, './src'),
  },
},
```

### TSCONFIG
```jsonc
// SOURCE: apps/app/tsconfig.json:1-10
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "types": ["vite/client", "node"]
  },
  "include": ["src/**/*", "vite.config.ts"]
}
```

### GLOBALS_CSS
```css
/* SOURCE: apps/app/src/styles/globals.css:1-15 */
@import '@lesso/ui-tokens/css/fonts.css';
@import '@lesso/ui-tokens/css/tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground font-sans; }
}
```

### CN_HELPER
```ts
// SOURCE: apps/app/src/lib/utils.ts:1-6
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### I18N_INIT
```ts
// SOURCE: apps/app/src/lib/i18n.ts:1-30
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import th from '@/locales/th.json';
import en from '@/locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { th: { translation: th }, en: { translation: en } },
    fallbackLng: 'en',
    supportedLngs: ['th', 'en'],
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'], lookupLocalStorage: 'lesso:lang' },
  });
export default i18n;
// → apps/web variant: replace LanguageDetector with route-segment driver
//   (`useParams().locale` overrides anything in localStorage so `/en/foo`
//   always renders English, regardless of browser preference).
```

### VERCEL_MONOREPO
```jsonc
// SOURCE: apps/app/vercel.json:1-12
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=@lesso/app",
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
  "outputDirectory": "dist",
  "ignoreCommand": "cd ../.. && npx turbo-ignore @lesso/app",
  "framework": "vite"
}
// → apps/web swaps filter to @lesso/web; outputDirectory stays "dist" but
//   vite-react-ssg writes to dist by default
```

### CSP_HEADERS
```jsonc
// SOURCE: apps/app/vercel.json:14-30
{
  "headers": [{ "source": "/(.*)", "headers": [
    { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
    { "key": "X-Frame-Options", "value": "DENY" },
    { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
  ]}]
}
// → apps/web adds Plausible domains to script-src + connect-src in B3 (NOT B1)
```

### TEST_STRUCTURE
```ts
// SOURCE: apps/app/src/components/ui/button.test.tsx:1-15
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders the label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });
});
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `apps/web/package.json` | CREATE | Workspace entry; deps locked to root versions |
| `apps/web/tsconfig.json` | CREATE | Inherits base; `@/*` alias |
| `apps/web/vite.config.ts` | CREATE | Vite 6 + react + mdx + sitemap + ssg |
| `apps/web/tailwind.config.ts` | CREATE | Mirrors apps/app preset usage |
| `apps/web/postcss.config.js` | CREATE | Standard tailwind/autoprefixer |
| `apps/web/components.json` | CREATE | shadcn config (matches app) |
| `apps/web/vercel.json` | CREATE | Vercel project B build + CSP |
| `apps/web/.env.example` | CREATE | Doc placeholders for B3 (Plausible domain) |
| `apps/web/index.html` | CREATE | Root HTML; `lang="en"` default; preconnect |
| `apps/web/public/robots.txt` | CREATE | Allow all + sitemap reference |
| `apps/web/public/favicon.svg` | CREATE | Placeholder (reuse app's favicon if present, else inline letter mark) |
| `apps/web/src/main.tsx` | CREATE | SSG entry — `ViteReactSSG({ routes })` |
| `apps/web/src/routes.tsx` | CREATE | RouteObject[] with `:locale?` segment |
| `apps/web/src/styles/globals.css` | CREATE | Mirrors app globals |
| `apps/web/src/lib/utils.ts` | CREATE | Copy of app `cn` helper |
| `apps/web/src/lib/i18n.ts` | CREATE | i18next init; route-driven locale |
| `apps/web/src/lib/site-config.ts` | CREATE | hostname, locales, default locale, brand strings |
| `apps/web/src/lib/use-locale.ts` | CREATE | Hook reading `:locale` route param + i18n switch |
| `apps/web/src/components/ui/button.tsx` | CREATE | Copy of app primitive |
| `apps/web/src/components/ui/card.tsx` | CREATE | Copy of app primitive |
| `apps/web/src/components/seo/page-seo.tsx` | CREATE | `<Helmet>` wrapper: title, description, canonical, OG, hreflang |
| `apps/web/src/components/seo/json-ld.tsx` | CREATE | `<script type="application/ld+json">` helper |
| `apps/web/src/components/layout/site-header.tsx` | CREATE | Brand mark + lang toggle (anchor) |
| `apps/web/src/components/layout/site-footer.tsx` | CREATE | © + nav stubs |
| `apps/web/src/components/layout/root-layout.tsx` | CREATE | `<HelmetProvider>` + Header + `<Outlet />` + Footer |
| `apps/web/src/pages/home.tsx` | CREATE | Hero placeholder ("Hello Lesso" / "สวัสดี Lesso") |
| `apps/web/src/pages/not-found.tsx` | CREATE | Branded 404 |
| `apps/web/src/locales/en.json` | CREATE | Site strings (hero, nav, footer) |
| `apps/web/src/locales/th.json` | CREATE | TH parity |
| `apps/web/tests/build-output.test.ts` | CREATE | Vitest assertion that `dist/index.html` (or `dist/en/index.html`) contains the rendered hero text — proves SSG worked |
| `pnpm-workspace.yaml` | MODIFY | Already covers `apps/*` — verify only |
| `tsconfig.base.json` | UNCHANGED | Inherited |
| `package.json` (root) | UNCHANGED | Pin already covers turbo |
| `.github/_deferred/lighthouse.yml` | CREATE | Lighthouse CI workflow stub kept under `_deferred/` until token has `workflow` scope |

## NOT Building

- **Home content** — only a placeholder hero. Real Home (problem/solution,
  features grid, social proof, pricing teaser, FAQ) lands in B2.
- **Pricing / Features / About pages** — B2.
- **Pilot signup form + `/api/waitlist`** — B3.
- **Privacy / Terms** — B3.
- **Plausible analytics integration** — B3 (only the env-var placeholder
  in `.env.example` lands here).
- **OG image generation pipeline** — B2 (only a single static `og.png` in
  `/public/og/default.png`).
- **Blog scaffold** — B4.
- **DNS cutover** — B4 (manual step; `lesso.clinic` reserved only).
- **Lighthouse CI green-gate enforcement** — workflow file scaffolded under
  `.github/_deferred/` only; promoted to `.github/workflows/` in B4 once
  GitHub token has `workflow` scope.
- **Per-page JSON-LD bodies** — only the helper component lands. B2 fills
  Organization, Product, FAQPage payloads.

---

## Step-by-Step Tasks

### Task 1: Workspace package + deps
- **ACTION**: Create `apps/web/package.json` with `@lesso/web` name + locked deps.
- **IMPLEMENT**: Mirror `apps/app/package.json` versions exactly for shared deps (`react`, `react-dom`, `vite`, `vitest`, `@vitejs/plugin-react`, `@types/*`, `tailwindcss`, `tailwindcss-animate`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `i18next`, `i18next-browser-languagedetector`, `react-i18next`, `eslint*`, `typescript-eslint`, `typescript`, `@radix-ui/react-slot`). Add web-specific: `vite-react-ssg`, `react-router-dom@^6.27.0`, `react-helmet-async@^2.0.5`, `@mdx-js/rollup@^3.0.0`, `@mdx-js/react@^3.0.0`, `vite-plugin-sitemap@^0.7.1`, `remark-frontmatter@^5.0.0`, `remark-mdx-frontmatter@^5.0.0`. Workspace deps: `@lesso/ui-tokens": "workspace:*"`. Scripts: `dev: vite`, `build: vite-react-ssg build`, `preview: vite preview`, `typecheck: tsc --noEmit`, `lint: eslint . --max-warnings 0`, `test: vitest run`. `type: module`, `private: true`.
- **MIRROR**: NAMING_CONVENTION
- **IMPORTS**: n/a
- **GOTCHA**: Do NOT add `msw`, `@tanstack/*`, `zustand`, or `playwright` — web is content-only. Lock `react-router-dom` to ≥6.4 (vite-react-ssg requirement). Run `pnpm install` from repo root after writing.
- **VALIDATE**: `pnpm install --frozen-lockfile=false` from root succeeds without peer warnings.

### Task 2: tsconfig
- **ACTION**: Create `apps/web/tsconfig.json` mirroring `apps/app/tsconfig.json`.
- **IMPLEMENT**: `extends: "../../tsconfig.base.json"`, `noEmit: true`, `baseUrl: "."`, `paths: { "@/*": ["./src/*"] }`, `types: ["vite/client", "node"]` (no vitest globals — we'll opt-in per file), `include: ["src/**/*", "tests/**/*", "vite.config.ts"]`.
- **MIRROR**: TSCONFIG
- **IMPORTS**: n/a
- **GOTCHA**: Do not add `vitest/globals` to `types` because the build SSG pass also reads tsconfig and bringing vitest types into Vite's transform pipe causes mismatch warnings. Use explicit imports in tests.
- **VALIDATE**: `pnpm --filter @lesso/web typecheck` from root returns clean (after later tasks add files).

### Task 3: Vite config
- **ACTION**: Create `apps/web/vite.config.ts` with mdx + react + sitemap plugins.
- **IMPLEMENT**:
  ```ts
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import mdx from '@mdx-js/rollup';
  import sitemap from 'vite-plugin-sitemap';
  import remarkFrontmatter from 'remark-frontmatter';
  import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
  import { fileURLToPath } from 'node:url';
  import { dirname, resolve } from 'node:path';
  import { siteConfig } from './src/lib/site-config';

  const __dirname = dirname(fileURLToPath(import.meta.url));

  export default defineConfig({
    plugins: [
      mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      }),
      react(),
      sitemap({
        hostname: siteConfig.hostname,
        i18n: { languages: siteConfig.locales, defaultLanguage: siteConfig.defaultLocale },
        dynamicRoutes: siteConfig.locales.flatMap((l) => [`/${l}`, `/${l}/`]),
      }),
    ],
    resolve: { alias: { '@': resolve(__dirname, './src') } },
    server: { port: 5174, host: '127.0.0.1' },
    build: { sourcemap: 'hidden' },
    optimizeDeps: { exclude: ['**/*.mdx'] },
    ssr: { noExternal: ['vite-react-ssg'] },
  });
  ```
- **MIRROR**: PATH_ALIAS (apps/app/vite.config.ts:24-27); plugin layering pattern.
- **IMPORTS**: see snippet
- **GOTCHA**: `mdx()` plugin MUST come before `react()` or JSX in `.mdx` files won't transform. Sitemap config uses `i18n.languages` (plural), not `locales`. Port 5174 (apps/app uses 5173) so both can run concurrently.
- **VALIDATE**: `pnpm --filter @lesso/web build` produces `dist/sitemap.xml` listing both `/en` and `/th`.

### Task 4: site-config
- **ACTION**: Create `apps/web/src/lib/site-config.ts` — central source of brand strings + URLs.
- **IMPLEMENT**:
  ```ts
  export const siteConfig = {
    name: 'Lesso',
    tagline: 'Less cost. More care.',
    hostname: 'https://lesso.clinic',
    locales: ['en', 'th'] as const,
    defaultLocale: 'en' as const,
    description: {
      en: 'Aesthetic clinic backoffice that lowers cost and raises care.',
      th: 'ระบบหลังบ้านคลินิกความงามที่ลดต้นทุน เพิ่มคุณภาพการดูแล',
    },
  } as const;
  export type Locale = (typeof siteConfig.locales)[number];
  ```
- **MIRROR**: n/a — new
- **IMPORTS**: n/a
- **GOTCHA**: Keep this file dependency-free so `vite.config.ts` can import it without triggering bundler magic.
- **VALIDATE**: `siteConfig.locales` is exported as a readonly tuple; `Locale` narrows to `'en' | 'th'`.

### Task 5: i18n
- **ACTION**: Create `apps/web/src/lib/i18n.ts` + `src/locales/{en,th}.json`.
- **IMPLEMENT**: Mirror `apps/app/src/lib/i18n.ts` but DROP `LanguageDetector` — locale comes from the route segment, not the browser. Init with `lng: 'en'` (overridden per-render by the hook in Task 6). JSON files: `app.{name,tagline}`, `nav.{home,pricing,features,about}` (placeholders for B2), `home.{heroHeading,heroSubheading}`, `footer.{copyright}`, `meta.{home.title,home.description}`.
- **MIRROR**: I18N_INIT
- **IMPORTS**: `i18next`, `react-i18next`, locale JSONs
- **GOTCHA**: Do NOT load `LanguageDetector` — the route is the source of truth. Browsers landing on `/` will be redirected to `/<browserLang>` by Task 7's root layout, not by i18next itself.
- **VALIDATE**: `i18n.t('home.heroHeading', { lng: 'th' })` returns the Thai string.

### Task 6: useLocale hook
- **ACTION**: Create `apps/web/src/lib/use-locale.ts` — read `:locale` from `useParams`, sync into i18next.
- **IMPLEMENT**:
  ```ts
  import { useEffect } from 'react';
  import { useTranslation } from 'react-i18next';
  import { useParams } from 'react-router-dom';
  import { siteConfig, type Locale } from './site-config';

  export function useLocale(): Locale {
    const { locale } = useParams<{ locale?: string }>();
    const resolved: Locale = (siteConfig.locales as readonly string[]).includes(locale ?? '')
      ? (locale as Locale)
      : siteConfig.defaultLocale;
    const { i18n } = useTranslation();
    useEffect(() => {
      if (i18n.language !== resolved) void i18n.changeLanguage(resolved);
    }, [resolved, i18n]);
    return resolved;
  }
  ```
- **MIRROR**: HtmlLangSync pattern from `apps/app/src/App.tsx:9-16` — useEffect-driven side effect.
- **IMPORTS**: see snippet
- **GOTCHA**: `useEffect` runs after render, so the FIRST render uses the previous language briefly. Acceptable for marketing — content reads via the same `useTranslation` hook on next tick. If FOUC becomes a problem later, switch to a synchronous resource manager.
- **VALIDATE**: Navigating from `/en` to `/th` updates `<html lang>` (set by root layout) within one tick.

### Task 7: routes
- **ACTION**: Create `apps/web/src/routes.tsx` — RouteObject[] with `:locale?` parent + index + 404.
- **IMPLEMENT**:
  ```tsx
  import type { RouteObject } from 'react-router-dom';
  import { RootLayout } from '@/components/layout/root-layout';
  import { HomePage } from '@/pages/home';
  import { NotFoundPage } from '@/pages/not-found';
  import { siteConfig } from '@/lib/site-config';

  export const routes: RouteObject[] = siteConfig.locales.flatMap((locale) => [
    {
      path: `/${locale}`,
      element: <RootLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ]).concat([
    { path: '/', element: <RootLayout />, children: [{ index: true, element: <HomePage /> }] },
    { path: '*', element: <RootLayout />, children: [{ index: true, element: <NotFoundPage /> }] },
  ]);
  ```
- **MIRROR**: external — react-router-dom v6 declarative array. Index route element only — no `lazy()` for B1 (lazy adds runtime weight without payoff for 2 pages).
- **IMPORTS**: see snippet
- **GOTCHA**: vite-react-ssg prerenders every static path it finds in the tree. Wildcard (`*`) routes are NOT prerendered — they only render at runtime. That's fine for 404. Locales are explicit `/en` + `/th` paths so the sitemap picks them up.
- **VALIDATE**: After Task 14 build, `dist/en/index.html` and `dist/th/index.html` both exist and contain the hero heading text.

### Task 8: SSG entry (`main.tsx`)
- **ACTION**: Create `apps/web/src/main.tsx` — vite-react-ssg entry.
- **IMPLEMENT**:
  ```tsx
  import { ViteReactSSG } from 'vite-react-ssg';
  import { routes } from './routes';
  import './styles/globals.css';
  import './lib/i18n';

  export const createRoot = ViteReactSSG({ routes });
  ```
- **MIRROR**: external — vite-react-ssg API.
- **IMPORTS**: see snippet
- **GOTCHA**: Do NOT call `ReactDOM.createRoot(...)` here — vite-react-ssg owns the bootstrap. `globals.css` import order matters (must come before any component that uses Tailwind classes). i18n import is side-effect only.
- **VALIDATE**: `pnpm --filter @lesso/web dev` opens 5174 with the home page rendering.

### Task 9: index.html
- **ACTION**: Create `apps/web/index.html` mirroring app's structure.
- **IMPLEMENT**: `<html lang="en">` (default; root layout updates per locale at runtime), `<meta name="viewport">`, `<meta name="theme-color">`, font preconnects, `<title>Lesso · Less cost. More care.</title>`. Body has `<div id="root"></div>` and `<script type="module" src="/src/main.tsx"></script>`.
- **MIRROR**: `apps/app/index.html`
- **IMPORTS**: n/a
- **GOTCHA**: vite-react-ssg replaces `#root` with prerendered HTML at build time. Leave `<div id="root"></div>` empty in the source — the build pass fills it.
- **VALIDATE**: After build, `view-source dist/en/index.html` shows real DOM (heading text), NOT an empty `<div id="root"></div>`.

### Task 10: globals.css + tailwind config + postcss
- **ACTION**: Create the three files mirroring `apps/app`.
- **IMPLEMENT**: globals.css imports `@lesso/ui-tokens/css/{fonts,tokens}.css`; tailwind.config.ts uses `lessoPreset`; postcss.config.js has tailwindcss + autoprefixer.
- **MIRROR**: GLOBALS_CSS, TAILWIND_PRESET_CONSUMPTION
- **IMPORTS**: n/a
- **GOTCHA**: `content` array must include `index.html` AND `./src/**/*.{ts,tsx,mdx}` — note the extra `mdx` glob compared to apps/app.
- **VALIDATE**: `pnpm --filter @lesso/web build` — built CSS contains `bg-primary` utility.

### Task 11: shadcn primitives + utils
- **ACTION**: Copy `apps/app/src/lib/utils.ts` + `components/ui/{button,card}.tsx` verbatim into `apps/web/src/lib/` and `apps/web/src/components/ui/`. Create `apps/web/components.json` mirroring app's config.
- **MIRROR**: CN_HELPER + the existing primitives.
- **IMPORTS**: n/a (verbatim copies)
- **GOTCHA**: Use `import { cn } from '@/lib/utils'` — same alias path resolves under web's tsconfig.
- **VALIDATE**: `<Button variant="default">click</Button>` renders with the brand-tokened bg-primary background.

### Task 12: SEO components
- **ACTION**: Create `src/components/seo/page-seo.tsx` + `src/components/seo/json-ld.tsx`.
- **IMPLEMENT**:
  ```tsx
  // page-seo.tsx
  import { Helmet } from 'react-helmet-async';
  import { siteConfig, type Locale } from '@/lib/site-config';

  interface PageSeoProps {
    title: string;
    description: string;
    path: string;
    locale: Locale;
  }

  export function PageSeo({ title, description, path, locale }: PageSeoProps) {
    const url = `${siteConfig.hostname}/${locale}${path}`;
    const fullTitle = title === siteConfig.name ? siteConfig.name : `${title} · ${siteConfig.name}`;
    return (
      <Helmet>
        <html lang={locale} />
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        {siteConfig.locales.map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`${siteConfig.hostname}/${l}${path}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${siteConfig.hostname}/${siteConfig.defaultLocale}${path}`} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={locale === 'th' ? 'th_TH' : 'en_US'} />
        <meta property="og:image" content={`${siteConfig.hostname}/og/default.png`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
    );
  }
  ```
  ```tsx
  // json-ld.tsx
  import { Helmet } from 'react-helmet-async';
  export function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(data)}</script>
      </Helmet>
    );
  }
  ```
- **MIRROR**: external react-helmet-async
- **IMPORTS**: see snippets
- **GOTCHA**: Do NOT escape HTML inside the JSON-LD `<script>` body — JSON encoding is enough. `<html lang>` set via `<Helmet>` propagates into prerendered HTML and updates dynamically on client navigation.
- **VALIDATE**: `view-source dist/th/index.html` contains `<html lang="th">` and `<link rel="alternate" hreflang="th" ...>`.

### Task 13: Layout components
- **ACTION**: Create `root-layout.tsx`, `site-header.tsx`, `site-footer.tsx`.
- **IMPLEMENT**:
  ```tsx
  // root-layout.tsx
  import { Outlet } from 'react-router-dom';
  import { HelmetProvider } from 'react-helmet-async';
  import { useLocale } from '@/lib/use-locale';
  import { SiteHeader } from './site-header';
  import { SiteFooter } from './site-footer';

  export function RootLayout() {
    const locale = useLocale();
    return (
      <HelmetProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <SiteHeader locale={locale} />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter locale={locale} />
        </div>
      </HelmetProvider>
    );
  }
  ```
  Header has brand mark (`Lesso`) + lang toggle (anchor — `<a href="/en/...">EN</a>` / `<a href="/th/...">TH</a>` swapping locale prefix while preserving the rest of `useLocation().pathname`). Footer has `© 2026 Lesso` + nav stub.
- **MIRROR**: PageShell pattern from `apps/app/src/components/page-shell.tsx`.
- **IMPORTS**: see snippet + `useLocation` for header lang swap.
- **GOTCHA**: Lang toggle MUST be a real `<a>` (not a Link), because we want a full page navigation that re-runs SSG-prerendered HTML — keeps server-rendered `<html lang>` in sync without a client-side flicker. `react-router-dom`'s `<Link>` would skip the full reload.
- **VALIDATE**: Click TH → URL becomes `/th/...`, `<html lang>` is `th`, body strings flip to Thai.

### Task 14: Pages
- **ACTION**: Create `pages/home.tsx` + `pages/not-found.tsx`.
- **IMPLEMENT**: Home renders `<PageSeo path="/" locale={locale} title={t('app.name')} description={t('meta.home.description')} />` + `<JsonLd data={{ '@context': 'https://schema.org', '@type': 'Organization', name: 'Lesso', url: siteConfig.hostname }} />` + a hero `<section>` with `t('home.heroHeading')` + tagline + a placeholder CTA button (disabled, label `t('home.pilotComingSoonCta')`). NotFound renders a centred `<h1>404</h1>` + link to `/{locale}` home.
- **MIRROR**: feature-folder convention from `apps/app/src/routes/index.tsx`.
- **IMPORTS**: react-i18next, useLocale, PageSeo, JsonLd, siteConfig
- **GOTCHA**: Do NOT add any conversion-tracking or analytics here — that's B3. The CTA is intentionally non-functional.
- **VALIDATE**: At `/en` the H1 reads "Hello, Lesso"; at `/th` it reads "สวัสดี Lesso".

### Task 15: robots.txt + favicon + og placeholder
- **ACTION**: Create `apps/web/public/robots.txt`, `public/favicon.svg`, `public/og/default.png`.
- **IMPLEMENT**:
  ```
  # robots.txt
  User-agent: *
  Allow: /
  Sitemap: https://lesso.clinic/sitemap.xml
  ```
  Favicon: copy from apps/app's `public/favicon.svg` if it exists, else use a minimal `<svg viewBox="0 0 32 32"><rect fill="#0891B2" width="32" height="32"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-size="20" font-family="system-ui">L</text></svg>`. og/default.png: 1200×630 placeholder (solid brand colour + "Lesso · Less cost. More care."). Ship as a real PNG checked in (Satori build pipeline lands in B2).
- **MIRROR**: n/a
- **IMPORTS**: n/a
- **GOTCHA**: `robots.txt` is a static file — Vite copies `public/` verbatim. The sitemap URL is hardcoded against the production hostname; preview deploys still link to `lesso.clinic`'s sitemap, which is intentional (preview deploys should not be indexed; Vercel sets `X-Robots-Tag: noindex` on preview hostnames anyway).
- **VALIDATE**: After build, `dist/robots.txt` exists at root and contains `Sitemap: https://lesso.clinic/sitemap.xml`.

### Task 16: vercel.json
- **ACTION**: Create `apps/web/vercel.json`.
- **IMPLEMENT**: Mirror `apps/app/vercel.json`. Differences: `buildCommand: "cd ../.. && pnpm turbo build --filter=@lesso/web"`, `ignoreCommand: "cd ../.. && npx turbo-ignore @lesso/web"`. Add a redirect from `/` → `/en` (302) so root doesn't double up; the prerender already produces `/en/index.html`. CSP: identical to apps/app for B1 — Plausible additions land in B3.
- **MIRROR**: VERCEL_MONOREPO + CSP_HEADERS
- **IMPORTS**: n/a
- **GOTCHA**: Include the `Vary: Accept-Language` header on `/` — once we swap to a serverless redirect that respects Accept-Language we need the cache to vary. For B1, plain 302 redirect to `/en` is fine (no per-locale logic yet).
- **VALIDATE**: `vercel build` from `apps/web` (or via Turbo filter) produces a static deployment with the redirect rule.

### Task 17: Build-output smoke test
- **ACTION**: Create `apps/web/tests/build-output.test.ts`.
- **IMPLEMENT**: Vitest test that runs after `pnpm build` (manually wired — not part of `pnpm test`). Reads `dist/en/index.html` and `dist/th/index.html`, asserts each contains `<html lang>` matching the locale, the rendered hero text, the `<link rel="alternate" hreflang>` set, and the JSON-LD `Organization` payload. Skip the test if `dist/` is missing (so unit-test runs don't fail on a fresh clone). Add an explicit script `test:build` that does `pnpm build && vitest run tests/build-output.test.ts`.
- **MIRROR**: TEST_STRUCTURE
- **IMPORTS**: `node:fs`, `node:path`, vitest
- **GOTCHA**: Read with `fs.readFileSync` and parse with a regex — do not pull in jsdom. The artefact is just a string check.
- **VALIDATE**: `pnpm --filter @lesso/web test:build` passes on a clean checkout.

### Task 18: Lighthouse CI workflow stub (deferred)
- **ACTION**: Create `.github/_deferred/workflows/lighthouse-web.yml` (stays in `_deferred/` until token has `workflow` scope).
- **IMPLEMENT**: GitHub Actions YAML that on PR runs `pnpm install` + `pnpm --filter @lesso/web build` + uses `treosh/lighthouse-ci-action@v12` against the built dist over a local server. Asserts perf/SEO/a11y/BP all ≥ 95. Add a comment at the top: `# Promote to .github/workflows/ once the GH token has the 'workflow' scope (see PRD Phase B4).`
- **MIRROR**: n/a
- **IMPORTS**: n/a
- **GOTCHA**: Do not place the file under `.github/workflows/` — pushing without `workflow` scope rejects the entire push (we hit this in A3). Keeping it in `_deferred/` means it ships in source but does not register a workflow.
- **VALIDATE**: `git push origin main` succeeds without a `workflow` scope error.

### Task 19: Wire turbo + workspace
- **ACTION**: Verify `pnpm-workspace.yaml` covers `apps/*` (it does — line 2). No turbo.json change needed; the existing `dev/build/lint/typecheck/test` tasks inherit. Verify by running each from root.
- **MIRROR**: n/a
- **IMPORTS**: n/a
- **GOTCHA**: If a future contributor adds an `apps/web/turbo.json` overlay, keep it; for B1 the root `turbo.json` is sufficient.
- **VALIDATE**: `pnpm typecheck` from root processes both `@lesso/app` and `@lesso/web`.

### Task 20: PRD update
- **ACTION**: Update PRD's B1 row from `pending` → `in-progress` and link the plan path.
- **IMPLEMENT**: One-line edit in `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md` line 699.
- **MIRROR**: existing pattern (rows for A1-A6).
- **IMPORTS**: n/a
- **GOTCHA**: Do not change the dependency cell — B1 has no `Depends`.
- **VALIDATE**: `git diff` shows only the single row updated.

---

## Testing Strategy

### Unit / Component Tests
| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| `Button` smoke | `<Button>x</Button>` | role=button, name=x | No |
| `useLocale` resolve | `useParams() = { locale: 'th' }` | returns `'th'`, calls `i18n.changeLanguage('th')` | No |
| `useLocale` fallback | `useParams() = { locale: 'fr' }` | returns `'en'` (default) | Yes — unsupported locale |
| `PageSeo` hreflang set | locale=th, path=/, title="Lesso" | Helmet emits `<link rel="alternate" hreflang="th" ...>` and `hreflang="en" ...` and `hreflang="x-default" ...` | No |
| `JsonLd` shape | `{ '@type': 'Organization' }` | renders `<script type="application/ld+json">{"@type":"Organization"}</script>` | No |

### Build Smoke Test (separate from unit suite)
`pnpm --filter @lesso/web test:build` (Task 17):
- `dist/en/index.html` exists, contains hero heading text, contains `<html lang="en">`, contains `<link rel="alternate" hreflang="th" ...>`, contains JSON-LD `Organization` payload.
- `dist/th/index.html` mirror with `lang="th"`.
- `dist/sitemap.xml` exists, lists both `/en` and `/th`.
- `dist/robots.txt` exists, references the sitemap URL.

### Edge Cases Checklist
- [ ] `/` (no locale) — redirects (vercel.json) to `/en`
- [ ] `/fr` (unsupported locale) — falls through to wildcard 404
- [ ] `/en/garbage` — wildcard 404 inside the locale layout (header + footer still render)
- [ ] `view-source` of root — full prerendered HTML, no empty `<div id="root">`
- [ ] Lang toggle — full-page navigation, `<html lang>` updates, all text flips
- [ ] `prefers-reduced-motion` — globals.css `@layer base` already disables animations
- [ ] Build with `VITE_FEEDBACK_URL` unset — no broken render (only relevant once B3 lands)

---

## Validation Commands

### Static Analysis
```bash
pnpm typecheck
```
EXPECT: Zero type errors across all 6 packages (apps/web included).

### Lint
```bash
pnpm lint
```
EXPECT: Zero issues. Root eslint config covers `apps/web/**` automatically.

### Unit Tests
```bash
pnpm --filter @lesso/web test
```
EXPECT: All component + hook tests pass.

### Build
```bash
pnpm build
```
EXPECT:
- `apps/app/dist` builds clean (no regression).
- `apps/web/dist` produced.
- `apps/web/dist/en/index.html` and `apps/web/dist/th/index.html` exist with full prerendered DOM.
- `apps/web/dist/sitemap.xml` lists both locale routes with `<xhtml:link rel="alternate">`.
- `apps/web/dist/robots.txt` references the sitemap.
- No `mockServiceWorker.js` in `apps/web/dist` (web has no msw to leak).

### Build-Output Smoke Test
```bash
pnpm --filter @lesso/web test:build
```
EXPECT: Vitest assertions on built HTML pass.

### Local Dev
```bash
pnpm --filter @lesso/web dev
# open http://127.0.0.1:5174/en
```
EXPECT: Hero renders. Lang toggle navigates between `/en` and `/th`.

### View-Source Sanity (manual)
```bash
pnpm --filter @lesso/web build
pnpm --filter @lesso/web preview &
curl -sS http://127.0.0.1:4173/en | grep -E '<h1|hreflang|Organization'
```
EXPECT: All three patterns present.

### Manual Validation
- [ ] `pnpm dev --filter=web` runs locally
- [ ] `view-source` of `/en` shows full HTML
- [ ] Lang toggle preserves path: `/en` ↔ `/th`
- [ ] Lighthouse run (manual, B4 promotes to CI): perf/SEO/a11y/BP ≥ 95 on `/en` and `/th`
- [ ] No regression: `apps/app` still builds + types + lints

---

## Acceptance Criteria
- [ ] `apps/web` scaffolded under the monorepo
- [ ] `pnpm dev --filter=web` runs locally on port 5174
- [ ] `pnpm build` produces prerendered HTML for `/en` and `/th`
- [ ] `view-source` shows real DOM (not empty `<div id="root"></div>`)
- [ ] Sitemap.xml lists both locale routes with hreflang alternates
- [ ] robots.txt references the sitemap
- [ ] `@lesso/ui-tokens` consumed via workspace link
- [ ] Vercel project B `vercel.json` checked in with monorepo build commands + CSP
- [ ] Lang toggle works (anchor → full-page navigation)
- [ ] All validation commands pass (typecheck, lint, test, build, smoke)
- [ ] Lighthouse CI workflow scaffolded under `.github/_deferred/`
- [ ] No regression in `apps/app`

## Completion Checklist
- [ ] Code follows discovered patterns (path alias, tailwind preset, shadcn primitives)
- [ ] Error handling matches codebase style (none needed for B1 — content-only)
- [ ] No console.log
- [ ] Tests follow vitest pattern from `apps/app/src/components/ui/button.test.tsx`
- [ ] No hardcoded brand strings outside `site-config.ts` + locale JSONs
- [ ] No unnecessary scope additions (Home is a placeholder, NOT full marketing copy)
- [ ] Self-contained — implementor needs only this plan to ship

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `vite-react-ssg` ESM/CJS interop with Vite 6.4 | M | H — build breaks | Set `ssr.noExternal: ['vite-react-ssg']`; if still broken, downgrade to Vite 6.0.x for `apps/web` only (Vite supports per-app version pin). |
| Tailwind preset content globs miss `.mdx` | M | M — utility classes purged | Explicitly include `**/*.{ts,tsx,mdx}` in tailwind config |
| Lang toggle FOUC | L | L — first render uses old language briefly | Already accepted in Task 6 GOTCHA. Ship as-is; revisit only if Lighthouse a11y flags it |
| Vercel project B not yet provisioned | M | L — preview deploy unavailable | The repo wiring lands here; clinic admin (user) provisions Vercel project + DNS reservation manually post-merge |
| GH token lacks `workflow` scope | H | L — Lighthouse CI doesn't trigger automatically | Workflow stays in `_deferred/`; B4 promotes once token fixed |
| `@mdx-js/rollup` order regression | L | M — JSX in MDX silently breaks | Plugin order is critical — flagged in Task 3 GOTCHA |

## Notes
- The plan deliberately **scaffolds without content**. Real Home + Pricing +
  Features + About copy lands in B2. B1's purpose is purely structural so B2
  can plug in pages without re-discovering wiring decisions.
- Why `react-router-dom` and not TanStack Router (used in apps/app)? Because
  `vite-react-ssg` integrates exclusively with `react-router-dom` v6's
  `RouteObject[]` shape. Mixing two routers across two apps is a one-time
  cost that's lower than building our own SSG pipeline.
- Why MDX in B1 if we're not shipping content? The build pipeline is a
  one-time wiring cost — adding MDX in B4 (when blog lands) means redoing
  vite.config.ts and re-validating Tailwind + a11y. Cheaper to wire now,
  unused, than to retrofit.
- Locale URL design: `/en` + `/th` (NOT `/?lang=th`). Crawlers treat path
  segments as separate documents; query strings are ambiguous.
- Why a build-output smoke test instead of an E2E test? E2E tests assert
  runtime behaviour; B1's whole point is build-time output. A 30-line
  string-grep over `dist/*.html` is precise and fast. Playwright lands in B4
  once there's actual content + flows to verify.
