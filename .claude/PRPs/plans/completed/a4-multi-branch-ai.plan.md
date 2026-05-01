# Plan: A4 — Multi-Branch + AI Stubs

## Summary
Owner-facing multi-branch view + 4 AI-assist features. Build cross-branch dashboard (revenue, visits, commission aggregated across branches; per-branch breakdown). Cross-branch course portability (course tied to tenant, redeemable at any branch). 4 AI stubs return deterministic mock responses behind same `apiClient` seam (real LLM swap at A7). Reports extended: daily/weekly/by-doctor/by-service/by-branch. AI features marked with `Preview` badge in UI.

## User Story
As **clinic owner Khun Sak running 2 branches**,
I want **a single dashboard that compares revenue and commission across branches plus AI-generated visit summaries and recall messages**,
so that **I can see which branch is winning + which patients to bring back without writing notes by hand**.

## Problem → Solution
A3 ships single-branch reports + manual entry. → A4 adds:
- Multi-branch dashboard (`/branches`)
- Cross-branch course portability (already supported by tenant-scoped storage; verify + UI affordance)
- Reports filterable by date-range + dimension (doctor / service / branch)
- 4 AI stubs surfaced in patient detail + walk-in flow + scheduling

## Metadata
- **Complexity**: Large (~30 files, ~1500 lines, 18 tasks, ~5 days)
- **Source PRD**: `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md`
- **PRD Phase**: A4 — Multi-Branch + AI
- **Depends on**: A2 (foundation) + A3 (commission/loyalty deps); parallel with A3 if 2nd contributor

---

## UX Design

### Multi-branch dashboard `/branches`
```
┌────────────────────────────────────────────────────────┐
│ Branches — Clinic A                                   │
│ ────────────────────────────────────────────────────── │
│  ┌── Sukhumvit ──────┐  ┌── Thonglor ──────────────┐  │
│  │ ฿312,400  · 92    │  │ ฿170,800  · 50           │  │
│  │ Top doc: Anong    │  │ Top doc: Som             │  │
│  │ Low stock: 2      │  │ Low stock: 1             │  │
│  └───────────────────┘  └──────────────────────────┘  │
│                                                        │
│  ┌── Combined ────────────────────────────────────┐    │
│  │ Total revenue   ฿483,200                       │    │
│  │ Total visits    142                            │    │
│  │ Active members  87 · Outstanding 45,200 pts   │    │
│  └────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

### Reports filter bar (extends A3)
```
[ This month ▼ ]  [ All branches ▼ ]  [ Group by: doctor ▼ ]
```

### AI Preview badges in UI
- Patient detail: `[✨ Generate visit summary] (Preview)`
- Walk-in done step: `[✨ Draft recall message] (Preview)`
- Appointment booking: `[✨ Suggest slot] (Preview)`
- Photo upload (placeholder): `[✨ Auto-tag photo] (Preview)`

---

## Mandatory Reading

| Priority | File | Why |
|---|---|---|
| P0 | `.claude/PRPs/plans/completed/a3-supporting-modules.plan.md` | A3 patterns A4 extends |
| P0 | `.claude/PRPs/reports/a3-supporting-modules-report.md` | Server-side cascade pattern; multi-write atomicity gap |
| P0 | `.claude/PRPs/reviews/a3-supporting-modules-review.md` | Review fixes already applied |
| P0 | `apps/app/src/features/report/hooks/use-monthly-report.ts` | Promise.all aggregation pattern A4 extends |
| P0 | `packages/mock-server/src/repositories/commission.ts` | `summaryByDoctor` pattern A4 reuses |
| P0 | `packages/mock-server/src/repositories/_utils.ts` | `inRange` shared util |

KEY_INSIGHT: AI stubs must be **deterministic given same input** — same patient ID + visit type → same generated summary. Use stable hash of input → indexed template selection. Real LLM swap at A7 will pass real prompts; UI contract unchanged.
APPLIES_TO: Tasks 12-15 (4 AI stubs).

KEY_INSIGHT: Cross-branch course portability already works at storage layer — courses are tenant-scoped, not branch-scoped. UI affordance: walk-in flow shows ALL active courses for patient regardless of which branch the course was purchased at. Add a `purchasedAtBranch` chip on course balance card so receptionist sees the original branch.
APPLIES_TO: Task 5 (course UI extension).

KEY_INSIGHT: Reports `groupBy` (doctor / service / branch) means 3 separate aggregator methods on commission repo. Receipt repo also needs `summaryByDimension`. Avoid premature abstraction — three explicit methods clearer than dynamic dispatch.
APPLIES_TO: Tasks 8-10.

KEY_INSIGHT: AI features are render-time stubs at A4. Don't wire to walk-in mutations — surfacing AI output is read-only (copy to clipboard). Real AI integration at A7 will add `aiClient` separately from `apiClient`.
APPLIES_TO: Tasks 12-15.

---

## Patterns to Mirror

### MULTI_BRANCH_AGGREGATOR (extends `commission.summaryByDoctor`)

```ts
// packages/mock-server/src/repositories/_aggregators.ts
import type { Receipt } from '@lesso/domain';

