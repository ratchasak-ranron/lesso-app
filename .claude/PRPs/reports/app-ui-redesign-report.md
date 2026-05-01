# Implementation Report: Lesso Backoffice UI/UX Redesign

## Summary
Refit `apps/app` to the persisted "Accessible & Ethical" design system. Landed
shared primitives (`PageHeader`, `TenantGate`, `FormError/Status`,
`SelectableCard`, `KpiTile`, `Sparkline`, `MobileNav`, `BottomTabBar`,
`DateNav`), then mechanically rewired routes + feature lists to consume them.
Home now leads with 4 KPI tiles + 2-pane content; tablet portrait + mobile
gain a sheet drawer + bottom-tab dock; focus rings bumped to 3px AAA; every
form error carries `role="alert"`; the audit log is a real `<table>`.

## Assessment vs Reality
| Metric | Predicted | Actual |
|---|---|---|
| Complexity | Large | Large |
| Files Changed | ~32 | 31 (10 created, 21 modified) |
| Bundle delta | ±5% | +1.6% (+9 KB → 587 KB) |
| Confidence | 8/10 | 9/10 |

## Tasks Completed
| # | Task | Status |
|---|---|---|
| T1 | Globals: focus 3px + `.touch-target` + RM `animation-name: none` | done |
| T2 | Primitives (PageHeader, TenantGate, FormFeedback, SelectableCard, KpiTile, Sparkline) | done |
| T3 | MobileNav (Sheet) + BottomTabBar | done |
| T4 | PageShell wired (mobile nav + bottom-tab + safe-area pad) | done |
| T5 | Sidebar 44px nav-items + `aria-current` | done |
| T6 | TopBar lang `aria-pressed` + label both languages + hamburger | done |
| T7 | DevToolbar `<aside aria-label>` region | done |
| T8 | Dialog/Sheet close → 44×44 + i18n `common.close` | done |
| T9 | `useTodayKpis` + Home redesign with 4 KpiTiles | done |
| T10 | SelectableCard rollout (patient, appointment, inventory) | done |
| T11 | Course picker `aria-pressed` + `Check` icon + 8 forms migrated to `FormError` | done |
| T12 | Course expiry date rendered + `DateNav` wired into Appointments | done |
| T13 | PageHeader + TenantGate across 7 routes | done |
| T14 | Reports KpiTile parity + Audit list `<table>` | done |
| T15 | Locale parity (en + th) | done |
| T16 | Validate + commit + push | done |

## Validation Results
| Level | Status |
|---|---|
| Typecheck | Pass — 6/6 packages |
| Lint | Pass — 0 errors, 0 warnings (after disabling 2 false-positive `security/detect-object-injection` on constant-union lookups) |
| Tests | Pass — 6/6 unit |
| Build | Pass — 587 KB / 175 KB gzip |

## Files Changed
| File | Action |
|---|---|
| `apps/app/src/styles/globals.css` | UPDATE |
| `apps/app/src/components/page-header.tsx` | CREATE |
| `apps/app/src/components/tenant-gate.tsx` | CREATE |
| `apps/app/src/components/nav-items.ts` | CREATE |
| `apps/app/src/components/mobile-nav.tsx` | CREATE |
| `apps/app/src/components/bottom-tab-bar.tsx` | CREATE |
| `apps/app/src/components/date-nav.tsx` | CREATE |
| `apps/app/src/components/ui/form-feedback.tsx` | CREATE |
| `apps/app/src/components/ui/selectable-card.tsx` | CREATE |
| `apps/app/src/components/ui/kpi-tile.tsx` | CREATE |
| `apps/app/src/components/ui/sparkline.tsx` | CREATE |
| `apps/app/src/features/_shared/use-today-kpis.ts` | CREATE |
| `apps/app/src/components/{page-shell,sidebar,top-bar,dev-toolbar,feedback-button}.tsx` | UPDATE |
| `apps/app/src/components/ui/{dialog,sheet}.tsx` | UPDATE |
| `apps/app/src/routes/{index,patients,appointments,courses,inventory,branches,reports,audit}.tsx` | UPDATE |
| `apps/app/src/features/{patient,appointment,inventory}/components/*.tsx` (lists) | UPDATE |
| `apps/app/src/features/walk-in/components/check-in-flow.tsx` | UPDATE |
| `apps/app/src/features/course/components/{course-balance-card,active-courses-list}.tsx` | UPDATE |
| `apps/app/src/features/{consent,loyalty,export,receipt,patient,inventory}/components/*` | UPDATE (FormError) |
| `apps/app/src/features/audit/components/audit-list.tsx` | UPDATE (table semantics) |
| `apps/app/src/locales/{en,th}.json` | UPDATE |

## Deviations from Plan
- Sparkline data source not yet aggregated — Home KpiTiles render without
  trend lines for now. Will land in A7 once server-side 7-day buckets exist.
- A few inline `<p className="text-destructive">` in `loyalty-card.tsx`
  retained as pure error state (no async submit) — kept short-form rather
  than `FormError` since not a submission feedback channel.

## Issues Encountered
- `security/detect-object-injection` flagged 4 spots in `kpi-tile.tsx` and
  `sparkline.tsx` where a constant union literal indexes a `Record<>`.
  Resolved with file-level `eslint-disable` comments + WHY note.
- Scrubbed `import { Card }` from list components after migrating to
  `SelectableCard` — TS would otherwise warn about unused.
- TanStack Router `Link` `activeProps` typing accepts `aria-current`, but
  used `useLocation` + manual computation for explicit control parity with
  MobileNav and BottomTabBar.

## Next Steps
- Manual smoke at 375 / 768 / 1024 / 1440 to verify the sweep
- A7: real 7-day sparkline data + Supabase backend
- A8: FormField + RHF migration + Playwright critical-path coverage
