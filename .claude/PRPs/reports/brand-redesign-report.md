# Implementation Report: Lesso Brand Redesign

## Summary
Brand-new visual identity across `apps/app` (backoffice) + `apps/web`
(marketing). Single-source rebrand via `packages/ui-tokens`: deep teal
primary `#134E4A` + terracotta secondary `#C67B5C` + sage success `#6B7B3C`
on warm cream `#FAF7F2`, Playfair Display headings (with italic) + Inter
body. New `EditorialHero` component for the marketing home replaces the
generic centred placeholder.

## Assessment vs Reality
| Metric | Predicted | Actual |
|---|---|---|
| Complexity | Medium-Large | Medium |
| Files Changed | ~25 | 21 (1 created, 20 modified) |
| Confidence | 8/10 | 9/10 — token-driven primitives flowed through cleanly |

## Tasks Completed
| # | Task | Status |
|---|---|---|
| T1 | tokens.css rewrite | done — light + dark, new palette + radius-card + warm shadows |
| T2 | fonts.css Playfair + Inter | done — dropped Figtree + Noto Sans (Latin); kept Noto Sans Thai + JetBrains Mono |
| T3 | tailwind preset fontFamily + radius + shadow | done — `fontFamily.heading = Playfair Display`, `fontFamily.sans = Inter`, `borderRadius.card`, `boxShadow.{card,popover}` |
| T4 | Card / SelectableCard / Dialog / Sheet / EmptyState radius + shadow | done — `rounded-card`, `shadow-card`, `shadow-popover`, overlay `bg-foreground/40` |
| T5 | theme-color in both index.htmls | done — `#0891B2` → `#134E4A`; favicon hex updated; OG png regenerated as teal block |
| T6 | EditorialHero + locale strings | done — eyebrow + italic accent + terracotta rule + sage trust strip |
| T7 | wire EditorialHero into home | done |
| T8 | SEO meta refresh | done — `meta.home.description` rewritten with concrete value-prop |
| T9 | validate + commit + push | done |

## Validation Results
| Level | Status |
|---|---|
| Typecheck | Pass — 7/7 |
| Lint | Pass — 0/0 |
| Tests | Pass — web 18 (incl. updated copy expectations) + app 19 = 37 |
| Build | Pass — Playfair + Inter in dist css; `dist/en.html` + `dist/th.html` carry hero copy + html lang per locale |

## Files Changed
| File | Action |
|---|---|
| `packages/ui-tokens/src/css/tokens.css` | UPDATE — full palette swap + new radius-card + 2 shadows |
| `packages/ui-tokens/src/css/fonts.css` | UPDATE — Playfair Display + Inter + Noto Sans Thai + JetBrains Mono |
| `packages/ui-tokens/src/tailwind-preset.ts` | UPDATE — fontFamily + borderRadius.card + boxShadow.{card,popover} |
| `apps/app/src/components/ui/{card,selectable-card,dialog,sheet,empty-state}.tsx` | UPDATE — radius + shadow tokens |
| `apps/web/src/components/ui/card.tsx` | UPDATE — same |
| `apps/{app,web}/index.html` | UPDATE — theme-color teal |
| `apps/web/public/favicon.svg` | UPDATE — fill teal |
| `apps/web/public/og/default.png` | REGENERATED — teal block |
| `apps/web/src/components/layout/editorial-hero.tsx` | CREATE — eyebrow + italic h1 + rule + trust strip |
| `apps/web/src/pages/home.tsx` | UPDATE — replace centred section with EditorialHero |
| `apps/web/src/locales/{en,th}.json` | UPDATE — heroLine1/2/eyebrow/trust + meta description rewrite |
| `apps/web/src/lib/i18n-dict.test.ts` | UPDATE — new key expectations |
| `apps/web/tests/build-output.test.ts` | UPDATE — assert hero copy + lang attr |
| `design-system/lesso-brand-v2/MASTER.md` | CREATE — persisted source of truth |

## Deviations from Plan
None. Plan executed task-by-task as written.

## Issues Encountered
- The first `pnpm test` after the locale rewrite ran before `pnpm build`, so
  the smoke test read stale `dist/`. Re-ran build → test → green. Future
  runs will hit the same pattern only when locale copy changes; the
  `test:build` script (`pnpm build && vitest`) is the documented path.
- Build output shows the en SSG static-loader-data inline in `th.html` and
  vice versa (vite-react-ssg pre-loads route data for client navigation).
  Harmless — visible content per page is locale-correct.

## Next Steps
- Manual smoke at 375 / 768 / 1024 / 1440 in both light + dark
- Lighthouse audit (deferred to B4 alongside CI gate)
- B2: Pricing / Features / About pages — extend the SEO route registry +
  add page-level translations, EditorialHero pattern repeats with section
  headings in Playfair italic where appropriate
- A7: Supabase backend integration (token swap is fully decoupled from
  data-layer work)
