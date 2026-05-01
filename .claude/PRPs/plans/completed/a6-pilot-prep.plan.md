# Plan: A6 — Pilot Prep

## Summary
Close A5 deferrals + ship pilot-ready bundle. Wire audit emission across all write surfaces (patient/walk-in/course/receipt/loyalty/inventory). Loyalty redeem UI. Patient form RHF migration as template. Tablet breakpoint sweep across remaining feature lists. Critical-path unit tests (target 80% coverage on repos + key hooks). Realistic demo data review. Pilot onboarding guide. Vercel production deploy at `app.lesso.clinic`. Feedback capture wired (in-app + Notion).

## User Story
As **the founder onboarding 5 pilot clinics on day 1**,
I want **a polished iPad-ready app, signed PDPA consent UI, accessible to pilot users, and a clear onboarding doc**,
so that **the receptionist can use it for 8 hours straight without bug reports + the owner can see month-end on day 30**.

## Problem → Solution
A5 ships PDPA infra + scaffolding. → A6 closes outstanding gaps + ships pilot-grade quality:
- Audit emission everywhere (PDPA Section 39 traceability complete)
- Loyalty redeem UI (closes A3 M3 — last user-visible MVP feature)
- RHF migration of patient form (template for A7+)
- Tablet polish across all feature lists (A2 review M9 fully closed)
- Coverage push to 80% on critical paths
- Vercel prod + onboarding doc

## Metadata
- **Complexity**: Large (~25 files, ~1500 lines, 18 tasks, ~3 days dev + manual deploy)
- **Source PRD**: `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md`
- **PRD Phase**: A6 — Pilot Prep
- **Depends on**: A5 complete

---

## UX Design

### Loyalty redeem UI (closes A3 M3)
```
Patient detail → loyalty card showing balance + lifetime
   [Redeem points] → dialog
       Points to redeem [100 ▼]
       Off next receipt: ฿100
       Reason (optional): [_________]
       [Cancel]  [Redeem]
   On success → balance updates, audit entry, toast
```

### Audit log filter (A5 deferral)
Already deferred in A5 plan; add basic filter (action enum + date range) to `/audit`.

### Pilot onboarding doc
Markdown in `docs/pilot-onboarding.md` + screenshot capture (manual step).

---

## Mandatory Reading

| Priority | File | Why |
|---|---|---|
| P0 | `.claude/PRPs/reviews/{a2,a3,a4,a5}-*-review.md` | All deferred items A6 closes |
| P0 | `.claude/PRPs/plans/completed/a5-compliance-polish.plan.md` | Audit + consent patterns A6 wires across writes |
| P0 | `apps/app/src/features/consent/components/consent-dialog.tsx` | Dialog pattern loyalty redeem mirrors |
| P0 | `apps/app/src/features/inventory/components/movement-form.tsx` | RHF migration template (closest A2 analog) |

---

## Patterns to Mirror

### AUDIT_EMISSION_PATTERN (extends A5)

```ts
// Every write handler appends an audit entry. PII NEVER in metadata.
// Example: handlers/patients.ts POST
const created = patientRepo.create(tenantId, parsed.data);
auditRepo.append(
  tenantId,
  {
    action: 'patient.create',
    resourceType: 'patient',
    resourceId: created.id,
    // Counts only — never names/phones/etc.
  },
  { userId: userId ?? undefined, userName: resolveActorName(tenantId, userId, getUsers) },
);
```

### RHF_FORM_PATTERN (A2 M3 closure — template for A7)

```tsx
// File: apps/app/src/features/patient/components/patient-form.tsx (rewrite)
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatientCreateSchema, type PatientCreateInput } from '@lesso/domain';

const form = useForm<PatientCreateInput>({
  resolver: zodResolver(PatientCreateSchema),
  defaultValues: { fullName: '', phoneDigits: '', phoneDisplay: '', /* ... */ },
});

return (
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <Controller
      control={form.control}
      name="fullName"
      render={({ field, fieldState }) => (
        <FormField label={t('patient.fullName')} error={fieldState.error?.message}>
          <Input {...field} />
        </FormField>
      )}
    />
  </form>
);
```

---

## Files to Change

