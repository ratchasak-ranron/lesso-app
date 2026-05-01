# Lesso — Aesthetic Clinic Backoffice MVP

> **Brand**: Lesso
> **Marketing site**: `lesso.clinic` (URL doubles as positioning — "Lesso for clinics")
> **Backoffice app**: `app.lesso.clinic` (authenticated product surface)
> **Tagline (EN)**: Less cost. More care.
> **Tagline (TH)**: บริหารคลินิก น้อยกว่า แต่ดีกว่า
> **Target market**: Thailand, expandable to SEA.
> **Vertical**: Aesthetic clinics, 1–10 branches.
> **MVP surfaces**: Two apps in one monorepo (`lesso-app`), shipped this month — (1) `apps/app` → Backoffice prototype (`app.lesso.clinic`), (2) `apps/web` → Marketing/landing site (`lesso.clinic`).

---

## Problem Statement

Small aesthetic clinics in Thailand run their daily operations on Excel and paper. Existing clinic management software (DoctorEase, ProClinic, APSX) costs ฿2,500–10,900/month per clinic — too expensive for owners with one or two branches. Clinics that scale by opening new branches near customer homes lose visibility across branches, double-book appointments, lose track of course-package balances, and miscount doctor commissions. The cost of not solving this is operational chaos that caps clinic growth at 2–3 branches before owners hit Excel ceiling.

## Evidence

- DoctorEase pricing tiers ฿2,590 / ฿5,900 / ฿10,900 per month — out of reach for solo or 2-branch operators.
- Cliniclive (฿1,200–1,400) and Miracle Clinic (฿825 effective) already serve budget tier — proves price sensitivity but UX/feature complaints persist (TBD: validate with user interviews).
- User-stated pain: "Excel chaos, existing software too expensive" — assumption needs validation through interviews with 5–10 clinic owners.
- TH aesthetic clinic market is "red ocean" (user input) → operational efficiency software has parallel pressure.

## Proposed Solution

A web-based clinic backoffice optimized for the receptionist as primary daily user, designed tablet-first for the front-desk counter. Core capabilities cover walk-in check-in, appointment booking with calendar, and course/package session tracking with at-a-glance balance display. Multi-branch dashboard, doctor commission tracking, PDPA-compliant patient records, and LINE OA integration round out the offering. AI assistance reduces time-consuming receptionist tasks (visit summaries, recall message drafting, photo tagging). Pricing positioned to compete with mid-tier (Cliniclive) on price while matching DoctorEase on features and beating both on UX polish.

## Key Hypothesis

We believe a tablet-friendly receptionist UI with course-balance-at-a-glance and LINE booking will replace Excel for small Thai aesthetic clinics. We will know we are right when 5 pilot clinics use it daily for 30 days without falling back to Excel.

## What We're NOT Building

- Hospital workflows (HOSxP territory) — different scale, different regulation
- Insurance / TH social security e-claims — out of aesthetic clinic flow
- Pharmacy / prescription module — defer to v2
- Lab integration — not in aesthetic clinic flow
- Telemedicine video — outside scope
- E-commerce / online product sales — not core operations
- Accounting integration — defer to v2
- Native mobile apps (iOS/Android) — web only, mobile-responsive
- Customer-facing patient app — receptionist-mediated only
- Heavy ML (skin analysis, face detection) — defer to v3+

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Pilot clinics using daily | 5 clinics × 30 days continuous | Active session log per tenant |
| Excel fallback rate | <10% of pilot users | User survey + interview after 30d |
| Receptionist task time | 30% faster check-in vs Excel | Stopwatch comparison in pilot |
| Paid conversion (post-pilot) | 3 of 5 pilot clinics convert | Subscription signups |
| Price point validation | Clinics confirm willingness to pay ฿800–1,500/mo | Pilot exit survey |

## Open Questions

- [ ] **Domain registration** — secure `lesso.clinic` (primary) + `lesso.co` (backup) + `lesso.app`. Verify availability + register.
- [ ] **Trademark** — file Lesso wordmark in TH (DBD) before public launch.
- [ ] Final pricing tier numbers — pilot data will inform.
- [ ] LINE OAuth provider — LIFF vs custom OAuth flow.
- [ ] PDPA legal review timing — before public launch, est. ฿20–50k consult.
- [ ] SEA expansion sequence — VN, PH, ID priorities and localization cost.
- [ ] Self-serve signup vs sales-led for first 10 customers.
- [ ] Free trial length — 14 vs 30 days.
- [ ] AI provider choice — OpenAI vs Anthropic vs local Whisper vs Typhoon (Thai LLM by SCB10X).

---

## Users & Context

### Primary User — Receptionist

- **Who**: Front-desk staff at small aesthetic clinic, age 22–35, female-dominated, comfortable with smartphones, Excel-literate but not power user. Often multi-tasking: phones, walk-ins, LINE messages, payments.
- **Current behavior**: Maintains a master Excel sheet of patients, paper appointment book, paper or Excel course-tracking sheet, separate LINE chat for booking. Cross-references three sources per walk-in.
- **Trigger**: A customer walks in or calls. Receptionist must look up record, confirm booking, check course balance, take payment, schedule next visit — all under 3 minutes per customer.
- **Success state**: Customer checked in, doctor notified, course session decremented, next visit booked, payment recorded. All in one screen, no Excel.

### Secondary Users

- **Doctor** — needs visit notes UI, patient history, photo upload during visit.
- **Branch manager** — operational reports, daily P&L for one branch.
- **Clinic owner** — multi-branch dashboard, financial summary, commission overview.
- **Patient (indirect)** — booking via LINE, recall reminders, receipt access.

### Job to Be Done

When a customer walks into the clinic, I want to find their record and course balance quickly, so I can check them in without making them wait.

### Non-Users

- Hospitals and clinics with 50+ branches (enterprise tier, custom contracts).
- Solo non-aesthetic GPs (different workflow, OPD/SOAP heavy).
- Pure spa or wellness without medical aesthetics (different regulation, different pricing model).

---

## Solution Detail

### Core Capabilities (MoSCoW)

| Priority | Capability | Rationale |
|----------|------------|-----------|
| Must | Patient records (CRUD + search) | Foundation. Every flow depends on it. |
| Must | Appointment booking + calendar | Primary receptionist daily task. |
| Must | Course/package tracking + session burn-down | Aesthetic clinic differentiator. |
| Must | Walk-in check-in flow | The 3-minute counter test. |
| Must | Multi-branch + multi-user (mocked in MVP) | Validates chain operations early. |
| Must | i18n (Thai + English) | Market requirement. |
| Must | Marketing site (`lesso.clinic`) | Pilot acquisition + waitlist + brand. Ships alongside backoffice. |
| Should | Billing / receipt | Revenue tracking, but Excel-replaceable short-term. |
| Should | Doctor commission tracking | Owner-critical, but can defer to month 2. |
| Should | Member points / loyalty | Retention play. |
| Should | Inventory (consumables) | Operational hygiene. |
| Should | Multi-branch dashboard + reports | Owner-facing value. |
| Should | Before/after photo storage | Aesthetic-specific must, defer to backend phase. |
| Should | LINE OA integration | TH cultural baseline, defer to backend phase. |
| Should | PDPA consent capture (mocked v1) | Legal v2 enforcement, UI now. |
| Should | Audit log (mocked v1) | Compliance hooks present. |
| Should | User roles (receptionist / doctor / owner) | Mocked in v1, enforced via Supabase RLS in v2. |
| Could | AI: visit summary generator | Reduce doctor note time. |
| Could | AI: recall message drafter | Personalized retention. |
| Could | AI: photo auto-tagging | Speed up before/after sorting. |
| Could | AI: appointment slot suggestions | No-show prediction, optimal slotting. |
| Won't (v1) | Native mobile apps | Web-responsive only. |
| Won't (v1) | Customer-facing patient portal | Receptionist-mediated only. |
| Won't (v1) | Insurance e-claim | Out of aesthetic flow. |
| Won't (v1) | Telemedicine video | Out of scope. |
| Won't (v1) | Heavy ML (skin analysis) | v3+. |

