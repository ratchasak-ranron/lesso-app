# Plan: B2 Core Pages

## Summary
Extend `apps/web` with the four public marketing pages (Home expanded,
Pricing, Features, About) under `/en` + `/th`. Lean on the existing
`EditorialHero` voice + the route-driven SEO injection from B1: each page
gets a `pageKey` in `vite.config.ts → pageForRoute`, matching translations
in `en/th.json`, JSON-LD where it adds value (Product on Pricing, FAQPage
on Home + Pricing). All copy via `useResolvedLocale.t`. No new runtime
dependencies — Satori OG image pipeline is OUT OF SCOPE (deferred to B4
polish per the PRD; one shared `/og/default.png` covers every page).

## User Story
As a clinic owner who landed on the editorial hero, I want concrete answers
to "what does it do?", "how much?", and "who built it?" before I commit to
the pilot — so I can make the call without scheduling a sales chat.

## Problem → Solution
B1 ships a hero + 404 only — visitors who scroll or click anywhere bounce.
→ B2 ships the full information funnel: Home (problem/solution + features
grid + social proof + pricing teaser + FAQ), Pricing (tier table + FAQ),
Features (5 sections with illustration slot), About (founder + mission +
vertical focus). Sitemap lists all 8 routes (4 pages × 2 locales).

## Metadata
- **Complexity**: Large
- **Source**: PRD Phase B2 + `design-system/lesso-brand-v2/MASTER.md`
- **Estimated Files**: ~22 created, 6 modified

---

## UX Design

### Site map (after B2)
```
/                     → 308 → /en
/en                   Home (expanded — hero + sections)
/en/pricing           Pricing
/en/features          Features
/en/about             About
/th                   Home (TH)
/th/pricing
/th/features
/th/about
```

### Page anatomy

#### Home (extended)
```
[ EditorialHero — already exists ]
[ Section: Problem / Solution ]   2-col on md+: pain bullets ↔ Lesso solves
[ Section: Features grid ]        4 cards (course / branches / LINE / AI)
[ Section: Social proof slot ]    "First clinics partnering" — placeholder
                                   logos until real ones land in B3
[ Section: Pricing teaser ]       single-card teaser → /pricing
[ Section: FAQ ]                  6 items, accordion; FAQPage JSON-LD
[ Section: Final CTA ]            "Join the pilot — free 30 days"
[ SiteFooter — already exists ]
```

#### Pricing
```
[ PageIntro — Playfair h1, terracotta eyebrow, sub-paragraph ]
[ PricingTable ]   3 tiers (Solo / Clinic / Group), monthly/annual toggle.
                   Pilot offer banner above table. Product JSON-LD.
[ FAQ — pricing-specific 5 items ]
[ Final CTA ]
```

#### Features
```
[ PageIntro ]
[ FeatureSection ] × 5  (course tracking, multi-branch, LINE-native,
                         AI assist, PDPA). Each: text col + illustration
                         slot col (alternating). Anchor IDs for cross-
                         linking from /pricing.
[ Final CTA ]
```

#### About
```
[ PageIntro ]
[ FounderCard ]   photo slot + bio (placeholder)
[ MissionStatement ]   pull-quote in Playfair italic
[ VerticalFocus ]   3 bullets — why aesthetic clinics specifically
[ Final CTA ]
```

### Interaction Changes
| Touchpoint | Before | After |
|---|---|---|
| `/en/pricing` | 404 | Tier table + FAQ |
| `/en/features` | 404 | 5-section breakdown |
| `/en/about` | 404 | Founder + mission |
| `<SiteHeader>` | brand logo + lang toggle only | adds `<nav>` with Home / Pricing / Features / About |
| FAQ accordion | absent | one per page, keyboard-navigable, Radix Accordion primitive |
| `/sitemap.xml` | 2 routes | 8 routes |

---

## Mandatory Reading

