# Implementation Report: A3 — Supporting Modules

## Summary
Built owner-facing revenue + operations modules. 4 entities (Receipt, Commission, LoyaltyAccount/Transaction, InventoryItem/Movement) wired through the same A1/A2 pattern. Walk-in payment dialog completes the receipt → commission accrual → loyalty earn chain in one mutation. Reports page aggregates revenue + visits + commission-by-doctor + loyalty + low-stock in parallel via `Promise.all`. Inventory page lists items with low-stock highlights + movement form.

## Assessment vs Reality

| Metric | Predicted | Actual |
|---|---|---|
| Complexity | Large (~35 files, 1800 lines, 21 tasks, 5 days) | Large (single session) |
| Confidence | 8/10 | 9/10 — A1+A2 patterns carried directly |
| Bundle target | ≤ 700 KB gzipped | **163 KB gzipped** |

## Tasks Completed (21/21)

| # | Task | Status |
|---|---|---|
| 1-5 | Domain schemas (Receipt, Commission, Loyalty, Inventory) + barrel | Complete |
| 6-9 | 4 mock-server repositories | Complete (with InsufficientPointsError + InsufficientStockError + InventoryItemNotFoundError) |
| 10-13 | 4 handler sets | Complete (server-side commission accrual + loyalty earn on receipt POST) |
| 14 | ApiClient extension | Complete (4 new resources) |
| 15-16 | Walk-in payment dialog + flow extension | Complete (browser print stub) |
| 17 | Reports page + feature | Complete (4-card grid + commission table + low-stock alerts) |
| 18 | Inventory page + feature | Complete (list + movement dialog) |
| 19 | Sidebar + locales | Complete (60+ new i18n keys, both locales) |
| 20 | Seed extension | Complete (SEED_VERSION 2 → 3; receipts + commissions + loyalty linked to existing appointments; 8 inventory SKUs per branch) |
| 21 | Validate | Pass — 14/14 turbo tasks |

## Validation Results

| Check | Result |
|---|---|
| `pnpm -r typecheck` | Pass — 6 workspaces |
| `pnpm -r lint` | Pass — 0 warnings |
| Tests | Pass — 6/6 (no new tests; A5 hardening) |
| Build | Pass — 538 KB / **163 KB gzipped** |
| `pnpm turbo build` | Pass — 14/14 tasks |

## Files Changed (~35 created, ~10 updated)

**Created:**
- `packages/domain/src/{receipt,commission,loyalty,inventory}.ts`
- `packages/mock-server/src/repositories/{receipt,commission,loyalty,inventory}.ts`
- `packages/mock-server/src/handlers/{receipts,commissions,loyalty,inventory}.ts`
- `apps/app/src/features/receipt/{hooks/use-receipts.ts, components/payment-dialog.tsx, index.ts}`
- `apps/app/src/features/inventory/{hooks/use-inventory.ts, components/{inventory-list,movement-form}.tsx, index.ts}`
- `apps/app/src/features/report/{hooks/use-monthly-report.ts, index.ts}`
- `apps/app/src/routes/{reports,inventory}.tsx`

**Updated:**
- `packages/domain/src/index.ts` (barrel)
- `packages/mock-server/src/{seed,handlers/index}.ts`
- `packages/api-client/src/{types,index,adapters/mock}.ts`
- `apps/app/src/{routeTree.gen.ts, components/sidebar.tsx, features/walk-in/components/check-in-flow.tsx, locales/{th,en}.json}`

## Deviations from Plan

1. **Receipt `update`/`delete`/`void` not exposed in ApiClient at A3.**
   - **WHY**: Plan said receipt CRUD; only `list`/`get`/`create` shipped because void/refund flow defers to A5 polish. Repos have no update/delete methods either.

2. **Doctor commission detail-drill UI deferred.**
   - **WHY**: Plan called for `[Detail]` link per doctor. Reports row shows aggregate only. A4 multi-branch dashboard owns drill-downs.

3. **Receipt `markPaid`/status transitions not exposed.**
   - **WHY**: Repo creates receipts already in `paid` status (mock backend simplification). Real backend in A7 will need draft→paid transition.

4. **Loyalty redeem UI not surfaced.**
   - **WHY**: API exists (`POST /v1/loyalty/redeem` + `apiClient.loyalty.redeem`) but no dialog ships at A3. Payment dialog hard-codes earn-only path. Redemption UI in A5 polish.

5. **No A3 unit tests.**
   - **WHY**: Same A2 deviation — coverage push to 80% lands in A5.

## Issues Encountered

| Issue | Resolution |
|---|---|
| `commission.ts` exports unused `Course` type | Removed from imports |
| Repository pattern triggered ESLint security warnings | Already scoped-disabled in A2 review fixes — no new warnings |

## Next Steps

- Manual iPad portrait test:
  - Set tenant=Clinic A, branch=Sukhumvit, user=Khun Sak (owner)
  - `/reports` → see revenue + commission + loyalty + inventory alerts
  - `/inventory` → see Lidocaine 2ml as low-stock; click → +Movement → in 10 → save
  - Switch user to Khun Ploy (receptionist) → walk-in flow → complete → take payment → receipt printed
- A4 plan next (Multi-Branch + AI)
- Push commits to GitHub

## A2 Patterns Re-used (validation)

- ✅ NAMING_CONVENTION
- ✅ ERROR_HANDLING (`@/lib/errors` for app, custom error classes in repos)
- ✅ REPOSITORY_PATTERN (4 new repos)
- ✅ SERVICE_PATTERN (header-first context, parsed query params)
- ✅ FEATURE_FOLDER_PATTERN (4 new features)
- ✅ QUERY_HOOK_PATTERN (4 new hook modules)
- ✅ ROUTE_PATTERN (declarative `routeTree.gen.ts` extended to 7 routes)
- ✅ A2 H1 useRef fence pattern in `payment-dialog.tsx`
- ✅ Multi-mutation seam documented (server-side commission/loyalty atomicity gap — same A2 H2 limitation)

## Confidence Calibration

Plan said 8/10; execution **9/10**. The owner-monthly-review flow lands clean. Risk concentrated in T15 payment dialog (multi-mutation) — handler does it server-side now (commission + loyalty inside receipt POST), which is cleaner than client-orchestrated. A7 backend swap will need a real DB transaction wrapping the same three writes.
