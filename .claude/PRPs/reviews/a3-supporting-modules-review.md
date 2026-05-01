# Code Review: A3 — Supporting Modules

**Reviewed**: 2026-05-01
**Decision**: **REQUEST CHANGES** — 0 CRITICAL · 6 HIGH · 8 MEDIUM · 5 LOW
**Reviewers**: typescript-reviewer + security-reviewer + code-reviewer (parallel)

## Summary
A3 patterns adhere to A1/A2 contract. Server-side cascade (receipt → commission accrual → loyalty earn) is architecturally sound. Concerns concentrate on: receipt counter atomicity, loyalty TOCTOU on first earn, commission summary cast, missing error states on new routes, and `adjust` inventory semantic ambiguity. No new vulnerabilities; financial fields not in PII guard yet.

Validation green: lint+typecheck+test+build, 14/14 turbo, 163 KB gzipped, 0 vulns.

---

## Findings (deduplicated)

### CRITICAL
None.

### HIGH

| ID | File:Line | Issue | Fix |
|---|---|---|---|
| H1 | `packages/mock-server/src/repositories/receipt.ts:21-27` | **Receipt counter TOCTOU** — `nextNumber` reads + writes localStorage non-atomically. Concurrent POST or retry → duplicate receipt numbers. | Acceptable mock-only; document A7 must use DB sequence. Add `// TODO A7: replace with DB sequence`. |
| H2 | `packages/mock-server/src/repositories/loyalty.ts:90-124` | **`applyDelta` double-read race** — reads accounts twice, mutates from stale snapshot. Two concurrent earns on same patient → second clobbers first. Financial impact. | Single read + mutation on the same snapshot (mirror A2 `courseRepo.decrement` pattern). |
| H3 | `packages/api-client/src/adapters/mock.ts:426-438` | **Unsafe `as DoctorCommissionSummary[]` cast** — `SummarySchema.status: z.string()` is wider than the typed union. Future unexpected status string silently renders unknown key. | Use `CommissionStatusSchema.or(z.literal('mixed'))` for the schema's `status` field; remove cast. |
| H4 | `packages/mock-server/src/repositories/{receipt,commission}.ts` (`inRange` duplicated) | DRY violation — two identical `inRange` functions. Drift risk. | Extract to `packages/mock-server/src/repositories/_utils.ts`; both repos import. |
| H5 | `apps/app/src/routes/reports.tsx:56-206` | **No error state** — `useMonthlyReport` returns `isError` but page renders blank on failure. Regression vs A2 `patients.$id.tsx`. | Add `{report.isError ? <p className="text-destructive">{t('common.error')}</p> : null}`. |
| H6 | `packages/mock-server/src/repositories/inventory.ts:94-96` | **`adjust` movement stores ambiguous quantity** — UI labels it "new stock level"; repo persists `quantity: input.quantity` (absolute) into movement record indistinguishable from in/out delta. Audit trail will misread. | Either store delta (`nextStock - item.currentStock`) or add `absoluteTarget` field to `InventoryMovement` schema. |

### MEDIUM

| ID | File:Line | Issue |
|---|---|---|
| M1 | `apps/app/src/features/inventory/components/movement-form.tsx:25-44` | `MovementForm` lacks `useRef` submit fence (A2 H1 pattern). Double-tap can fire two mutations. Add `submittingRef`. |
| M2 | `packages/mock-server/src/handlers/receipts.ts:55-58` | Cascade has no try/catch — partial failure (commission/loyalty throws) returns 500 with receipt already persisted. Wrap side-effects in try/catch + warning log; return 201 with `warnings` array. |
| M3 | `packages/mock-server/src/repositories/loyalty.ts:29` + `handlers/loyalty.ts:57` | 409 response leaks current loyalty balance in error message. PDPA-sensitive. Return generic `"Insufficient points"` + structured `{ available, requested }` fields for client. |
| M4 | `apps/app/src/lib/logger.ts:10-34` | PII guard misses financial fields — add `'amount'`, `'balance'`, `'total'`, `'tip'`, `'discount'`, `'unitCost'`, `'baseAmount'`, `'rate'`, `'pricePaid'`, `'subtotal'`. No active leak (no A3 logger call sites pass full receipt objects), but close before code does. |
| M5 | `packages/domain/src/inventory.ts:19` | `unitCost` exposed in list endpoint to all roles. Commercial sensitivity. Strip from response unless caller is owner/manager (A7). |
| M6 | `apps/app/src/features/report/hooks/use-monthly-report.ts:25-33` | `Promise.all` is all-or-nothing — one failure blanks the report. `Promise.allSettled` with per-source null-coalesce makes page resilient when (e.g.) inventory unseeded. |
| M7 | `apps/app/src/routes/inventory.tsx:18` | Same as H5 — no error state on `useInventoryItems`. |
| M8 | i18n loyalty namespace | `loyalty.*` keys absent from both locales though A5 will need them. Adding empty placeholders now establishes contract. |
| M9 | `packages/mock-server/src/handlers/receipts.ts:56` | Loyalty earn condition `total > 0` is correct math but undocumented; pure course-redeem (total=0) silently skips earn. Add `// Course-redeem receipts have total=0 and intentionally do not earn points` comment. |
| M10 | `apps/app/src/features/receipt/components/payment-dialog.tsx:21` + `seed.ts` (twice) | `[3000, 5000, 8000, 12000]` repeated 3× as service price tiers. Extract to shared constant in `@lesso/domain` or app config. |
| M11 | `packages/domain/src/inventory.ts:57-59` | `isLowStock` uses `<=` — alert fires at exactly minStock. Likely product wants `<` (below min). Verify intent. |