### MVP Scope (1 Month, Solo Dev, Two Repos)

MVP ships **two separate repos in parallel** this month:

#### A. Backoffice Prototype (`app.lesso.clinic`)

**All pages clickable. All flows visible. No auth. All data mocked via MSW + localStorage.**

Fully-clickable prototype of the entire product surface. Backend (Supabase) not built this month. Prototype validates UX, information architecture, and feature completeness with pilot users before backend investment.

**In-scope**:
- Every screen rendered with mock data
- Every CRUD flow writes to localStorage via MSW handlers
- Multi-branch + multi-user simulated via switcher in dev toolbar
- AI features stubbed with deterministic mock responses (real LLM calls in backend phase)
- i18n th/en throughout
- Tablet-first responsive design (iPad portrait + landscape)
- ApiClient abstraction layer in place — Supabase swap is one-line factory change

**Out of scope (MVP)**:
- Real auth (no Supabase yet)
- Real Postgres / RLS / Realtime
- Real LINE OA integration
- Real photo storage
- Real PDPA enforcement (mocked UI flows present)
- Real AI calls (deterministic stubs)

#### B. Marketing Site (`lesso.clinic`)

**Public, SEO-optimized landing + waitlist. Separate Next.js repo. Deployed to Vercel.**

Pilot acquisition funnel + brand presence. Drives waitlist signups for pilot clinic recruitment, then converts to paid post-pilot. Bilingual (th default, en toggle).

**In-scope**:
- Landing page (hero, problem/solution, features, pricing teaser, CTA)
- Pricing page (tier comparison, ฿800–1,500/mo positioning, "Pilot — free 30 days")
- Features deep-dive page (course tracking, multi-branch, LINE, AI assist)
- About / story page (founder, mission, vertical focus)
- Pilot signup / waitlist form (name, clinic, branches, phone, LINE ID) → email + Notion
- Privacy policy + Terms (PDPA-compliant boilerplate, legal review pre-launch)
- Blog scaffold (CMS-ready, 0–3 launch posts)
- SEO: meta, OG, sitemap, robots, structured data (Organization, Product, FAQ)
- i18n th/en (URL-prefixed `/th` `/en`, `hreflang` tags)
- Analytics (Plausible or Umami — privacy-respecting, PDPA-friendly)
- Pixel-clean responsive: mobile, tablet, desktop

**Out of scope (MVP)**:
- Self-serve signup → backoffice auth (post-Phase 7, when real backend exists)
- Live chat / chatbot
- Heavy CMS (Sanity, Contentful) — MDX local files for v1
- A/B testing infra
- Customer dashboard / billing portal (post-launch)

### Critical User Flow — Walk-In Check-In (3-Minute Test)

```
1. Receptionist opens "Today" view (default landing) — sees today's appointments + walk-ins
2. Customer arrives — receptionist taps [+ Walk-in] or searches name/phone
3. Patient card opens with: course balance card, last visit date, alerts (consent expired, package expiring)
4. Tap [Check In] → assigns to doctor queue
5. Doctor's tablet receives notification (mocked)
6. After visit: tap [Complete] → decrement course, prompt for payment, prompt for rebook
7. Receipt printed/PDF (mocked) — done.
```

Stopwatch target: <90 seconds receptionist time.

---

## Technical Approach

**Single monorepo, two apps, same Vite + React core.** Both apps live under `apps/` in this repo (`lesso-app`). Backoffice = SPA shell with MSW. Marketing = SSG via `vite-react-ssg` (build-time prerender → SEO-clean static HTML). One toolchain, shared `packages/ui-tokens` + `packages/ui` (when worth sharing), one CI pipeline with per-app deploy targets.

### Apps Topology (locked)

| Path | Purpose | Domain | Stack | Hosting |
|------|---------|--------|-------|---------|
| `apps/app` | Backoffice prototype | `app.lesso.clinic` | Vite + React 18 SPA | Vercel project A |
| `apps/web` | Marketing / landing site | `lesso.clinic` | Vite + React 18 + `vite-react-ssg` (static prerender) | Vercel project B |

Both apps consume `packages/ui-tokens` (CSS vars + Tailwind preset) directly via workspace link — no publish step. Components NOT shared at MVP (app-shell patterns vs marketing patterns differ); reassess at month 2. Each app has independent `package.json`, `vite.config.ts`, and Vercel project, but shares lockfile, lint/format/TS configs, and `node_modules` deduplication.

### Backoffice Stack (`lesso-app`, locked)

| Layer | Choice |
|-------|--------|
| Frontend | Vite + React 18 + TypeScript |
| Routing | TanStack Router (type-safe) |
| State / cache | TanStack Query + Zustand for UI state |
| Styling | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| i18n | i18next |
| Mock layer | MSW (Mock Service Worker) + localStorage |
| API contract | OpenAPI 3.1 (source of truth) |
| Type generation | openapi-typescript |
| Testing | Vitest + React Testing Library + Playwright |
| Hosting | Vercel (frontend) |
| Backend (post-MVP) | Supabase (Postgres + Auth + Storage + Realtime + Edge Functions) |
| Future optional | Shuttle (Rust) for compute-heavy services |

### Marketing Stack (`apps/web`, locked)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Vite + React 18 + TypeScript | Same core as backoffice — one mental model, shared tooling. |
| Static gen (SEO) | **`vite-react-ssg`** (prerender at build) | Crawlable HTML for every route. Output = static `.html` + hashed assets. No Node runtime needed at edge. |
| Routing | `react-router-dom` v6 (data router) | `vite-react-ssg` integrates natively. File-based routes via convention. |
| Head / SEO | `react-helmet-async` + JSON-LD components | Per-route `<title>`, meta, OG, `hreflang`. Schema.org Organization/Product/FAQ. |
| Styling | Tailwind CSS + shadcn/ui | Token parity with backoffice. |
| Content | MDX via `@mdx-js/rollup` + `vite-plugin-mdx` | Local files, bilingual posts, build-time resolved. |
| Forms | React Hook Form + Zod | Submit to Vercel Serverless Function → Resend + Notion. |
| i18n | `react-i18next` (same as backoffice) + URL-prefixed routes (`/th/*`, `/en/*`) | Same lib both repos; static-friendly. `hreflang` rendered via Helmet. |
| Sitemap / robots | `vite-plugin-sitemap` (auto from routes) + static `robots.txt` | Generated at build. |
| OG images | Build-time generation via `@vercel/og` invoked in script (or Satori standalone) | Per-page social cards as static `.png`. |
| Analytics | Plausible (or self-hosted Umami) | Privacy-first, PDPA-friendly, no cookie banner. |
| Email capture | Vercel Serverless Function → Resend (email) + Notion API (CRM) | Single `/api/waitlist.ts` endpoint. No backend stack added. |
| Testing | Vitest + Playwright + Lighthouse CI | Same test stack as backoffice. Perf gates. |
| Hosting | Vercel (static deploy + 1 serverless function) | Same hosting as backoffice. Edge-cached HTML. |

