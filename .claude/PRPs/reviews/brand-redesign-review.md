# Local Review: Brand Redesign — `ab4375b`

**Reviewed**: 2026-05-02
**Author**: ratchasak
**Branch**: main (local)
**Decision**: REQUEST CHANGES — 0 CRITICAL, 7 HIGH, 11 MEDIUM, 5 LOW

## Summary
Three parallel reviewers (typescript-reviewer, a11y-architect, code-reviewer)
audited the rebrand. No security/data-loss CRITICAL. HIGH issues cluster
around two themes: (a) two new colour pairings fail WCAG contrast rules
(terracotta-as-text + invisible sand border on cream), (b) a stale OG
image plus three orphan/duplication maintenance items. Token-driven
primitives propagated cleanly otherwise.

## Findings

### CRITICAL
None.

### HIGH

| # | File:Line | Issue | Fix |
|---|---|---|---|
| H1 | `apps/web/src/components/layout/editorial-hero.tsx:18` (`text-secondary`) + `packages/ui-tokens/src/css/tokens.css` (`--secondary`) | Terracotta `#C67B5C` on cream `#FAF7F2` = **3.05:1**. Eyebrow text is `text-xs` (12 px), so it fails SC 1.4.3 (4.5:1 normal text). | Darken `--secondary` to ≈`#A45A3D` (≥4.8:1), OR introduce a `--secondary-text` token at higher contrast and reserve the lighter shade for decorative-only (rule, eyebrow background). |
| H2 | `packages/ui-tokens/src/css/tokens.css` (`--border`) | Sand `#E7E0D5` against cream `#FAF7F2` = **1.18:1**. Fails SC 1.4.11 (3:1 for non-text UI components). Card / Input / Select / KpiTile lose a discoverable boundary for low-vision users. | Bump `--border` HSL to ≈`hsl(33 28% 75%)` (`#C9BEA8`, ≥3:1 vs cream), or add a stronger `--border-strong` token used by primitives and keep the lighter one for decorative dividers. |
| H3 | (subsumed by H2) Card `shadow-card` is decorative + sand border barely visible — combined effect is invisible card edge on cream. | n/a | Once `--border` lifts to ≥3:1 the card edge anchors; alternatively raise `--shadow-card` opacity from 0.5 to 0.75. |
| H4 | `apps/web/public/og/default.png` (416 bytes, 1-bit colormap PNG) | ImageMagick fallback rendered the OG as 1-bit black/white, not a teal block. Social shares render as a 2-colour placeholder. | Regenerate via a different tool (Satori is the planned pipeline; in the meantime use `magick -size 1200x630 -define png:color-type=2 xc:'#134E4A' default.png` or hand-author a flat-colour PNG export). |
| H5 | `apps/web/src/locales/en.json:18` + `th.json:18` (`home.heroHeading`) | Orphan key — no source path calls `t('home.heroHeading')` post-refactor. Risk: copy editors update a dead key thinking it's live. | Remove from both locales. |
| H6 | `apps/web/src/components/layout/editorial-hero.tsx:5` (`TRUST_KEYS`) | The 3-element tuple duplicates the structure of `home.trust.*` in the locale JSON. Adding a fourth trust bullet requires touching both files. | Derive at runtime from `Object.keys(t('home.trust'))`, or use the typed-key trick `(['pdpa', 'thaiFirst', 'noLockIn'] as const).map(k => t(\`home.trust.${k}\`))` from a shared constants module. |
| H7 | `apps/app/src/components/ui/alert-dialog.tsx:31` + `apps/app/src/components/{feedback-button,dev-toolbar}.tsx` | Three components still use `shadow-lg` (Tailwind default cool grey) instead of the new `shadow-popover` (warm cream) token. Visual inconsistency on the new cream surface. | Swap `shadow-lg` → `shadow-popover` in all three. |

### MEDIUM

