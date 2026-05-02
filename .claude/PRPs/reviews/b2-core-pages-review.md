# Local Review: B2 Core Pages — `573e140`

**Reviewed**: 2026-05-02
**Author**: ratchasak
**Branch**: main (local)
**Decision**: REQUEST CHANGES — 0 CRITICAL, 7 HIGH, 11 MEDIUM, 7 LOW

## Summary
Three parallel reviewers (typescript-reviewer, a11y-architect,
code-reviewer) audited B2. No security/data-loss CRITICAL. HIGH issues
cluster around four themes: (a) the new `dict` typing in `useResolvedLocale`
escapes the type system via a double cast, (b) About page misuses `Section`
with empty-string sentinel props that emit unlabelled landmarks, (c) the
new `TierCard` CTA is a non-disabled `<Button>` that does nothing on click,
(d) two orphan locale keys + a hardcoded skip-link string break the i18n
discipline. Token-driven primitives + brand v2 voice carried over cleanly.

## Findings

### CRITICAL
None.

### HIGH

| # | File:Line | Issue | Fix |
|---|---|---|---|
| H1 | `apps/web/src/lib/use-locale.ts:39` | `DICTS[locale] as unknown as Dict` — double cast escapes TS. Today both locales share identical structural shape so it works at runtime, but a key drift between `en.json` and `th.json` is silently allowed. | Type `DICTS` as `Record<Locale, Dict>` (or `{ en: Dict; th: Dict }`). The cast disappears and the JSON imports are checked against the canonical `typeof en` shape at compile time. |
| H2 | `apps/web/src/pages/about.tsx:26` | `<Section id="about-founder" eyebrow="" heading="">` passes empty strings. `Section` guards truthiness so the eyebrow/h2 do not render — but `aria-labelledby` is still wired to `about-founder-heading`, an empty h2 element. AT users hear an unlabelled landmark. | Either drop the `Section` wrapper for the Founder card (use a plain `<div>`) or pass `heading={t('about.founder.name')}`. Avoid empty-string sentinels — use `undefined`. Same fix for the Mission Section if it surfaces. |
| H3 | `apps/web/src/components/marketing/tier-card.tsx:62-68` | TierCard `<Button>` has no `href`, no `disabled`, no `onClick`. Click does nothing. FinalCta + EditorialHero use `disabled` (consistent + honest). Inconsistent identification (SC 3.2.4) + missing role/value (SC 4.1.2). | Add `disabled` prop matching FinalCta until B3 wires the pilot form. When B3 lands, swap to a styled `<a href="/pilot">`. |
| H4 | `apps/web/src/pages/features.tsx:23-33` (`Illustration`) | Placeholder `bg-muted` block has `role="img"` + `aria-label={section.heading}`. Screen readers announce the heading twice — once as h2, again as image alt. Pure decoration in B2. | Drop `role="img"` + `aria-label`; add `aria-hidden="true"` to the wrapper. Restore meaningful alt text in B3+ when real illustrations land. |
| H5 | `apps/web/src/locales/{en,th}.json:3-4` | `app.tagline` defined in both locales, zero call-sites in source. Maintenance trap when copy changes. | Drop the key. Tagline already lives in `siteConfig.tagline` (single source of truth) and the editorial hero copy is split into `home.heroLine1/2`. |
| H6 | `apps/web/src/components/layout/root-layout.tsx:18` | Skip-link text is hardcoded English `"Skip to main content"`. Thai-locale users get the English string. Also `common.skipToMain` exists in both locales but is unused — inverse orphan. | Replace the string literal with `useResolvedLocale().t('common.skipToMain')`. RootLayout is already inside the router so the hook works. |
| H7 | `apps/web/src/components/marketing/tier-card.tsx:38` | `"Pilot"` badge text hardcoded English. TH locale Clinic card renders the English word. | Either accept a `badgeLabel?: string` prop and pass `dict.pricing.featuredLabel` from the page, or add a `pricing.featuredBadge` key both locales and read via the `t` function. |

### MEDIUM

