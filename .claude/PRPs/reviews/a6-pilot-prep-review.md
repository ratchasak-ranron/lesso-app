# Local Review: A6 Pilot Prep — `6eedd63`

**Reviewed**: 2026-05-01
**Author**: ratchasak
**Branch**: main (local)
**Decision**: REQUEST CHANGES — 0 CRITICAL, 8 HIGH, 9 MEDIUM, 7 LOW

## Summary
Three parallel reviewers (typescript-reviewer, security-reviewer, code-reviewer)
audited the A6 commit. No security CRITICAL. Several HIGH issues cluster around
two themes: (a) audit-emission gaps in non-A6 handlers (DELETE walk-in, DELETE
course, POST inventory item — exposed by A5/A6 raising the bar), and
(b) input-validation gaps on the new loyalty redeem dialog + feedback button.

## Findings

### CRITICAL
None.

### HIGH
| # | File | Issue | Fix |
|---|---|---|---|
| H1 | `apps/app/src/features/loyalty/components/redeem-dialog.tsx:48` | Fractional points slip past client guard (`Number("0.5") > 0`); server `RedeemSchema.int()` rejects → user sees generic error instead of typed message. | Add `step={1}` to Input, gate with `Number.isInteger(points)`. |
| H2 | `packages/mock-server/src/handlers/walk-ins.ts` (DELETE handler) | No audit emission on walk-in delete — PDPA gap. | Append `walkIn.delete` action via auditRepo. |
| H3 | `packages/mock-server/src/handlers/courses.ts` (DELETE handler) | No audit emission on course delete — same gap. | Append `course.delete` action. |
| H4 | `packages/mock-server/src/handlers/inventory.ts` (POST item) | Item creation not audited — breaks "all mutating actions logged" invariant. | Append `inventory.create` action. |
| H5 | `apps/app/src/components/feedback-button.tsx:4-5` | `VITE_FEEDBACK_URL` rendered raw. A misconfigured env (`javascript:foo`) yields a live JS-URI link. | Validate scheme (`https:` only) with `new URL(raw).protocol` before render; return null otherwise. |
| H6 | `apps/app/src/locales/th.json` (audit.action.*) | TH has 4 ghost keys not in EN nor in `ACTION_OPTIONS` (`appointment.create/update/cancel`, `receipt.void`). i18next renders raw key strings if ever hit. | Either remove the dead keys or add the actions to the domain enum + EN. |
| H7 | `apps/app/src/routes/audit.tsx:35-42` | No `from > to` guard. User picks inverted range → empty list with no feedback. | Surface inline error; clear or swap dates. |
| H8 | `packages/mock-server/src/handlers/{patients,walk-ins,courses,inventory,loyalty}.ts` | `actor()` helper duplicated 3× (and inlined elsewhere). DRY drift; future shape change touches 5 files. | Lift to `handlers/_shared.ts` next to `resolveActorName`. |

> Note: missing-tests for loyalty (CR-H4) flagged but explicitly deferred to A8 per plan. Tracked, not blocking.

### MEDIUM
| # | File | Issue |
|---|---|---|
| M1 | `apps/app/src/routes/audit.tsx:36-41` | `as AuditAction` cast bypasses validation. Use `isAuditAction` type guard or Zod parse. |
| M2 | `apps/app/src/features/loyalty/components/redeem-dialog.tsx:39` | Reset on open uses `Math.min(100, availableBalance)` → for balance=0 fills 0 with submit not defensively disabled. |
| M3 | `packages/mock-server/src/handlers/loyalty.ts:32` | `params.patientId as Id` — bypasses Zod brand. Pre-existing pattern but A6 adds new instances. Use `IdSchema.parse`. |
| M4 | `packages/mock-server/src/handlers/courses.ts:117` | Long inline `metadata` literal exceeds 120 chars; extract local const for parity with peers. |
| M5 | `packages/mock-server/src/repositories/loyalty.ts` (`RedeemSchema`) | No server-side min-100 floor. UI gate is bypassable via direct API call. Add `z.number().int().min(100)` to align with the pilot rule. |
| M6 | `packages/mock-server/src/handlers/receipts.ts:77-86` | Audit metadata `points: created.total` records the receipt total, not the actual points credited (`Math.floor(total * POINTS_PER_BAHT)`). Today they match (rate=1) but will drift when the rate changes. |
| M7 | `apps/app/src/features/loyalty/components/redeem-dialog.tsx:114` | Inline error lacks `role="alert"` / `aria-live="polite"`. Same gap exists in consent-dialog but this is a new component. |
| M8 | `apps/app/src/features/loyalty/hooks/use-loyalty.ts` (`useLoyaltyAccount`) | Catches every exception → returns null. 500/401 looks like "no account". Re-throw on non-404. |
| M9 | `apps/app/src/routes/audit.tsx:10-26` | `ACTION_OPTIONS` is a hardcoded literal that duplicates the `AuditAction` union from `@lesso/domain`. Domain additions silently omitted from the filter. Derive from a domain-exported array. |

