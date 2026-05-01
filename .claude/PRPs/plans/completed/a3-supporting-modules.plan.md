# Plan: A3 — Supporting Modules (Billing, Commission, Loyalty, Inventory)

## Summary
Build owner-facing revenue and operations modules. 4 entities (Receipt, Commission, LoyaltyAccount + Transaction, InventoryItem + Movement) wired through the same A1/A2 pattern: domain Zod → MSW handlers → ApiClient → React Query hooks → 4 routes. Receipt PDF stub. Owner persona completes month-end revenue review on `/reports`.

## User Story
As **clinic owner Khun Sak**,
I want **a single page that shows monthly revenue, doctor commissions earned, points distribution, and low-stock alerts**,
so that **I can do month-end review in 5 minutes without opening Excel or paper**.

## Problem → Solution
A2 ships the receptionist's daily surface. → A3 adds the owner's monthly surface: receipts on every completed visit, commission accruing per-doctor per-service, loyalty points on every payment, inventory tracking on consumables.

## Metadata
- **Complexity**: Large (~35 files, ~1800 lines, 18 tasks, ~5 days)
- **Source PRD**: `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md`
- **PRD Phase**: A3 — Supporting Modules
- **Estimated Files**: ~35 created, ~5 updated
- **Depends on**: A2 complete (uses Patient, Appointment, Course, WalkIn types and the walk-in orchestrator as integration point)

---

## UX Design

### Reports landing — owner monthly review
```
┌─────────────────────────────────────────────────────────┐
│ Reports — May 2026                          [TH/EN]    │
│ ─────────────────────────────────────────────────────── │
│  ┌── Revenue ────────┐  ┌── Visits ──────────────────┐  │
│  │ ฿483,200          │  │ 142 visits                 │  │
│  │ 78 paid receipts  │  │ +12% vs last month         │  │
│  └───────────────────┘  └────────────────────────────┘  │
│                                                         │
│  ┌── Commission by doctor ─────────────────────────┐    │
│  │ Dr. Anong       28 visits   ฿42,000   [Detail]  │    │
│  │ Dr. Som         19 visits   ฿28,500   [Detail]  │    │
│  │ Dr. Chan        12 visits   ฿18,000   [Detail]  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌── Loyalty ──────────────────────────────────────┐    │
│  │ Active members: 87 · Points outstanding: 45,200 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌── Inventory alerts ─────────────────────────────┐    │
│  │ ⚠ Botulinum 100u — 3 units left (min: 10)       │    │
│  │ ⚠ Hyaluronic 1ml — 5 units left (min: 8)        │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Walk-in flow — payment hand-off (extends A2)
```
After "Complete" → toast: "Visit completed"
                 → optional [Take payment] CTA
Tap Take payment → small dialog:
  Service: Botox 100u           ฿5,000
  Course session redeem? [✓]    -฿5,000
  Tip                           ฿0
  ─────────────────────────────
  Total                          ฿0  (covered by course)
  [Print receipt] [Skip]
                 → Toast: "Receipt #00237" + commission +฿2,500 logged
