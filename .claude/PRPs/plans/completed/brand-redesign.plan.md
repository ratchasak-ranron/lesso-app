# Plan: Lesso Brand Redesign — Editorial Premium

## Summary
Brand-new visual identity across `apps/app` (backoffice) + `apps/web`
(marketing). Replace the current cool-cyan + Figtree palette with a warm,
editorial premium look: deep teal primary + terracotta accent + sage CTA on a
warm-cream canvas, Playfair Display headings paired with Inter body. Touches
shared `packages/ui-tokens` once and propagates to both apps via the existing
preset + CSS-variable architecture. No structural component changes — only
tokens, primitives' radius/shadow tweaks, hero rewrite for the marketing
home, and one new editorial layout component.

## User Story
As a clinic owner browsing `lesso.clinic` or running the backoffice on a
front-desk tablet, I want the product to feel like a premium medical spa
brand — calm, warm, editorial — instead of a generic cool-cyan SaaS, so
trust is earned at first glance.

## Problem → Solution
Current palette + fonts read as utilitarian SaaS (cyan + neutral
sans-sans). Aesthetic clinics live in a beauty-meets-healthcare space that
benefits from warmth + editorial type. → Single-source rebrand via
`@lesso/ui-tokens` flips both apps simultaneously; primitives gain warmer
shadow + larger radius for spa-feel; marketing home leads with an
editorial italic-accent hero.

## Metadata
- **Complexity**: Medium-Large
- **Source**: `design-system/lesso-brand-v2/MASTER.md` + tokens-audit subagent report
- **Estimated Files**: ~25 modified, 1 created

---

## UX Design

### Before (web home)
```
┌─────────────────────────────────────────┐
│   Lesso        TH/EN                    │
├─────────────────────────────────────────┤
│                                         │
│           Hello, Lesso                  │
│         Less cost. More care.           │
│         [Pilot — coming soon]           │
│                                         │
└─────────────────────────────────────────┘
cool cyan #0891B2 + Figtree, centered, generic SaaS
```

### After (web home — editorial hero)
```
┌────────────────────────────────────────────────┐
│   Lesso                          TH/EN         │
├────────────────────────────────────────────────┤
│  PREMIUM CARE · NATURE DISTILLED  ─ terracotta │
│                                                │
│  Less cost.                                    │
│  More care.   ← italic Playfair                │
│  ─────                                         │
│                                                │
│  Aesthetic clinic backoffice that frees        │
│  you to focus on the work that matters.        │
│                                                │
│  [ Join the pilot — free 30 days ]   teal CTA  │
│  · PDPA compliant · Thai-first · No lock-in    │
│                                                │
└────────────────────────────────────────────────┘
warm cream bg, Playfair italic accent, terracotta eyebrow,
deep-teal CTA, left-anchored editorial spacing
```

### Interaction Changes
| Touchpoint | Before | After |
|---|---|---|
| Brand colour | Cyan #0891B2 | Deep teal #134E4A |
| Page bg | Cyan-50 #ECFEFF | Warm cream #FAF7F2 |
| Heading font | Figtree (sans) | Playfair Display (serif, italic accent) |
| Body font | Noto Sans | Inter |
| Card radius | 12px (rounded-xl) | 16px (rounded-card) |
| Card shadow | `shadow-sm` cool grey | `shadow-card` warm-cream tinted |
| Status alert | Yellow warning border | unchanged (still warning token) |
| theme-color (PWA) | #0891B2 | #134E4A |

---

## Mandatory Reading

| Priority | File | Why |
|---|---|---|
| P0 | `design-system/lesso-brand-v2/MASTER.md` | Persisted source of truth |
| P0 | `packages/ui-tokens/src/css/tokens.css` | All CSS variables — primary migration target |
| P0 | `packages/ui-tokens/src/css/fonts.css` | Font import — full rewrite |
| P0 | `packages/ui-tokens/src/tailwind-preset.ts` | fontFamily + radius + shadow tokens |
| P1 | `apps/app/src/components/ui/{card,selectable-card,dialog,empty-state}.tsx` | rounded + shadow class swaps |
| P1 | `apps/web/src/pages/home.tsx` | Hero rewrite |
| P1 | `apps/web/src/components/ui/card.tsx` | Same card changes (duplicated file) |
| P2 | `apps/{app,web}/index.html` | `<meta name="theme-color">` swap |

---

## Patterns to Mirror

### TOKEN_SHAPE (existing)
```css
/* SOURCE: packages/ui-tokens/src/css/tokens.css */
:root {
  --primary: 192 91% 36%;          /* HSL — cyan now, teal after */
  --primary-foreground: 0 0% 100%;
  --background: 183 100% 96%;
  --foreground: 192 49% 23%;
  --radius: 0.5rem;                /* 8px — keep for buttons */
  /* …same shape, new values */
}
```