### LOW
| # | File | Issue |
|---|---|---|
| L1 | `apps/app/src/features/loyalty/components/redeem-dialog.tsx:120` | Submit button disabled only by `isPending`. Add `redeem.isPending || points < 1` for defensive UX. |
| L2 | `apps/app/src/features/course/components/course-balance-card.tsx:23` | `variant` ternary chain re-branches inside the JSX — minor redundancy, no bug. |
| L3 | `packages/mock-server/src/handlers/loyalty.ts` 409 body | `details: { available, requested }` leaks balance into HTTP body. OK for mock; rip out when porting to A7 backend. |
| L4 | `apps/app/src/routes/audit.tsx` | Template-literal i18n key construction is benign because `a` comes from a static typed array; flag-only. |
| L5 | `apps/app/src/features/loyalty/components/redeem-dialog.tsx:111` | `formatCurrency(points)` implies 1pt = 1฿. True today (`POINTS_PER_BAHT=1`); drifts if constant changes. Comment or derive. |
| L6 | `apps/app/src/features/course/components/course-balance-card.tsx:21` | `break-words` redundant inside flex-wrap container; `min-w-0` already does the work. |
| L7 | `apps/app/src/components/feedback-button.tsx` | Dock collides visually with DevToolbar (also bottom-right) on tablets in DEV. Not in prod, but worth a `bottom-20` offset when DevToolbar is present, or move to `bottom-left`. |

## Validation Results
| Check | Result |
|---|---|
| Typecheck | Pass |
| Lint | Pass (zero issues) |
| Tests | Pass (6/6) |
| Build | Pass (577 KB / 171 KB gzip) |

## Files Reviewed
- `apps/app/src/features/loyalty/**` (CREATED)
- `apps/app/src/components/feedback-button.tsx` (CREATED)
- `apps/app/src/components/page-shell.tsx` (MODIFIED)
- `apps/app/src/routes/{audit,patients.$id}.tsx` (MODIFIED)
- `apps/app/src/features/audit/components/audit-list.tsx` (MODIFIED)
- `apps/app/src/features/consent/{components/consent-dialog.tsx,hooks/use-consent.ts}` (MODIFIED)
- `apps/app/src/features/{appointment,walk-in,course}/components/*.tsx` (MODIFIED)
- `apps/app/src/App.tsx` (MODIFIED)
- `apps/app/src/locales/{en,th}.json` (MODIFIED)
- `packages/mock-server/src/handlers/{patients,walk-ins,courses,receipts,inventory,loyalty}.ts` (MODIFIED)
- `apps/app/.env.example` (MODIFIED)
- `docs/pilot-onboarding.md` (CREATED)

## Decision
**REQUEST CHANGES.** 8 HIGH issues. Pilot-blocking subset:
- H1 (fractional points)
- H5 (feedback URL scheme guard)
- H7 (audit `from>to` guard)
- H8 (lift `actor()` helper to _shared)

H2/H3/H4 (audit emission gaps on DELETE/POST handlers) raise the PDPA bar but
are honestly pre-existing — flag for an A6.5 sub-fix or fold into A8 hardening.

H6 (TH ghost keys) is one-line cleanup: either delete or promote.