### LOW

| ID | File:Line | Issue |
|---|---|---|
| L1 | `packages/mock-server/src/seed.ts:388-403` | Tenant B has no seeded doctors so receipt counter never initialized for B. UI receipt creation starts at `00001`. Cosmetic but causes counter divergence from seeded data. Either always init counter, or seed Tenant B doctors. |
| L2 | `apps/app/src/routes/reports.tsx:162` | `font-mono` on commission amount inconsistent with `font-heading` / default elsewhere. Align convention. |
| L3 | `packages/mock-server/src/handlers/commissions.ts:6` | Imports `getUsers` from `seed.ts` to resolve doctor names — leaks seed boundary into handler. Acceptable for mock; add `// TODO A7` comment. |
| L4 | `apps/app/src/routes/reports.tsx:12-13` | `MONTHS_TH`/`MONTHS_EN` hard-coded outside i18n system. Use `Intl.DateTimeFormat({ month: 'short' })` driven by `i18n.language`. |
| L5 | `apps/app/src/features/inventory/components/inventory-list.tsx:38-43` | When `onSelectItem` is undefined, items still render as `<button>` with `cursor-default` — wrong semantics. Should render as `<div>`/`<li>` directly. |

---

## Validation Results

| Check | Result |
|---|---|
| `pnpm -r typecheck` | Pass — 6/6 |
| `pnpm -r lint` | Pass — 0 warnings |
| Tests | Pass — 6/6 (no new tests; A5 hardening) |
| Build | Pass — 538 KB / 163 KB gzipped |
| `pnpm audit` | 0 vulns |

---

## Positives

- Server-side cascade (receipt → commission → loyalty inside POST handler) — better than client-orchestrated triple-mutation
- Lexicographic ISO-8601 date comparison in `inRange` — concise, no Date allocations
- `tabular-nums` + `formatCurrency` discipline consistent across all 4 entities
- Payment dialog `useRef` fence applied (A2 H1 pattern preserved)
- TanStack Router routes registered declaratively — no magic strings
- Tenant-scoped storage keys → cross-tenant leak structurally impossible
- Header UUID validation + Zod-parsed query params
- Zero `dangerouslySetInnerHTML` in any A3 code
- Mock-server still tree-shaken from prod bundle

---

## Decision

**REQUEST CHANGES** — fix 6 HIGH before A4. Two of the HIGHs (H5 missing error state + H4 DRY) are A2 pattern regressions that A4 will mirror if not fixed.

### Priority Fix Order

1. **H2** (loyalty applyDelta TOCTOU) — financial impact
2. **H3** (commission cast) — type-safety leak
3. **H4** (`inRange` DRY) — extract to `_utils.ts`
4. **H5** + **M7** (error states on Reports + Inventory pages) — A2 regression
5. **H6** (adjust movement semantics) — audit trail
6. **H1** (receipt counter) — TODO comment for A7 sufficient at MVP
7. MEDIUMs M1, M2, M4, M11 (form fence, cascade try/catch, financial PII guard, isLowStock semantics)
8. Defer M3, M5, M6, M8-M10, all LOWs to A5

---

## Next

Apply HIGHs + critical MEDIUMs (H1-H6 + M1, M2, M4, M11)? ~25 min.