| Priority | File | Why |
|---|---|---|
| P0 | `apps/web/vite.config.ts` | `pageForRoute` registry — extend with 3 new keys |
| P0 | `apps/web/src/components/layout/{root-layout,site-header,site-footer,editorial-hero}.tsx` | Existing layout primitives to mirror voice |
| P0 | `apps/web/src/lib/{site-config,locale-utils,use-locale,i18n-dict}.ts` | t-function + locale derivation |
| P0 | `apps/web/src/locales/{en,th}.json` | Append page-level keys |
| P0 | `apps/web/src/routes.tsx` | Add 3 routes per locale |
| P0 | `apps/web/tests/build-output.test.ts` | Extend smoke checks |
| P1 | `apps/app/src/components/ui/{button,card}.tsx` | shadcn primitives — reference for any new ones |
| P1 | `design-system/lesso-brand-v2/MASTER.md` | Editorial premium tokens + voice |

## External Documentation

| Topic | Source | Takeaway |
|---|---|---|
| Schema.org Product | schema.org/Product | Required: name, description, brand, offers; optional: aggregateRating (skip — no reviews yet) |
| Schema.org FAQPage | schema.org/FAQPage | mainEntity[] with Question + acceptedAnswer Answer |
| Radix Accordion | radix-ui/primitives | `<Accordion type="single" collapsible>` — keyboard arrow nav baked in |

---

## Patterns to Mirror

### EDITORIAL_HERO (existing)
```tsx
// SOURCE: apps/web/src/components/layout/editorial-hero.tsx
<section className="bg-background">
  <div className="mx-auto max-w-4xl px-6 py-24 md:py-36">
    <p className="text-xs uppercase tracking-[0.2em] text-secondary">{eyebrow}</p>
    <h1 className="mt-6 font-heading text-5xl md:text-7xl">…</h1>
    …
  </div>
</section>
```

### SECTION_CONTAINER (new pattern)
```tsx
// Reusable section wrapper — same horizontal rhythm as the hero
<section aria-labelledby={id} className="border-t border-border bg-background">
  <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
    <p className="text-xs uppercase tracking-[0.2em] text-secondary">{eyebrow}</p>
    <h2 id={id} className="mt-4 font-heading text-3xl md:text-4xl">…</h2>
    …
  </div>
</section>
```