### TAILWIND_PRESET (existing)
```ts
// SOURCE: packages/ui-tokens/src/tailwind-preset.ts
fontFamily: {
  sans: ['Noto Sans', 'system-ui', 'sans-serif'],
  heading: ['Figtree', 'Georgia', 'serif'],
  mono: ['JetBrains Mono', 'monospace'],
},
borderRadius: {
  lg: 'var(--radius)',
  md: 'calc(var(--radius) - 2px)',
  sm: 'calc(var(--radius) - 4px)',
},
```

### NEW_TOKENS (additions)
```css
/* Add to tokens.css */
--radius-card: 1rem;   /* 16px — Card, KpiTile, SelectableCard, Dialog */
--shadow-card: 0 2px 12px 0 hsl(36 53% 85% / 0.5);
--shadow-popover: 0 4px 24px 0 hsl(36 53% 80% / 0.4);
```

### CARD_RADIUS_MIGRATION (sample)
```tsx
// SOURCE: apps/app/src/components/ui/card.tsx:8 (current)
className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)}

// AFTER
className={cn('rounded-card border bg-card text-card-foreground shadow-card', className)}
```

### EDITORIAL_HERO (new pattern)
```tsx
// SOURCE: NEW — apps/web/src/components/layout/editorial-hero.tsx
<section className="relative overflow-hidden bg-background">
  <div className="mx-auto max-w-4xl px-6 py-24 md:py-36">
    <p className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
      {t('home.eyebrow')}
    </p>
    <h1 className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-7xl">
      {t('home.heroLine1')}
      <br />
      <span className="italic font-normal">{t('home.heroLine2')}</span>
    </h1>
    <hr className="mt-8 w-16 border-t-2 border-secondary" />
    <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-muted-foreground md:text-xl">
      {t('home.heroSubheading')}
    </p>
    <div className="mt-10 flex flex-wrap items-center gap-4">
      <Button size="lg" disabled aria-disabled="true">
        {t('home.pilotComingSoonCta')}
      </Button>
    </div>
    <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
      <li className="inline-flex items-center gap-1.5">{/* check icon */} {t('home.trust.pdpa')}</li>
      <li className="inline-flex items-center gap-1.5">{t('home.trust.thaiFirst')}</li>
      <li className="inline-flex items-center gap-1.5">{t('home.trust.noLockIn')}</li>
    </ul>
  </div>
</section>
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `packages/ui-tokens/src/css/tokens.css` | UPDATE | All HSL values + add 3 new tokens |
| `packages/ui-tokens/src/css/fonts.css` | UPDATE | Drop Figtree + Noto Sans (Latin). Add Playfair Display + Inter. Keep Noto Sans Thai + JetBrains Mono. |
| `packages/ui-tokens/src/tailwind-preset.ts` | UPDATE | `fontFamily.heading` + `.sans`; add `borderRadius.card` + `boxShadow.{card,popover}` |
| `apps/app/index.html` | UPDATE | `theme-color` `#0891B2` → `#134E4A` |
| `apps/web/index.html` | UPDATE | same |
| `apps/app/src/components/ui/card.tsx` | UPDATE | `rounded-xl` → `rounded-card`; `shadow-sm` → `shadow-card` |
| `apps/web/src/components/ui/card.tsx` | UPDATE | same |
| `apps/app/src/components/ui/selectable-card.tsx` | UPDATE | `rounded-xl` → `rounded-card` |
| `apps/app/src/components/ui/dialog.tsx` | UPDATE | `sm:rounded-lg` → `sm:rounded-card`; `shadow-lg` → `shadow-popover`; overlay `bg-black/50` → `bg-foreground/40` |
| `apps/app/src/components/ui/sheet.tsx` | UPDATE | `shadow-lg` → `shadow-popover`; overlay tweak |
| `apps/app/src/components/ui/empty-state.tsx` | UPDATE | `rounded-lg` → `rounded-card` |
| `apps/web/src/pages/home.tsx` | UPDATE | Replace hero JSX with editorial layout (uses `EditorialHero` or inline) |
| `apps/web/src/components/layout/editorial-hero.tsx` | CREATE | Reusable hero with eyebrow + italic accent + trust strip |
| `apps/web/src/locales/en.json` | UPDATE | Add `home.eyebrow`, `home.heroLine1`, `home.heroLine2`, `home.heroSubheading` (rewrite), `home.trust.{pdpa,thaiFirst,noLockIn}` |
| `apps/web/src/locales/th.json` | UPDATE | Same keys |
| `apps/app/src/components/ui/button.tsx` | UNCHANGED | Token-driven; `rounded-md` (8px) stays — buttons should NOT pick up the new 16px radius |
| `apps/app/src/components/{sidebar,top-bar,bottom-tab-bar,mobile-nav,page-shell,page-header,feedback-button}.tsx` | UNCHANGED | All token-driven; new colours flow automatically |
| `apps/app/src/components/ui/{badge,kpi-tile,sparkline,form-feedback,input,label,select,progress,skeleton,tabs,textarea}.tsx` | UNCHANGED | Token-driven |
| `apps/web/src/components/layout/{root-layout,site-header,site-footer}.tsx` | UNCHANGED | Token-driven |
| `apps/app/src/styles/globals.css` | UNCHANGED | Imports tokens.css + fonts.css; no rule changes |
| `apps/web/src/styles/globals.css` | UNCHANGED | same |

