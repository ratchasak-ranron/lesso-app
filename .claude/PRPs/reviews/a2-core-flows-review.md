# Code Review: A2 — Core Flows

**Reviewed**: 2026-05-01
**Scope**: Local A2 changes (no git repo)
**Reviewers**: typescript-reviewer + security-reviewer + code-reviewer (parallel)
**Decision**: **REQUEST CHANGES** — 0 CRITICAL · 6 HIGH · 9 MEDIUM · 5 LOW

## Summary
A2 patterns adhere to A1 contract. Backend layer (repos + handlers + ApiClient) clean. Walk-in orchestrator + a few UI bits need fixes before A3 layers more mutations on top. No new vulnerabilities; one PII-guard miss + a few input-validation gaps to close before A7 backend swap.

Validation: lint/typecheck/test/build all green (14/14 turbo). Bundle 156KB gzipped.

---

## Findings (deduplicated across 3 reviewers)

### CRITICAL
None.

### HIGH

| ID | File:Line | Issue | Fix |
|---|---|---|---|
| H1 | `apps/app/src/features/walk-in/components/check-in-flow.tsx:73-95` | **Walk-in double-submit race** — `handleComplete` fires `decrementCourse` then `updateWalkIn` sequentially. Between click and `isPending=true` re-render, fast double-tap can fire decrement twice → consumes 2 sessions for 1 visit. (TS-rev + Sec-rev + Quality-rev all flagged) | Add `useRef<boolean>` guard at function entry (`if (submittingRef.current) return; submittingRef.current = true; try { ... } finally { submittingRef.current = false }`). Also add `createWalkIn.isPending` to disabled predicate. |
| H2 | `apps/app/src/features/walk-in/components/check-in-flow.tsx:77-95` | **No rollback on partial failure** — if `decrementCourse` succeeds but `updateWalkIn` throws, course session burned + walk-in stays `waiting`. Plan Task 20 explicitly required rollback. | Either compensating PATCH (decrement `sessionsUsed` back) in catch block before re-throw, OR document as known A3 gap with TODO + ticket. |
| H3 | `packages/api-client/src/adapters/mock.ts:92` | **`fetchValidated` 204 path returns `undefined as z.infer<S>`** — unsafe cast suppresses what should be type error. Future caller passing non-void schema gets undefined silently. | Split into two functions: `fetchValidated<S>(...)` for data, `fetchVoid(...)` for 204; OR require `z.void()` schema explicitly for delete-style endpoints. |
| H4 | `apps/app/src/lib/logger.ts:10-31` | **PII guard misses `notes` field** — `PatientSchema` exposes `notes` (free-text clinical observations); guard covers `medicalNotes`/`visitNotes`/`diagnosis` but not bare `notes`. | Add `'notes'` to `PII_FIELD_NAMES` set. |
| H5 | `apps/app/src/features/patient/components/patient-list.tsx:31` | **Dead code: `void i18n`** — destructured then suppressed; debug artefact. Will confuse future readers. | Remove destructure of `i18n` and the `void i18n` line. |
| H6 | `apps/app/src/features/appointment/components/appointment-list.tsx:68` | **Hard-coded English `aria-label="alert"`** on consent-warning AlertCircle — screen reader users in Thai mode hear "alert" with no context. | `aria-label={t('patient.consent.expiring_soon')}` or dedicated `consent.alertLabel` key. |

### MEDIUM

