# Implementation Report: B1 Marketing Foundation

## Summary
Scaffolded `apps/web` inside the existing pnpm + Turborepo monorepo. Vite 6 +
React 18 + TypeScript + `vite-react-ssg` for build-time prerender +
`react-router-dom` v6 for routing + a custom synchronous t-function (replaces
`react-i18next` for the SSG pipeline) + MDX (`@mdx-js/rollup`) +
`vite-plugin-sitemap`. Output is fully prerendered HTML for `/`, `/en`, `/th`
with correct `<html lang>`, hreflang alternates, canonical URL, OG meta,
JSON-LD Organization payload, and a sitemap. Vercel project B `vercel.json`
ready for cutover.

## Assessment vs Reality
| Metric | Predicted | Actual |
|---|---|---|
| Complexity | Large | Large |
| Files Changed | ~28 | 27 |
| Confidence | 8/10 | 8/10 — the helmet pipeline needed a non-trivial workaround |

## Tasks Completed
| # | Task | Status | Notes |
|---|---|---|---|
| T1 | apps/web/package.json | done | `vite-react-ssg` pinned `^0.9.0` (latest stable; plan said `0.7.7` which was a pre-release tag) |
| T2 | tsconfig | done | inherits base, `@/*` alias |
| T3 | vite.config | done | mdx + react + sitemap; ssgOptions handles SEO injection |
| T4 | site-config | done | hostname, locales, default, descriptions, tagline |
| T5 | i18n + locale JSONs | DEVIATED | dropped `react-i18next` runtime; built a synchronous t-function in `useResolvedLocale` instead. SSG renders during a single React pass — `i18next.changeLanguage` is async and never updates the active `t` returned by `useTranslation` mid-render, leaking the default locale into prerendered HTML. Static dict lookup is deterministic. |
| T6 | useLocale hook | done | reads `useLocation().pathname` (routes use literal `/en` `/th`, not `/:locale` params) |
| T7 | routes.tsx | done | `/`, `/en`, `/th` + wildcard 404 |
| T8 | main.tsx | done | `ViteReactSSG({ routes })` |
| T9 | index.html | done | preconnect to fonts, theme-color |
| T10 | tailwind + postcss + globals | done | reuses `@lesso/ui-tokens` preset; touch-target utility |
| T11 | shadcn primitives + components.json | done | `Button`, `Card` copied verbatim from apps/app |
| T12 | PageSeo + JsonLd | DEVIATED | both reduced to no-op components. SEO meta + JSON-LD injected per route in `ssgOptions.onPageRendered` because `react-helmet-async` ships dual ESM/CJS that `vite-react-ssg` and our app each bundled into separate React contexts. The "right" fix needs upstream changes in vite-react-ssg or a v3 helmet that ships pure ESM — not in scope for B1. |
| T13 | layout components | done | RootLayout (no HelmetProvider — see T12), SiteHeader, SiteFooter |
| T14 | pages | done | Home (hero placeholder + disabled CTA), NotFound |
| T15 | robots + favicon + og | done | OG generated as 1200×630 PNG via ImageMagick (text rendering deferred; Satori pipeline lands B2) |
| T16 | vercel.json | done | monorepo build/install/ignore + CSP + redirect `/` → `/en` |
| T17 | build-output smoke test | done | 4/4 vitest tests pass — asserts `/en.html`, `/th.html`, sitemap, robots.txt + html lang + hreflang + JSON-LD |
| T18 | Lighthouse CI workflow | done | scaffolded under `.github/_deferred/workflows/lighthouse-web.yml` (kept out of `workflows/` until GH token has `workflow` scope) |
| T19 | install + verify build pipeline | done | typecheck + lint + tests + build all green |
| T20 | PRD update + report + commit + push | done (this report) |