### FAQ_ACCORDION (new component)
```tsx
// Radix Accordion + Lucide ChevronDown. Items render question + answer.
// Pure component — caller passes the data array (locale-aware).
<Accordion type="single" collapsible>
  {items.map((item) => (
    <AccordionItem key={item.id} value={item.id}>
      <AccordionTrigger>{item.q}</AccordionTrigger>
      <AccordionContent>{item.a}</AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

### TIER_CARD (new)
```tsx
// SelectableCard-like but non-interactive — shadcn Card with a name +
// price + bullets list + CTA. Featured tier flagged via `featured` prop
// (border-primary + lift via shadow-popover).
```

### JSON_LD_PRODUCT (extend buildSeo)
```ts
// SOURCE: apps/web/vite.config.ts buildSeo
// New per-page: emit Product schema for `/pricing`, FAQPage for `/`
// + `/pricing`. Driven from `pageKey` lookup against locale dict.
```

---

## Files to Change

| File | Action |
|---|---|
| `apps/web/src/components/ui/accordion.tsx` | CREATE — wraps `@radix-ui/react-accordion` |
| `apps/web/src/components/marketing/page-intro.tsx` | CREATE — eyebrow + h1 + sub copy |
| `apps/web/src/components/marketing/section.tsx` | CREATE — generic `<section>` wrapper |
| `apps/web/src/components/marketing/faq.tsx` | CREATE — locale-driven accordion list |
| `apps/web/src/components/marketing/feature-section.tsx` | CREATE — alternating text/illustration |
| `apps/web/src/components/marketing/tier-card.tsx` | CREATE — pricing tier |
| `apps/web/src/components/marketing/final-cta.tsx` | CREATE — repeated bottom CTA block |
| `apps/web/src/components/layout/site-header.tsx` | UPDATE — add nav links |
| `apps/web/src/pages/home.tsx` | UPDATE — append sections after EditorialHero |
| `apps/web/src/pages/pricing.tsx` | CREATE |
| `apps/web/src/pages/features.tsx` | CREATE |
| `apps/web/src/pages/about.tsx` | CREATE |
| `apps/web/src/routes.tsx` | UPDATE — 3 new child routes per locale |
| `apps/web/vite.config.ts` | UPDATE — extend `pageForRoute` + add Product/FAQPage to `buildSeo`; sitemap `dynamicRoutes` |
| `apps/web/src/locales/en.json` | UPDATE — pricing/features/about/faq keys |
| `apps/web/src/locales/th.json` | UPDATE — same keys |
| `apps/web/src/components/marketing/{*.test.tsx}` | CREATE — smoke for FAQ + TierCard + Section |
| `apps/web/tests/build-output.test.ts` | UPDATE — assert all 8 prerendered HTML files + Product / FAQPage JSON-LD |
| `apps/web/package.json` | UPDATE — add `@radix-ui/react-accordion` |

## NOT Building

- Real photography / illustrations — every illustration slot ships a styled
  placeholder div (`bg-muted` + lucide icon). Real photo lands in B4
- Per-page Satori OG images — single shared `/og/default.png`
  (rebuild deferred to B4 alongside Lighthouse CI)
- Plausible analytics — B3
- Pilot signup form — B3
- Privacy / Terms — B3
- Real testimonials — placeholder copy only ("First clinics partnering")
- Blog scaffold — B4
- A/B framework — out of scope

---

## Step-by-Step Tasks

### T1: Add `@radix-ui/react-accordion` + Accordion primitive
- ACTION: `pnpm --filter @lesso/web add @radix-ui/react-accordion`. Create `apps/web/src/components/ui/accordion.tsx` mirroring shadcn Accordion (Root + Item + Trigger + Content), token-driven.
- MIRROR: `apps/app/src/components/ui/dialog.tsx` for the Radix wrapping pattern.
- VALIDATE: typecheck clean; component renders in a vitest smoke test (defer to T13).

### T2: Marketing primitives
- ACTION: Create `components/marketing/{section,page-intro,faq,feature-section,tier-card,final-cta}.tsx`.
- IMPLEMENT: Each is a layout-only component; copy props are typed but optional. `Section` accepts `id`, `eyebrow`, `heading`, `children`. `PageIntro` is a section variant for the top of non-Home pages — eyebrow + h1 + sub. `Faq` takes `items: Array<{ id, q, a }>` and renders Accordion. `TierCard` takes name/price/period/bullets/cta/featured. `FeatureSection` accepts `eyebrow/heading/body/illustration` (illustration is a `ReactNode` — pages pass a placeholder div). `FinalCta` is a `<section>` with the same shadow-card CTA pattern as the hero.
- IMPORTS: `Button`, `Accordion*`, `cn`, `Check` for tier bullets.
- GOTCHA: Keep `bg-background` on each section. Alternate `bg-muted` inside `<FeatureSection>` only when the variant prop is `'muted'` (page composes the rhythm).
- VALIDATE: render each in vitest under a router wrapper to confirm shape.

### T3: SiteHeader nav
- ACTION: Update `apps/web/src/components/layout/site-header.tsx`. Add a `<nav>` between brand logo + lang toggle, listing Home / Pricing / Features / About. On `<md` collapse to a Sheet (mirror app's `MobileNav`).
- IMPLEMENT: Use `useResolvedLocale().locale` to build hrefs (`/en/pricing` etc). Active link gets `aria-current="page"` via `useLocation().pathname.endsWith(href)`. Real anchors (not Link) so SSG-prerendered `<html lang>` stays correct on full-page nav.
- IMPORTS: `Sheet*` from a new `apps/web/src/components/ui/sheet.tsx` copied from apps/app.
- GOTCHA: Lang toggle still bottom of the Sheet on mobile. Don't break the existing `localeSwitchHref` logic.
- VALIDATE: nav visible at md+; hamburger triggers Sheet at <md.

### T4: Locale strings (en + th)
- ACTION: Append nav, pricing, features, about, faq, finalCta keys to both locale JSONs. Each page gets `meta.<page>.{title,description}` for SEO.
- IMPLEMENT: ~120 keys per locale. Mirror structure: `pricing.{intro,tiers[],faq[]}`, `features.{intro,sections[]}`, `about.{intro,founder,mission,verticalFocus[]}`, `home.{problemSolution,features,socialProof,pricingTeaser,faq,finalCta}`. Avoid free-form HTML — use plain strings + structural markup in TSX.
- GOTCHA: Thai pricing uses ฿; English uses THB. Keep prices identical numeric values; only currency display differs.
- VALIDATE: i18n-dict.test.ts smoke for at least one new key in both locales.

### T5: Pricing page
- ACTION: Create `apps/web/src/pages/pricing.tsx`. Compose `<PageIntro>` + 3 `<TierCard>`s in a grid + `<Faq>` + `<FinalCta>`. Inject `<PageSeo path="/pricing" />`.
- IMPLEMENT: Tiers driven by `t('pricing.tiers')` array. Featured tier ("Clinic") rendered with `featured` prop. Pilot banner is a `Section` variant above the grid: `eyebrow="Pilot offer"`, terracotta-tinted bg, copy from locale.
- VALIDATE: `/en/pricing` renders 3 tiers; price strings localised.

### T6: Features page
- ACTION: Create `apps/web/src/pages/features.tsx`. Compose `<PageIntro>` + 5 `<FeatureSection>`s + `<FinalCta>`.
- IMPLEMENT: Sections alternate `align: 'left' | 'right'` for the illustration slot. Illustration is a `bg-muted rounded-card` block with a Lucide icon centred (course → `GraduationCap`, branches → `Building2`, LINE → `MessageCircle`, AI → `Sparkles`, PDPA → `ShieldCheck`).
- VALIDATE: `/en/features` shows 5 sections, each with anchor ID matching its key (`#course`, `#branches`, …) so `/en/pricing` can deep-link.