**Performance budget** (Lighthouse CI gate): Performance ≥ 95, SEO ≥ 95, Accessibility ≥ 95, LCP < 2.0s on 4G mobile.

**SEO posture**: every route prerendered to static HTML at build time → indistinguishable from Next.js SSG to Googlebot. No client-only SPA penalty. `<link rel="alternate" hreflang>` rendered statically.

**Feasibility**: HIGH for both. Marketing site (~5 pages + waitlist) is ~5 days. Single-stack consistency saves ~1 day vs Next.js (no second framework to learn/upgrade/maintain).

### Monorepo Layout (locked)

```
lesso-app/                           # pnpm workspace root
├── apps/
│   ├── app/                         # Backoffice — Vite + React SPA → app.lesso.clinic
│   │   ├── src/
│   │   │   ├── routes/              # TanStack Router route tree
│   │   │   ├── features/            # Domain features: patient, appointment, course, ...
│   │   │   ├── components/          # App-shell components (shadcn-based)
│   │   │   ├── lib/                 # apiClient bootstrap, i18n init, dev toolbar
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── tests/
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── web/                         # Marketing — Vite + vite-react-ssg → lesso.clinic
│       ├── src/
│       │   ├── pages/               # Route components (vite-react-ssg conventions)
│       │   │   └── [locale]/        # th, en
│       │   │       ├── index.tsx    # Home
│       │   │       ├── pricing.tsx
│       │   │       ├── features.tsx
│       │   │       ├── about.tsx
│       │   │       ├── pilot.tsx    # Waitlist signup
│       │   │       ├── privacy.tsx
│       │   │       ├── terms.tsx
│       │   │       └── blog/
│       │   │           ├── index.tsx
│       │   │           └── [slug].tsx
│       │   ├── content/             # MDX (th/, en/)
│       │   ├── components/          # Marketing components (Hero, Pricing, FAQ, ...)
│       │   ├── locales/             # react-i18next files (th.json, en.json)
│       │   ├── lib/
│       │   │   ├── seo.tsx          # Helmet + JSON-LD helpers
│       │   │   └── analytics.ts     # Plausible events
│       │   └── main.tsx             # vite-react-ssg entry
│       ├── api/
│       │   └── waitlist.ts          # Vercel Serverless Function — Resend + Notion
│       ├── scripts/
│       │   └── og-gen.ts            # Build-time OG image generation (Satori)
│       ├── public/
│       │   ├── robots.txt
│       │   └── og/                  # Generated OG assets
│       ├── tests/
│       ├── vite.config.ts           # vite-react-ssg + sitemap + mdx plugins
│       └── package.json
│
├── packages/
│   ├── api-spec/                    # OpenAPI YAML — source of truth (apps/app)
│   ├── api-client/                  # TS client + ApiClient interface (Supabase + Mock adapters)
│   ├── mock-server/                 # MSW handlers + localStorage seed/persistence
│   ├── domain/                      # Zod schemas + shared TS types (from OpenAPI)
│   ├── ui/                          # Shared shadcn primitives (used by apps/app at MVP; apps/web later)
│   └── ui-tokens/                   # Brand tokens (CSS vars + Tailwind preset) — consumed by both apps
│
├── supabase/                        # (future) migrations + RLS policies + Edge Functions
│
├── docs/
│   ├── research/                    # Market research, migration plan
│   └── api-spec/                    # Generated API documentation site
│
├── .claude/
│   └── PRPs/
│       └── prds/                    # This file
│
├── pnpm-workspace.yaml              # workspaces: apps/*, packages/*
├── package.json                     # root scripts: dev:app, dev:web, build:app, build:web, lint, test
├── turbo.json                       # (optional) Turborepo for cached builds + parallel dev
└── tsconfig.base.json               # shared strict config, extended per app/package
```

**Workspace tooling**:
- **pnpm workspaces** — fast, strict, dedupes across `apps/*` + `packages/*`.
- **Turborepo** (optional) — task graph + remote cache; `turbo run dev --filter=app` and `turbo run build --filter=web`.
- **Two Vercel projects, one repo** — each project sets root directory: `apps/app` and `apps/web`. Independent deploys, independent domains, independent preview URLs per PR.

### Architecture Decisions

- **Single monorepo, two apps** — `apps/app` (backoffice) and `apps/web` (marketing) share lockfile, TS configs, design tokens, and CI infra. Two Vercel projects point at the same repo with different root directories → independent deploys, independent domains, but one `git push` cycle. Trade-off vs separate repos: tighter coupling on dependency upgrades (acceptable; both apps ride same Vite/React major). Trade-off vs single app: 2× build configs (acceptable; isolation is the point).
- **Marketing on Vite + `vite-react-ssg`, not Next.js** — single-stack consistency wins. Same Vite/React/TS/Tailwind/Vitest/Playwright/i18next across both apps = one mental model, one upgrade path, one CI template, one `node_modules` graph. SEO solved via build-time prerender (`vite-react-ssg` + `react-helmet-async` + `vite-plugin-sitemap`) — output is plain static HTML, indistinguishable from Next.js SSG to Googlebot. Trade-off: no ISR; full rebuilds (<30s for 10–20 pages, fine).
- **No CMS at MVP** — MDX + git. Founder-as-author is fast enough at <10 pages. Re-evaluate at 30+ posts or non-technical author onboarding.
- **Waitlist → Notion, not DB** — pilot CRM lives in Notion; signups append via Notion API. No backend needed for MVP marketing site. Email confirmation via Resend.
- **Privacy-first analytics** — Plausible / Umami avoids cookie banner, simpler PDPA story. Switch to GA4 only if marketing demands attribution we can't model otherwise.
- **ApiClient abstraction first** (backoffice) — components import `apiClient` from `packages/api-client`, never `supabase-js` or `fetch` directly. Enables Supabase ↔ Rust swap with adapter change. (Migration plan: `docs/research/migration-plan-supabase-to-shuttle.md`.)
- **OpenAPI as truth** (backoffice) — `packages/api-spec/openapi.yaml` defines all endpoints. Both MSW handlers and future Supabase/Rust adapters conform. TS types generated, never hand-written.
- **Mock persistence to localStorage** (backoffice) — receptionist closes tab, reopens, data survives. Realistic prototype demos.
- **Dev toolbar** (backoffice) — overlay with: tenant switcher, branch switcher, user/role switcher, time mock, data reset, mock-error toggle. Critical for demos and prototyping.
- **Component library: shadcn/ui** (both apps) — copy-in components, fully owned, no runtime dep. Tokens shared via `packages/ui-tokens` workspace link.
- **Tablet-first design** (backoffice) — iPad portrait + landscape primary breakpoints. Desktop secondary. Phone as bonus.
- **Mobile-first design** (marketing) — most pilot acquisition traffic from LINE/IG/FB on phones. Tablet + desktop secondary.

