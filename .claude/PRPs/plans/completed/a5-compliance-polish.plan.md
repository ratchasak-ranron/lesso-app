# Plan: A5 — Compliance + Polish

## Summary
PDPA consent UI + audit log viewer + per-patient data export. Close deferred MEDIUMs/LOWs from A2/A3/A4 reviews. Full WCAG 2.1 AA pass on existing surfaces. Tablet portrait + landscape polish (`md:`/`lg:` breakpoints in feature components — A2 review M9). Empty/error/loading states audit on every list/detail. Coverage push toward 80% with critical-path unit tests. Pilot-ready quality bar.

## User Story
As **clinic owner Khun Sak preparing for a 30-day pilot**,
I want **PDPA consent capture, audit-log visibility, per-patient data export, and a polished UI on iPad**,
so that **the app meets Thai PDPA enforcement requirements + receptionists can use it 8 hours a day without friction**.

## Problem → Solution
A4 ships feature-complete app with operational MVP. → A5 hardens pilot quality:
- PDPA: consent capture + audit log + data export
- All A2-A4 review-deferred items closed
- Accessibility: keyboard nav, focus rings, contrast, skip-to-main, lang switching
- Tablet: every list adapts md:/lg: breakpoints
- Tests: 80% coverage on repositories + critical hooks

## Metadata
- **Complexity**: Large (~30 files added/modified, ~1500 lines, 22 tasks, ~5 days)
- **Source PRD**: `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md`
- **PRD Phase**: A5 — Compliance + Polish
- **Depends on**: A3 + A4 complete (consent on Patient already; audit log new)

---

## UX Design

### PDPA consent capture dialog
```
┌────────────────────────────────────────────────────────┐
│ ความยินยอม PDPA                                        │
│ ────────────────────────────────────────────────────── │
│  คุณให้ความยินยอมในการใช้ข้อมูลส่วนบุคคลตาม...           │
│                                                        │
│  □ ยินยอมให้บันทึกประวัติการรักษา                      │
│  □ ยินยอมให้ติดต่อกลับเพื่อนัดหมาย                     │
│  □ ยินยอมให้แสดงรูปก่อน-หลังเพื่อโฆษณา (เลือกได้)      │
│                                                        │
│  ระยะเวลา: [1 ปี ▼]                                    │
│                                                        │
│  [ยกเลิก]  [บันทึกความยินยอม]                         │
└────────────────────────────────────────────────────────┘
```

### Audit log viewer
```
┌────────────────────────────────────────────────────────┐
│ Audit Log                          [Filter ▼]         │
│ ────────────────────────────────────────────────────── │
│ 2026-05-01 14:32 · Khun Ploy   patient.create        │
│   Patient: <id-redacted>                              │
│ 2026-05-01 14:35 · Khun Ploy   walkIn.create         │
│ 2026-05-01 14:38 · Khun Ploy   course.decrement      │
│ 2026-05-01 14:38 · Khun Ploy   receipt.create        │
│ ...                                                    │
└────────────────────────────────────────────────────────┘
```

### Per-patient data export
```
Patient detail page → [Export data (PDPA)]
   → CSV download with patient + courses + appointments + receipts
   → Audit-logged
```

### Loyalty redeem UI (closes A3 M3 — moved here)
```
Patient detail → loyalty card showing balance
   [Redeem 100 pts → ฿100 off next receipt]
```

---

## Mandatory Reading

| Priority | File | Why |
|---|---|---|
| P0 | `.claude/PRPs/reviews/{a2,a3,a4}-*-review.md` | All deferred items A5 must close |
| P0 | `.claude/PRPs/reports/a4-multi-branch-ai-report.md` | Patterns A4 established |
| P0 | `packages/domain/src/patient.ts` | `consentStatus` already on Patient — A5 wires UI |
| P0 | `apps/app/src/lib/logger.ts` | PII guard pattern A5 extends with audit-log redaction |
| P1 | PRD §Design System | WCAG 2.1 AA targets |

