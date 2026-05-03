# Reinly Design System — v2 (Soft Modern)

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Reinly
**Generated:** 2026-05-03 (v2 redesign)
**Category:** Healthcare SaaS — small-clinic backoffice
**Tokens source of truth:** [`packages/ui-tokens/src/css/tokens.css`](../../packages/ui-tokens/src/css/tokens.css)

---

## Brand Essence (v2)

> **Soft modern. One bold accent.**
> Clean white surfaces, indigo signature, per-section color memory.

The visual identity is *modern product* — Linear / Vercel / Notion sensibility with section-accent color rotation for memorability. Body content stays neutral (zinc-950 on white) so colored accents read as deliberate signal, not noise.

---

## Core Palette

| Role | Hex | Usage | Contrast on bg |
|------|-----|-------|---------------|
| Background | `#FAFAFA` | App + web body bg | — |
| Card | `#FFFFFF` | Cards, popovers, dialogs | — |
| Foreground | `#09090B` | Body text, primary text | 20.6 : 1 AAA |
| Muted-fg | `#71717A` | Descriptions, captions | 4.6 : 1 AA |
| Border | `#E4E4E7` | Card edges, input borders | UI-only |
| **Primary** | `#6366F1` | Brand action, hero CTA, focus ring | 4.6 : 1 AA |
| Success | `#059669` | Success states, trust check, positive deltas | 4.7 : 1 AA |
| Warning | `#D97706` | Warning states (low-stock alerts) | 4.5 : 1 AA |
| Destructive | `#E11D48` | Errors, destructive actions | 5.1 : 1 AA |

## Section Accents (memorability)

Each primary section gets a signature color. Used for: nav active state, KPI tile dot + icon chip, eyebrow on web, left-border on banners. Body text + cards stay neutral.

| Section | Token | Surface | Text-safe (`-ink`) | Soft wash (`-soft`) |
|---|---|---|---|---|
| Today | **indigo** | `#6366F1` | `#4F46E5` (5.4:1) | `#EEF2FF` |
| Patients | **sky** | `#0EA5E9` | `#0284C7` (4.6:1) | `#F0F9FF` |
| Appointments / Branches | **emerald** | `#10B981` | `#059669` (4.7:1) | `#ECFDF5` |
| Courses | **violet** | `#A855F7` | `#7C3AED` (5.5:1) | `#FAF5FF` |
| Walk-in | **amber** | `#F59E0B` | `#D97706` (4.5:1) | `#FFFBEB` |
| Inventory | **rose** | `#F43F5E` | `#E11D48` (5.1:1) | `#FFF1F2` |
| Reports / Audit | **zinc** | `#3F3F46` | `#09090B` | `#F4F4F5` |

**Color rules:**
- Bare token (`bg-indigo`) = surface fill — dots, dot-indicator pills, KPI border-l, decorative chips.
- `-ink` variant = text-safe — use whenever color sits on text.
- `-soft` variant = wash bg — behind icon chips (`bg-indigo-soft + text-indigo-ink`), active nav-item, badges.
- Featured pricing tier uses **indigo** primary (border + filled badge).
- Web feature grid rotates **indigo → sky → emerald → violet** across the 4 home cards (1 accent per card).
- Never use bright neon, AI gradients, or healthcare-blue cliché.

## Typography