### Technical Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| 1mo prototype scope creep | H | Hard daily scope review. Cut "Should" items aggressively. |
| Monorepo build slowdown as it grows | L | pnpm + Turborepo cached builds + per-app Vercel projects. Filter by `--filter=app` / `--filter=web`. |
| Brand drift between apps | L | Shared `packages/ui-tokens` consumed by both. Visual review weekly across both routes. |
| Marketing capped scope risk | M | 5-day cap on `apps/web` MVP work. Cut blog if needed. |
| `vite-react-ssg` SEO parity vs Next.js SSG | L | Validate via Lighthouse SEO ≥95 + manual `view-source` inspection at B1. Fallback: switch to Astro (still Vite-based) if prerender + Helmet falls short. |
| Mock data divergence from real Supabase shape | M | OpenAPI as truth. Mock + real both conform to spec. |
| Tablet UX assumptions wrong | M | Test on real iPad week 1, not week 4. |
| AI stubs misleading pilot users | M | Mark AI features clearly as "preview" in UI. Set expectations. |
| Domain `lesso.clinic` unavailable | L | Fallback: `lesso.co` or `getlesso.com`. Verify week 1. |
| Trademark conflict (Lesso in another vertical) | L | DBD search before public launch. Coexistence likely (different class). |
| Italian "lesso" = "boiled" (EU coincidence) | L | Negligible for TH/SEA market. Address only if EU expansion. |
| PDPA non-compliance (post-MVP) | M | Legal review before backend phase. Build consent + audit hooks now. |
| Supabase region / residency for PDPA | M | Singapore region + DPA assumed sufficient. Confirm with legal. |

---

## Design System

> **Direction**: Accessible & Ethical — calm, clinical, trustworthy. Healthcare context demands WCAG AA minimum, large readable type, predictable interactions. No flashy gradients, no dark-mode-only flexes. The receptionist is multitasking under pressure; UI must be boring in the best way.
>
> **Stack expression**: Tailwind CSS + shadcn/ui (locked in Technical Approach). All tokens below map to Tailwind config + shadcn theme variables.

### 1. Visual Style

| Attribute | Choice |
|-----------|--------|
| Style family | Accessible & Ethical (healthcare-clean) |
| Density | Comfortable (not compact) — tablet first, fingers not mice |
| Mood | Medical, clean, trustworthy, professional |
| Surface | Flat with subtle shadow elevation (no glassmorphism, no neumorphism) |
| Corner radius | `rounded-lg` (8px) default, `rounded-xl` (12px) for cards, `rounded-full` for pills/avatars |
| Elevation | 3-tier shadow scale: `shadow-sm` (cards), `shadow-md` (popovers/dropdowns), `shadow-lg` (modals/sheets) |

### 2. Color Palette

**Light mode (primary — clinic counter is bright daylight):**

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Primary | `primary` | `#0891B2` (cyan-600) | Brand, primary buttons, active nav, key CTAs |
| Primary Hover | — | `#0E7490` (cyan-700) | Button hover, link hover |
| Secondary | `secondary` | `#22D3EE` (cyan-400) | Tags, secondary highlights, accent strokes |
| Success / CTA Confirm | `success` | `#059669` (emerald-600) | "Check In", "Complete", paid status, course-balance positive |
| Warning | `warning` | `#D97706` (amber-600) | Course expiring, consent expiring, low stock |
| Danger | `destructive` | `#DC2626` (red-600) | Delete, cancel appointment, no-show, errors |
| Info | `info` | `#2563EB` (blue-600) | Notifications, neutral status |
| Background | `background` | `#ECFEFF` (cyan-50) | Page background — calm, low eye-strain |
| Surface (card) | `card` | `#FFFFFF` | Cards, modals, table rows |
| Surface alt | `muted` | `#F1F5F9` (slate-100) | Subtle row stripe, disabled bg, sidebar |
| Border | `border` | `#E2E8F0` (slate-200) | Default border, divider |
| Border strong | — | `#CBD5E1` (slate-300) | Input border, table border |
| Text primary | `foreground` | `#164E63` (cyan-900) | Body text, headings — high contrast on cyan-50 (>10:1) |
| Text secondary | `muted-foreground` | `#475569` (slate-600) | Helper text, captions, table meta — passes 4.5:1 |
| Text disabled | — | `#94A3B8` (slate-400) | Disabled labels only — never body text |

**Dark mode (secondary — late shifts, reduced eye fatigue):**

| Role | Hex | Notes |
|------|-----|-------|
| Background | `#0F172A` (slate-900) | Page bg |
| Surface | `#1E293B` (slate-800) | Cards |
| Border | `#334155` (slate-700) | Visible, not invisible — `border-white/10` is forbidden |
| Text primary | `#F1F5F9` (slate-100) | Body |
| Text secondary | `#94A3B8` (slate-400) | Helper |
| Primary | `#22D3EE` (cyan-400) | Lighter primary for dark contrast |
| Success | `#34D399` (emerald-400) | Lighter for dark |

**Forbidden palette choices** (anti-patterns — call out in code review):
- Bright neon (`#00FF00`, `#FF00FF`, etc.) — clashes with medical trust
- AI purple/pink gradients (`from-purple-500 to-pink-500`) — wrong vertical signal
- Glass cards with `bg-white/10` in light mode — invisible, fails contrast
- Pure black `#000` text — too harsh; use `#164E63` or `#0F172A`
- Color as sole indicator (success = green only) — pair with icon + text label

### 3. Typography

| Role | Family | Weights | Source |
|------|--------|---------|--------|
| Heading | **Figtree** | 500, 600, 700 | Google Fonts |
| Body / UI | **Noto Sans** + **Noto Sans Thai** | 300, 400, 500, 700 | Google Fonts |
| Numeric / tabular | **Noto Sans** with `font-variant-numeric: tabular-nums` | 400, 500 | Google Fonts |
| Mono (audit log, IDs) | **JetBrains Mono** | 400 | Google Fonts |

**Why this pair**: Figtree = modern, friendly, trustworthy headings. Noto Sans = Google's universal sans, full Thai script coverage (critical — primary market is TH), neutral and legible. Both pass WCAG large-text and small-text contrast across the palette.

**CSS import** (single line, both subsets):

```css
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@500;600;700&family=Noto+Sans:wght@300;400;500;700&family=Noto+Sans+Thai:wght@300;400;500;700&family=JetBrains+Mono:wght@400&display=swap');
```

**Type scale** (rem-based, tablet-tuned — body never < 16px):

| Token | Size | Line height | Use |
|-------|------|-------------|-----|
| `text-xs` | 12px | 16px | Badges, tags only — never body |
| `text-sm` | 14px | 20px | Helper, table secondary cell |
| `text-base` | **16px** | 24px | **Body default — minimum on mobile/tablet** |
| `text-lg` | 18px | 28px | Lead paragraph, prominent labels |
| `text-xl` | 20px | 30px | Section heading h4 |
| `text-2xl` | 24px | 32px | Card title, h3 |
| `text-3xl` | 30px | 36px | Page title, h2 |
| `text-4xl` | 36px | 40px | Hero / dashboard headline, h1 |

**Typography rules**:
- Body line-height: **1.5–1.75** (Noto Sans ships dense; bump to 1.6 default).
- Line length: **65–75 characters** for paragraphs (use `max-w-prose`).
- Numeric data (currency, course balance, commission): always `tabular-nums` — columns must align.
- Thai + English mixed strings: rely on `Noto Sans + Noto Sans Thai` font-stack fallback (`font-family: 'Noto Sans', 'Noto Sans Thai', sans-serif`). No Latin-only fonts on Thai-language UI.

### 4. Spacing, Layout, Grid

**Spacing scale**: Tailwind default (4px base) — `1=4px`, `2=8px`, `3=12px`, `4=16px`, `6=24px`, `8=32px`, `12=48px`, `16=64px`.

**Layout primitives**:
- Page container: `max-w-7xl mx-auto px-4 md:px-6 lg:px-8` (consistent everywhere — never mix `max-w-6xl` and `max-w-7xl`).
- Card padding: `p-6` (desktop/tablet), `p-4` (mobile).
- Section spacing: `py-8` between sections, `py-12` between page-level blocks.
- Grid gutters: `gap-4` (small grids), `gap-6` (card grids), `gap-8` (dashboard tiles).