| # | File:Line | Issue |
|---|---|---|
| M1 | `packages/ui-tokens/src/css/tokens.css` (`.dark` block) | Missing dark variants for `--success-foreground`, `--warning-foreground`, `--destructive-foreground`, `--info-foreground`, `--ring`. Light-mode values bleed. Pilot is light-only but the `.dark` class is wired. |
| M2 | `packages/ui-tokens/src/css/tokens.css` (`.dark`) | `--radius-card` not re-declared in `.dark`. Inconsistent with `--shadow-card` which IS re-declared. |
| M3 | `apps/app/src/components/ui/dialog.tsx:48` (`sm:rounded-card`) | Dialog uses sharp corners on `<sm`. All other surfaces (`Card`, `SelectableCard`, `EmptyState`) use unconditional `rounded-card`. Confirm intent (mobile-sheet feel?) or drop the `sm:` prefix. |
| M4 | `apps/web/src/components/layout/editorial-hero.tsx:39` (`<Button disabled aria-disabled="true">`) | Redundant — native `disabled` already sets `aria-disabled`. Misleading — readers assume the two can diverge. Drop `aria-disabled`. |
| M5 | `packages/ui-tokens/src/css/fonts.css:9` | Single `@import` loads Playfair + Inter + Noto Sans Thai + JetBrains Mono unconditionally on every page. Mono is only needed on backoffice receipts/IDs; marketing site never touches it. Consider splitting per-app or `font-display: optional` for Mono. |
| M6 | `apps/{app,web}/src/components/ui/card.tsx` | Byte-for-byte identical files in two apps. Edited in sync this commit; next maintainer may forget. Promote to `packages/ui-components`. |
| M7 | `apps/app/src/components/ui/{input,select,textarea,tabs}.tsx` | Form controls keep `shadow-sm` (Tailwind default). Acceptable for form controls but inconsistent with the "all shadows via CSS vars" intent. Fold into a `--shadow-input` or accept as a deliberate utility-shadow exception with a comment. |
| M8 | `apps/web/src/components/layout/editorial-hero.tsx` | No unit/component test for structure. Build smoke checks strings, not DOM (eyebrow `<p>`, h1 with italic span, hr rule, trust strip ul). |
| M9 | `packages/ui-tokens/src/css/tokens.css:49-50` | Shadow tokens use literal HSL values rather than referencing `--background`. If cream tint shifts, shadow needs a manual update. |
| M10 | `packages/ui-tokens/src/tailwind-preset.ts` | `boxShadow.popover` semantic name is overloaded — used by both `Sheet` and `Dialog` neither of which are popovers. Minor naming confusion. |
| M11 | `packages/ui-tokens/src/css/tokens.css:55,68` | `TODO(B4)` free-floating comment with no linked ticket — common smell. |

### LOW

| # | File:Line | Issue |
|---|---|---|
| L1 | `apps/web/public/favicon.svg:3` | `<text y="58%">` has no `dominant-baseline` — cross-platform 2-3 px shift. Add `dominant-baseline="central"`. |
| L2 | `packages/ui-tokens/src/css/tokens.css` (`--muted-foreground`) | `#78716C` on cream = 4.55:1 — razor-thin AA. Any future palette tweak risks failing. |
| L3 | `apps/web/src/components/layout/editorial-hero.tsx` | Placement in `components/layout/` is defensible (page-section layout) but home-only. Convention puts home-specific JSX in `pages/`. |
| L4 | `apps/{app,web}/index.html:8` | `<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />` — earlier audit flagged this as added; both apps now consistent. |
| L5 | `packages/ui-tokens/src/css/tokens.css:46` | `.dark { --background: 222 47% 11% }` is plain slate-900. Brand v2 dark could lean warmer (e.g. very dark espresso) to keep the editorial vibe. Defer to B4 dark pass. |

## Validation Results
| Check | Result |
|---|---|
| Typecheck | Pass — 7/7 |
| Lint | Pass — 0/0 |
| Tests | Pass — web 18 + app 19 = 37 |
| Build | Pass — both dist outputs OK |

## Files Reviewed
- All 21 changed files in commit `ab4375b`
- Cross-checked against prior reviews to confirm no regressions on FormError / focus ring / Sidebar 44px / Dialog close 44x44 / Lang toggle / SelectableCard aria-pressed / KpiTile sr-only status — all preserved.

## Decision
**REQUEST CHANGES.** 7 HIGH issues. Pilot-blocking subset:
- H1 (terracotta text contrast — 3.05:1 fails AA)
- H2 (sand border invisible — 1.18:1 fails SC 1.4.11)
- H4 (OG png broken — 1-bit, not teal)
- H5 (orphan `heroHeading` keys)
- H7 (`shadow-lg` stragglers in alert-dialog / feedback-button / dev-toolbar)

Improvement HIGH (acceptable to fold into a follow-up):
- H3 (subsumed by H2)
- H6 (`TRUST_KEYS` derivation — small refactor)

MEDIUM dark-mode token holes (M1–M2) belong in the B4 dark pass per the
existing TODO. Other MEDIUMs are deferrable.