---

## Patterns to Mirror

### AUDIT_LOG_PATTERN (new — A5 establishes)

```ts
// packages/domain/src/audit.ts
export const AuditActionSchema = z.enum([
  'patient.create', 'patient.update', 'patient.delete', 'patient.export',
  'appointment.create', 'appointment.update', 'appointment.cancel',
  'walkIn.create', 'walkIn.complete',
  'course.create', 'course.decrement',
  'receipt.create', 'receipt.void',
  'loyalty.earn', 'loyalty.redeem',
  'inventory.movement',
  'consent.capture', 'consent.withdraw',
]);

export const AuditLogSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  branchId: IdSchema.optional(),
  userId: IdSchema.optional(),
  userName: z.string().optional(),
  action: AuditActionSchema,
  resourceType: z.string(),
  resourceId: IdSchema.optional(),
  metadata: z.record(z.unknown()).optional(), // PII redacted before write
  createdAt: IsoDateSchema,
});
```

### CONSENT_CAPTURE_PATTERN

```ts
// packages/domain/src/consent.ts
export const ConsentScopeSchema = z.enum([
  'medical_records',     // mandatory
  'recall_contact',      // mandatory for follow-up
  'photo_marketing',     // optional
]);

export const ConsentRecordSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  patientId: IdSchema,
  scopes: z.array(ConsentScopeSchema),
  capturedAt: IsoDateSchema,
  expiresAt: IsoDateSchema.optional(),
  capturedByUserId: IdSchema,
  withdrawnAt: IsoDateSchema.optional(),
  withdrawalReason: z.string().max(500).optional(),
});
```

### RHF_FORM_PATTERN (A2 M3 closure — refactor patient form)

```tsx
// Pattern: useForm + zodResolver + FormField
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatientCreateSchema } from '@lesso/domain';

const form = useForm<PatientCreateInput>({
  resolver: zodResolver(PatientCreateSchema),
  defaultValues: { /* ... */ },
});
```

---

## Files to Change

### Domain (`packages/domain/src/`)
| File | Action |
|---|---|
| `audit.ts` | CREATE — AuditAction enum + AuditLog schema |
| `consent.ts` | CREATE — ConsentScope + ConsentRecord schema |
| `index.ts` | UPDATE — barrel |

### Mock-server
| File | Action |
|---|---|
| `repositories/audit.ts` | CREATE — append-only log + filter |
| `repositories/consent.ts` | CREATE — capture/withdraw/history |
| `handlers/audit.ts` | CREATE — GET list, filter |
| `handlers/consent.ts` | CREATE — POST capture, POST withdraw, GET by-patient |
| `handlers/index.ts` | UPDATE |
| Other handlers | UPDATE — emit audit events on writes |

### ApiClient
| File | Action |
|---|---|
| `types.ts` | UPDATE — AuditResource, ConsentResource |
| `adapters/mock.ts` | UPDATE |
| `index.ts` | UPDATE |

### App features
| Folder | Files |
|---|---|
| `consent/` | `hooks/use-consent.ts`, `components/{consent-dialog,consent-status-badge}.tsx`, `index.ts` |
| `audit/` | `hooks/use-audit-log.ts`, `components/audit-list.tsx`, `index.ts` |
| `export/` | `hooks/use-patient-export.ts`, `components/export-button.tsx`, `index.ts` |
| `loyalty/` | NEW — `hooks/use-loyalty.ts`, `components/{loyalty-card,redeem-dialog}.tsx` (closes A3 M3) |

### Routes
| File | Action |
|---|---|
| `audit.tsx` | CREATE — `/audit` route owner-only |
| `patients.$id.tsx` | UPDATE — add ConsentDialog trigger, ExportButton, LoyaltyCard |
| `routeTree.gen.ts` | UPDATE — wire `/audit` |