**Tablet-first breakpoints** (locked — iPad is the daily driver):

| Breakpoint | Tailwind | Width | Primary device |
|------------|----------|-------|----------------|
| Mobile | (default) | < 640px | Phone (bonus, not primary) |
| sm | `sm:` | ≥ 640px | Phone landscape |
| **md** | `md:` | **≥ 768px** | **iPad portrait — PRIMARY** |
| **lg** | `lg:` | **≥ 1024px** | **iPad landscape — PRIMARY** |
| xl | `xl:` | ≥ 1280px | Desktop secondary |
| 2xl | `2xl:` | ≥ 1536px | Large desktop |

**Layout test matrix** (every page must pass):
- 768×1024 (iPad portrait)
- 1024×768 (iPad landscape)
- 1280×800 (desktop secondary)
- 375×667 (phone bonus — no broken flows)

### 5. Touch & Interaction

| Rule | Spec | Why |
|------|------|-----|
| Touch target min | **44 × 44 px** (`min-h-11 min-w-11`) | Apple HIG + WCAG 2.5.5 |
| Touch spacing | **≥ 8px gap** (`gap-2`) between adjacent targets | Prevent fat-finger mistaps |
| Cursor | `cursor-pointer` on every clickable surface (cards, rows, icons) | Communicate interactivity |
| Hover feedback | Color/shadow transition only — **never `scale`** that shifts neighbors | Stable layout |
| Transition timing | **150–250ms** with `ease-out` for micro-interactions | Snappy, not laggy |
| Disabled state | `opacity-50 pointer-events-none` + visible label | Clear non-interactive |
| Loading state | Disable button + inline spinner + keep label | "Saving..." not blank |

### 6. Iconography

