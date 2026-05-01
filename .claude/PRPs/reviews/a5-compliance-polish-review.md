# Code Review: A5 — Compliance + Polish

**Reviewed**: 2026-05-01
**Decision**: **REQUEST CHANGES** — 0 CRITICAL · **5 HIGH** · 7 MEDIUM · 6 LOW
**Reviewers**: typescript-reviewer + security-reviewer + code-reviewer (parallel)

## Summary
PDPA infrastructure clean. Audit + consent + export wired correctly. CSV escape handles RFC 4180 commas + quotes + newlines (missing `\r`). Three pre-pilot bugs to close + audit linkage gap to fix before pilot user-test.

Validation green: lint+typecheck+test+build, 14/14 turbo, 169 KB gzipped, 0 vulns.

---

## Findings

### CRITICAL
None.

### HIGH

| ID | File:Line | Issue | Fix |
|---|---|---|---|
| H1 | `packages/mock-server/src/repositories/audit.ts:60` | **Audit `append` race** — `readAll + writeAll` non-atomic. Concurrent emits drop entries. Same class as A3 H1 receipt counter. | Single-pass write (mirror course.decrement); document mock-only A7 needs DB transaction |
| H2 | `apps/app/src/features/export/components/export-button.tsx:35-39` | **`Promise.all` swallows partial fail** — silent re-enable, no user feedback. PDPA subject export needs visible error. | `Promise.allSettled` + error state; show which source failed |
| H3 | `apps/app/src/features/consent/components/consent-dialog.tsx:34-36` | **Stale dialog state on re-open** — failed-submit error + checkbox state persist; Radix keeps subtree mounted. | `useEffect(open → reset)` on open transition |
| H4 | `apps/app/src/features/ai/components/visit-summary-section.tsx:51` + `ai-output-card.tsx:40-44` | **`ai.copy` audit event missing `resourceId`** — egress record unlinked from patient. Defeats PDPA Section 39 purpose. | Pass `resourceId={patient.id}` `resourceType="patient"` from caller |
| H5 | `packages/mock-server/src/handlers/{consent,audit}.ts` | **`actorName` lookup duplicated** — will compound in A6 when patient/walk-in/course/receipt handlers wire emission (5+ more sites). | Extract `resolveActorName(tenantId, userId)` to `handlers/_shared.ts` |

### MEDIUM

| ID | File:Line | Issue |
|---|---|---|
| M1 | `apps/app/src/features/export/components/export-button.tsx:18` | CSV escape regex `/[",\n]/` misses `\r`. RFC 4180 requires both. Replace with `/[",\n\r]/`. |
| M2 | `apps/app/src/features/consent/hooks/use-consent.ts:46-48` | `useWithdrawConsent.onSuccess` doesn't invalidate `['audit', tenantId]` — capture path does (line 34). Inconsistent. AuditPage stale after withdraw. |
| M3 | `packages/mock-server/src/handlers/consent.ts:62-64` | `metadata: { reason }` — receptionist could type patient name in withdraw reason. Free-text PII into audit metadata. Replace with `{ hasReason: parsed.data.reason != null }`; keep actual reason on `ConsentRecord.withdrawalReason` only. |
| M4 | `apps/app/src/features/export/components/export-button.tsx:82` | Filename `patient-${patient.id}-export.csv` exposes UUID to OS Recent Files / browser history / backup tools. Use `pdpa-export-${YYYY-MM-DD}.csv`. |
| M5 | `apps/app/src/features/audit/components/audit-list.tsx:40` | Badge renders raw action enum (`walkIn.create`, `ai.copy`) — opaque to non-technical pilot users. Add `audit.action.*` i18n map. |
| M6 | `apps/app/src/features/consent/components/consent-dialog.tsx:104` | Required-scope UX: pre-checked + disabled with tiny muted "required" text. Replace with prominent `Badge variant="secondary"` inline. Screen reader hears "checkbox checked dimmed" with no context. |
| M7 | `apps/app/src/routes/audit.tsx` | `error` typed `Error \| null` from useQuery; existing `error.message` works at runtime but inconsistent with `error instanceof Error ?` pattern elsewhere. |

### LOW

| ID | File:Line | Issue |
|---|---|---|
| L1 | `packages/mock-server/src/handlers/audit.ts:37` | GET returns full raw `metadata` no egress sanitisation. Defense-in-depth gap if M3 ever regresses. Document A7 hardening. |
| L2 | `apps/app/src/features/audit/components/audit-list.tsx:45` | Truncated UUID in audit row leaks tenant-internal IDs to anyone reaching `/audit`. A7 RBAC will gate. Document. |
| L3 | `apps/app/src/App.tsx:11-14` | `HtmlLangSync` benign double-fire under StrictMode (idempotent `document.documentElement.lang = lang`). Add comment about co-location with `I18nextProvider`. |
| L4 | `apps/app/src/features/export/components/export-button.tsx` | No `aria-busy={exporting}` on the button. Screen-reader hint missing. |
| L5 | `apps/app/src/features/consent/hooks/use-consent.ts:42` | `ConsentWithdrawInput & { patientId: Id }` inline intersection — could use named type for clarity. |
| L6 | `apps/app/src/features/ai/components/ai-output-card.tsx:51-53` | Outer catch silently swallows clipboard-unavailable errors (intentional per comment). Acceptable. |

---

## Validation Results

| Check | Result |
|---|---|
| typecheck | Pass — 6/6 |
| lint | Pass — 0 warnings |
| Tests | Pass — 6/6 (no new tests added) |
| Build | Pass — 567 KB / 169 KB gzipped |
| Bundle audit | No patient IDs in prod chunk; consent + audit infra correctly tree-shakeable |
| `pnpm audit` | 0 vulns (presumed unchanged) |

---

## Positives

- `auditRepo.append` JSDoc explicitly marks PII redaction as caller responsibility — exactly the right contract documentation
- `toCsvRow` correctly handles commas + quotes + newlines (RFC 4180 minus `\r`)
- `ConsentDialog` mutable Set state uses `new Set(prev)` clone — correct React immutability at boundary
- `consent.withdraw` tenant-scoped before consentId match (cross-tenant impossible)
- `consent.capture` audit metadata clean (scopes + expiresAt only — no PII)
- `<a href="#main-content">` skip link + `<main tabIndex={-1}>` is the standard accessible pattern; no keyboard trap
- Blob URL revoke timing correct
- HtmlLangSync read-only enum value — no injection risk
- Receipts cascade try/catch + warnings array preserved (A3 M2 closure intact)
- Logger PII guard preserved across all A5 paths

---

## Decision

**REQUEST CHANGES** — 5 HIGH issues block pilot.

### Priority Fix Order

1. **H1** (audit append race) — same class as A3 H1; mirror single-pass write pattern
2. **H2** (export Promise.allSettled + error state) — partial-failure visibility for PDPA subject export
3. **H3** (consent dialog stale state) — `useEffect(open → reset)`
4. **H4** (`ai.copy` resourceId) — wire `patient.id` from VisitSummarySection
5. **H5** (`actorName` extract) — pre-A6 to prevent 5+ duplicate sites
6. MEDIUMs M1, M2, M3, M4 — CSV `\r` + withdraw cache invalidation + reason redaction + filename
7. LOWs deferrable to A6

---

## Next

Apply H1-H5 + critical MEDIUMs (M1, M2, M3, M4)? ~25 min. Or defer some to A6.