### Patient form (A2 M3 — RHF refactor)
| File | Action |
|---|---|
| `apps/app/src/features/patient/components/patient-form.tsx` | UPDATE — useForm + zodResolver + FormField wrappers |
| `apps/app/src/components/ui/form.tsx` | CREATE — shadcn Form primitive |
| `apps/app/src/components/ui/form-field.tsx` | CREATE — typed wrapper around RHF Controller + Label + ErrorMessage |

### Tablet polish (A2 review M9 closure)
| File | Action |
|---|---|
| `apps/app/src/features/patient/components/patient-list.tsx` | UPDATE — `md:grid-cols-2 lg:grid-cols-3` for cards |
| `apps/app/src/features/appointment/components/appointment-list.tsx` | UPDATE — `md:max-w-3xl` container |
| `apps/app/src/features/walk-in/components/walk-in-queue.tsx` | UPDATE — same |
| `apps/app/src/features/course/components/course-balance-card.tsx` | UPDATE — `md:` density |
| `apps/app/src/features/inventory/components/inventory-list.tsx` | UPDATE — `md:grid-cols-2` for items |

### Accessibility audit
| Action |
|---|
| Add skip-to-main link in `apps/app/src/components/page-shell.tsx` |
| Verify all icon-only buttons have `aria-label` |
| `<html lang>` attribute reflects current i18n language (update on toggle) |
| Test keyboard nav with `Tab`/`Shift+Tab` through 8 routes |
| Color contrast: verify `text-muted-foreground` ≥ 4.5:1 against bg-card and bg-background |

### Locales
| Section | Action |
|---|---|
| `apps/app/src/locales/{th,en}.json` | Add `consent.*`, `audit.*`, `export.*`, `loyalty.*` keys |

### Sidebar
| File | Action |
|---|---|
| `apps/app/src/components/sidebar.tsx` | Add `/audit` link (owner role only — visible always at A5; role-gating in A7) |

### useDebounce extraction (A2 M8)
| File | Action |
|---|---|
| `apps/app/src/lib/use-debounce.ts` | CREATE — generic hook |
| `apps/app/src/features/patient/components/{patient-search,patient-list}.tsx` | UPDATE — use shared hook |

### SERVICE_PRESETS (A3 M10)
| File | Action |
|---|---|
| `packages/domain/src/service.ts` | CREATE — `SERVICE_PRICE_TIERS` constant |
| `apps/app/src/features/receipt/components/payment-dialog.tsx` | UPDATE — import |
| `packages/mock-server/src/seed.ts` | UPDATE — import |

### Tests (push toward 80%)
| File | Action |
|---|---|
| `packages/mock-server/src/repositories/{patient,course,loyalty,inventory}.test.ts` | CREATE — happy + edge paths |
| `apps/app/src/features/walk-in/components/check-in-flow.test.tsx` | CREATE — full flow with MSW |
| `apps/app/src/lib/{phone,format,logger}.test.ts` | CREATE |

### Logger (close A4 M5 audit clipboard)
| File | Action |
|---|---|
| `apps/app/src/features/ai/components/ai-output-card.tsx` | UPDATE — emit `logger.info('ai.clipboard.copy', { patientId })` on success |

---

## NOT Building

