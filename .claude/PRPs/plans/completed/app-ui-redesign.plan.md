# Plan: Lesso Backoffice UI/UX Redesign

## Summary
Refit `apps/app` to the persisted design system (`design-system/lesso-backoffice/MASTER.md`)
— "Accessible & Ethical" pattern with WCAG 2.2 AA targets, Executive-Dashboard
KPI surface on Home, tablet-first nav, and consistent page primitives.
Anchored in two parallel audits (a11y-architect + code-explorer). Visual tokens
already align; the work is 80% structural primitives + a11y wiring + Home KPI
tier.

## User Story
As a clinic front-desk operator on a tablet, I want one operational dashboard
that surfaces today's load + queue + alerts at a glance and lets me reach any
nav target with a single tap, so I can run the desk without bouncing between
unrelated list pages.

## Problem → Solution
Today: Home is two unlabelled lists; sidebar is invisible on `<md`; KPI surface
absent; touch targets / focus rings under WCAG AAA; `<html lang>` desync;
async errors silent on screen readers. → Tablet-first dashboard with
`TodayKpiBar`, `<Sheet>` mobile nav, 44×44 minimum touch, 3-4px focus,
`role="alert"` on form errors, `aria-pressed` on toggle pickers.

## Metadata
- **Complexity**: Large
- **Source**: `design-system/lesso-backoffice/MASTER.md` + audits
- **Estimated Files**: 10 created, ~22 modified
- **Anti-pattern guard**: no neon colours, no motion-heavy animation, no AI gradients

---

## UX Design

### Before (Home `routes/index.tsx`)
```
┌────────────────────────────────────┐
│  Hello, Lesso                      │
│  Clinic: ... Branch: ... User: ... │
│                                    │
│  Today's appointments              │
│  · 09:00  Khun A   Botox           │
│  · 10:30  Khun B   Filler          │
│                                    │
│  Walk-in queue                     │
│  · Khun C   waiting                │
└────────────────────────────────────┘
```

### After (Home redesign)
```
┌────────────────────────────────────────────────────────┐
│  Today · 2026-05-02         Clinic ▾  Branch ▾  User ▾ │
├────────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │ Queue  │ │ Booked │ │  Done  │ │ Alerts │           │
│  │   3    │ │  12    │ │   7    │ │   2    │           │
│  │ ▁▂▅▃▂  │ │ ▁▃▅▆▄  │ │ ▁▂▃▃▄  │ │ low    │           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
│                                                        │
│  ┌─ Appointments today ──┬─ Walk-in queue ──┐          │
│  │ 09:00  Khun A  Botox  │ Khun C  waiting  │          │
│  │ 10:30  Khun B  Filler │                  │          │
│  └───────────────────────┴──────────────────┘          │
└────────────────────────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Sidebar `<md` | Hidden, no fallback | Bottom-tab bar (4 primary) + Sheet drawer for the rest | WCAG SC 2.4.1 unblocked |
| Lang toggle | Icon-only Button, no state | Aria-pressed, current+next label, live-region announce | 4.1.2 |
| Dialog close | English-only sr-only "Close" | `t('common.close')` | 3.1.2 |
| Focus ring | 2px / offset 2 | 3px / offset 3 | AAA gain |
| Form errors | `<p text-destructive>` | `<FormError role="alert">` shared primitive | 4.1.3 |
| Card list rows | Wrap-`<button>`-around-`<Card>` (double border on focus) | `SelectableCard` with single ring on the Card; aria-label builder | Voice-control + visual cleanup |
| Course picker (check-in flow) | Color-only selected state | `aria-pressed` + check icon | 1.4.1 |
| Appointments page | Today-only, no date nav | `<DateNav>` prev / date / next | Fixes single-day prison |
| Course balance card | `t('course.expiresAt')` label only | Label + actual `formatDate(expiresAt)` | Bug fix |

---

## Mandatory Reading

| Priority | File | Why |
|---|---|---|
| P0 | `design-system/lesso-backoffice/MASTER.md` | Tokens + style + don'ts |
| P0 | `apps/app/src/styles/globals.css` | Focus ring + base layer |
| P0 | `apps/app/src/components/ui/{button,card,sheet,dialog,empty-state}.tsx` | Primitives to wrap, not duplicate |
| P0 | `apps/app/src/components/{page-shell,sidebar,top-bar}.tsx` | Shell to refactor |
| P0 | `apps/app/src/routes/index.tsx` | Home rewrite target |
| P1 | `apps/app/src/features/patient/components/patient-list.tsx` | Card-button pattern source |
| P1 | `apps/app/src/features/walk-in/components/check-in-flow.tsx` | Toggle-picker fix site |
| P1 | `apps/app/src/features/course/components/course-balance-card.tsx` | Date-render bug |
| P1 | `apps/app/src/routes/{appointments,reports,audit}.tsx` | Page-header dedup + filter wiring |
| P2 | `apps/app/src/lib/format.ts` | Existing `formatDate` reuse |

---

## Patterns to Mirror

### PAGE_HEADER (NEW shared primitive)
```tsx
// SOURCE: extracted from repeated h2 in routes/index.tsx, patients.tsx, etc.
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 sm:flex-nowrap">
      <div className="min-w-0">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