```

### Inventory page
```
┌─────────────────────────────────────────────┐
│ Inventory                  [+ Movement]    │
│ ─────────────────────────────────────────── │
│  Botulinum 100u    32 units    Min 10      │
│  Hyaluronic 1ml    24 units    Min 8       │
│  Lidocaine 2ml      3 units ⚠  Min 10      │
│  Sterile gauze    150 units    Min 50      │
└─────────────────────────────────────────────┘
```

---

## Mandatory Reading

| Priority | File | Why |
|---|---|---|
| P0 | `.claude/PRPs/plans/completed/a2-core-flows.plan.md` | A2 patterns A3 must follow |
| P0 | `.claude/PRPs/reports/a2-core-flows-report.md` | Deviations + open work A3 inherits |
| P0 | `.claude/PRPs/reviews/a2-core-flows-review.md` | Review fixes already applied (H1-H6 + M1, M2, M5, M7); deferred MEDIUMs (M3, M4, M6, M8, M9) — A3 must not regress |
| P0 | `apps/app/src/features/walk-in/components/check-in-flow.tsx` | A3 extends this with payment step |
| P0 | `packages/mock-server/src/repositories/course.ts` | Atomic decrement pattern — receipts will follow same atomicity contract |
| P0 | `packages/mock-server/src/handlers/_shared.ts` | New parsers (`parseIdParam`, `parseEnumParam`, `parseDateParam`) — A3 handlers reuse |
| P0 | `apps/app/src/features/_shared/use-ctx.ts` | Per-hook context resolver |

## External Documentation

| Topic | Source | Takeaway |
|---|---|---|
| Receipt PDF stub | `@react-pdf/renderer` or browser `window.print()` with print CSS | A3 ships browser-print stub. Real PDF gen at A7. |
| Recharts | https://recharts.org/ | Used in A4 dashboard; A3 reports use simple cards + lists, no chart yet |

KEY_INSIGHT: Receipt creation is the integration seam. Walk-in `Complete` → optional payment dialog → creates Receipt + commission accrual + loyalty earn in one transaction.
APPLIES_TO: Tasks 14-16 (walk-in payment extension).
GOTCHA: Multi-write (course decrement + receipt + commission + loyalty + inventory consumption) — wrap each in independent mutation but document compensating-rollback gap (same as A2 H2).

KEY_INSIGHT: Commission rule is per-doctor per-service. Default 50% of service price. Deviation per service supported but defer customization UI to A4.
APPLIES_TO: Task 6 (commission domain).
GOTCHA: Commission accrues on `completed` status only. No-show / cancelled = no accrual. Rebooks count once.

KEY_INSIGHT: Loyalty = points = 1 baht spent → 1 point. Redemption = 100 points → ฿100 off. Trivial math, but document so A4 can build referral bonuses on top.
APPLIES_TO: Task 7 (loyalty domain).

KEY_INSIGHT: Inventory consumption is **manual** at A3 — receptionist marks item used. Auto-deduction on service completion deferred (would require service→item mapping table; YAGNI for MVP).
APPLIES_TO: Task 8 (inventory domain).

---

## Patterns to Mirror (extends A2)

### REPOSITORY_PATTERN (already established A1/A2 — same shape per entity)

```ts
// File: packages/mock-server/src/repositories/receipt.ts
const KEY = (tenantId: Id) => `lesso:tenant:${tenantId}:receipts`;
// findAll / findById / create / update — same as patient/appointment
// Extra: findByDateRange(tenantId, from, to) for monthly reports
```

### WALK_IN_PAYMENT_HOOK (new — composes existing mutations)

```ts
// File: apps/app/src/features/walk-in/hooks/use-walk-in-payment.ts
export function useCompleteWalkInWithPayment() {
  // composes: courseRepo.decrement (if course)
  //         + receipt create
  //         + commission create
  //         + loyalty earn
  //         + walkIn update status=completed
  // Same useRef fence pattern from A2 H1.
  // Documents the multi-write atomicity gap (A7 backend will resolve).
}
```

### REPORT_HOOK (new)

```ts
// File: apps/app/src/features/report/hooks/use-monthly-report.ts
export function useMonthlyReport(year: number, month: number) {
  // Aggregates receipts + commissions + loyalty + inventory in parallel
  // Uses Promise.all on apiClient calls; queryKey ['report', month]
}
```

---

## Files to Change

### Domain (`packages/domain/src/`) — 4 new
| File | Action |
|---|---|
| `receipt.ts` | CREATE — Receipt + LineItem schemas |
| `commission.ts` | CREATE — CommissionEntry + per-doctor aggregate type |
| `loyalty.ts` | CREATE — LoyaltyAccount + LoyaltyTransaction schemas |
| `inventory.ts` | CREATE — InventoryItem + InventoryMovement schemas |
| `index.ts` | UPDATE — barrel |

### OpenAPI (`packages/api-spec/`) — defer to A6 (per A2 deviation)

### ApiClient (`packages/api-client/src/`)
| File | Action |
|---|---|
| `types.ts` | UPDATE — add 4 resources |
| `adapters/mock.ts` | UPDATE — implement new resources |
| `index.ts` | UPDATE — re-exports |

### Mock-server (`packages/mock-server/src/`)
| File | Action |
|---|---|
| `repositories/{receipt,commission,loyalty,inventory}.ts` | CREATE |
| `handlers/{receipts,commissions,loyalty,inventory}.ts` | CREATE |
| `handlers/index.ts` | UPDATE |
| `seed.ts` | UPDATE — seed 6 months of receipts (linked to existing appointments) + commissions + loyalty accts + inventory items |

### App features (`apps/app/src/features/`)
| Folder | Files |
|---|---|
| `receipt/` | `hooks/use-receipts.ts`, `components/{receipt-print,payment-dialog}.tsx`, `index.ts` |
| `commission/` | `hooks/use-commissions.ts`, `components/commission-list.tsx`, `index.ts` |
| `loyalty/` | `hooks/use-loyalty.ts`, `components/loyalty-card.tsx`, `index.ts` |
| `inventory/` | `hooks/use-inventory.ts`, `components/{inventory-list,movement-form,low-stock-alerts}.tsx`, `index.ts` |
| `report/` | `hooks/use-monthly-report.ts`, `components/{revenue-card,visits-card,commission-card,loyalty-card,inventory-alert-card}.tsx`, `index.ts` |
| `walk-in/` | UPDATE — wire payment dialog into check-in-flow |

### Routes (`apps/app/src/routes/`)
| File | Path | Justification |
|---|---|---|
| `reports.tsx` | `/reports` | Owner monthly review page |
| `inventory.tsx` | `/inventory` | List + add movement |
| `routeTree.gen.ts` | UPDATE | Wire 2 new routes |

### Shadcn primitives needed
| File | Notes |
|---|---|
| `apps/app/src/components/ui/table.tsx` | Simple table primitive (commission list, inventory list) |

### Locales
| File | Action |
|---|---|
| `apps/app/src/locales/{th,en}.json` | Add `report.*`, `receipt.*`, `commission.*`, `loyalty.*`, `inventory.*`, `payment.*` keys |

### Sidebar
| File | Action |
|---|---|
| `apps/app/src/components/sidebar.tsx` | Add /reports + /inventory links |

---

## NOT Building

- ❌ Real PDF generation (use browser print stub; PDF gen → A7)
- ❌ Custom commission rules per doctor — only default flat % (A4)
- ❌ Loyalty referral bonuses (defer)
- ❌ Loyalty tier system (defer)
- ❌ Multi-branch dashboard (A4)
- ❌ Service → inventory item auto-mapping (manual at A3)
- ❌ Inventory cost basis / valuation (defer)
- ❌ Doctor schedule / time-off (A4)
- ❌ AI features (A4)
- ❌ Real-time updates (A7 Realtime)
- ❌ Recharts / chart visualizations (A4 dashboard owns charts; A3 uses cards + lists)
- ❌ Refund flow on receipts (defer to A5 polish)

---

## Step-by-Step Tasks

### Task 1: Domain — Receipt schema
- **ACTION**: `packages/domain/src/receipt.ts`
- **IMPLEMENT**: `ReceiptStatus`, `LineItem` (description, qty, unitPrice, courseSessionUsed?), `Receipt` (linked walkInId/appointmentId, lineItems, subtotal, tip, total, status, paidAt, paidByMethod). `ReceiptCreateInput`.
- **VALIDATE**: typecheck.

### Task 2: Domain — Commission schema
- **ACTION**: `packages/domain/src/commission.ts`
- **IMPLEMENT**: `CommissionEntry` (doctorId, receiptId, lineItemRef, amount, percentage, status: accrued/paid). Aggregate type `DoctorCommissionSummary`.
- **VALIDATE**: typecheck.

### Task 3: Domain — Loyalty schema
- **ACTION**: `packages/domain/src/loyalty.ts`
- **IMPLEMENT**: `LoyaltyAccount` (patientId, balance, tier?), `LoyaltyTransaction` (type: earn/redeem/adjust, amount, receiptId?, reason).
- **VALIDATE**: typecheck.

### Task 4: Domain — Inventory schema
- **ACTION**: `packages/domain/src/inventory.ts`
- **IMPLEMENT**: `InventoryItem` (sku, name, unit, currentStock, minStock, branchId), `InventoryMovement` (type: in/out/adjust, qty, reason, performedByUserId).
- **VALIDATE**: typecheck.

### Task 5: Domain barrel update
- **ACTION**: `packages/domain/src/index.ts` — export new schemas.

### Tasks 6-9: 4 mock-server repositories
- **ACTION**: Create `repositories/{receipt,commission,loyalty,inventory}.ts`.
- **MIRROR**: A2 `patient.ts` / `course.ts` shape.
- **GOTCHAs**:
  - Receipt: `findByDateRange(tenantId, fromIso, toIso)` for monthly reports.
  - Loyalty: balance derived from transactions sum (or stored on account; choose stored for read-cheap).
  - Inventory: `applyMovement(item, qty, type)` → recompute `currentStock`. Atomic write of item + movement.
  - Commission: `findByDoctor(doctorId, dateRange)`.

### Tasks 10-13: 4 handler sets
- **ACTION**: Create `handlers/{receipts,commissions,loyalty,inventory}.ts`.
- **MIRROR**: A2 patient/course handler structure. Reuse `_shared.ts` parsers + envelope.
- **GOTCHA**: Commission has no direct CREATE endpoint — accrued automatically when receipt created server-side. Expose only GET endpoints + a manual `PATCH /commissions/:id` for status flip (paid).

### Task 14: ApiClient extension
- **ACTION**: Add 4 resources to `packages/api-client/src/types.ts` + `adapters/mock.ts`.
- **MIRROR**: A2 patient resource.

### Task 15: Walk-in payment dialog
- **ACTION**: New `apps/app/src/features/receipt/components/payment-dialog.tsx` triggered from `check-in-flow.tsx` on `done` step.
- **IMPLEMENT**: Dialog shows line items (auto-populated from selected course or service), tip input, total. On confirm: creates Receipt → server creates Commission + Loyalty earn atomically (handler chains repos). Browser print stub for receipt.
- **MIRROR**: A2 H1 useRef fence pattern.
- **GOTCHA**: Multi-mutation seam — same compensating-rollback gap as A2 H2. Document.

### Task 16: Walk-in flow extension
- **ACTION**: Update `check-in-flow.tsx` to surface `[Take payment]` after `done` step. Optional skip.

### Task 17: Reports page
- **ACTION**: `routes/reports.tsx` + `features/report/`.
- **IMPLEMENT**: 4-card grid: Revenue, Visits, Commission table, Inventory alerts. Month picker (default current month).
- **MIRROR**: A2 patient list patterns; tabular-nums; `formatCurrency`.

### Task 18: Inventory page
- **ACTION**: `routes/inventory.tsx` + `features/inventory/`.
- **IMPLEMENT**: List with low-stock highlights. `+ Movement` opens dialog (in/out/adjust + qty + reason). Optimistic updates.

### Task 19: Sidebar + locales
- **ACTION**: Add /reports + /inventory to sidebar; add ~30 i18n keys per locale.

### Task 20: Seed extension
- **ACTION**: Update `seed.ts` to generate 6 months of receipts/commissions/loyalty + initial inventory.
- **IMPLEMENT**: Each `completed` appointment from A2 seed → matching receipt + commission accrual + loyalty earn. Inventory: 8 SKUs per branch, varying stock with 1-2 below min for alert demo.
- **GOTCHA**: Bump SEED_VERSION to 3 → triggers re-seed on first load.

### Task 21: Validate
- **ACTION**: `pnpm turbo run lint typecheck test build` green.
- **MANUAL**: Open `/reports`, owner persona — read all 4 cards, click commission detail, no errors.

---

## Testing Strategy

### Unit
| Test | Expected |
|---|---|
| `receiptRepo.findByDateRange` | filters correctly |
| `loyaltyRepo.earn(amount)` | balance increases by amount |
| `loyaltyRepo.redeem(amount)` past balance | throws InsufficientPointsError |
| `inventoryRepo.applyMovement('out', qty)` past stock | throws InsufficientStockError |
| `commissionRepo.summaryByDoctor(dateRange)` | aggregates correctly |
| `useCompleteWalkInWithPayment` happy path | walk-in completed + receipt + commission + loyalty all created |

### Edge cases
- [ ] Receipt with course-redeem (price = 0)
- [ ] Inventory `out` with qty > current stock → 409
- [ ] Loyalty `redeem` > balance → 409
- [ ] Commission for doctor with no completed visits → empty array, not 404
- [ ] Reports for future month → empty cards, not error
- [ ] Reports without tenant → "pick tenant" empty state

---

## Validation Commands

```bash
pnpm turbo run lint typecheck test build
EXPECT: 14/14 turbo tasks green; bundle ≤ 700 KB gzipped (A2 was 157 KB; A3 adds ~50-150 KB)

