# Local Review: B1 Marketing Foundation — `5c825e5`

**Reviewed**: 2026-05-02
**Author**: ratchasak
**Branch**: main (local)
**Decision**: REQUEST CHANGES — 0 CRITICAL, 8 HIGH, 9 MEDIUM, 7 LOW

## Summary
Three parallel reviewers (typescript-reviewer, security-reviewer,
code-reviewer) audited the B1 scaffold. No security CRITICAL. HIGH issues
cluster around three themes: (a) the SEO-injection pipeline has correctness
+ architecture gaps that B2 needs to close, (b) two dead deps + duplicated
locale-resolution logic, and (c) the `/` and `/404` routes silently render
home metadata.

## Findings

### CRITICAL
None.

### HIGH

| # | File:Line | Issue | Fix |
|---|---|---|---|
| H1 | `apps/web/vite.config.ts:154` | `<html lang>` regex `/<html\b[^>]*\blang="[^"]*"/i` only fires when the template already has a `lang` attribute. If `index.html` ever loses `lang="en"`, every prerendered page ships without a lang attribute. | Replace defensively: `html.replace(/<html\b[^>]*?(?:\s+lang="[^"]*")?(\s*>)/i, ...)` or assert `replace` returned a different string and throw if not. |
| H2 | `apps/web/vite.config.ts:44-66` (`buildSeo`) | `isNotFound = false` is hardcoded; the `meta.notFound.*` keys + path detection branch are dead. 404 routes silently get the home page's meta + canonical. | Derive `isNotFound` from the route arg (e.g. `route.endsWith('/404')` or check whether the route is in the prerendered allowlist) and use the right keys. |
| H3 | `apps/web/vite.config.ts:48` (`titleKey`) | `buildSeo` only maps locale → `meta.home.*`. B2 (per-page meta) will need per-route title/description, which the function does not accept. | Build a `route → pageKey` registry (`{ '/en': 'home', '/en/pricing': 'pricing', ... }`) and look up `meta.<pageKey>.title` instead of hardcoding `meta.home.*`. Land before B2 starts. |
| H4 | `apps/web/vite.config.ts:104-116` (`renderSeoTags`) | `seo.canonical`, `seo.alternates[*].href`, `seo.ogImage` interpolated into HTML attributes WITHOUT `escapeHtml`. Description / title go through `escapeHtml` but URLs don't. | Wrap every URL attribute through `escapeHtml`. Trivial diff. Pattern fragility: today `siteConfig.hostname` is hardcoded, but if it ever comes from env at build time the gap becomes exploitable. |
| H5 | `apps/web/package.json:23-25` | `react-i18next` + `i18next` are runtime `dependencies` but neither is imported anywhere in `src/`. Dead weight in the client bundle and a misleading signal. | Drop both, or move to `devDependencies` with a TODO + tracking issue. |
| H6 | `apps/web/vite.config.ts:20-23` vs `apps/web/src/lib/use-locale.ts:34-38` | `localeFromRoute` duplicated in both files (build-time + browser). If a third locale is added to `siteConfig.locales`, one copy gets updated and the other silently diverges. | Extract to a pure `src/lib/locale-utils.ts` that `vite.config.ts` imports at build time (Node CJS-compatible — `site-config.ts` already crosses this boundary). |
| H7 | `apps/web/src/routes.tsx:22-30` + vite-react-ssg | The `/` catch-all also prerenders `dist/index.html` with `<HomePage>` defaulting to `en`. Result: two HTML files (`/index.html` + `/en.html`) with the same canonical `https://lesso.clinic/en/`. Duplicate-content SEO issue. | Either drop `/` from the prerender route list (Vercel's redirect handles it) or set `vercel.json` redirect to `permanent: true` AND keep `/` to provide an immediate-render before the redirect lands. |
| H8 | `apps/web/src/pages/not-found.tsx:9-13` | `PageSeo path="/404"` is silently dropped (component is a no-op) and `buildSeo` doesn't recognise the path — wrong canonical / title would be injected if the function ever covers 404. | Pair with H2: thread the path through `onPageRendered`'s registry. |

### MEDIUM

| # | File:Line | Issue |
|---|---|---|
| M1 | `apps/web/vercel.json:9` | Redirect `/` → `/en` is `"permanent": false` (302). Crawlers don't consolidate link equity to `/en`. Should be 308 (or 301) once the locale strategy is final. |
| M2 | `apps/web/vercel.json:26-29` | `Vary: Accept-Language` is set on the `/` source. But the `/` redirect is a 302 — `Vary` on a redirect response is ignored by all major caches and browsers. The header is dead until edge-locale-detection middleware lands. |
| M3 | `apps/web/vercel.json:17` | CSP `style-src 'unsafe-inline'` permits inline style injection. Required by Google Fonts today; document as a known gap to revisit when font loading changes. |
| M4 | `apps/web/tests/build-output.test.ts` | No unit tests for `useResolvedLocale`: dot-notation key lookup, `{{var}}` interpolation, missing-key fallback, default-locale fallback. A regression in the `t()` function would only surface at build time. |
| M5 | `apps/web/tests/build-output.test.ts` | No assertion for the `SiteHeader` lang-toggle URL rewrite (`stripPrefix` regex + `switchHref` computation). The `/en/foo` → `/th/foo` mapping is non-trivial and untested. |
| M6 | `apps/web/src/components/seo/{page-seo,json-ld}.tsx` | No-op components accept typed props that are silently discarded. Risk: callers diverge from the `onPageRendered` logic — for instance `not-found.tsx` already passes `path="/404"` that goes nowhere (subsumes H8). |
| M7 | `apps/web/src/lib/use-locale.ts:46` | Template-variable `{{var}}` substitution does not escape `vars` values. Today only static labels (`nextLabel`) are passed in, but if a future caller passes user-supplied text, it renders unescaped. Flag for B3 waitlist. |
| M8 | `apps/web/index.html:11` | `preconnect` to `https://fonts.googleapis.com` lacks `crossorigin`. Browser-hint suboptimal (the second preconnect to `gstatic` correctly has it). |
| M9 | `apps/web/vite.config.ts:170` | Title-replace regex uses `/i` flag — HTML parsers treat `<title>` case-sensitively, so the flag is incorrect (low-impact: the template ships lowercase). |

### LOW

| # | File:Line | Issue |
|---|---|---|
| L1 | `apps/web/src/lib/use-locale.ts:42` | `as Record<string, unknown>` cast is safe but redundant. `lookup` could accept `unknown` and the cast disappears. |
| L2 | `apps/web/src/components/layout/root-layout.tsx:6-9` + `vite.config.ts:140-148` | The "why no HelmetProvider" comment is split across two files. Cross-reference: in root-layout add "see `vite.config.ts → ssgOptions.onPageRendered`" so a future dev knows where the meta actually lives. |
| L3 | `apps/web/src/routes.tsx:22-26` | The `/` index route renders `<HomePage>` without a locale prefix; client hit before Vercel redirect produces a brief default-locale render. Worth a one-line comment. |
| L4 | `apps/web/vercel.json` | No `nonce` in CSP; `script-src 'self'` only. Correct posture for a static site with no inline scripts. Note for B3 when Plausible / Resend lands. |
| L5 | `apps/web/src/components/layout/site-header.tsx:24` | `new RegExp(\`^/${locale}/\`)` ESLint suppression confirmed — `locale` is `'en' \| 'th'`, no user input. False positive. |
| L6 | `apps/web/src/components/seo/page-seo.tsx` | `_props` underscore prefix silences `no-unused-vars`. Already correct. |
| L7 | `apps/web/.env.example` | `VITE_PLAUSIBLE_DOMAIN` placeholder — empty as expected. |

## Validation Results
| Check | Result |
|---|---|
| Typecheck | Pass — 7/7 packages |
| Lint | Pass — 0 errors, 0 warnings |
| Tests | Pass — web 4 + app 19 = 23 |
| Build | Pass — `dist/{en,th,index}.html` 4 KB each, sitemap.xml, robots.txt |

## Files Reviewed
- All 27 created files in `apps/web/`
- `.github/_deferred/workflows/lighthouse-web.yml`
- `.claude/PRPs/{plans/completed/b1-marketing-foundation.plan.md, prds/aesthetic-clinic-backoffice-mvp.prd.md, reports/b1-marketing-foundation-report.md}`

## Decision
**REQUEST CHANGES.** 8 HIGH issues. Pilot-blocking subset (must fix before B2):
- H1 (defensive `<html lang>` replace)
- H2 (fix `isNotFound` dead branch + 404 canonical)
- H3 (per-route SEO registry — B2 prereq)
- H4 (escapeHtml on URL attributes)
- H5 (drop `react-i18next` + `i18next` dead deps)

Improvement HIGH (acceptable to fold into B2):
- H6 (lift `localeFromRoute` to a shared module)
- H7 (`/` duplicate-content)
- H8 (subsumed by H2 once registry lands)

MEDIUMs around tests / vercel redirect strategy / `Vary` header can land in
B4 alongside the Lighthouse CI gate. Inline comments + tests for
`useResolvedLocale` should accompany B2's per-route SEO work.