## NOT Building

- Logo redesign (wordmark in Playfair handles it)
- Photography / illustration — hero ships without an image; B2 brings in real
  photography per the marketing PRD
- Dark mode polish — brand-v2 dark variants captured in `tokens.css` but a
  manual contrast pass at every screen is deferred (light mode is the
  primary surface for the pilot)
- Recharts upgrade for sparklines — token re-skin is enough
- New icons — Lucide stays
- Logo SVG / favicon (current cyan letter mark stays — wordmark is the brand
  carrier; favicon refresh is a B4 polish task)

---

## Step-by-Step Tasks

### T1: tokens.css rewrite
- ACTION: Update `packages/ui-tokens/src/css/tokens.css` light + dark blocks per the token diff in the audit (primary teal, secondary terracotta, background cream, text slate-800, muted/accent warm off-white, border sand). Add `--radius-card`, `--shadow-card`, `--shadow-popover`.
- MIRROR: TOKEN_SHAPE
- VALIDATE: `pnpm --filter @lesso/ui-tokens typecheck` (no ts here, just css — visual check); `pnpm build` produces same dist size.

### T2: fonts.css rewrite
- ACTION: Replace the `@import url(...)` line in `packages/ui-tokens/src/css/fonts.css` to load `Playfair+Display:ital,wght@0,400;0,600;0,700;1,400 + Inter:wght@300;400;500;700 + Noto+Sans+Thai:wght@300;400;500;700 + JetBrains+Mono:wght@400`.
- VALIDATE: `pnpm --filter @lesso/web build` succeeds; `view-source dist/en.html` references Playfair + Inter.

### T3: Tailwind preset
- ACTION: Update `packages/ui-tokens/src/tailwind-preset.ts`:
  - `fontFamily.sans = ['Inter', 'Noto Sans Thai', 'system-ui', 'sans-serif']`
  - `fontFamily.heading = ['Playfair Display', 'Georgia', 'serif']`
  - `borderRadius`: add `card: 'var(--radius-card)'`
  - `boxShadow`: add `card: 'var(--shadow-card)'`, `popover: 'var(--shadow-popover)'`
- VALIDATE: `pnpm typecheck` clean; tailwind compiles in both apps.

### T4: Card primitives radius + shadow
- ACTION: In `apps/app/src/components/ui/card.tsx` and `apps/web/src/components/ui/card.tsx`, swap `rounded-xl` → `rounded-card` and `shadow-sm` → `shadow-card`.
- ACTION: In `apps/app/src/components/ui/selectable-card.tsx`, swap `rounded-xl` → `rounded-card`.
- ACTION: In `apps/app/src/components/ui/dialog.tsx`, swap `sm:rounded-lg` → `sm:rounded-card`, `shadow-lg` → `shadow-popover`, overlay `bg-black/50` → `bg-foreground/40`.
- ACTION: In `apps/app/src/components/ui/sheet.tsx`, swap `shadow-lg` → `shadow-popover`, overlay tweak.
- ACTION: In `apps/app/src/components/ui/empty-state.tsx`, swap `rounded-lg` → `rounded-card`.
- GOTCHA: Buttons keep `rounded-md` (8px) — DO NOT change `button.tsx`. The 16px radius is for surface containers; buttons stay tighter to feel actionable.
- VALIDATE: `pnpm typecheck` + visual smoke at 1024px (apps/app home) — KpiTiles + walk-in queue cards + audit table look softer.

### T5: theme-color
- ACTION: Update `<meta name="theme-color" content="#0891B2">` → `#134E4A` in both `apps/app/index.html` + `apps/web/index.html`.
- VALIDATE: Mobile preview shows the new colour in the URL bar.

### T6: Editorial hero component + locale strings
- ACTION: Create `apps/web/src/components/layout/editorial-hero.tsx` per snippet above. Add `home.eyebrow`, `home.heroLine1`, `home.heroLine2`, `home.heroSubheading` (rewrite to be more concrete than the current placeholder), `home.trust.{pdpa,thaiFirst,noLockIn}` keys to en.json + th.json.
- IMPORTS: `Button`, `Check` from lucide for trust-bullet bullet, `useResolvedLocale`.
- GOTCHA: trust strip uses inline `<Check className="size-3.5">` for the bullet — no emoji.
- VALIDATE: `pnpm --filter @lesso/web build` + visit `/en` and `/th`. H1 renders Playfair, second line italic.