pnpm --filter @lesso/app dev
# Manual:
# 1. Set tenant=Clinic A, branch=Sukhumvit, user=Khun Sak (owner)
# 2. Visit /reports — see revenue + commission + loyalty + inventory alerts
# 3. Click commission row → drill-down (or just expand)
# 4. Visit /inventory — see low-stock highlight
# 5. Switch to receptionist → walk-in → complete → take payment → receipt printed
```

---

## Acceptance Criteria
- [ ] All 21 tasks complete
- [ ] Validation green
- [ ] Reports page renders with seeded data
- [ ] Inventory page renders with low-stock alerts
- [ ] Walk-in payment dialog wires receipt + commission + loyalty
- [ ] Browser print stub for receipt works
- [ ] Bundle ≤ 700 KB gzipped
- [ ] th + en complete for new strings
- [ ] No new lint warnings; no new type errors
- [ ] No regressions in A1/A2 surfaces (Today, Patients, Walk-in still work)

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 5-day estimate slips | M | A4 starts late | Cut commission detail-drill UI; cut PDF generation (browser print only) |
| Multi-mutation atomicity (receipt + commission + loyalty) | H | Inconsistent state on failure | Same documented gap as A2 H2; A7 backend resolves |
| Bundle bloat past 700KB | M | Slow load | Lazy-load /reports + /inventory routes via React.lazy; Recharts NOT added at A3 |
| Inventory consumption math wrong | L | Owner trust drop | Repo-level unit tests on every movement type |
| Loyalty rounding (฿1 = 1 point) | L | Disputes | Store integer points; floor on earn |

## Notes

- A4 will add multi-branch aggregates + AI; A3 keeps single-branch, no charts.
- Browser print stub = `window.print()` after rendering a print-CSS-styled receipt component. Functional, ugly, replaceable in A7.
- After A3 + A4 ship, A5 polish closes deferred MEDIUMs from A2 review (M3 RHF, M6 ID-leak, M8 useDebounce, M9 tablet breakpoints).
- **Confidence: 8/10** — patterns from A1+A2 carry directly. Risk concentrates in Task 15 (payment dialog as second multi-mutation seam after walk-in).