- **Latin (heading + body):** Geist (Vercel's open-source UI typeface)
- **Thai (heading + body):** IBM Plex Sans Thai Looped (loop-style for Thai readability)
- **Mono:** Geist Mono — receipts, IDs, audit values

Single-family Latin: heading and body use the same font, differentiated by weight (semibold/medium) and tracking (`-0.03em` to `-0.04em` on display sizes). No serif.

CSS load: `<link rel="stylesheet">` in `apps/{app,web}/index.html` + defensive `@import` in [`packages/ui-tokens/src/css/fonts.css`](../../packages/ui-tokens/src/css/fonts.css).

### Type scale (display / heading)

| Use | Size | Weight | Tracking |
|---|---|---|---|
| Hero h1 | `text-7xl` → `text-8xl` | `font-semibold` | `-0.04em` |
| Page intro h1 | `text-6xl` → `text-7xl` | `font-semibold` | `-0.03em` |
| Section h2 | `text-4xl` → `text-5xl` | `font-semibold` | `-0.025em` |
| Card title | `text-base` → `text-lg` | `font-semibold` | `-0.01em` |
| KPI value | `text-3xl` | `font-semibold tabular-nums` | `-0.01em` |
| Body | `text-base` | `font-normal` | normal |
| Eyebrow | `text-xs` | `font-semibold uppercase` | `0.18em` |

## Radii

- `--radius` `12px` — buttons (`rounded-lg` ≈ 12px)
- `--radius-input` `10px` — text inputs
- `--radius-card` `20px` — Card / KpiTile / Dialog
- Section-accent dot: `rounded-full`, 6px (`size-1.5`)
- Icon chip: `rounded-xl` (12px) or `rounded-lg` (10px)

## Shadows

- `shadow-card` — soft layered (1px ambient + 2-3px diffuse) for surfaces
- `shadow-popover` — taller layered (24px) for menus/dialogs
- `shadow-hover` — bumped layer for interactive cards on hover

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Tight inline groups (eyebrow dot to label) |
| `gap-2` | 8px | Icon → text in nav-item |
| `gap-3` | 12px | Sidebar item padding-left |
| `p-5` | 20px | KPI tile padding |
| `p-6` → `p-8` | 24–32px | Cards, dialog body |
| `py-20 md:py-28` | 80–112px | Section vertical rhythm |

---

## Web Marketing Hero Pattern

- Center-anchored. Pill eyebrow with indigo dot. Massive type (5xl→8xl). Indigo accent rule. Single primary CTA. Trust strip checks in emerald.
- Subtle radial gradient glow (indigo-soft) sits behind hero — not a "AI gradient", just one soft blur.
- No competing CTAs. Primary action is **Join the pilot**.

## App Dashboard Pattern

- Sidebar 60w, `R` mark in indigo square + brand name. Nav items: 18px icon + medium label, active = soft section bg + ink text + bolder icon stroke.
- Bottom tab (`<sm`): top-pill indicator filled with section color (8px wide × 4px tall) when active.
- Today KPI tiles: dot + uppercase muted label · big tabular value · soft-bg icon chip in section color · optional trend sparkline.
- Page heading: section eyebrow with section dot, then h2 in semibold tracking-tight.

---

## Anti-Patterns (Do NOT Use)

- ❌ Serif fonts (no Playfair, no italic accent — single-family Latin)
- ❌ Big multi-color hero gradients (one subtle radial glow only)
- ❌ Section accents on body text or large surfaces (chips/dots/borders only)
- ❌ Mixed icon weight on one screen (active = 2.25, default = 1.75)
- ❌ Round-scale hover transforms (use shadow change, not `scale`)
- ❌ Healthcare-blue cliché (no `#0891B2` cyan, no medical-cross)
- ❌ Per-tier upsell language ("Unlock", "Premium", "Enterprise")
- ❌ Emojis as icons — use SVG (Lucide)
- ❌ Low contrast text — maintain 4.5:1 minimum
- ❌ Instant state changes — always 150–300ms transitions
- ❌ Invisible focus states — focus rings must be visible

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] Geist + IBM Plex Sans Thai Looped both load (browser inspect → DOM fonts loaded)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Focus rings visible on all interactive elements (2px ring + 2px offset)
- [ ] Text contrast 4.5:1 minimum (use `-ink` variants for text on color)
- [ ] Section accent applied to nav active + KPI tile dot
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
- [ ] No emojis used as icons (use SVG instead)
- [ ] `prefers-reduced-motion` respected
