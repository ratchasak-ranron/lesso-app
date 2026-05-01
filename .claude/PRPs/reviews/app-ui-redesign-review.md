# Local Review: UI/UX Redesign — `3780e6e`

**Reviewed**: 2026-05-02
**Author**: ratchasak
**Branch**: main (local)
**Decision**: REQUEST CHANGES — 0 CRITICAL, 8 HIGH, 11 MEDIUM, 9 LOW

## Summary
Three parallel reviewers (typescript-reviewer, a11y-architect, code-reviewer)
audited the redesign. All 10 prior CRITICAL/HIGH a11y findings verified
**fixed** by the redesign. New HIGH issues cluster around: (a) two stray a11y
defects in the new code (dangling IDREF, inverted aria-pressed semantics),
(b) a fixed-bottom z-stack collision in DEV, (c) duplicate query subscriptions
on Home, (d) triple-implementation of "active route" detection, and
(e) untested new primitives + a stale Playwright smoke spec.

## Findings

### CRITICAL
None.

### HIGH

| # | File:Line | Issue | Fix |
|---|---|---|---|
| H1 | `apps/app/src/features/loyalty/components/redeem-dialog.tsx:100` | `aria-describedby="redeem-balance-hint redeem-points-error"` references `redeem-balance-hint` but no element with that id exists. AT silently drops the missing IDREF. | Add `id="redeem-balance-hint"` to the balance row, or remove from the describedby string. |
| H2 | `apps/app/src/components/top-bar.tsx:29` | `aria-pressed={isThai}` on a language toggle — `aria-pressed` is a stateful toggle pattern. Pressing the toggle does NOT "deselect" Thai; it switches to English. Inverted semantic confuses AT users. | Either drop `aria-pressed` (label already conveys target action), or model as `<select>` of two languages, or use `role="switch"` + `aria-checked` with the switch labelled "Thai" so checked == th. |
| H3 | `apps/app/src/components/dev-toolbar.tsx:50-55` vs `apps/app/src/components/bottom-tab-bar.tsx:14` | DEV-only `<aside>` (z-50, fixed bottom) overlaps `BottomTabBar` (z-30) at <sm. Two competing fixed bottom bars in DEV. | Hide BottomTabBar in DEV (`import.meta.env.DEV`) or float DevToolbar at `bottom-16` so the tab dock sits below it. |
| H4 | `apps/app/src/components/ui/kpi-tile.tsx:18-22, 45` | KpiTile status conveyed by `border-l-4` + icon color only — `border-warning/60` (60% alpha) may dip below 3:1 vs Card bg AND it's color-only signalling (SC 1.4.1). | Add `<span className="sr-only">{statusText}</span>` and bump status border to full opacity (`border-warning` not `/60`). |
| H5 | `apps/app/src/routes/index.tsx:28-32` + `apps/app/src/features/_shared/use-today-kpis.ts:21-23` | Home calls `useTodaysAppointments` / `useTodaysWalkIns` directly AND inside `useTodayKpis`. TanStack Query dedupes the network call, but each hook creates its own observer — inflated subscription count + duplicated memoization surface. | Either lift the queries into the route and pass derived counts to a pure `computeTodayKpis(appts, walks, lowStock)` helper, or read both `appts.data` / `walks.data` from `useTodayKpis` exposed shape. |
| H6 | `apps/app/src/components/{sidebar,mobile-nav,bottom-tab-bar}.tsx` | Active-route detection implemented three times: Sidebar uses TanStack Router's `[&.active]` class AND a manual pathname compute (two sources of truth). MobileNav + BottomTabBar use slightly different manual logic. | Extract `useIsRouteActive(to, exact)` (or a tiny `isNavItemActive(pathname, item)` pure helper); have all three nav components consume it. Drop the framework `[&.active]` class to make the manual `aria-current` the only signal. |
| H7 | `apps/app/src/components/{page-header,tenant-gate,nav-items,mobile-nav,bottom-tab-bar,date-nav}.tsx` + `components/ui/{form-feedback,selectable-card,kpi-tile,sparkline}.tsx` + `features/_shared/use-today-kpis.ts` | Zero unit tests for 10 new primitives + 1 hook. Project standard is ≥80% coverage. | Land at minimum smoke tests for each — render check, prop variants, ARIA wiring. Or accept the deferral to A8 hardening with an explicit note. |
| H8 | `apps/app/tests/e2e/smoke.spec.ts:8` | Spec asserts `[data-testid="health-status"]` which the redesigned Home no longer renders. Spec is either stale-passing-on-vacuous-DOM or already failing. | Update smoke spec to assert KpiTile presence + bottom-tab visible at 375px + sidebar visible at 1024px. |