| ID | File:Line | Issue |
|---|---|---|
| M1 | `apps/app/src/features/patient/hooks/use-patients.ts:15,43` | Query-key mismatch: `patientKey` uses `'patient'` singular, `useCreatePatient.onSuccess` invalidates `'patients'` plural prefix → create-then-detail can serve stale single-record cache. Add `qc.invalidateQueries({ queryKey: ['patient', ctx.tenantId] })` to create. |
| M2 | `apps/app/src/features/course/hooks/use-courses.ts:30` | `useActiveCoursesForPatient` key is structurally divergent from `coursesKey` — accidental key miss possible. Normalize to `coursesKey({ patientId, status: 'active' })`. |
| M3 | `apps/app/src/features/patient/components/patient-form.tsx:29,34` | Manual validation sets field-label as error message (`"Error: Full Name"`). Add dedicated `patient.errors.fullNameRequired` etc. keys. |
| M4 | `apps/app/src/routeTree.gen.ts` | Hand-authored route tree omits `declare module '@tanstack/react-router' { interface Register { router } }` augmentation → `<Link to="/patients/$id">` `params` typed as `Record<string,string>` instead of `{id: string}`. Add the Register block (already in `apps/app/src/router.ts` from A1 — verify it's applied). |
| M5 | `apps/app/src/routes/patients.$id.route.tsx:6` | Route `id` param passed unvalidated. UUID-shape check absent. Add `IdSchema.safeParse(id)` + redirect on failure (or use TanStack Router `parseParams`). |
| M6 | `packages/mock-server/src/handlers/courses.ts:87` + `repositories/course.ts:37` | `CourseExhaustedError` 409 message embeds courseId — timing oracle for tenant-existence check. Fine for prototype, must not survive to A7. Strip ID from user-facing message; log server-side. |
| M7 | `packages/mock-server/src/handlers/walk-ins.ts:17`, `appointments.ts:12`, `courses.ts:30` | Filter query params (`branchId`, `status`, `date`) cast `as Id` / `as Status` without Zod validation → invalid values silently filter to empty array. Validate each via `IdSchema.safeParse` + enum schema; `badRequest` on failure. |
| M8 | `apps/app/src/features/{patient/components/{patient-search,patient-list},...}.tsx` | Debounce logic duplicated. Extract `useDebounce<T>(value, delay)` to `apps/app/src/lib/use-debounce.ts`. |
| M9 | All feature components in `apps/app/src/features/**` | No `md:` breakpoints inside feature folders — only shell/layout. Patient/appointment/walk-in lists render single-column on iPad landscape with wasted whitespace. Add `max-w-3xl` container or `md:grid-cols-2` per design system tablet-first contract. |

### LOW

| ID | File:Line | Issue |
|---|---|---|
| L1 | `apps/app/src/routes/index.tsx:9-10` | Duplicate import statements from `@/features/walk-in` — merge. |
| L2 | `apps/app/src/features/patient/components/patient-search.tsx:57` | Silent `.slice(0, 25)` truncation; show "25 of N" hint or push limit to query. |
| L3 | `apps/app/src/routes/courses.tsx:33-37` | Redundant Card-in-Card; `CourseBalanceCard` already renders own Card. Drop outer wrapping. |
| L4 | `apps/app/src/features/_shared/use-ctx.ts:9-13` | Three separate `useDevToolbar` calls = three subscriptions. Combine into one selector with `zustand/shallow`. Cumulative impact across all hooks. |
| L5 | `apps/app/src/features/course/components/course-balance-card.tsx:33` | Renders "Expires" label without the date itself. Add `formatDate(course.expiresAt)`. |
| L6 | Tests | Zero new A2 unit tests. At minimum: `courseRepo.decrement` exhausted, `patientRepo.search` phone normalization, `usePatient(undefined)` disabled. |

---

## Validation Results

| Check | Result |
|---|---|
| `pnpm -r typecheck` | Pass — 6/6 |
| `pnpm -r lint` | Pass — security plugin scoped |
| Tests | Pass — 6/6 (existing only; zero A2 tests added — see L6) |
| Build | Pass — 156KB gzipped, 14/14 turbo |
| Mock-server symbols in prod chunk | Absent (verified) |
| `pnpm audit` | 0 vulns |

---

## Files Reviewed (~45 A2 changes)

- `packages/domain/src/{patient,appointment,course,walk-in,index}.ts`
- `packages/mock-server/src/{context,seed,seed-fixtures,storage}.ts`
- `packages/mock-server/src/repositories/{patient,appointment,course,walk-in}.ts`
- `packages/mock-server/src/handlers/{_shared,patients,appointments,courses,walk-ins,index,health}.ts`
- `packages/api-client/src/{types,index,adapters/mock}.ts`
- `apps/app/src/lib/{dates,format,phone}.ts`
- `apps/app/src/components/ui/{dialog,sheet,alert-dialog,tabs,input,textarea,progress,skeleton,empty-state}.tsx`
- `apps/app/src/features/{_shared,patient,appointment,course,walk-in}/**`
- `apps/app/src/routes/{__root,index,patients,patients.$id,patients.$id.route,appointments,courses}.tsx`
- `apps/app/src/components/sidebar.tsx`
- `apps/app/src/routeTree.gen.ts`
- `apps/app/src/locales/{th,en}.json`
- `eslint.config.js`

---

## Positives (do NOT change)

- `_shared.ts` handler helpers (`noTenant`, `notFound`, `conflict`, `badRequest`, `readJson`) — DRY across all 4 entities
- `courseRepo.decrement` atomic semantic + custom error classes (`CourseExhaustedError`, `CourseNotFoundError`)
- `tabular-nums` consistently applied to phone/time/sessions/currency
- Tenant-scoped storage keys (`lesso:tenant:${id}:*`) — cross-tenant leak structurally impossible
- All handlers gate on `resolveContext` → `noTenant()` first
- Header UUID validation in `resolveContext` — `IdSchema.safeParse` blocks injection
- Zero `dangerouslySetInnerHTML` in any A2 code
- No hardcoded secrets, no real national IDs in seed fixtures
- Mock-server still tree-shakes from prod bundle (A1 contract held)
- `tabular-nums` everywhere numeric is rendered

---

## Decision

**REQUEST CHANGES** — fix 6 HIGH issues before A3 lays billing mutations on top of the same orchestrator.

### Priority Fix Order

1. **H1** (double-submit race) — `useRef` fence on `handleComplete`. Highest blast radius — burns sessions on real customers in production.
2. **H4** (PII guard `notes`) — one-character set addition, prevents future log leak.
3. **H2** (rollback) — either real compensating call or explicit TODO + ticket.
4. **H3** (`fetchValidated` 204) — split function or require `z.void()`.
5. **H5** (`void i18n` dead code) — one-line removal.
6. **H6** (English `aria-label`) — i18n key.
7. Then MEDIUM batch: M5 (route param UUID), M7 (filter param Zod), M1+M2 (query-key fixes), M9 (tablet breakpoints), M3 (form error keys).
8. LOW: opportunistic during A3.

---

## Next

- Apply H1–H6 + M1, M2, M5, M7 fixes? (~20 min)
- OR plan a separate `a2-review-fixes` PR
- OR defer all to A3 (not recommended — H1 is a real bug)
