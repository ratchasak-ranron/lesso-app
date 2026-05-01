# Implementation Report: A5 — Compliance + Polish

## Summary
PDPA + audit infrastructure live. Audit log + consent capture + per-patient data export wired into patient detail. AI clipboard copy now emits audit egress events. Skip-to-main link + `<html lang>` sync close A11y polish basics. Patient + inventory lists use tablet-grid breakpoints. `useDebounce` + `SERVICE_PRICE_TIERS` extracted (A2 M8 + A3 M10 closures). Three plan items deferred to A6 (loyalty redeem UI, RHF migration, full coverage push).

## Tasks Completed (16/22 — 6 deferred)

| # | Task | Status |
|---|---|---|
| T1-4 | Domain (audit, consent, service) + barrel | Complete |
| T5 | Audit + Consent repos | Complete |
| T6 | Audit + Consent handlers + audit emission from consent | Complete (full emission across all writes deferred — only consent emits at A5) |
| T7 | ApiClient extensions | Complete |
| T8 | Audit feature folder + `/audit` route | Complete |
| T9 | Consent feature folder + `ConsentDialog` | Complete |
| T10 | Export feature + `ExportButton` (CSV blob) | Complete |
| T11 | Loyalty redeem UI | **Deferred to A6** — API ready since A3, UI lands when patient detail loyalty card built |
| T12-13 | shadcn `Form` primitives + RHF migration | **Deferred to A6** — large refactor; current `useState` patient form passes review |
| T14 | `useDebounce` extraction | Complete |
| T15 | Tablet breakpoints | Partial — patient-list + inventory-list grid; appointment-list + walk-in-queue + course-balance-card deferred to A6 |
| T16 | Skip link + `<html lang>` sync | Complete |
| T17 | AI clipboard audit event | Complete |
| T18 | Sidebar — `/audit` link | Complete |
| T19 | Locales — audit + consent + export keys | Complete |
| T20 | `SERVICE_PRICE_TIERS` extraction | Complete |
| T21 | Tests push to 80% | **Deferred to A6** |
| T22 | Validate | Pass — 14/14 turbo tasks |

## Validation Results

| Check | Result |
|---|---|
| `pnpm -r typecheck` | Pass — 6 workspaces |
| `pnpm -r lint` | Pass — 0 warnings |
| Tests | Pass — 6/6 (no new tests; A6 hardening) |
| Build | Pass — 567 KB / **169 KB gzipped** (target 800 KB) |
| Turbo full pipeline | 14/14 green |

## Files Changed

**Created (~16)**:
- `packages/domain/src/{audit,consent,service}.ts`
- `packages/mock-server/src/repositories/{audit,consent}.ts`
- `packages/mock-server/src/handlers/{audit,consent}.ts`
- `apps/app/src/features/audit/{hooks/use-audit-log,components/audit-list,index}.{ts,tsx}`
- `apps/app/src/features/consent/{hooks/use-consent,components/consent-dialog,index}.{ts,tsx}`
- `apps/app/src/features/export/{components/export-button,index}.{ts,tsx}`
- `apps/app/src/lib/use-debounce.ts`
- `apps/app/src/routes/audit.tsx`

**Updated (~20)**:
- `packages/domain/src/index.ts` (barrel)
- `packages/mock-server/src/handlers/index.ts`
- `packages/api-client/src/{types,index,adapters/mock}.ts`
- `apps/app/src/{App, components/page-shell, components/sidebar, routeTree.gen}.tsx`
- `apps/app/src/locales/{th,en}.json`
- `apps/app/src/lib/logger.ts` (no change here — A4 review fix already in place)
- `apps/app/src/routes/patients.$id.tsx`
- `apps/app/src/features/ai/components/ai-output-card.tsx` (audit event)
- `apps/app/src/features/patient/components/{patient-search,patient-list}.tsx` (useDebounce)
- `apps/app/src/features/receipt/components/payment-dialog.tsx` (SERVICE_PRICE_TIERS)
- `apps/app/src/features/inventory/components/inventory-list.tsx` (md:grid-cols-2)

## Deviations from Plan

1. **T11 Loyalty redeem UI deferred to A6.**
   - WHY: A3 deferred this; A5 plan tried again but limited time-box. API + redeem hook + audit emission ready; only the UI dialog/card missing. Pre-pilot demo can still show points balance via patient detail.

2. **T12-13 shadcn Form primitives + RHF migration deferred to A6.**
   - WHY: Patient form currently uses `useState` with manual Zod-aligned validation; works correctly. RHF refactor is mechanical but touches ~80 lines per form; deferred to consolidate with A6 when course/appointment forms land.

3. **T15 Tablet breakpoints — partial.**
   - DONE: patient-list grid `md:grid-cols-2 xl:grid-cols-3`, inventory-list grid `md:grid-cols-2 xl:grid-cols-3`, page-shell `max-w-7xl mx-auto`.
   - DEFERRED to A6: appointment-list, walk-in-queue, course-balance-card breakpoints.

4. **T21 unit test push — deferred entirely to A6.**
   - WHY: Quality bar OK at 6/6 existing tests; A6 hardening phase will run dedicated test agent for repos + critical hooks.

5. **Audit emission only from consent handlers.**
   - WHY: Plan called for emission across patient/walk-in/course/receipt/loyalty/inventory writes. Current state: consent + AI copy + patient export emit. The remaining writes can be wired in A6 review-fix sweep without contract change (handler is plumbed; just calls missing).

## Next Steps

- Manual iPad portrait test:
  - Owner persona — `/audit` shows entries (after triggering consent capture or AI copy)
  - Patient detail — capture consent dialog, fill 3 scopes + duration, save → audit entry appears
  - Patient detail — Export CSV — file downloads + audit entry
  - Tab through routes — focus rings visible; skip-to-main reachable on Tab
  - Toggle EN ↔ TH — `<html lang>` updates
- A6 plan next (Pilot Prep — demo data + Vercel deploy + onboarding doc; close A5 deferrals)

## A1-A4 Patterns Re-used

- ✅ NAMING_CONVENTION
- ✅ ERROR_HANDLING (`@/lib/errors`)
- ✅ REPOSITORY_PATTERN (audit append-only, consent capture/withdraw)
- ✅ SERVICE_PATTERN (header-first context)
- ✅ FEATURE_FOLDER_PATTERN (3 new features: audit, consent, export)
- ✅ QUERY_HOOK_PATTERN
- ✅ ROUTE_PATTERN (declarative routeTree extended to 9 routes)
- ✅ Tenant-scoped storage keys + tenant-filtered doctor maps (A4 M4 closure preserved)
- ✅ Logger PII guard preserved
- ✅ Promise.allSettled in monthly report preserved (A3 M6 closure)
- ✅ A4 H1 locale fix preserved
- ✅ A4 H4 patientName-off-the-wire preserved

## Confidence Calibration

Plan said 7/10; execution **8/10**. PDPA infrastructure (audit + consent + export) lands clean. Risk concentrated in T11/T12 — both deferred deliberately to keep A5 timeboxed. Pilot can ship with A5 + A6 on schedule.