### T7: About page
- ACTION: Create `apps/web/src/pages/about.tsx`. PageIntro + Founder card + MissionStatement + VerticalFocus + FinalCta.
- IMPLEMENT: Founder photo slot is a `bg-muted aspect-square rounded-card` placeholder (`<User />` icon). Mission is a Playfair italic blockquote with terracotta `border-l-4` accent. VerticalFocus is 3 cards in a grid.
- VALIDATE: `/en/about` renders.

### T8: Home extended sections
- ACTION: In `apps/web/src/pages/home.tsx`, after `<EditorialHero />`, append: ProblemSolution section, Features grid (4 condensed cards from features data), Social proof placeholder, Pricing teaser (1 tier card link to /pricing), FAQ (6 items), FinalCta.
- IMPLEMENT: Reuse `Section`, `Faq`, `TierCard`, `FinalCta`. Features grid uses 4 of the 5 keys from `t('features.sections')` (skip PDPA on home — it lives on /features).
- VALIDATE: `/en` scrollable from hero to FAQ to FinalCta.

### T9: Routes + sitemap
- ACTION: Update `apps/web/src/routes.tsx` to add `pricing`, `features`, `about` children under each locale parent. Update `apps/web/vite.config.ts`: extend `dynamicRoutes` for sitemap to all 8 routes; extend `ssgOptions.includedRoutes` from `[/en, /th]` to all 8.
- VALIDATE: `pnpm build` emits `dist/{en,th}{,/pricing,/features,/about}.html` (8 files); sitemap.xml lists all.

### T10: SEO + JSON-LD per page
- ACTION: Update `apps/web/vite.config.ts → pageForRoute`. Add page keys: `home`, `pricing`, `features`, `about`, `notFound`. Each maps to `meta.<page>.title/description` in dict.
- IMPLEMENT: In `buildSeo`, emit:
  - Always: Organization JSON-LD (existing, kept).
  - When pageKey === 'pricing': add Product schema (name = "Lesso", brand, offers from `pricing.tiers[].price`).
  - When pageKey === 'home' or 'pricing': add FAQPage schema reading `home.faq[]` / `pricing.faq[]` from the dict.
- GOTCHA: JSON-LD payload is per-locale. Read translations via the static dict directly (not a t-function — vite.config runs at build time). Escape JSON properly.
- VALIDATE: build smoke asserts each page's JSON-LD presence.

### T11: SiteHeader test (URL switch + active link)
- ACTION: Add `apps/web/src/components/layout/site-header.test.tsx`. Test active-link state at `/en/pricing` (Pricing has `aria-current="page"`); lang-toggle href correct at `/en/features` → `/th/features`.
- VALIDATE: tests pass.

### T12: Build-output smoke extension
- ACTION: Update `apps/web/tests/build-output.test.ts`. For each of the 8 generated HTMLs:
  - `<html lang>` matches locale
  - hreflang alternates exist (where indexed)
  - canonical URL matches the route
  - JSON-LD includes `Organization`; pricing+home include `FAQPage`; pricing includes `Product`