- ❌ Real PDPA legal review (DOC review separate; A5 ships UI only)
- ❌ Cross-border data DPA (Singapore Supabase region — A7)
- ❌ Real PDF export (CSV stub at A5; PDF at A7)
- ❌ Role-based access control enforcement (A7 — Supabase RLS)
- ❌ Real-time audit-log streaming (A7)
- ❌ Audit log retention/archival policy (A7 — DB partitioning)
- ❌ Compliance officer dashboard (out of scope)
- ❌ Patient-facing app / portal (Won't v1)
- ❌ Insurance e-claim / lab integration (Won't)
- ❌ Vision API for photo PII detection (Won't v1)

---

## Step-by-Step Tasks

### T1: Domain — `audit.ts` schema
### T2: Domain — `consent.ts` schema
### T3: Domain — `service.ts` (SERVICE_PRICE_TIERS shared constant)
### T4: Domain barrel update
### T5: Mock-server — `audit` + `consent` repos
### T6: Mock-server — `audit` + `consent` handlers + emit audit events from existing handlers (patient/walk-in/course/receipt CRUD)
### T7: ApiClient — Audit + Consent resources
### T8: Audit feature folder + `/audit` route
### T9: Consent feature folder + dialog + status badge wired into patient detail
### T10: Export feature folder + button (CSV blob download)
### T11: Loyalty feature folder + redeem dialog (A3 M3)
### T12: shadcn `form.tsx` + `form-field.tsx` primitives
### T13: Patient form — RHF + zodResolver migration
### T14: `useDebounce` extraction (A2 M8)
### T15: Tablet breakpoints in feature components (A2 M9)
### T16: Accessibility — skip link + lang attr + keyboard audit
### T17: Wire audit emission into ai-output-card clipboard (A4 M5)
### T18: Sidebar — `/audit` link
### T19: Locales — add ~80 new keys both sides
### T20: SERVICE_PRESETS extraction (A3 M10)
### T21: Tests — repos + critical hooks + flow E2E (push to 80%)
### T22: Validate full pipeline + manual a11y check (axe DevTools spot)

---

## Validation Commands

```bash
pnpm turbo run lint typecheck test build
EXPECT: 14/14 turbo tasks; bundle ≤ 800 KB gzipped (A4 was 166 KB; A5 adds RHF + audit + consent + loyalty)
EXPECT: coverage ≥ 80% on critical paths (repos, key hooks)

pnpm --filter @lesso/app exec playwright test
EXPECT: walk-in flow + checkin smoke pass

# Manual a11y:
# - Tab through every route — focus rings visible
# - Lighthouse a11y ≥ 95 on each route
# - axe DevTools — 0 violations on /patients/$id (most complex route)
# - lang attribute updates on locale toggle
# - Skip link reachable via keyboard
```

---

## Acceptance Criteria
- [ ] All 22 tasks complete
- [ ] Validation green
- [ ] PDPA consent dialog captures + persists; status badge updates on patient card
- [ ] `/audit` route renders log entries; filterable
- [ ] Patient export downloads CSV containing patient + courses + appointments + receipts
- [ ] Loyalty redeem dialog flips balance; works in walk-in flow
- [ ] Patient form uses RHF + zodResolver
- [ ] Every list view has empty / error / loading states
- [ ] All icon-only buttons have `aria-label`
- [ ] Skip-to-main link present + reachable via keyboard
- [ ] `<html lang>` updates on locale toggle
- [ ] Lighthouse a11y ≥ 95 on /, /patients, /reports
- [ ] iPad portrait + landscape: feature components use `md:`/`lg:` breakpoints (no full-width waste)
- [ ] Coverage ≥ 80% on critical-path repositories + hooks
- [ ] No new lint warnings; no new type errors
- [ ] No regressions in A1-A4 surfaces

## Risks
| Risk | L | Mitigation |
|---|---|---|
| 5-day estimate slips | H | Defer audit log filters to A6; ship list-only at A5 |
| RHF migration breaks existing patient form | M | Keep existing form behind feature flag; smoke-test with Playwright |
| 80% coverage push slows velocity | M | Target repos + critical hooks only; defer UI snapshot tests |
| Consent UI legal-review changes | M | Build flexible scopes enum; copy in i18n keys (easy update) |
| CSV export blob handling on iPad Safari | M | Test on real device; fallback to JSON download if blob fails |

## Notes

- A5 closes the deferred-MEDIUMs backlog from 4 prior reviews — track each in commit messages.
- After A5 ships clean, A6 = pilot prep (demo data, deploy, onboarding doc), A7 = backend Supabase swap.
- B1 (marketing site) still parallel-ready; can land alongside A5 with second contributor.
- **Confidence: 7/10** — large surface; risk in T15 (tablet breakpoints across 5+ components) + T21 (coverage push without dedicated test agent).