export interface BranchSummary {
  branchId: string;
  branchName: string;
  revenue: number;
  visitCount: number;
  topDoctorId: string | null;
  topDoctorAmount: number;
  lowStockCount: number;
}

export function aggregateByBranch(...): BranchSummary[] { ... }
```

### AI_STUB_PATTERN (deterministic by input hash)

```ts
// packages/mock-server/src/ai/visit-summary.ts
const TEMPLATES_TH = [
  'ผู้ป่วยมาทำหัตถการ {{service}} เป็นครั้งที่ {{n}} อาการดี ไม่มีผลข้างเคียง',
  'ทำ {{service}} ตามแผน อาการตอบสนองดี นัดครั้งต่อไปใน 4 สัปดาห์',
  // ...
];
const TEMPLATES_EN = [/* same length, parallel index */];

function hashIndex(input: string, modulo: number): number {
  let h = 0;
  for (const c of input) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return Math.abs(h) % modulo;
}

export function generateVisitSummary(input: { patientId: string; serviceName: string; sessionN: number; locale: 'th' | 'en' }): string {
  const templates = input.locale === 'th' ? TEMPLATES_TH : TEMPLATES_EN;
  const idx = hashIndex(`${input.patientId}:${input.serviceName}:${input.sessionN}`, templates.length);
  return templates[idx]
    .replace('{{service}}', input.serviceName)
    .replace('{{n}}', String(input.sessionN));
}
```

### PROMISE_ALLSETTLED (M6 from A3 review)

```ts
const [receipts, summary, loyalty, lowStock] = await Promise.allSettled([...]);
// Each `.value ?? defaultValue` — never blank entire dashboard.
```

---

## Files to Change

### Domain
| File | Action |
|---|---|
| (none) | All entities exist; no new domain types |

### Mock-server
| File | Action |
|---|---|
| `repositories/_aggregators.ts` | CREATE — branch summary, daily/weekly bucketing, doctor/service breakdowns |
| `repositories/inventory.ts` | UPDATE — add `lowStockCountByBranch` helper |
| `repositories/receipt.ts` | UPDATE — add `summaryByDimension` (doctor/service/branch) |
| `ai/visit-summary.ts` | CREATE — deterministic stub with templates |
| `ai/recall-message.ts` | CREATE — deterministic stub |
| `ai/slot-suggestion.ts` | CREATE — deterministic stub |
| `ai/photo-tag.ts` | CREATE — deterministic stub |
| `handlers/branches.ts` | CREATE — `GET /v1/branches/summary?from&to` |
| `handlers/reports.ts` | CREATE — `GET /v1/reports?dimension=doctor\|service\|branch&from&to` |
| `handlers/ai.ts` | CREATE — 4 endpoints under `/v1/ai/*` |
| `handlers/index.ts` | UPDATE — aggregate new handlers |

### ApiClient
| File | Action |
|---|---|
| `types.ts` | UPDATE — add `BranchesResource`, `AiResource`, extend `ReportsResource` |
| `adapters/mock.ts` | UPDATE — implement |
| `index.ts` | UPDATE — exports |

### App features
| Folder | Files |
|---|---|
| `branches/` | `hooks/use-branches.ts`, `components/branch-summary-card.tsx`, `index.ts` |
| `report/` | UPDATE — extend `useMonthlyReport` to support `groupBy`; add date-range picker hook |
| `ai/` | `hooks/{use-visit-summary, use-recall-draft, use-slot-suggestion, use-photo-tag}.ts`, `components/{ai-button, ai-output-card, preview-badge}.tsx`, `index.ts` |

### Routes
| File | Path |
|---|---|
| `branches.tsx` | `/branches` — multi-branch dashboard |
| `reports.tsx` | UPDATE — add filters (date-range + dimension) |
| `routeTree.gen.ts` | UPDATE — wire `/branches` |

### Wiring AI into existing flows
| File | Change |
|---|---|
| `routes/patients.$id.tsx` | Add `[Generate visit summary] (Preview)` button per visit history row |
| `features/walk-in/components/check-in-flow.tsx` | At `done` step add `[Draft recall message] (Preview)` button |
| `routes/appointments.tsx` (or new booking dialog) | Add `[Suggest slot] (Preview)` |
| Patient card (placeholder photo slot) | `[Auto-tag] (Preview)` |

### Sidebar + locales
| File | Action |
|---|---|
| `components/sidebar.tsx` | Add `/branches` link |
| `locales/{th,en}.json` | Add `branch.*`, `ai.*`, `report.dimension.*` keys |

---

## NOT Building

- ❌ Real LLM API calls (deterministic stubs only; A7 swap)
- ❌ Real photo upload / vision AI (placeholder slot only)
- ❌ Custom commission rules per doctor / service (still flat 50%)
- ❌ Branch-level user permissions (single-tenant + dev toolbar still controls)
- ❌ Booking-time slot conflict detection (defer)
- ❌ Doctor schedule / time-off (A4 in PRD scope but not building this round; defer)
- ❌ Realtime sync between branches (A7)
- ❌ AI cost tracking / token budgets (A7)
- ❌ Recharts / chart visualizations (cards + lists only — bundle budget)
- ❌ Drill-down from branch summary into per-branch report (A5 polish)
- ❌ Patient cross-branch transfer (course portability is server-side data already; UI affordance only)

---

## Step-by-Step Tasks

### T1: Aggregator helpers
- File: `packages/mock-server/src/repositories/_aggregators.ts`
- `aggregateByBranch(tenantId, branches, fromIso, toIso)` → `BranchSummary[]`
- `aggregateByDimension(tenantId, dim: 'doctor'|'service'|'branch', fromIso, toIso)` → typed result
- Reuses `receiptRepo.findAll`, `commissionRepo.findAll`, `inventoryRepo.findAllItems`

### T2: Receipt repo extension
- Add `summaryByDimension` method (or use _aggregators for cleanness)

### T3: Inventory repo extension
- Add `lowStockCountByBranch(tenantId, branchId)` helper

### T4: AI stubs (4 files)
- `ai/{visit-summary,recall-message,slot-suggestion,photo-tag}.ts`
- Deterministic via `hashIndex` over input
- Each ships ~6 templates per locale (th + en)

### T5: AI handlers
- `handlers/ai.ts` — 4 POST endpoints under `/v1/ai/*`
- Each accepts JSON body with input fields, returns `{ data: { text: string } }` or richer shape per stub
- Add ~50ms artificial delay (`await new Promise(r => setTimeout(r, 50))`) so UI shows pending state

### T6: Branches handler
- `handlers/branches.ts` — `GET /v1/branches/summary?from&to`
- Returns `BranchSummary[]`

### T7: Reports handler
- `handlers/reports.ts` — `GET /v1/reports?dimension&from&to&branchId?`
- Returns dimension-bucketed aggregates

### T8: ApiClient extension
- 4 AI methods, branches summary, reports dimension
- Same fetchValidated + Zod-schema pattern

### T9: Branches feature folder
- `hooks/use-branches.ts`, `components/branch-summary-card.tsx`

### T10: AI feature folder
- `hooks/use-{visit-summary,recall-draft,slot-suggestion,photo-tag}.ts`
- `components/ai-button.tsx` (button + spinner + Preview badge)
- `components/ai-output-card.tsx` (card with copy-to-clipboard)
- `components/preview-badge.tsx` (small `[Preview]` chip)

### T11: Branches route + dashboard
- `routes/branches.tsx`
- Renders `BranchSummaryCard` grid + combined totals card

### T12: Reports route filters
- Update `routes/reports.tsx`
- Add date-range picker (default current month) + dimension select (doctor/service/branch)
- Preserve A3 4-card top section; add filtered breakdown table below

### T13: Wire AI into patient detail
- `routes/patients.$id.tsx` — `<AiButton>` per visit history row → `<AiOutputCard>` with summary + copy

### T14: Wire AI recall into walk-in done step
- `check-in-flow.tsx` `done` step — add `<AiButton>` → output → copy to clipboard, suggest sending via LINE (UI hint only)

### T15: Wire AI slot into appointments
- New booking dialog (or extension) — `<AiButton>` returns 3 suggested slots based on doctor history; UI populates dropdown

### T16: Promise.allSettled in reports (A3 M6)
- Update `use-monthly-report.ts` — `Promise.allSettled` per source; null-coalesce defaults; show partial data

### T17: Sidebar + locales
- Add `/branches` to nav
- ~40 new i18n keys both locales (`branch.*`, `ai.*`, `report.dimension.*`, `report.range.*`)

### T18: Validate
- Full pipeline + manual exercise of branches dashboard + AI buttons

---

## Testing Strategy

| Test | Expected |
|---|---|
| `aggregateByBranch` 2 branches with seeded data | sums revenue + visit count per branch correctly |
| `generateVisitSummary` same input twice | same output (deterministic) |
| `generateVisitSummary` different patient | different template |
| AI handler delays >40ms | UI shows pending state |
| `/branches` with tenant unset | "pick tenant" empty state |
| `/reports?dimension=doctor` filter | groups receipts by `lineItem.doctorId` |
| Promise.allSettled — inventory unseeded | report renders with `lowStockItems = []`, no error |

---

## Validation Commands

```bash
pnpm turbo run lint typecheck test build
EXPECT: 14/14 turbo tasks; bundle ≤ 750 KB gzipped (A3 was 163 KB; AI stubs + branches add ~50-150 KB)

pnpm --filter @lesso/app dev
# Manual:
# 1. Set tenant=Clinic A, owner role
# 2. /branches — see 2 branches summarized
# 3. /reports — switch dimension doctor → service → branch
# 4. Patient detail — click [Generate visit summary] (Preview) — see deterministic output
# 5. Walk-in done step — click [Draft recall message] — copy
```

---

## Acceptance Criteria
- [ ] All 18 tasks complete
- [ ] Validation green
- [ ] /branches renders 2 branches with seeded data
- [ ] /reports supports date-range + dimension filter
- [ ] 4 AI stubs callable via UI; deterministic same-input-same-output
- [ ] Each AI feature has `[Preview]` chip
- [ ] th + en locales complete
- [ ] No regressions in A1/A2/A3 surfaces (Today, Patients, Walk-in, Reports, Inventory)
- [ ] Bundle ≤ 750 KB gzipped

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI stub determinism breaks user trust | L | Confused demo | Document in `[Preview]` tooltip — "Mock output, real AI in v2" |
| Bundle bloat past 750 KB with 4 AI stubs + branches | M | Slow tablet load | Lazy-load `/branches` + `/reports` routes via React.lazy |
| Reports dimension change re-fetches large dataset | M | Slow render | Cache per-dimension in TanStack Query (key includes dimension) |
| Cross-branch course UX confusing | L | Receptionist hesitates | Add `purchasedAtBranch` chip; tooltip explains portability |
| Owner expects real LLM | M | Demo skepticism | `[Preview]` chip + tooltip; written disclaimer in pilot onboarding |

## Notes

- A4 closes A3 review M6 (Promise.allSettled).
- AI integration architecture: A4 builds UI affordances + deterministic stubs. A7 backend phase swaps `apiClient.ai.*` to real LLM provider (Anthropic Claude or OpenAI).
- Real photo upload deferred — placeholder slot remains.
- After A4 ships, A5 polish closes remaining A2/A3 review MEDIUMs (RHF refactor, query-key alignment, route param validation, unitCost role-strip, locale namespaces).
- **Confidence: 8/10** — patterns established. Risk concentrates in T16 (Promise.allSettled refactor without breaking existing reports) + T15 (slot AI integration into booking flow).