- **Library**: [Lucide](https://lucide.dev/) (`lucide-react`). Single source. No mixing.
- **Sizing**: `w-5 h-5` (20px) inline-with-text, `w-6 h-6` (24px) standalone, `w-4 h-4` (16px) inside dense table cells.
- **Stroke**: 1.5 default, 2 for emphasis.
- **Forbidden**: emoji as UI icons (🎨 ⚙️ 📅), mixed icon sets (Lucide + Heroicons), inline SVG without `aria-hidden` or `aria-label`.
- **Brand logos** (LINE, etc.): pull official SVG from [Simple Icons](https://simpleicons.org/) — never hand-trace.

### 7. Motion

- **Duration**: 150ms (color/opacity), 200ms (small transforms), 300ms (page/sheet transitions). Never > 400ms.
- **Easing**: `ease-out` for enter, `ease-in` for exit, `ease-in-out` for two-way (drawer open/close).
- **Performant properties only**: `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`.
- **`prefers-reduced-motion`**: respect globally — wrap every transition in:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- **Loading**: skeleton screens (not spinners) for any block > 300ms expected load. Reserve space — no content jumping.

### 8. Component Patterns (shadcn/ui)

Locked component vocabulary. Receptionist learns these once, reuses across every page.

| Pattern | shadcn primitive | Use case |
|---------|------------------|----------|
| **Page shell** | shadcn block `dashboard-01` (sidebar + topbar) | All authenticated pages |
| Forms | `Form` + `FormField` + `react-hook-form` + Zod | Patient CRUD, appointment, course creation |
| Data tables | `Table` + `DataTable` + TanStack Table | Patient list, appointment list, audit log, inventory |
| Calendar | `Calendar` (date picker) + custom day/week/month grid | Appointment booking |
| Patient card / entity card | `Card` + `Avatar` + `Badge` | Patient summary, course balance card |
| Walk-in queue | `Card` list with `Badge` (status) + primary CTA | "Today" landing |
| Filters | `Popover` + `Command` (combobox) | Branch, doctor, date-range filters |
| Confirmations | `AlertDialog` (destructive) / `Dialog` (neutral) | Delete patient, void receipt |
| Side panels | `Sheet` (right-side) | Patient detail drawer, edit appointment |
| Inline edits | `Popover` + `Input` | Quick edit (price, qty, notes) |
| Notifications | `Sonner` toast | Save success, errors, AI suggestions |
| Empty states | `Card` + Lucide icon + helper text + primary CTA | "No appointments today — book one" |
| Loading | `Skeleton` matching final layout shape | Lists, cards, tables |

**Forms**: never `<Input value onChange>` — always `<FormField control={form.control} name="x">`. Validation via Zod schema (single source of truth, shared with OpenAPI domain types).

**Tables**: every list page uses `DataTable` pattern (sort + filter + pagination + bulk select). No hand-rolled `<table>`.

### 9. Charts (Dashboard / Reports)

Library: **Recharts** (React-native, composable, accessible). Add ApexCharts only if a chart Recharts can't do.

| Data type | Chart | Notes |
|-----------|-------|-------|
| Revenue trend, visits over time | **Line chart** (or Area, 20% fill opacity) | Primary `#0891B2`. Multi-series: cyan + emerald + amber. |
| Branch comparison, doctor commission ranking | **Horizontal bar chart**, descending | Value labels on bars. Distinct color per bar. |
| Doctor performance multi-axis (visits, revenue, retention, rebook %) | **Radar chart** | Cap at 5–8 axes. Always pair with data table. |
| Service mix breakdown | **Donut** (only if ≤ 5 slices, else stacked bar) | Avoid pie > 5 slices. |
| Course session burn-down | **Stacked bar** (used vs remaining) per course | Inline in patient card. |
| Funnel (lead → booked → showed → paid) | **Funnel chart** | Phase 4+ if needed. |

**Chart accessibility (mandatory)**:
- Every chart pairs with a `Table` alternative (toggle "View as data").
- Color is never sole signal — add patterns or labels.
- Hover tooltip + keyboard focus on data points.
- Color-blind safe palette: cyan / emerald / amber / red — distinct hue + lightness.

### 10. Accessibility (WCAG 2.1 AA — non-negotiable)

| Item | Spec |
|------|------|
| Contrast | Body 4.5:1, large 3:1, UI/icons 3:1. All palette pairs above pre-validated. |
| Focus ring | `focus-visible:ring-2 ring-cyan-500 ring-offset-2` — 3–4px visible, never `outline-none` without replacement |
| Keyboard | Tab order matches visual order. All interactions reachable without mouse. |
| Form labels | `<label for>` or `<FormLabel>` always — never placeholder-only |
| Icon buttons | `aria-label` mandatory |
| Live regions | Toasts use `role="status"` (`Sonner` handles) |
| Skip links | "Skip to main content" on every page |
| Touch targets | 44×44 minimum (already specified) |
| Motion | `prefers-reduced-motion` respected (already specified) |
| Language | `<html lang="th">` or `<html lang="en">` toggled by i18n; `lang` attr on inline language switches |
| Screen reader | All decorative icons `aria-hidden="true"`; meaningful icons `aria-label` |

### 11. i18n / Bilingual UI Rules

- **Two locales**: `th` (default for TH market) and `en` (fallback / staff toggle).
- **No string concatenation** for translatable text — always `t('key', { var })` via i18next.
- **Numbers**: `Intl.NumberFormat('th-TH')` for currency (฿), `Intl.NumberFormat('en-US')` for English mode.
- **Dates**: `dayjs` + `dayjs/locale/th` Buddhist calendar option (B.E. year) + Gregorian toggle in user preference.
- **Pluralization**: Thai has no plural inflection — keep keys simple, but English keys use ICU `plural` syntax.
- **Font fallback chain**: `'Noto Sans', 'Noto Sans Thai', sans-serif` — Thai glyphs render natively without layout jump.
- **Truncation**: Thai words wrap differently than English — test long Thai names in tables, use `truncate` + `title` tooltip.

### 12. Content & Tone

- **Voice**: Calm, direct, helpful. Never cute, never apologetic.
- **Buttons**: verb + object — "Check In", "Save Patient", "Book Appointment". Not "OK" / "Submit".
- **Empty states**: state the situation + offer the action. "No appointments today. [+ Book one]"
- **Errors**: what failed + what to do. "Couldn't save — check internet and retry. [Retry]"
- **AI features**: label `Preview` badge clearly. Always show source/confidence. User edits before send.

### 13. Anti-Pattern Quick Reference (call out in code review)

- ❌ Emoji as icon
- ❌ `bg-white/10` glass card in light mode
- ❌ Scale-transform hover that shifts neighbors
- ❌ Placeholder-only inputs
- ❌ `cursor: default` on clickable card
- ❌ `outline: none` without visible focus replacement
- ❌ Body text < 16px on mobile/tablet
- ❌ Animating `width`/`height`/`top`/`left`
- ❌ AI purple/pink gradient backgrounds
- ❌ Color-only status (red/green dot without icon + label)
- ❌ Latin-only font on Thai text
- ❌ Hand-rolled `<table>` instead of `DataTable`

### 14. Pre-Delivery Checklist (every PR)

**Visual**
- [ ] All icons from Lucide (no emoji, no mixed sets)
- [ ] Brand logos verified from Simple Icons
- [ ] Hover states cause no layout shift
- [ ] Theme tokens used directly (`bg-primary`, not arbitrary hex)

**Interaction**
- [ ] `cursor-pointer` on every clickable surface
- [ ] Hover/focus feedback present and smooth (150–250ms)
- [ ] Loading + disabled states on every async action
- [ ] All buttons disabled during in-flight requests

**Light mode**
- [ ] Body text ≥ 4.5:1 contrast
- [ ] Borders visible (`border-slate-200`+, not `border-white/10`)
- [ ] No glass card under-opacity issues

**Dark mode**
- [ ] Borders visible (`border-slate-700`+)
- [ ] Primary color shifts to lighter variant for contrast
- [ ] Same 4.5:1 contrast minimum

**Layout**
- [ ] Renders at 768×1024, 1024×768, 1280×800, 375×667
- [ ] No horizontal scroll on mobile
- [ ] Floating elements have edge spacing
- [ ] No content hidden behind fixed bars

**Accessibility**
- [ ] All inputs have labels
- [ ] All icon-only buttons have `aria-label`
- [ ] Focus-visible rings on all interactive elements
- [ ] Tab order matches visual order
- [ ] `prefers-reduced-motion` respected

**i18n**
- [ ] No hard-coded strings — all via `t('key')`
- [ ] Both `th` and `en` keys present
- [ ] Thai font fallback active on Thai content
- [ ] Long Thai names tested in tables/cards

### 15. Tooling & Tokens

- Tailwind config exposes all tokens above as theme extensions (`primary`, `success`, etc.).
- shadcn `components.json` themed via CSS variables in `globals.css` — light + dark blocks.
- Storybook (optional, Phase 5) documents every component state — empty/loading/error/success.
- Figma file (optional but recommended) mirrors token names 1:1 for designer/dev parity.

---

## Implementation Phases

<!--
  STATUS: pending | in-progress | complete
  PARALLEL: phases that can run concurrently
  DEPENDS: phases that must complete first
  PRP: link to generated plan file once created
-->

Two parallel tracks in **one monorepo** (`lesso-app`): **A = `apps/app` (backoffice)**, **B = `apps/web` (marketing)**. Phases below.

Two work tracks, one monorepo: **A = `apps/app` (backoffice)**, **B = `apps/web` (marketing)**.

**Track A — Backoffice (`apps/app`)**

| # | Phase | Description | Status | Parallel | Depends | PRP Plan |
|---|-------|-------------|--------|----------|---------|----------|
| A1 | Foundation | pnpm workspace, Turborepo, `apps/app` scaffold, `packages/ui-tokens`, mock infra, dev toolbar | complete | with B1 | - | [plan](../plans/completed/a1-foundation.plan.md) · [report](../reports/a1-foundation-report.md) |
| A2 | Core Flows | Patient + Appointment + Course + Walk-in check-in | complete | - | A1 | [plan](../plans/completed/a2-core-flows.plan.md) · [report](../reports/a2-core-flows-report.md) |
| A3 | Supporting Modules | Billing, commission, points, inventory | in-progress | with A4 | A2 | [a3-supporting-modules.plan.md](../plans/a3-supporting-modules.plan.md) |
| A4 | Multi-Branch + AI | Branch switcher, dashboard, AI stubs (visit summary, recall drafter) | pending | with A3 | A2 | - |
| A5 | Compliance + Polish | PDPA UI (consent + audit), i18n th/en, tablet polish | pending | - | A3, A4 | - |
| A6 | Pilot Prep | Demo data, Vercel project A → `app.lesso.clinic`, pilot onboarding doc | pending | - | A5 | - |
| A7 | Backend Stand-Up | Supabase project, schema, RLS, swap ApiClient adapter | pending | - | A6 | - |
| A8 | Pilot Run | 5 clinics × 30 days, feedback loop | pending | - | A7 | - |

**Track B — Marketing (`apps/web`)**

| # | Phase | Description | Status | Parallel | Depends | PRP Plan |
|---|-------|-------------|--------|----------|---------|----------|
| B1 | Marketing Foundation | `apps/web` scaffold (Vite + `vite-react-ssg`), shadcn, `react-i18next`, MDX, Helmet SEO, sitemap, Vercel project B | pending | with A1 | - | - |
| B2 | Core Pages | Home, Pricing, Features, About — th/en, JSON-LD, build-time OG images | pending | with A2/A3 | B1 | - |
| B3 | Waitlist + Legal | Pilot signup form (`/api/waitlist` → Resend + Notion), Privacy, Terms, Plausible | pending | with A3/A4 | B2 | - |
| B4 | Polish + Launch | Lighthouse CI gates (≥95), blog scaffold (0–3 posts), `lesso.clinic` go-live | pending | - | B3, A6 | - |

### Phase Details

#### Track A — Backoffice (`apps/app`)

**Phase A1: Foundation** (~5 days)
- **Goal**: Monorepo scaffolded, both apps compile, `apps/app` ready for feature work.
- **Scope**:
  - pnpm workspace root (`pnpm-workspace.yaml`) + Turborepo (optional cache layer)
  - `tsconfig.base.json` + shared lint/format configs
  - `packages/ui-tokens` (CSS vars + Tailwind preset) — consumed by both apps via workspace link
  - `apps/app`: Vite + React + TS + Tailwind + shadcn
  - TanStack Router + TanStack Query + Zustand
  - i18next th/en scaffolding
  - MSW worker + localStorage persistence layer
  - ApiClient interface + Mock adapter (`packages/api-client`)
  - OpenAPI spec skeleton (`packages/api-spec`) + type generation pipeline (`packages/domain`)
  - Dev toolbar (tenant/branch/user switcher + reset)
  - Vercel project A pointed at `apps/app` (preview deploys per PR)
  - Vitest + Playwright smoke test
- **Success signal**: `pnpm dev --filter=app` runs locally; Hello-world `apps/app` deployed to Vercel; clicking nav switches mock tenant/branch; `apps/web` (created in B1) imports `packages/ui-tokens` cleanly.

**Phase A2: Core Flows** (~7 days)
- **Goal**: Receptionist 3-minute walk-in test passes.
- **Scope**:
  - Patient model + CRUD + search (name, phone, ID)
  - Appointment model + calendar view (day/week/month)
  - Course/package model + session burn-down + balance card
  - Walk-in check-in flow end-to-end
  - "Today" landing page (appointments + walk-in queue)
  - Patient card view (history, alerts, courses, photos placeholder)
- **Success signal**: Receptionist actor in user test completes walk-in check-in <90s on iPad.

**Phase A3: Supporting Modules** (~5 days, parallel with Phase A4)
- **Goal**: Revenue and operational modules clickable.
- **Scope**:
  - Billing + receipt generation (PDF stub)
  - Doctor commission tracking + report
  - Member points / loyalty (earn + redeem)
  - Inventory: consumables in/out + low-stock alert
- **Success signal**: Owner persona completes month-end revenue review flow.

**Phase A4: Multi-Branch + AI** (~5 days, parallel with Phase A3)
- **Goal**: Owner-facing multi-branch + AI-assist visible.
- **Scope**:
  - Multi-branch dashboard (revenue, visits, commission per branch)
  - Cross-branch member portability (course usable at any branch)
  - Reports: daily, weekly, by doctor, by service, by branch
  - AI stubs:
    - Visit summary generator (mock)
    - Recall message drafter (mock, th + en)
    - Photo auto-tag (mock)
    - Appointment slot suggester (mock)
- **Success signal**: Owner persona reviews multi-branch dashboard; AI suggestions visible in UI flagged "Preview".

**Phase A5: Compliance + Polish** (~5 days)
- **Goal**: Pilot-ready quality.
- **Scope**:
  - PDPA consent capture flow (UI + mocked storage)
  - Audit log viewer (mocked entries)
  - Data export per patient (PDF/CSV stub)
  - i18n th/en complete coverage
  - Tablet portrait + landscape polish
  - Empty states, error states, loading skeletons
  - Accessibility pass (WCAG 2.1 AA targets)
- **Success signal**: Full app review on iPad with 0 broken flows; th/en toggle works everywhere.

**Phase A6: Pilot Prep** (~3 days)
- **Goal**: Pilot clinic onboarded.
- **Scope**:
  - Realistic demo data set (200 patients, 50 courses, 6 months history)
  - Pilot onboarding guide (PDF + video)
  - Feedback capture mechanism (in-app + Notion form)
  - Vercel production deploy + `app.lesso.clinic` custom domain
- **Success signal**: First pilot clinic logs in and uses for first day.

**Phase A7: Backend Stand-Up** (post-MVP, ~3 weeks)
- **Goal**: Real backend behind same UI.
- **Scope**:
  - Supabase project + schema migrations
  - RLS policies (tenant isolation, branch scoping, role enforcement)
  - Auth (email/OTP + LINE OAuth via custom flow)
  - Realtime channels for multi-branch sync
  - Storage for before/after photos
  - Edge Functions for LINE webhooks + scheduled recalls
  - Real AI integration (Anthropic Claude or OpenAI for stubs replaced)
  - ApiClient: swap Mock adapter → Supabase adapter
- **Success signal**: Pilot clinic data in real Postgres; multi-branch realtime sync works.

**Phase A8: Pilot Run** (post-MVP, 30 days)
- **Goal**: Validate hypothesis.
- **Scope**: 5 clinics, daily usage, weekly check-ins, feature/bug iteration, exit survey.
- **Success signal**: 3 of 5 pilots convert to paid.

#### Track B — Marketing (`apps/web`)

**Phase B1: Marketing Foundation** (~2 days)
- **Goal**: `apps/web` scaffolded inside same monorepo, prerendered HTML deploys clean, brand tokens consumed via workspace.
- **Scope**:
  - `apps/web`: Vite + React 18 + TS + Tailwind + shadcn
  - `vite-react-ssg` configured (build-time prerender every route)
  - `react-router-dom` v6 with `[locale]` route segment (`/th/*`, `/en/*`)
  - `react-i18next` th/en setup
  - MDX pipeline (`@mdx-js/rollup` + `vite-plugin-mdx`)
  - `react-helmet-async` SEO helpers + JSON-LD components
  - `vite-plugin-sitemap` auto-generated sitemap + static `robots.txt`
  - Consume `packages/ui-tokens` via workspace link (`workspace:*` in `package.json`)
  - Vercel project B pointed at `apps/web` root directory (static + serverless function support); preview deploys per PR; `lesso.clinic` domain reserved (DNS pending)
  - Lighthouse CI workflow (perf/SEO/a11y ≥ 95 gate)
  - SEO sanity: `view-source` of root must show full HTML content (not empty `<div id="root">`)
- **Success signal**: `pnpm dev --filter=web` runs locally; `https://<vercel-preview>.vercel.app` returns prerendered Hello-Lesso in th/en (visible in `curl` HTML); Lighthouse all green; sitemap.xml auto-generated; both apps build clean from root via `pnpm build`.

**Phase B2: Core Pages** (~2 days, parallel with A2/A3)
- **Goal**: All public pages live, SEO complete.
- **Scope**:
  - Home: hero (above-fold CTA "Join pilot — free 30 days"), problem/solution, features grid, social proof slot, pricing teaser, FAQ, footer
  - Pricing: tier table, "Pilot — free 30 days" CTA, FAQ
  - Features: course tracking, multi-branch, LINE-native, AI assist, PDPA — each section with screenshot/illustration slot
  - About: founder, mission, vertical focus
  - JSON-LD components rendered via Helmet: `Organization`, `Product`, `FAQPage` on relevant pages
  - Per-page OG images generated at build (`scripts/og-gen.ts` via Satori → static `.png` in `/public/og`)
- **Success signal**: All pages render th + en in static HTML; Lighthouse ≥ 95 on every route; sitemap.xml lists all pages.

**Phase B3: Waitlist + Legal** (~1 day, parallel with A3/A4)
- **Goal**: Pilot acquisition funnel live + compliance pages shipped.
- **Scope**:
  - Pilot signup form (`/{locale}/pilot`): name, clinic, branches, phone, LINE ID, message (RHF + Zod)
  - Vercel Serverless Function `/api/waitlist`: validate (Zod) → Resend confirmation email → Notion API append to "Pilot Waitlist" DB
  - Privacy policy + Terms (PDPA-compliant boilerplate, marked DRAFT pending legal review)
  - Plausible analytics integrated, custom events: `cta_click`, `pilot_submit`, `lang_toggle`
  - Honeypot + rate limit on `/api/waitlist` (Vercel KV or Upstash Redis)
- **Success signal**: Test submission lands in Notion, Resend email delivered, Plausible event recorded.

**Phase B4: Polish + Launch** (~1 day, gated on A6)
- **Goal**: Marketing site go-live coordinated with backoffice pilot prep.
- **Scope**:
  - Lighthouse CI green on all pages (Performance ≥ 95, SEO ≥ 95, Accessibility ≥ 95, BP ≥ 95)
  - Final OG images, favicon, app manifest
  - Blog scaffold + 0–3 launch posts (founder note, "why we built this", pilot announcement)
  - DNS cutover to `lesso.clinic` (root) + `www.lesso.clinic` redirect
  - 404 + 500 pages branded
  - Search Console + Bing Webmaster verified, sitemap submitted
- **Success signal**: `https://lesso.clinic` live, indexed by Google within 7d, first organic waitlist submission within 14d.

### Parallelism Notes

- **Track A and Track B run in parallel by design** — same monorepo, two apps, two Vercel projects, two preview URLs per PR. Solo dev context-switches by day, not by file. Same Vite/React/TS toolchain reduces switching cost.
- A1 + B1 can start same week; B1 unblocked once `packages/ui-tokens` exists in workspace (~day 3 of A1) — no publish step, just `workspace:*` link.
- B2/B3 run alongside A2/A3/A4 with no shared bottleneck. PRs can touch both apps when shared `packages/*` change.
- B4 gates on A6 (pilot ready) so marketing launch + first pilot land same day.
- Within Track A: Phases A3 and A4 are independent feature tracks (parallel with second contributor; solo dev sequences them).
- Phase A7 (backend) is gated on Phase A6 (pilot prep) so user feedback shapes schema before commitment.
- Phases A1, A2, A5 are critical path within Track A — never parallelize internally.
- CI uses `turbo run build --filter=...[origin/main]` to only rebuild apps whose deps changed.

---

## Decisions Log

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Repo strategy | **Single monorepo** (`lesso-app`) with `apps/app` (backoffice) + `apps/web` (marketing) | Two repos | Shared toolchain, lockfile, tokens. Two Vercel projects point at same repo with different root dirs → independent deploys retained. |
| Marketing framework | **Vite + React + `vite-react-ssg`** | Next.js, Astro, Remix, plain HTML | Single-stack consistency with backoffice. Build-time prerender → static HTML, full SEO parity with Next.js SSG. |
| Marketing routing | `react-router-dom` v6 | TanStack Router (backoffice choice) | `vite-react-ssg` first-class integration. Marketing route shape simple enough; TanStack Router not needed. |
| Marketing SEO | `react-helmet-async` + JSON-LD + `vite-plugin-sitemap` | Next.js metadata API | Per-route head tags rendered into static HTML at build. Sitemap auto-generated from routes. |
| Marketing i18n | `react-i18next` (same as backoffice) + URL-prefixed routes (`/th/*`, `/en/*`) | `next-intl`, separate libs per repo | Same lib both repos. Static-friendly. `hreflang` rendered via Helmet. |
| Marketing CMS | MDX + git (no CMS) | Sanity, Contentful, Strapi, Payload | Founder-as-author at <10 pages; revisit at 30+ posts or non-tech authors. |
| Waitlist storage | Notion API + Resend email via Vercel Serverless Function | DB table, Airtable, Mailchimp, Tally | Pilot CRM lives in Notion; one serverless function, no backend infra. |
| Marketing analytics | Plausible (or self-hosted Umami) | GA4, Mixpanel, PostHog | Privacy-first; no cookie banner; PDPA-friendly default. |
| Marketing → backoffice signup | Decoupled (waitlist-only at MVP) | Direct self-serve auth handoff | Real auth lives in backoffice Phase A7; marketing collects intent only at MVP. |
| Frontend framework (backoffice) | Vite + React + TS | Next.js, Remix, SolidStart | User-locked. Static deploy on Vercel. SEO not needed (authenticated app). |
| Backend (post-MVP) | Supabase | Custom Rust, Firebase, AWS Amplify | Solo-dev velocity, free tier, OSS escape hatch. |
| Backend (MVP) | None — MSW + localStorage | Stand up Supabase now | 1mo timeline; validate UX before backend cost. |
| State + cache | TanStack Query | Redux, Zustand-only, RTK Query | Industry standard, optimistic updates, devtools. |
| Local-first lib | None | RxDB, PowerSync, ElectricSQL | Aesthetic clinics urban + always-online; offline not core. Add later if needed. |
| Hosting | Vercel | Cloudflare Pages, Netlify | Vite + Edge Functions native; preview deploys. |
| Future Rust home | Shuttle (if ever) | Vercel (no Rust), Fly.io | Rust-native PaaS; free tier for solo dev. |
| Component library | shadcn/ui | MUI, Chakra, Mantine, custom | Copy-in (no runtime dep), Tailwind-native, modern aesthetic. |
| Mock layer | MSW | Custom fetch interceptor, JSON Server | Network-level, isomorphic, swap-free with real API. |
| API contract | OpenAPI 3.1 | tRPC, GraphQL, hand-written | Language-neutral; supports Supabase/Rust/anything; codegen. |
| Auth (post-MVP) | Supabase Auth | Clerk, Auth0, custom JWT | Bundled, $0 baseline. Reconsider if scaling. |
| Database (post-MVP) | Postgres (Supabase) | MySQL, Mongo, Firestore | Real SQL, RLS, mature, OSS. |
| Multi-tenancy strategy | Shared DB, RLS by org_id + branch_id | DB-per-tenant, schema-per-tenant | Standard SaaS pattern, Supabase native. |
| AI scope (MVP) | Stubs only | Real LLM calls in MVP | Cost + complexity. Real calls in Phase 7. |
| Brand name | **Lesso** | Klinilite, GlowOps, Sabaiklinik, Kliniq | Emotional brand investment kept; `.clinic` TLD solves recognition; tagline carries affordability. |
| Domain split | **`lesso.clinic`** (marketing) + **`app.lesso.clinic`** (backoffice) | Single domain serving both | Clean separation: SEO-public root, authenticated app on subdomain. Standard SaaS convention. |
| Domain | **lesso.clinic** | lessoclinic.com, lesso.co, lesso.app | URL itself = positioning ("Lesso for clinics"). Modern, ownable, memorable. |
| Tagline (EN) | "Less cost. More care." | "Clinic ops, the lesso way." | Direct affordability + value signal in <4 words. |
| Tagline (TH) | "บริหารคลินิก น้อยกว่า แต่ดีกว่า" | — | Localized "less but better" framing. |

---

## Research Summary

### Market Context

Detailed in `docs/research/market-research-aesthetic-clinic-th.md`.

Key findings:
- DoctorEase = ฿2,590–10,900/mo, premium tier, multi-vertical.
- Cliniclive (~฿1,300) and Miracle Clinic (~฿825) already at budget tier.
- Pure 50%-off DoctorEase positioning collides with budget incumbents → must differentiate on UX, multi-branch, LINE-native, AI.
- Red ocean: many vendors, price-sensitive market, branch expansion is growth lever.
- Aesthetic-specific must-haves: course tracking, before/after photos, doctor commission, PDPA consent.
- Gaps competitors miss: tablet-first UX, LINE-native flow, self-serve onboarding/pricing, modern UI.

### Technical Context

Detailed in `docs/research/migration-plan-supabase-to-shuttle.md`.

Key findings:
- Supabase covers 100% of clinic backoffice needs (Postgres + Auth + RLS + Realtime + Storage + Edge Functions).
- ApiClient abstraction enables future Shuttle (Rust) migration without component code change.
- PDPA: 72hr breach notification, consent records, audit log, data export — all enforceable in Postgres + Supabase Auth.
- Singapore region likely satisfies Section 29 cross-border with DPA — confirm with legal.
- Vercel is frontend-only home; Rust on Vercel = poor fit, host on Shuttle if ever needed.

### Regulatory Context

- PDPA (Personal Data Protection Act, B.E. 2562) enforcement active 2025+, fines real.
- Active enforcement targeted inadequate security + late breach reporting.
- Required: explicit consent, audit logs, retention period, data subject export, breach notification within 72 hours.

---

*Generated: 2026-05-01*
*Status: DRAFT — needs validation by 5–10 clinic owner interviews + legal PDPA review.*