### Mock-server: audit emission across writes
| File | Action |
|---|---|
| `handlers/patients.ts` | Emit `patient.create/update/delete` |
| `handlers/walk-ins.ts` | Emit `walkIn.create/complete` (transition) |
| `handlers/courses.ts` | Emit `course.create/decrement` (decrement is the high-value audit event) |
| `handlers/appointments.ts` | Emit `appointment.create/update/cancel` |
| `handlers/receipts.ts` | Emit `receipt.create` (already emits cascade; add explicit audit) |
| `handlers/inventory.ts` | Emit `inventory.movement` |
| `handlers/loyalty.ts` | Emit `loyalty.earn/redeem` (earn auto on receipt; redeem on POST /redeem) |

### App: Loyalty feature folder + redeem UI (A3 M3 closure)
| File | Action |
|---|---|
| `apps/app/src/features/loyalty/hooks/use-loyalty.ts` | CREATE — `useLoyaltyAccount`, `useRedeemPoints` |
| `apps/app/src/features/loyalty/components/loyalty-card.tsx` | CREATE — balance display |
| `apps/app/src/features/loyalty/components/redeem-dialog.tsx` | CREATE — dialog with useRef fence + audit invalidation |
| `apps/app/src/features/loyalty/index.ts` | CREATE |
| `apps/app/src/routes/patients.$id.tsx` | UPDATE — add `<LoyaltyCard patientId={data.id} />` |

### App: Patient form RHF migration (A2 M3 closure)
| File | Action |
|---|---|
| `apps/app/src/components/ui/form-field.tsx` | CREATE — typed wrapper for `<Label>` + error message + slot |
| `apps/app/src/features/patient/components/patient-form.tsx` | REWRITE — useForm + Controller + FormField |
| `apps/app/package.json` | UPDATE — add `react-hook-form` + `@hookform/resolvers` |

### App: Audit page filters (A5 M5 + filter enhancement)
| File | Action |
|---|---|
| `apps/app/src/routes/audit.tsx` | UPDATE — add action enum select + date-range pickers |
| `apps/app/src/features/audit/components/audit-list.tsx` | UPDATE — translate action enum via `audit.action.*` keys |
| `apps/app/src/locales/{th,en}.json` | UPDATE — add `audit.action.*` for all 19 enum values |

### App: Tablet breakpoint sweep (A2 M9 closure — full)
| File | Action |
|---|---|
| `apps/app/src/features/appointment/components/appointment-list.tsx` | UPDATE — `md:max-w-3xl` container or `md:grid-cols-2` |
| `apps/app/src/features/walk-in/components/walk-in-queue.tsx` | UPDATE — same |
| `apps/app/src/features/course/components/course-balance-card.tsx` | UPDATE — `md:` density |

### App: A5 deferral closures
| Action |
|---|
| `audit.tsx` route — `error?.message` narrowing pattern (A5 M7) |
| `audit-list.tsx` — `audit.action.*` translation (A5 M5) |
| `consent-dialog.tsx` — required scopes elevated to inline `Badge variant="secondary"` (A5 M6) |
| `App.tsx` — comment about HtmlLangSync co-location (A5 L3) |
| `use-consent.ts` — named type `ConsentWithdrawWithPatientId` for mutation input (A5 L5) |

### Tests (push toward 80% on critical paths)
| File | Action |
|---|---|
| `packages/mock-server/src/repositories/{patient,course,loyalty,inventory,audit,consent}.test.ts` | CREATE — happy + edge paths |
| `apps/app/src/lib/{phone,format,use-debounce}.test.ts` | CREATE |
| `apps/app/src/features/walk-in/components/check-in-flow.test.tsx` | CREATE — full orchestration |

### Pilot deploy
| File | Action |
|---|---|
| `docs/pilot-onboarding.md` | CREATE — 1-page setup, account info, walk-in walkthrough, feedback channel |
| `apps/app/.env.production` | CREATE — `VITE_ENABLE_MOCKS=true` (Phase A6 still mock; backend at A7) |
| Manual: Vercel project A → `app.lesso.clinic` DNS | User-facing step |
| Manual: Notion DB for feedback intake | User-facing step |

### In-app feedback widget (light)
| File | Action |
|---|---|
| `apps/app/src/components/feedback-button.tsx` | CREATE — fixed bottom-right; opens Notion form URL in new tab |
| `apps/app/src/components/page-shell.tsx` | UPDATE — render feedback button |

---

## NOT Building

