# Code Review: A4 — Multi-Branch + AI Stubs

**Reviewed**: 2026-05-01
**Decision**: **REQUEST CHANGES** — 0 CRITICAL · **5 HIGH** · 6 MEDIUM · 5 LOW
**Reviewers**: typescript-reviewer + security-reviewer + code-reviewer (parallel)

## Summary
A4 patterns adhere to A1-A3 contract. Promise.allSettled refactor closes A3 M6 cleanly. AI stub determinism contract holds in 3 of 4 stubs (slot-suggestion has timestamp drift). Two real bugs to close + two PII contract issues that block A7 backend swap.

Validation green: lint+typecheck+test+build, 14/14 turbo, 166 KB gzipped, 0 vulns.

---

## Findings (deduplicated)

### CRITICAL
None.

### HIGH

| ID | File:Line | Issue | Fix |
|---|---|---|---|
| H1 | `apps/app/src/features/walk-in/components/check-in-flow.tsx:231` | **Locale derived via translated string compare** — `t('common.switchLanguage') === 'English'`. en.json value is `"ภาษาไทย"` so condition always false → Thai users always get English recall. Real bug. | `locale: i18n.language === 'th' ? 'th' : 'en'` (matches `VisitSummarySection` pattern) |
| H2 | `packages/mock-server/src/ai/slot-suggestion.ts:31-36` | **`suggestSlots` non-deterministic** — `nextWorkdayAt` calls `new Date()` per invocation. Same input → different timestamps. Breaks plan's stated determinism contract. | Pin base date to a fixed seed reference (e.g., last day of seed data range) OR document deviation explicitly |
| H3 | `packages/mock-server/src/repositories/_aggregators.ts:90-93` | **Mutation in `add()` helper** — mutates `existing` object retrieved from Map; `buckets.set` becomes no-op for existing keys. Violates project mandatory immutability rule. | Spread: `buckets.set(key, { label, visitCount: (existing?.visitCount ?? 0) + 1, revenue: (existing?.revenue ?? 0) + total })` |
| H4 | `packages/api-client/src/types.ts:228` (RecallMessageRequest), `handlers/ai.ts:21-26`, `check-in-flow.tsx:225` | **`patientName` in API contract** — sent client→server. At A7 this forwards full name to OpenAI/Anthropic/Typhoon as-is. PDPA: requires DPA + consent. | Strip `patientName` from `RecallMessageRequest`; resolve server-side via `patientRepo.findById(tenantId, patientId).fullName` before template substitution |
| H5 | `apps/app/src/lib/logger.ts` PII_FIELD_NAMES | **Missing `text` + `rationale`** in PII guard. AI output `text` may contain patient name post-template substitution. Future `logger.info('ai.success', {text})` would leak. | Add `'text'`, `'rationale'` to `PII_FIELD_NAMES` |

### MEDIUM

| ID | File:Line | Issue |
|---|---|---|
| M1 | `branches.tsx:13-14` + `reports.tsx:17-18` | `MONTHS_TH`/`MONTHS_EN` 12-element arrays duplicated. A3 review flagged same; A4 propagated to branches.tsx. Extract to `apps/app/src/lib/locale-months.ts` before A5 adds more date-filter surfaces. |
| M2 | `apps/app/src/routes/branches.tsx:56` | Year `Select` options array rebuilt every render (`[year - 1, year, year + 1].map(...)`). `month` change triggers Select re-render with new ref. Wrap with `useMemo`. |
| M3 | `apps/app/src/features/ai/components/visit-summary-section.tsx:18-23` | `useAppointments({ patientId })` fetches ALL patient appointments — query key has no date bound; cache grows unboundedly. Acceptable at mock scale; track for A7. |
| M4 | `packages/mock-server/src/handlers/{branches,reports}.ts:19,25` | `getUsers()` returns all-tenant users; loop builds doctorMap without tenant filter. Mock UUIDs don't collide so no leak today, but pattern unsafe for A7. Filter: `getUsers().filter((u) => u.tenantId === tenantId)`. |
| M5 | `apps/app/src/features/ai/components/ai-output-card.tsx:16-23` | Clipboard copy of AI output (may contain patient name) lacks audit log. PDPA: copy = data egress event. Emit `logger.info('ai.clipboard.copy', { patientId })` (id only, not text). |
| M6 | `apps/app/src/features/walk-in/components/check-in-flow.tsx:228` | `weeksSinceLastVisit: 4` hardcoded. Misleading recall message if real backend forwards. Derive from real visit history or comment as known stub. |