### MEDIUM

| # | File:Line | Issue |
|---|---|---|
| M1 | `apps/app/src/components/ui/kpi-tile.tsx:30-34, 56` | `STATUS_SPARK` is an identity map between `KpiTile.Status` and `Sparkline.variant` (both `'default' \| 'warning' \| 'destructive'`). Drop the indirection. |
| M2 | `apps/app/src/components/{mobile-nav,bottom-tab-bar}.tsx` | Active-detection asymmetry — MobileNav `to === '/'` short-circuits exact-always; BottomTabBar gates on `exact \|\| to === '/'`. Latent bug if `exact` is toggled on the home item. (Subsumed by H6 fix.) |
| M3 | `apps/app/src/routes/audit.tsx:94-97` | `role="alert"` + `aria-live="polite"` mixed. `alert` implies `assertive`. Drop the explicit `aria-live` or use `role="status"` + `polite`. |
| M4 | 9 sites (`reports.tsx:37`, `branches.tsx:24`, `audit-list.tsx:16`, `course-balance-card.tsx:14`, `loyalty-card.tsx:18`, `redeem-dialog.tsx:31`, `payment-dialog.tsx:61`, `visit-summary-section.tsx:26`, `check-in-flow.tsx:235`) | `i18n.language === 'th' ? 'th' : 'en'` duplicated 9×. Extract `useLocale()` hook or `getLocale(i18n.language)` helper. |
| M5 | `apps/app/src/features/appointment/components/appointment-list.tsx:4,58` + `patient-list.tsx:6` | `CardContent` imported and used as inner padding div even though there is no wrapping `Card` (it's a `SelectableCard`). Misleading semantic. Replace with a plain styled div or rename usage. |
| M6 | `apps/app/src/components/page-shell.tsx:37` vs `bottom-tab-bar.tsx:14` | `pb-28 sm:pb-24` on main reserves 96 px between 640-767 px even though `BottomTabBar` is hidden at `sm` (640+). Dead whitespace. Use `pb-28 sm:pb-6` to match. |
| M7 | `apps/app/src/components/page-header.tsx:7-19` | No `className` prop / `cn()`. Every other primitive accepts override. Easy now, hard after widespread adoption. |
| M8 | `apps/app/src/features/walk-in/components/check-in-flow.tsx:124-130` | Compensating rollback writes `sessionsTotal` not `sessionsUsed` — flagged "stub" but mutates the wrong field if it ever runs. Pre-existing; flag for A7. |
| M9 | `apps/app/src/components/ui/sparkline.tsx:21-22` | `Math.min(...data)` spread blows call-stack at large array sizes. Sparkline scale is fine (≤30 points) but `data.reduce` is the safer idiom. |
| M10 | `apps/app/src/features/patient/components/patient-form.tsx:30` | Validation error displays `t('patient.fullName')` (label string) as the error message. Should be a dedicated `patient.errors.nameRequired` key. Pre-existing, surfaced by the redesign sweep. |
| M11 | `apps/app/src/components/page-shell.tsx:11-13` | `DevToolbar` typed `LazyExoticComponent \| null`. Truthy check conflates null-vs-component. Cleaner: `if (import.meta.env.DEV) { ... }` guard. |

### LOW

| # | File:Line | Issue |
|---|---|---|
| L1 | `apps/app/src/components/ui/kpi-tile.tsx:47-51` | Value `<p>` is not programmatically associated with its CardTitle. Adjacent reading order works but no explicit linkage. |
| L2 | `apps/app/src/components/date-nav.tsx` | No left/right arrow shorthand at the field level. Browser-native date input handles its own keys; tab-order through prev/today/next is fine. |
| L3 | `apps/app/src/features/audit/components/audit-list.tsx:32-33` | `<table>` at 375px requires horizontal scroll. Acceptable per WCAG 1.4.10 data-table exception, but flag-only. |
| L4 | `apps/app/src/components/bottom-tab-bar.tsx:14` + `sidebar.tsx:11` | Tablet portrait band 640-767 px has no bottom-tab AND no sidebar; only the hamburger. Discoverable but worth noting. |
| L5 | `apps/app/src/routes/reports.tsx:48-50` | `<TenantGate>` opening tag indented one level less than its child `<div>`. Visual nesting convention break only. |
| L6 | `apps/app/src/components/nav-items.ts:14-34` | Union literal types for `to` + `labelKey` need manual update for every new route. Type-safe but rigid. |
| L7 | `apps/app/src/components/ui/sparkline.tsx` + `kpi-tile.tsx` | File-level eslint-disable for `security/detect-object-injection` is fine but a per-line disable with `--` rationale would tell future readers what was waived and why. |
| L8 | `apps/app/src/components/feedback-button.tsx:29` | FAB at `bottom-20 sm:bottom-6`. Overlap calc verified clear of BottomTabBar. OK. |
| L9 | `apps/app/src/components/mobile-nav.tsx:24` | `Button size="icon"` (h-10 w-10 = 40px) PLUS `touch-target` (min-h/w 44px). `min-*` overrides — final hit is 44. Works but two systems describing the same baseline. |

## Verified Fixes (against the prior review)
| Prior finding | Status | Evidence |
|---|---|---|
| Hard-coded EN "Close" sr-only | FIXED | `dialog.tsx` + `sheet.tsx` use `t('common.close')` |
| Sidebar invisible <md | FIXED | `mobile-nav.tsx` + `bottom-tab-bar.tsx` wired in `page-shell.tsx` |
| DevToolbar tab-trap order | FIXED | `<aside aria-label>` wrapper |
| Card-button missing accessible names | FIXED | `SelectableCard` with curated `ariaLabel` builder |
| Async errors lacked `role="alert"` | FIXED | `FormError` primitive |
| Course-picker color-only state | FIXED | `aria-pressed` + `<Check>` icon |
| Dialog/Sheet close <44 | FIXED | `h-11 w-11` |
| Audit dates `aria-invalid` linkage | FIXED | `aria-invalid` + `aria-describedby` |
| Focus ring 2px | FIXED | 3px / offset 3 in globals |
| Course expiry date missing | FIXED | `formatDate(course.expiresAt, locale)` |

## Validation Results
| Check | Result |
|---|---|
| Typecheck | Pass |
| Lint | Pass (zero errors, zero warnings after scoped disables) |
| Tests | Pass (6/6 unit) |
| Build | Pass (587 KB / 175 KB gzip) |

## Files Reviewed
- All 10 created components/hooks
- 5 modified shell components
- 8 modified routes
- 12 modified feature components
- 2 modified UI primitives
- globals.css + locale JSONs

## Decision
**REQUEST CHANGES.** 8 HIGH issues. Pilot-blocking subset:
- H1 (dangling IDREF)
- H2 (inverted `aria-pressed` on lang toggle)
- H3 (DevToolbar / BottomTabBar z-stack collision in DEV)
- H4 (KpiTile color-only status)
- H8 (broken Playwright smoke spec)

Improvement HIGH (acceptable to fold into A8 hardening, with explicit note):
- H5 (Home double-fetch — observer count, not network)
- H6 (consolidate route-active detection)
- H7 (primitive tests — already deferred to A8 per plan)