```

### KPI_TILE (NEW)
```tsx
// SOURCE: derived from reports.tsx:104-130 + Executive Dashboard rule
interface KpiTileProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number[];          // last N data points for sparkline
  status?: 'default' | 'warning' | 'destructive';
}
// Renders Card + icon + value (text-3xl tabular-nums) + sparkline svg
```

### FORM_ERROR (NEW shared)
```tsx
// SOURCE: replaces ad-hoc <p className="text-sm text-destructive"> across 8+ forms
export function FormError({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="text-sm text-destructive" role="alert" aria-live="assertive">
      {children}
    </p>
  );
}
export function FormStatus({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
      {children}
    </p>
  );
}
```

### SELECTABLE_CARD (NEW)
```tsx
// SOURCE: collapses appointment-list.tsx:51, patient-list.tsx:73, inventory-list.tsx:39
interface SelectableCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel: string;     // explicit — concatenated content rarely useful for SR
  selected?: boolean;
}
// Renders <button> wrapping <Card>. Single ring on the button, no extra Card border on hover.
// 44x44 minimum height. cursor-pointer baked in.
```

### TENANT_GATE (NEW)
```tsx
// SOURCE: replaces 4 different no-tenant treatments
export function TenantGate({ children }: { children: React.ReactNode }) {
  const tenantId = useDevToolbar((s) => s.tenantId);
  const { t } = useTranslation();
  if (!tenantId) {
    return <EmptyState icon={Building2} title={t('common.noTenant')} />;
  }
  return <>{children}</>;
}
```

### MOBILE_NAV (NEW)
```tsx
// SOURCE: Sheet primitive from components/ui/sheet.tsx
// Shows hamburger trigger in TopBar at <md; sheet contains the same nav items as Sidebar.
// Bottom-tab bar at <sm with 4 primary items (Home, Patients, Appointments, Reports).
```

### TOUCH_TARGET_BASELINE
```css
/* SOURCE: globals.css update — applies 44x44 floor without per-component churn */
@layer components {
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### FOCUS_RING_AAA
```css
/* SOURCE: globals.css:22-24 update */
:focus-visible {
  outline: 3px solid hsl(var(--ring));
  outline-offset: 3px;
  border-radius: var(--radius);
}
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `apps/app/src/styles/globals.css` | UPDATE | Focus ring 2→3px, `.touch-target` utility, reduced-motion `animation-name: none` |
| `apps/app/src/components/page-header.tsx` | CREATE | Shared header primitive |
| `apps/app/src/components/tenant-gate.tsx` | CREATE | Replaces 4 ad-hoc guards |
| `apps/app/src/components/ui/form-feedback.tsx` | CREATE | `FormError` + `FormStatus` shared a11y primitives |
| `apps/app/src/components/ui/selectable-card.tsx` | CREATE | Card-button pattern with explicit aria-label |
| `apps/app/src/components/ui/kpi-tile.tsx` | CREATE | Executive-dashboard tile |
| `apps/app/src/components/ui/sparkline.tsx` | CREATE | Lightweight inline-svg sparkline (no recharts) |
| `apps/app/src/components/mobile-nav.tsx` | CREATE | Sheet trigger + nav links |
| `apps/app/src/components/bottom-tab-bar.tsx` | CREATE | `<sm` 4-item dock |
| `apps/app/src/features/_shared/use-today-kpis.ts` | CREATE | Aggregates queue / appointments / completed / low-stock |
| `apps/app/src/components/page-shell.tsx` | UPDATE | Wire mobile-nav + bottom-tab-bar; safe-area pad for FAB |
| `apps/app/src/components/sidebar.tsx` | UPDATE | 44px nav-item height; `aria-current` |
| `apps/app/src/components/top-bar.tsx` | UPDATE | Lang toggle aria-pressed + label both languages; mobile hamburger |
| `apps/app/src/components/dev-toolbar.tsx` | UPDATE | Move after `<main>` in DOM; region label; ensure not in main tab order until expanded |
| `apps/app/src/components/ui/dialog.tsx` | UPDATE | Close button 44x44; `t('common.close')` |
| `apps/app/src/components/ui/sheet.tsx` | UPDATE | Same close-button fix |
| `apps/app/src/components/ui/progress.tsx` | UPDATE | Accept + forward `aria-label` |
| `apps/app/src/routes/index.tsx` | UPDATE | KpiTile bar + 2-col layout, PageHeader, TenantGate |
| `apps/app/src/routes/appointments.tsx` | UPDATE | DateNav + PageHeader + TenantGate |
| `apps/app/src/routes/patients.tsx` | UPDATE | PageHeader |
| `apps/app/src/routes/courses.tsx` | UPDATE | PageHeader + EmptyState parity |
| `apps/app/src/routes/reports.tsx` | UPDATE | PageHeader; KPI tile parity (icon on every tile + sparkline) |
| `apps/app/src/routes/branches.tsx` | UPDATE | PageHeader |
| `apps/app/src/routes/inventory.tsx` | UPDATE | PageHeader + TenantGate |
| `apps/app/src/routes/audit.tsx` | UPDATE | PageHeader; date inputs `aria-invalid`/`aria-describedby` |
| `apps/app/src/features/patient/components/patient-list.tsx` | UPDATE | Replace inline card-button with `SelectableCard` |
| `apps/app/src/features/appointment/components/appointment-list.tsx` | UPDATE | Same |
| `apps/app/src/features/walk-in/components/walk-in-queue.tsx` | UPDATE | Same |
| `apps/app/src/features/inventory/components/inventory-list.tsx` | UPDATE | Same |
| `apps/app/src/features/walk-in/components/check-in-flow.tsx` | UPDATE | Course picker `aria-pressed` + check-icon when selected; `FormError` for inline errors |
| `apps/app/src/features/course/components/course-balance-card.tsx` | UPDATE | Render real `expiresAt` date |
| `apps/app/src/features/consent/components/consent-dialog.tsx` | UPDATE | `aria-required` on locked checkboxes; `FormError` |
| `apps/app/src/features/loyalty/components/redeem-dialog.tsx` | UPDATE | `FormError`, `aria-describedby` linking balance hint |
| `apps/app/src/features/export/components/export-button.tsx` | UPDATE | `FormStatus` for partial / success states |
| `apps/app/src/features/audit/components/audit-list.tsx` | UPDATE | Convert `<ul role="list">` to `<table>` with `<thead>` |
| `apps/app/src/features/report/components/*.tsx` | UPDATE | KpiTile parity + per-tile icon |
| `apps/app/src/locales/{en,th}.json` | UPDATE | `common.close`, `home.kpi.{queue,booked,done,alerts}`, `nav.menu`, lang-toggle aria strings |

## NOT Building

- Dark-mode visual polish (tokens already there)
- Real Recharts / heavy charting (sparkline stub only)
- Form RHF + Zod migration (deferred to A8)
- New primary brand colors (palette already aligned)
- Animation choreography (Accessible & Ethical excludes motion-heavy)
- Print receipt redesign (A7 backend dependency)
- Bulk-action multi-select (cited but not pilot-critical)

---

## Step-by-Step Tasks

(Tasks are ordered to minimise rework — primitives → shell → routes → feature-list rewires → audits.)

### T1: Globals — focus ring + touch-target utility + RM safety
- ACTION: Edit `apps/app/src/styles/globals.css`.
- IMPLEMENT: focus-visible 3px / offset 3, add `.touch-target` `@layer components`, append `animation-name: none !important` to reduced-motion block.
- VALIDATE: `pnpm typecheck && pnpm build`; visual sweep — focus rings visibly thicker.

### T2: Shared primitives (`PageHeader`, `TenantGate`, `FormError/Status`, `SelectableCard`, `KpiTile`, `Sparkline`)
- ACTION: Create the 6 files under `components/`.
- IMPLEMENT: Per snippets above. Sparkline = inline SVG, accepts `number[]`, normalises 0..1, draws a polyline; `<svg role="img" aria-label={...} class="h-8 w-full">`.
- VALIDATE: Each primitive imports cleanly; no Tailwind class typos.

### T3: Mobile nav (Sheet drawer + bottom-tab dock)
- ACTION: Create `components/mobile-nav.tsx` + `components/bottom-tab-bar.tsx`.
- IMPLEMENT: Sheet trigger with `<Menu>` icon (Lucide), 44×44, lives in `TopBar` at `md:hidden`. BottomTabBar fixed `bottom-0 inset-x-0` at `sm:hidden` with 4 primary nav items (Home, Patients, Appointments, Reports). Use `aria-current="page"` on active route.
- VALIDATE: Resize to 375px → bottom-tab visible, sidebar hidden, sheet opens via hamburger.

### T4: PageShell wiring
- ACTION: Update `components/page-shell.tsx`.
- IMPLEMENT: Mount mobile-nav + bottom-tab-bar; pad `<main>` `pb-24` (safe-area for bottom-tab + FB button); ensure DevToolbar moves below `<main>` in DOM order.
- VALIDATE: Tab order at 375px — skip-link → top-bar → main → bottom-tab → dev-toolbar.

### T5: Sidebar nav-item height + aria-current
- ACTION: Update `components/sidebar.tsx`.
- IMPLEMENT: Items get `min-h-[44px] py-2.5 px-3 touch-target`; add `aria-current="page"` on active.
- VALIDATE: Keyboard tab through sidebar; AT announces "current page".

### T6: TopBar — lang toggle a11y + mobile hamburger
- ACTION: Update `components/top-bar.tsx`.
- IMPLEMENT: Lang toggle becomes Button with `aria-pressed` for current language and label "ภาษาไทย / English" reflecting next state; add `aria-live="polite"` sibling that announces switch. Hamburger appears `md:hidden` on the left.
- VALIDATE: VoiceOver reads "language, button, switches to English/Thai".

### T7: DevToolbar reposition + region
- ACTION: Update `components/dev-toolbar.tsx`.
- IMPLEMENT: Wrap in `<aside aria-label="Developer toolbar">`; place after `<main>`; collapse button focusable as last item.
- VALIDATE: Tab order in dev mode — main content reachable before toolbar.

### T8: Dialog/Sheet close button + Progress aria-label
- ACTION: Update `components/ui/{dialog,sheet,progress}.tsx`.
- IMPLEMENT: Close button gets `inline-flex h-11 w-11`; `<span class="sr-only">{t('common.close')}</span>` (tiny i18n hook in dialog content). Progress accepts `aria-label` prop and forwards to root.
- VALIDATE: Tap target ≥44; close announces in Thai when language is th.

### T9: useTodayKpis + Home redesign
- ACTION: Create hook + rewrite `routes/index.tsx`.
- IMPLEMENT: `useTodayKpis()` returns `{ queue, booked, done, lowStockAlerts, sparkline7d }` derived from existing `useTodayDashboard` hook (extend if needed) + `useInventory({ lowStockOnly: true })`. Home renders `<PageHeader title={t('home.greeting')} description={tenantBanner} />` then 4 `<KpiTile>` in a `grid grid-cols-2 lg:grid-cols-4 gap-3` then a `grid md:grid-cols-2 gap-4` for appointments + walk-in queue.
- VALIDATE: Manual smoke — Home shows 4 KPI cards + two side-by-side sections at md+.

### T10: SelectableCard rollout (patient/appointment/walk-in/inventory lists)
- ACTION: Replace inline `<button><Card>` patterns.
- IMPLEMENT: Build an `aria-label` per row from name + status + meta (e.g. `${patient.fullName}, ${phoneDisplay}, consent ${status}`). Use `cn()` to apply `ring-2 ring-ring ring-offset-1` on focus to the Card itself, no double border.
- VALIDATE: Voice Control on iPad — say a patient name, that row activates.

### T11: Course picker + form errors
- ACTION: Update `check-in-flow.tsx`, `redeem-dialog.tsx`, `consent-dialog.tsx`, `patient-form.tsx`, `payment-dialog.tsx`, `movement-form.tsx`, `export-button.tsx`.
- IMPLEMENT: Replace `<p text-destructive>` with `<FormError>`; replace partial-status `<p>` with `<FormStatus>`. Course picker buttons get `aria-pressed`, `<Check />` icon when selected. Audit date inputs: `aria-invalid={!!rangeError}` + `aria-describedby="audit-range-error"`.
- VALIDATE: Submit empty form → AT announces error.

### T12: Course balance + appointments date nav
- ACTION: Update `course-balance-card.tsx` + create `<DateNav>` shared component + wire into `appointments.tsx`.
- IMPLEMENT: course-balance shows `formatDate(course.expiresAt, locale)`; DateNav = three `<Button>`s (prev / native date input / next) with arrow keys.
- VALIDATE: Navigate to yesterday / tomorrow; back-to-today shortcut works.

### T13: PageHeader rollout + TenantGate rollout
- ACTION: Replace duplicated `<h2>` blocks across all 9 routes; replace 4 ad-hoc no-tenant guards.
- IMPLEMENT: Mechanical edit per file.
- VALIDATE: `pnpm typecheck && pnpm build`; no visual regression vs prior screenshots.

### T14: Reports KPI parity + audit list table semantics
- ACTION: Update `reports.tsx` + `audit-list.tsx`.
- IMPLEMENT: Use `KpiTile` for all 4 reports cards (icon + value + sparkline if data available). audit-list converts to `<table>` with `<thead>` (date / action / actor / resource).
- VALIDATE: AT announces "table 4 columns N rows" on Audit page.

### T15: Locale parity
- ACTION: Add new keys to `en.json` + `th.json`.
- IMPLEMENT: `common.close`, `nav.menu`, `home.kpi.{queue,booked,done,alerts}`, `home.kpi.alertsLowStock`, `topbar.langPressedTh`, `topbar.langPressedEn`, audit `audit.filter.invalidRangeAria`.
- VALIDATE: Run app in both locales; no missing-key warnings.

### T16: Validate + commit + push
- ACTION: Full pipeline.
- IMPLEMENT: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Visual smoke on 375 / 768 / 1024 / 1440 breakpoints.
- VALIDATE: Green; bundle size delta within ±5%.

---

## Testing Strategy

### Unit
| Test | Input | Expected |
|---|---|---|
| `KpiTile` | `value=12 trend=[1,2,3,4]` | renders text "12" + svg with 4 points |
| `FormError` | children="bad" | `role="alert"` element |
| `SelectableCard` | `selected=true ariaLabel="x"` | `aria-pressed="true"` + label set |
| `useTodayKpis` | seeded data | returns object with all 4 numeric keys |

### A11y manual
- [ ] Keyboard-only sweep across Home → Patients → Patient detail → Audit
- [ ] VoiceOver on iPad: lang toggle announces change; KPI tiles read "label, value"
- [ ] Tab-targets ≥44 measured via Chrome DevTools "Tap target size"
- [ ] `prefers-reduced-motion` set → no animations

### Visual
- [ ] 375 / 768 / 1024 / 1440 — no horizontal scroll, no clipped content
- [ ] Dark mode toggle (if tested) — readable contrast in both modes

---

## Validation Commands
```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm --filter @lesso/app dev   # manual smoke
```
EXPECT: All green, bundle ≤ 590 KB JS.

---

## Acceptance Criteria
- [ ] Home renders 4 KPI tiles + 2-col content
- [ ] Mobile nav reachable on 375px (sheet + bottom-tab)
- [ ] Focus rings visibly 3px / offset 3
- [ ] All form errors carry `role="alert"`
- [ ] Card-list rows use `SelectableCard` with explicit aria-label
- [ ] Course balance shows real expiry date
- [ ] Appointments page has DateNav
- [ ] Audit page is a real `<table>`
- [ ] Lang toggle announces switch
- [ ] No bare `<p text-destructive>` remains
- [ ] No regression: existing tests pass

## Risks
| Risk | L | I | Mitigation |
|---|---|---|---|
| Sparkline data not yet aggregated server-side | M | L | Render with empty array → SVG hides; collect 7-day buckets later |
| Bottom-tab + FAB collision | M | M | Push FB button up by `bottom-20` when bottom-tab is mounted |
| Card double-border on focus persists | L | L | Snapshot test with focus-visible state |
| `<table>` audit conversion breaks current truncation logic | L | M | Use `<th scope="col">` + retain text-ellipsis on `<td>` |
| Tablet scroll in two-pane Home | M | M | Use `min-h-0` on inner pane wrappers |

## Notes
- Design system + audits already persisted at `design-system/lesso-backoffice/` — keep MASTER as the canonical reference; no per-page overrides yet.
- This redesign is **structural + a11y first**. Visual flourish (illustrations, hero photography, etc.) belongs to `apps/web` (B2), not the backoffice.
- Why a primitive-first task order? 6 of the routes share the same header/empty/error treatments — landing primitives first turns the route updates into one-line edits.