## Validation Results
| Level | Status | Notes |
|---|---|---|
| Typecheck | Pass | 7/7 packages |
| Lint | Pass | 0 errors, 0 warnings |
| Unit tests (web) | Pass | 4 build-output assertions |
| Build | Pass | `dist/{en,th,index}.html` 4.0 KiB each, sitemap.xml, robots.txt |
| `<html lang>` per locale | Verified | en.html `lang="en"`, th.html `lang="th"` |
| Thai content present in `/th.html` | Verified | "สวัสดี Lesso" |
| Hreflang alternates | Verified | en, th, x-default present in all locale files |
| JSON-LD Organization | Verified | inline `<script>` payload in every locale |
| Sitemap | Verified | both locale routes listed |

## Files Changed
| File | Action |
|---|---|
| `apps/web/package.json` | CREATE |
| `apps/web/tsconfig.json` | CREATE |
| `apps/web/vite.config.ts` | CREATE |
| `apps/web/tailwind.config.ts` | CREATE |
| `apps/web/postcss.config.js` | CREATE |
| `apps/web/components.json` | CREATE |
| `apps/web/vercel.json` | CREATE |
| `apps/web/.env.example` | CREATE |
| `apps/web/index.html` | CREATE |
| `apps/web/public/robots.txt` | CREATE |
| `apps/web/public/favicon.svg` | CREATE |
| `apps/web/public/og/default.png` | CREATE |
| `apps/web/src/main.tsx` | CREATE |
| `apps/web/src/routes.tsx` | CREATE |
| `apps/web/src/styles/globals.css` | CREATE |
| `apps/web/src/lib/{utils,site-config,use-locale}.ts` | CREATE |
| `apps/web/src/locales/{en,th}.json` | CREATE |
| `apps/web/src/components/ui/{button,card}.tsx` | CREATE |
| `apps/web/src/components/seo/{page-seo,json-ld}.tsx` | CREATE (no-op components) |
| `apps/web/src/components/layout/{root-layout,site-header,site-footer}.tsx` | CREATE |
| `apps/web/src/pages/{home,not-found}.tsx` | CREATE |
| `apps/web/tests/build-output.test.ts` | CREATE |
| `.github/_deferred/workflows/lighthouse-web.yml` | CREATE |
| `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md` | UPDATE (B1 → complete) |

## Deviations from Plan
- **T5 i18n**: dropped `react-i18next` for the runtime t-function. `useResolvedLocale` returns a synchronous `t` reading from a static dict keyed by route locale. Reason: SSG renders happen during a single React pass — `i18next.changeLanguage` is async and never reaches the `useTranslation`-returned `t` within the same render. The dependency stays declared in `package.json` for an eventual client-side migration.
- **T12 PageSeo / JsonLd**: reduced to no-op components. SEO meta + JSON-LD are injected per route in `ssgOptions.onPageRendered` (vite.config.ts). Reason: `react-helmet-async` and `vite-react-ssg` end up with two separate helmet copies that split the React context, so `<Helmet>` payloads never reach the prerendered HTML. Multiple attempts (HelmetProvider toggle, `Head` re-export, `noExternal` + `dedupe`) all failed in this Vite 6 / vite-react-ssg 0.9 / react-helmet-async 1.3 combination. The string-template injection is deterministic, has zero runtime cost, and scales to B2's per-page meta needs.
- **OG image**: PNG generated as a flat brand-color block (text fonts unavailable in this CI environment without `gs`). Real Satori-rendered OG images land in B2.

## Issues Encountered
- `vite-react-ssg@^0.7.7` (per plan) didn't exist on npm — pinned to `^0.9.0` (latest stable).
- `react-helmet-async` named-export error under Vite 6 SSR — required `noExternal: ['vite-react-ssg']` (not the helmet itself, which would have introduced the dual-context issue).
- Routes literal vs param: routes use `/en` + `/th` literal paths so vite-react-ssg can prerender by name; that means `useParams<{ locale }>` returns `{}`, so locale is read from `useLocation().pathname` instead.

## Next Steps
- B2 Core Pages (Home content, Pricing, Features, About, JSON-LD payloads)
- Manual: provision Vercel project B, reserve `lesso.clinic` domain (DNS at B4)
- Promote `.github/_deferred/workflows/lighthouse-web.yml` to `.github/workflows/` once GH token has `workflow` scope