- VALIDATE: 4/4 → ~12/12 passing tests.

### T13: Marketing component tests
- ACTION: Add smoke tests for `Faq`, `TierCard`, `Section`, `PageIntro`. Render each with sample props under MemoryRouter; assert role + structure.
- VALIDATE: ≥6 new tests pass.

### T14: Validate full pipeline + commit + push
- ACTION: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Manual smoke at 375 / 1024.
- VALIDATE: All green; bundle delta ≤10% (~30 KB acceptable for 4 new pages of content).

---

## Testing Strategy

### Unit / component
| Test | Target |
|---|---|
| `Faq` smoke | Renders all items, ChevronDown rotates on open, keyboard arrow nav |
| `TierCard` featured prop | Adds `border-primary` + featured-only badge |
| `Section` headings | Eyebrow uppercase, h2 id matches `id` prop, `aria-labelledby` wires |
| `PageIntro` | h1 + eyebrow + sub render |
| `SiteHeader` active | `aria-current="page"` on the matching link |
| `SiteHeader` lang toggle | `/en/pricing` → `/th/pricing` |

### Build-output
- 8 prerendered HTMLs exist
- Each HTML has correct lang
- Pricing HTMLs have Product JSON-LD
- Home + Pricing have FAQPage JSON-LD
- Sitemap lists 8 routes

### A11y manual
- [ ] Tab through SiteHeader nav at md+; aria-current announced
- [ ] Hamburger Sheet keyboard-trapped on mobile
- [ ] FAQ accordion arrow keys move between triggers
- [ ] All text contrast on cream ≥ AA

---

## Validation Commands
```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm --filter @lesso/web dev   # manual smoke
```
EXPECT: All green. 8 HTML files in `apps/web/dist/`. Sitemap lists 8 routes.

---

## Acceptance Criteria
- [ ] Home extended with Problem/Solution + Features grid + Social proof + Pricing teaser + FAQ + FinalCta
- [ ] Pricing page live with tier table + FAQ + Product/FAQPage JSON-LD
- [ ] Features page live with 5 sections + anchor IDs
- [ ] About page live with founder + mission + vertical focus
- [ ] SiteHeader has nav + mobile Sheet
- [ ] All 8 prerendered HTML files in `dist/`
- [ ] Sitemap lists all routes with hreflang alternates
- [ ] Per-page meta + canonical correct
- [ ] FAQ accordion keyboard-navigable
- [ ] No regression: typecheck + lint + tests + build all green

## Risks
| Risk | L | I | Mitigation |
|---|---|---|---|
| Bundle bloat from 4 new pages | M | M | Keep marketing components dependency-free (no charts, no animations). Accept ≤10% delta. |
| FAQPage JSON-LD payload size | L | L | Cap at 6 items per page; prune if Lighthouse flags |
| Thai accordion keyboard order — RTL/Indic concern | L | L | Thai is LTR; Radix Accordion handles arrow keys natively |
| `pageForRoute` extension breaks B1 routes | L | M | Keep home as default fallback; new keys explicit-match |
| Per-page JSON-LD escaping | L | M | Use `JSON.stringify` (already in B1); no manual concat |
| Active-link computed via `pathname.endsWith` may match `/about` AND `/about-us` if added later | L | L | Keep route names distinct; can switch to exact-match later |
| Real OG images deferred — social cards stay generic teal block | M | L | Document as B4; pilot launch is the first real share-test moment |

## Notes
- Page voice: Pricing + About lean editorial (longer Playfair headings, Inter
  body); Features leans operational (shorter sentences, more icon use). Both
  inside the same brand voice.
- Why no per-page Satori OG: the pipeline is a B4 polish task and the cost
  is real (Satori + sharp + a build script). Single shared OG is acceptable
  pre-launch.
- Why no testimonial photography: real pilot clinics aren't onboarded until
  A6 — using stock photos would dilute trust. Placeholder copy is honest.
- Why FAQ on Home AND Pricing: Home FAQ tackles "is this for me" / "what
  does it do"; Pricing FAQ tackles "billing / cancellation". Different audience.