| # | File:Line | Issue |
|---|---|---|
| M1 | `apps/web/src/pages/home.tsx:65,78` | `key={i}` (array index) on Problem/Solution `<li>`. Static locale data so reorder won't happen, but breaks the stable-key rule. Use a content-derived key. |
| M2 | `apps/web/vite.config.ts:108` | `tier.price.replace(/,/g, '')` strips thousand separators before emitting `Offer.price`. No validation that the result parses as a number. A typo in TH locale (e.g. period separator) silently emits a malformed JSON-LD value. |
| M3 | `apps/web/src/components/layout/site-header.tsx:47,95` | Both desktop nav AND mobile-Sheet nav use `aria-label="Primary navigation"` (translated). Two `<nav>` landmarks share an identical name. |
| M4 | `apps/web/vite.config.ts:67` | `(dict.meta as Record<string, { title: string; description: string }>)[pageKey]` casts away TypeScript safety. New `PageKey` without matching `meta.*` falls through to default silently. |
| M5 | `apps/web/src/components/ui/sheet.tsx` (apps/web) vs `apps/app/src/components/ui/sheet.tsx` | Byte-similar except `useTranslation` (app) vs `useResolvedLocale` (web). Drift risk. Promote to `packages/ui-components` or add a comment cross-referencing the sibling file. |
| M6 | `apps/web/src/pages/{pricing,features,about}.tsx` | No page-level render tests. Build-output tests confirm HTML artifacts but not React rendering — `dict` access regressions, bad prop threading would slip past. |
| M7 | `apps/web/src/components/marketing/marketing.test.tsx` | No coverage for `FeatureSection` alternating `align` prop or `TierCard` non-featured (outline) variant. |
| M8 | `apps/web/src/components/marketing/section.tsx`, `faq.tsx` | Fully generic primitives placed under `components/marketing/`. `EditorialHero` lives under `components/layout/` — same logic puts these under `components/ui/`. Discoverability + cross-page reuse. |
| M9 | `apps/web/src/components/marketing/tier-card.tsx:38` | (subsumed by H7) badge string also non-localised. |
| M10 | `apps/web/src/pages/about.tsx:26,48` | (subsumed by H2) empty-string Section sentinel pattern. |
| M11 | `apps/web/src/pages/home.tsx:18-26` (`<JsonLd>`) + `apps/web/vite.config.ts:88-100` | Home prerendered HTML emits Organization JSON-LD twice — once via the `<JsonLd>` no-op-component-then-injection path (still in home.tsx as a fallback?) and once via `buildSeo`. Verify only `buildSeo` writes the script tag; if so, drop the inert `<JsonLd>` call from home.tsx. |

### LOW

| # | File:Line | Issue |
|---|---|---|
| L1 | `apps/web/vite.config.ts:172` | JSON-LD emitted as `JSON.stringify(block)` inside `<script>` without escaping `</script>` substrings. Defense-in-depth only — content is checked-in JSON, not user input. |
| L2 | `apps/web/src/components/marketing/section.tsx:46` | `cn(eyebrow \|\| heading \|\| sub ? 'mt-10' : '')` — `cn` adds nothing here; a plain ternary suffices. |
| L3 | `apps/web/src/components/marketing/page-intro.tsx` | No `className` prop / `cn()`. `Section` accepts override; PageIntro doesn't — inconsistent API. |
| L4 | `apps/web/src/components/marketing/faq.tsx:23` | Accordion `value={item.id}` — works. If two FAQs ever render on one page with overlapping ids, Radix breaks. Today single-FAQ-per-page so fine. |
| L5 | `apps/web/src/pages/home.tsx:131-141` (social proof) | Five placeholder divs `[1,2,3,4,5].map(...)` — throw-away array each render. Trivial cost; flag for replacement when real partner logos land. |
| L6 | `apps/web/src/components/layout/root-layout.tsx:21` | `<main tabIndex={-1}>` is a defensive scaffold for client-side routing focus reset. With SSG full-page reload it is unused but harmless. Note for B3+ if/when client-side routing arrives. |
| L7 | `apps/web/vite.config.ts:135` | JSON-LD payload (Organization + Product + FAQPage) on Pricing reaches ~1,947 B inline. Confirmed within 2 KB budget. |

## Validation Results
| Check | Result |
|---|---|
| Typecheck | Pass — 7/7 |
| Lint | Pass — 0/0 |
| Tests | Pass — web 40 + app 19 = 59 |
| Build | Pass — 8 prerendered HTML files (home 28 KB, pricing 27 KB, features 13 KB, about 9 KB) |

## Files Reviewed
- All 19 created files in commit `573e140`
- All 7 modified files
- Cross-checked against the brand-redesign-review fixes; no regressions detected (focus ring, dialog 44×44, FormError role=alert, lang toggle without aria-pressed all preserved).

## Decision
**REQUEST CHANGES.** 7 HIGH issues. Pilot-blocking subset:
- H1 (drop `as unknown as Dict` cast)
- H2 (About `Section` empty-string sentinel)
- H3 (TierCard CTA disabled)
- H4 (FeatureSection redundant `role="img"`)
- H6 (localise skip-link)
- H7 (localise TierCard featured badge)

Quick cleanup:
- H5 (drop `app.tagline` orphan)

MEDIUM items mostly maintenance debt (Sheet cross-app drift, page-level
tests, M11 duplicate Organization JSON-LD). All can fold into a single
follow-up commit.
