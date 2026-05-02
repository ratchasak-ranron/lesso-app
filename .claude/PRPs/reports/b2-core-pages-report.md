# Implementation Report: B2 Core Pages

## Summary
Shipped 4 marketing pages × 2 locales = 8 prerendered HTML files: Home
(expanded with Problem/Solution + Features grid + Social proof + Pricing
teaser + FAQ + FinalCta), Pricing (3 tiers + FAQ + Product + FAQPage
JSON-LD), Features (5 sections with anchor IDs), About (founder + mission
+ vertical focus). SiteHeader gains nav + mobile Sheet drawer. Sitemap
lists all 8 routes. SEO route registry extended with per-page Product +
FAQPage schemas. All token-driven; brand v2 voice consistent.

## Assessment vs Reality
| Metric | Predicted | Actual |
|---|---|---|
| Complexity | Large | Large |
| Files Changed | ~22 created / 6 modified | 19 created / 7 modified |
| Confidence | 9/10 | 9/10 |

## Tasks Completed
| # | Task | Status |
|---|---|---|
| T1 | `@radix-ui/react-accordion` + `ui/accordion.tsx` | done |
| T2 | Marketing primitives (Section, PageIntro, Faq, FeatureSection, TierCard, FinalCta) | done |
| T3 | SiteHeader nav + mobile Sheet | done |
| T4 | Locale strings (en + th) — full B2 dict | done |
| T5 | Pricing page | done |
| T6 | Features page (5 sections, anchor IDs) | done |
| T7 | About page (founder + mission + vertical focus) | done |
| T8 | Home extended sections | done |
| T9 | Routes + sitemap (8 routes prerendered) | done |
| T10 | SEO + Product + FAQPage JSON-LD | done — Pricing emits Product, Home + Pricing emit FAQPage |
| T11 | SiteHeader test | done — 4 cases (nav links, active state, lang-switch href, nested-route active) |
| T12 | Build-output smoke extension | done — 14 it.each cases covering all 8 HTMLs + JSON-LD presence/absence |
| T13 | Marketing component tests | done — 6 cases across Section / PageIntro / Faq / TierCard / FinalCta |
| T14 | Validate + commit + push | done |

## Validation Results
| Level | Status |
|---|---|
| Typecheck | Pass — 7/7 |
| Lint | Pass — 0/0 |
| Tests | Pass — web 40 + app 19 = 59 |
| Build | Pass — 8 prerendered HTML files; pricing 27 KB, features 13 KB, about 9 KB, home 28 KB |

## Files Changed
| File | Action |
|---|---|
| `apps/web/package.json` | UPDATE — add @radix-ui/react-accordion + react-dialog |
| `apps/web/src/components/ui/accordion.tsx` | CREATE |
| `apps/web/src/components/ui/sheet.tsx` | CREATE (copied from apps/app, swap useTranslation → useResolvedLocale) |
| `apps/web/src/components/marketing/{section,page-intro,faq,feature-section,tier-card,final-cta}.tsx` | CREATE |
| `apps/web/src/components/marketing/marketing.test.tsx` | CREATE |
| `apps/web/src/components/layout/site-header.tsx` | UPDATE — nav + Sheet |
| `apps/web/src/components/layout/site-header.test.tsx` | CREATE |
| `apps/web/src/lib/use-locale.ts` | UPDATE — expose `dict` for typed array access |
| `apps/web/src/locales/{en,th}.json` | UPDATE — full B2 dict (~120 keys per locale) |
| `apps/web/src/pages/{pricing,features,about}.tsx` | CREATE |
| `apps/web/src/pages/home.tsx` | UPDATE — append 6 sections after EditorialHero |
| `apps/web/src/routes.tsx` | UPDATE — 3 child routes per locale |
| `apps/web/vite.config.ts` | UPDATE — extend `pageForRoute` registry, add Product + FAQPage JSON-LD, sitemap to 8 routes |
| `apps/web/tests/build-output.test.ts` | UPDATE — 14 cases covering 8 HTMLs |
| `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md` | UPDATE — B2 → complete |

## Deviations from Plan
- **Per-page Satori OG images**: deferred to B4 per the plan's "NOT building"
  list. Single shared `/og/default.png` covers every page.
- **TierCard CTA**: rendered as `<Button>` (not anchor) since pricing CTAs
  link to the pilot form which lives in B3. Today they are `disabled`-style
  buttons; B3 will swap to anchors that hit `/pilot`.

## Issues Encountered
- The `Button` primitive (copied from apps/app) does not support `asChild`,
  so the Home pricing-teaser CTA was rewritten as a styled inline `<a>`
  element. Future cross-app primitive promotion (`packages/ui-components`)
  would let us add `asChild` once.
- `eslint-plugin-security/detect-object-injection` flagged the dict-keyed
  loops in pages; resolved by removing the file-level disables once the
  rule confirmed the union-key reads were safe (it only triggers on
  user-input keys).

## Next Steps
- B3 Waitlist + Legal: pilot signup form, Resend + Notion API, Plausible
- B4 Polish + Launch: Lighthouse CI gate, real OG images via Satori
- A7 Supabase backend (orthogonal — token + schema work)