### T7: Wire editorial hero into home
- ACTION: Replace the current centred `<section>` in `apps/web/src/pages/home.tsx` with `<EditorialHero />`. Keep `<PageSeo>` + `<JsonLd>` calls.
- VALIDATE: Build smoke test still passes (4/4); visual smoke of `/en` shows new hero.

### T8: SEO meta refresh
- ACTION: Bump `meta.home.title` + `meta.home.description` in en.json + th.json to match new positioning ("Less cost. More care." — keep, but lengthen description so the OG card reads better).
- VALIDATE: `dist/en.html` `<meta name="description">` updated.

### T9: Validate + commit + push
- ACTION: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Visual smoke at 375 / 768 / 1024 / 1440 on apps/app home + audit + patient-detail; on apps/web `/en` + `/th`.
- VALIDATE: All green; bundle ≤ 5% delta vs baseline.

---

## Testing Strategy

### Visual smoke (manual)
- [ ] apps/app home renders with warm cream bg, KpiTile values in Playfair, body in Inter
- [ ] apps/app patient detail card uses rounded-card + warm shadow
- [ ] apps/app dialog (consent / redeem) uses softer overlay + rounded-card
- [ ] apps/web /en hero shows: terracotta eyebrow → Playfair h1 (line 2 italic) → terracotta rule → Inter body → teal CTA → trust strip
- [ ] apps/web /th hero same with Thai content
- [ ] mobile (375px) — hero stacks correctly, no horizontal scroll

### Unit tests
- Existing tests stay green — token swap is non-functional.
- No new tests needed for T6 (component is layout-only, tokens covered by build smoke).

### Build smoke (web)
- [ ] `pnpm --filter @lesso/web test:build` — 4/4 pass
- [ ] `dist/en.html` Playfair Display in `<link rel="stylesheet">`
- [ ] `dist/th.html` same

---

## Validation Commands
```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm --filter @lesso/app dev   # manual smoke
pnpm --filter @lesso/web dev   # manual smoke
```
EXPECT: All green. Bundle delta ≤5%.

---

## Acceptance Criteria
- [ ] `tokens.css` ships new palette (light + dark)
- [ ] `fonts.css` loads Playfair Display + Inter (no Figtree, no Noto Sans Latin)
- [ ] Tailwind preset has `borderRadius.card` + `boxShadow.card` + `boxShadow.popover`
- [ ] Card / SelectableCard / Dialog / Sheet / EmptyState use new radius + shadow
- [ ] Both apps' `theme-color` updated to teal
- [ ] apps/web home renders editorial hero (eyebrow + italic accent + rule + trust strip)
- [ ] No regression: typecheck + lint + tests + build all green
- [ ] No structural component changes (only colours / fonts / radius / shadow)

## Risks
| Risk | L | I | Mitigation |
|---|---|---|---|
| Playfair Display Thai render — fallback to Noto Sans Thai for Thai pages | M | M | `fontFamily.heading` chains `Playfair Display, Noto Sans Thai, Georgia, serif` — Thai chars hit the Noto fallback while latin renders Playfair |
| Warm-cream bg too low contrast under Lighthouse — text on `#FAF7F2` | L | M | Token diff sets text to slate-800 `#1E293B` against cream — measured 13:1, well above WCAG AAA |
| Cards lose hierarchy with no shadow → use `--shadow-card` | L | L | Shadow defined as warm cream tint, visible against cream bg without screaming |
| Dark mode contrast — primary `#134E4A` on dark bg | M | M | Dark mode primary swaps to `#4DB6AC` (lighter teal); flagged in tokens.css comment for future audit |
| Bundle size delta from font swap | L | L | Inter + Playfair are similar weight to Figtree + Noto Sans; expect ≤5 KB delta |

## Notes
- Why this palette: Aesthetic clinic = beauty + healthcare. Cool cyan reads
  too clinical/SaaS. Terracotta + sage + cream gets the spa warmth without
  losing the calm/trustworthy primary.
- Why Playfair Display: editorial luxury serif, free, well-supported, has an
  italic that creates a clear voice for marketing headlines without needing
  custom typography.
- Why italic only on hero second line: visual rhythm — sets Lesso's voice
  without applying italics to operational dashboard headings (where it would
  reduce density-readability).
- Buttons stay 8px: 16px radius reads pillow-y on action elements; tighter
  buttons feel decisive against the soft surfaces.
- All token-driven primitives (Badge, Input, Select, Progress, etc.) flow
  the new colours without code changes — that's the single-source rebrand
  pattern paying off.