### LOW

| ID | File:Line | Issue |
|---|---|---|
| L1 | `apps/app/src/features/ai/components/visit-summary-section.tsx:25` | Fallback `'Consultation'` hardcoded English. At A7 will go into LLM prompt. Use `t('ai.visitSummary.defaultService')` or move to disabled-state guard. |
| L2 | `apps/app/src/features/ai/components/ai-output-card.tsx:16-23` | Clipboard silent failure — iOS Safari non-HTTPS unavailable. No user feedback. Add `document.execCommand` fallback or transient toast. |
| L3 | `apps/app/src/locales/th.json:161` | `ai.preview` key is `"Preview"` verbatim in Thai locale. Brand-term consistency (LINE Pay, PDPA also untranslated) — confirm intent. |
| L4 | `packages/mock-server/src/handlers/{branches,reports}.ts:21-39` | Double null-coalesce — `if (fromDate === null) return ...` then `fromDate ?? undefined`. Dead code path; harmless but confusing. |
| L5 | `packages/mock-server/src/handlers/reports.ts:34` | `as ReportDimension` cast unnecessary after `if (!dimension)` guard. Inferred narrowing already correct. |

---

## Validation Results

| Check | Result |
|---|---|
| typecheck | Pass — 6/6 |
| lint | Pass — 0 warnings (after `ai/**` security scope-disable) |
| Tests | Pass — 6/6 |
| Build | Pass — 553 KB / 166 KB gzipped |
| Bundle audit | AI templates absent from prod chunk (Thai strings, hashIndex, generateRecallMessage all confirmed not in `dist/`) |
| `pnpm audit` | 0 vulns (presumed unchanged) |

---

## Positives

- `_hash.ts` clean extraction with `Math.max(1, modulo)` zero-division guard + clear stub-only JSDoc
- `Promise.allSettled` `settled<T>()` helper closes A3 M6 cleanly without duplicating fallback logic
- AI components (`AiButton`, `AiOutputCard`, `PreviewBadge`) — small, focused, compose well
- Determinism contract holds in 3 of 4 stubs (visit-summary, recall-message, photo-tag)
- Receipts cascade try/catch + `warnings` array implemented per A3 M2 closure
- TH/EN template arrays equal length (parallel-index invariant intact)
- Bundle audit: AI internals correctly tree-shaken from prod
- Cross-branch course portability already works at storage layer (tenant-scoped)

---

## Decision

**REQUEST CHANGES** — 5 HIGH issues block merge.

### Priority Fix Order

1. **H1** (locale string compare) — silent bug; Thai users currently get English recall. One-line fix.
2. **H3** (immutability in aggregator) — project rule violation. One-block fix.
3. **H4** (PII contract `patientName`) — blocks A7 LLM swap; PDPA-relevant.
4. **H5** (logger PII guard) — add `text`+`rationale`. Two-line fix.
5. **H2** (slot determinism) — pin base date or document deviation.
6. MEDIUMs M1 (extract month arrays), M2 (useMemo year options), M4 (tenant-filter doctor map), M6 (weeksSinceLastVisit hardcode comment).
7. Defer M3, M5, all LOWs to A5 polish.

---

## Next

Apply H1-H5 + critical MEDIUMs (M1, M2, M4, M6)? ~25 min.