- ❌ Real Supabase auth — A7
- ❌ Real PDF receipt — A7
- ❌ Real LINE booking — A7
- ❌ Real photo storage — A7
- ❌ Real LLM AI — A7
- ❌ Custom commission rules per doctor — A4 deferred; not pilot-critical
- ❌ Insurance / lab integration — Won't (per PRD)
- ❌ Mobile native app — Won't (per PRD)
- ❌ Multi-tenant onboarding (real signup flow) — A7
- ❌ A/B testing infra — Won't
- ❌ Sentry/Datadog observability — A7

---

## Step-by-Step Tasks

### T1: Audit emission helper + wire across 6 handlers
- Single helper in `handlers/_shared.ts` if pattern requires (probably inline call to auditRepo per handler is fine)
- Patient: create/update/delete
- Walk-in: create/transition (status flip → completed)
- Course: create/decrement
- Appointment: create/update (cancel via patch status)
- Receipt: create (currently has cascade; add explicit audit)
- Inventory: movement
- Loyalty redeem (already emits earn via receipt; add redeem)

### T2-T6: Loyalty feature folder
- T2 hooks (use-loyalty.ts)
- T3 LoyaltyCard component
- T4 RedeemDialog component
- T5 index.ts barrel
- T6 wire `<LoyaltyCard>` into patient detail

### T7: shadcn FormField primitive

### T8: Patient form RHF migration

### T9: Audit page filters (action enum + date-range)
### T10: AuditList action enum i18n

### T11: ConsentDialog required-scope Badge UX

### T12-T14: Tablet breakpoint sweep (3 components)

### T15: A5 deferral micros (M7, L3, L5)

### T16: Critical-path unit tests
- 6 repo tests minimum
- 3 lib utility tests
- 1 walk-in flow integration test

### T17: Pilot onboarding doc + feedback button

### T18: Validate full pipeline + manual a11y/iPad sanity check

---

## Validation Commands

```bash
pnpm turbo run lint typecheck test build
EXPECT: 14/14 turbo tasks; bundle ≤ 850 KB gzipped (A5 was 170 KB)
EXPECT: coverage ≥ 80% on critical paths (target tested via `pnpm test --coverage`)

pnpm --filter @lesso/app dev
# Manual:
# - All 9 routes load on iPad portrait
# - Walk-in flow: 90s stopwatch
# - Audit page: filter by action + date works
# - Loyalty: capture appt → receipt → balance updates → redeem dialog deducts
# - Patient form: RHF errors render inline; submit hits Zod validation
# - Switch lang TH/EN — every new key resolves
# - Lighthouse a11y ≥ 95 on /, /patients, /reports, /branches, /audit
```

---

## Acceptance Criteria
- [ ] All 18 tasks complete
- [ ] Validation green
- [ ] Audit log shows every write across patient/walk-in/course/appointment/receipt/inventory/loyalty
- [ ] Loyalty redeem dialog works; balance decrements; audit entry appears
- [ ] Patient form uses RHF + zodResolver
- [ ] Audit page filters by action + date range
- [ ] AuditList renders translated action labels in both locales
- [ ] All feature lists have `md:` breakpoints (no full-width waste on iPad landscape)
- [ ] 80%+ coverage on critical-path repositories + hooks
- [ ] Pilot onboarding doc exists at `docs/pilot-onboarding.md`
- [ ] Feedback button visible on every route (opens Notion form)
- [ ] No regressions in A1-A5 surfaces
- [ ] Bundle ≤ 850 KB gzipped

## Risks
| Risk | L | Mitigation |
|---|---|---|
| RHF migration breaks patient form | M | Smoke-test with Playwright before merge; keep useState fallback path |
| Audit emission slows write handlers | L | Single sync `auditRepo.append` call after main write; <1ms overhead |
| 80% coverage push slows velocity | M | Target repos + critical hooks only; defer UI snapshot tests to A8 |
| Vercel custom domain DNS lag | M | Cut DNS 24h before pilot kickoff; user-facing manual step |
| Pilot doc copy needs Thai legal review | L | Mark as DRAFT; iterate during pilot week 1 |
| Notion feedback form URL hardcode | L | Env var `VITE_FEEDBACK_URL`; default to placeholder |

## Notes

- A6 closes the deferred-MEDIUMs backlog from 5 prior reviews — track each in commit messages.
- After A6 ships clean, A7 = backend Supabase swap, A8 = pilot run.
- B1 marketing still parallel-ready; can land alongside A6 if second contributor.
- **Confidence: 7/10** — large surface but mostly mechanical wiring + tests. Risk in T8 (RHF) + T16 (coverage push without dedicated test agent).
