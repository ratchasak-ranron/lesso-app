# Design System Master File — Reinly

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Reinly
**Generated:** 2026-05-02
**Category:** Healthcare SaaS — small-clinic backoffice
**Brand source of truth:** [`docs/marketing/reinly.md`](../../docs/marketing/reinly.md)

---

## Brand Essence

> **Clinic software, distilled.**
> Quiet, fair, complete. Less, on purpose.

The visual identity is *thoughtful product*, not *generic healthcare*. Avoid medical-cross / stethoscope / aggressive blue gradients. Lean editorial-warm: bone paper background, slate ink, sage accent, clay used only for urgent signals.

---

## Global Rules

### Color Palette

Runtime tokens live in [`packages/ui-tokens/src/css/tokens.css`](../../packages/ui-tokens/src/css/tokens.css). Hex values shown with contrast notes.

| Role | Hex | Usage | Contrast on bone |
|------|-----|-------|-------|
| Bone (background) | `#F5F2EC` | Body bg — paper feel | — |
| Cream (cards) | `#FAF7F1` | Card surfaces, warmer than bone | — |
| Mist (muted) | `#E6E2DA` | Dividers, subtle surfaces | UI-only |
| Slate ink (foreground + primary) | `#1F2328` | Body text, primary action | 14.6 : 1 AAA |
| Sage (secondary + success) | `#5A7060` | Text-safe accent, success | 4.6 : 1 AA |
| Brand sage (surface fill) | `#9CAE9F` | Decorative fill / badges only | not text-safe |
| Clay (destructive) | `#A85F3F` | Errors, urgent only | 5.0 : 1 AA |
| Border | `#A89E84` | Lines, input borders | 3.0 : 1 (UI) |

**Color rules:**
- Sage is the brand's calm/health signal — use for success, secondary actions, and editorial accents.
- Brand sage `#9CAE9F` is for fills only — never as text on bone.
- Clay is reserved for urgent errors. Use sparingly — quietness is the brand.
- Never use bright neon, AI gradients, or medical-blue.

### Typography

- **Heading:** Playfair Display (italic accent reserved for hero)
- **Body:** Inter
- **Body (Thai):** Noto Sans Thai (auto-fallback chain)
- **Mono:** JetBrains Mono — receipts + ID values

**Brand-doc note:** humanist serifs (GT Sectra, Source Serif) are the long-term display direction. Playfair Display retained for now; font swap is a candidate follow-up rebrand pass.

CSS import lives in [`packages/ui-tokens/src/css/fonts.css`](../../packages/ui-tokens/src/css/fonts.css).

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` | Tight gaps |
| `--space-sm` | `8px` | Icon gaps, inline spacing |
| `--space-md` | `16px` | Standard padding |
| `--space-lg` | `24px` | Section padding |
| `--space-xl` | `32px` | Large gaps |
| `--space-2xl` | `48px` | Section margins |
| `--space-3xl` | `64px` | Hero padding |

### Radius

- `--radius` `8px` — buttons, inputs (decisive, tight)
- `--radius-card` `16px` — Card / KpiTile / Dialog (soft, calm)

### Shadow

Bone-tinted shadows preserve the warm surface feel without "cold SaaS" grey:

- `--shadow-card` — cards, buttons
- `--shadow-popover` — modals, dropdowns

---

## Voice & Tone

**Plain, warm, professional. Like a competent friend who happens to know clinics.**

| Reinly sounds like | Reinly doesn't sound like |
|---|---|
| "Schedule's set. See you tomorrow." | "🎉 Appointment successfully scheduled!" |
| "One price. No surprises." | "Contact sales for enterprise pricing!" |
| "Built for small clinics." | "The leading AI-powered healthcare platform!" |
| "Your data stays yours." | "Industry-leading data ecosystem!" |

**Writing rules:**
- Short sentences. Plain words.
- Talk to the doctor, the receptionist, the clinic owner — not "stakeholders."
- Never say "revolutionary," "AI-powered," "seamless," "robust."
- Localize properly. Thai users get real Thai, not Google Translate Thai.
- Default copy in patient-facing surfaces never mentions Reinly — the clinic is the brand to the patient.

---

## Page Pattern

**Pattern Name:** Editorial single-column, left-anchored

- Hero: eyebrow (sage, uppercase, tracked) → italic-accent serif headline → short rule → calm body → primary CTA → trust strip
- CTA Placement: above the fold, single primary
- Section Order: Hero → Problem/Solution → Features → Social proof → Pricing teaser → FAQ → Final CTA

---

## Anti-Patterns (Do NOT Use)

- ❌ Bright neon colors
- ❌ Motion-heavy animations
- ❌ AI purple/pink gradients
- ❌ Medical crosses, stethoscopes, EKG lines
- ❌ Aggressive blue "trust" gradients
- ❌ Per-tier upsell language ("Unlock", "Premium", "Enterprise")
- ❌ Emojis as icons — use SVG (Lucide / Heroicons)
- ❌ Layout-shifting hovers — color/opacity only
- ❌ Low contrast text — maintain 4.5:1 minimum
- ❌ Instant state changes — always 150–300ms transitions
- ❌ Invisible focus states — focus rings must be visible

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent set (Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
- [ ] Brand sage `#9CAE9F` never used as text on bone
- [ ] Clay `#C97F5C` reserved for urgent only (not decorative)
