# Code Review: A1 — Foundation

**Reviewed**: 2026-05-01
**Scope**: Local uncommitted changes (greenfield repo, no git)
**Reviewers**: typescript-reviewer + security-reviewer + code-reviewer (parallel)
**Decision**: **REQUEST CHANGES** — 0 CRITICAL · 8 HIGH · 8 MEDIUM · 8 LOW

## Summary
A1 lands clean architecturally — adapter seam, Zod-validated localStorage, AppError/ApiError, dev toolbar, MSW double-gating, no hardcoded secrets, no XSS surface. Three concerns block A2 build-on:
1. **Production bundling** — `seedIfEmpty()` + mock-server static imports ship to prod (Sec-H1 + TS-2 + Q-M)
2. **Convention seams** — `resetData` over-broad clear, missing `apps/app/src/lib/errors.ts` re-export, `renderWithProviders` lacks Router → A2 will copy bad patterns
3. **Type-safety leaks** — `fetchJson<T>` unsafe cast, Zustand persist schema decoupled from reader

Validation: typecheck/lint/test/build all green.

---

## Findings

### CRITICAL
None.

### HIGH

| ID | File:Line | Issue | Fix |
|---|---|---|---|
| H1 | `apps/app/src/main.tsx:14` + `components/dev-toolbar.tsx:5` + `routes/index.tsx:5` + `store/dev-toolbar.ts:4` | Mock-server static imports + `seedIfEmpty()` ship in production bundle. Vite cannot tree-shake. When A7 flips `VITE_ENABLE_MOCKS=false`, seed still writes to localStorage on every prod page load. Mock storage code reachable in prod = future PII leak surface. | Move `seedIfEmpty()` inside `enableMocking()` after `worker.start()`. Convert all mock-server imports in app code to dynamic `import()` gated by `import.meta.env.DEV`. |
| H2 | `apps/app/vite.config.ts:18` | `host: true` binds dev server to `0.0.0.0` — reachable from LAN/cloud. Compounds esbuild dev-server cross-origin CVE (L3). | Remove `host: true` or set `host: '127.0.0.1'`. |
| H3 | `apps/app/vite.config.ts:21` | `build: { sourcemap: true }` ships full source maps to Vercel prod. Exposes business logic + future patient code. | `sourcemap: 'hidden'` (or `false`). |
| H4 | `packages/mock-server/src/seed.ts:81` + `apps/app/src/components/dev-toolbar.tsx:113` | `resetData()` calls `clearByPrefix('lesso:')` which wipes `lesso:dev-toolbar` (Zustand) + `lesso:lang` (i18n) along with seed data. After reload, toolbar selections + lang preference gone. | Replace prefix clear with explicit per-key removals (TENANTS_KEY, BRANCHES_KEY, USERS_KEY, SEED_VERSION_KEY) or use scoped prefix `lesso:seed:`. |
| H5 | (missing) `apps/app/src/lib/errors.ts` | Plan mandated this file. Currently `routes/index.tsx:4` imports `ApiError` directly from `@lesso/api-client`. A2 form-validation / routing-guard errors will follow this anti-pattern. | Add re-export: `export { AppError, ApiError } from '@lesso/api-client';`. Update `routes/index.tsx` to import from `@/lib/errors`. |
| H6 | `apps/app/src/store/dev-toolbar.ts:25-30` ↔ `packages/mock-server/src/context.ts:7-15` | Zustand persist envelope (`{state, version}`) and `DevToolbarStateSchema` are not type-linked. Future Zustand version change or partialize tweak silently returns null context. | Define shared `PersistedDevToolbarSchema` consumed by both store `partialize` + context reader. Include `z.object({ version: z.number() })` to catch drift. |
| H7 | `packages/api-client/src/adapters/mock.ts:24` | `fetchJson<T>` returns `(await res.json()) as T` — unchecked cast. Today only `health.get` validates downstream via Zod; future adapters will copy and skip. | Change return to `Promise<unknown>` and require Zod parse at every call site (or accept `z.ZodType<T>` parameter and parse inside). |
| H8 | `apps/app/src/components/sidebar.tsx:18` | `<nav aria-label={t('nav.today')}>` uses item label as landmark name → screen reader announces "Today navigation region". | Add `nav.primary` key (`เมนูหลัก` / `Primary navigation`); use it as landmark label. |

### MEDIUM

| ID | File:Line | Issue |
|---|---|---|
| M1 | `apps/app/vercel.json` (no headers) + `index.html` | No CSP, no `X-Frame-Options`, no `X-Content-Type-Options`, no `Referrer-Policy`. Healthcare app needs these from day one. |
| M2 | `apps/app/src/lib/i18n.ts:7` | `void i18n.init()` swallows init errors. Replace with `.catch(logger.error)`. |
| M3 | `apps/app/src/lib/logger.ts:6-8` | `console.error`/`warn` unconditional in prod + unbounded `ctx` spread. Future PII risk when patient code lands. Need PII-sanitisation contract or compile-time guard on field names. |
| M4 | `apps/app/public/mockServiceWorker.js` | Worker file ships in prod bundle even when MSW disabled. Add Vercel rewrite returning 404 for the path in non-dev. |
| M5 | `apps/app/src/routes/index.tsx:21-24` | `queryFn: () => apiClient.health.get()` ignores key context; relies on localStorage side-channel. Forward context explicitly. |
| M6 | `packages/api-client/src/errors.ts:5` | `cause` not forwarded to native `Error options.cause` (ES2022). Use `super(message, { cause })` so devtools/Sentry unwrap chains. |
| M7 | `apps/app/src/main.tsx:14` | `seedIfEmpty()` runs unconditionally — also see H1 root cause. |
| M8 | `apps/app/src/test/utils.tsx:16` | `renderWithProviders` lacks TanStack Router wrap. `Sidebar`/`PageShell` tests will crash on `<Link>`. Plan explicitly required `createMemoryHistory`. Fix before first A2 component test. |

### LOW

| ID | File:Line | Issue |
|---|---|---|
| L1 | `apps/app/src/routes/index.tsx:17-19` | `getTenants/getBranches/getUsers` called on every render — re-parses localStorage. Memoize like `dev-toolbar.tsx`. |
| L2 | `apps/app/src/components/ui/badge.tsx:29` | Badge root is `<div>` — invalid inside `<p>`/`<td>`. Use `<span>`. |
| L3 | `pnpm audit` | `vite ≤ 6.4.1` (path traversal in optimized deps map) + `esbuild ≤ 0.24.2` (dev server cross-origin) — both dev-only. Run `pnpm update vite esbuild --latest`. |
| L4 | `apps/app/src/components/top-bar.tsx:21` | `aria-label={t('common.switchToEnglish')}` — key name misleading; values already locale-aware but key implies one-direction. Rename to `common.switchLanguage`. |
| L5 | `apps/app/src/routeTree.gen.ts:2` | `eslint-disable` banner on hand-authored file — masks future bugs. Remove banner; mark as hand-authored placeholder. |
| L6 | `apps/app/index.html:8-9` | Google Fonts preconnect — no SRI possible on stylesheet, but consider self-hosting for PDPA data minimization later. |
| L7 | `packages/mock-server/src/seed.ts:27-35` | Plan said "2 tenants × 2 branches"; Clinic B has only 1 branch (Phuket). Add second branch for proper multi-branch testing. |
| L8 | (config) `eslint.config.js` | No `eslint-plugin-security` / `no-secrets`. Cheap to add at A1 baseline; prevents future regressions. |

---

## Validation Results

| Check | Result | Notes |
|---|---|---|
| Typecheck (`pnpm -r typecheck`) | Pass | All 6 workspaces clean |
| Lint (`pnpm -r lint`) | Pass | `--max-warnings 0` |
| Tests (`pnpm --filter @lesso/app test`) | Pass | 6/6 |
| Build (`pnpm turbo build`) | Pass | 14/14 tasks; Vite 689 KB / 220 KB gzipped |
| `pnpm audit` | Warn | 2 moderate (dev-only): vite + esbuild |

---

## Files Reviewed

48 source files across 6 workspaces:
- `apps/app/src/**/*.{ts,tsx}` (28 files incl. tests)
- `packages/api-client/src/**` (5)
- `packages/api-spec/scripts/generate.ts` (1)
- `packages/domain/src/**` (5)
- `packages/mock-server/src/**` (8)
- `packages/ui-tokens/src/**` (1)

Configs: `apps/app/{vite,vitest,playwright}.config.ts`, `apps/app/vercel.json`, `apps/app/index.html`, root `eslint.config.js`, `package.json` lockfiles.

---

## Positives (do NOT change)

- Adapter seam (`api-client`) clean — Mock + Supabase-stub correctly throw at boundary
- Zod-validated `storage` reads with memoryFallback for SSR/test
- AppError/ApiError single source
- Logger gates `log` behind `isDev` correctly
- Zustand `version: 1` from day one
- MSW double-gated (`DEV` + `VITE_ENABLE_MOCKS === 'true'`)
- No hardcoded secrets / API keys / passwords anywhere
- No `dangerouslySetInnerHTML`
- Focus rings + `prefers-reduced-motion` wired in `globals.css`
- `aria-hidden="true"` on every decorative icon
- `.gitignore` correctly excludes `.env*`
- `.env.example` only innocuous placeholders

---

## Decision

**REQUEST CHANGES** — fix HIGH issues before merging A1 / starting A2.

### Priority Fix Order

1. **H1 + M7** (production bundle hygiene) — gate `seedIfEmpty` + dynamic-import mock-server. Single root fix.
2. **H4** (`resetData` scope) — explicit key removals. One-line change, prevents user-state corruption.
3. **H5** (`apps/app/src/lib/errors.ts` re-export stub) — one-file change, locks convention before A2.
4. **H7** (`fetchJson<T>` unsafe cast) — unsafe seam, one function rewrite.
5. **H6** (Zustand persist schema seam) — shared schema package or one-file shared type.
6. **H2 + H3** (Vite config — host + sourcemap) — two-line change.
7. **H8** (sidebar `aria-label`) — one-line + locale key.
8. **M1** (Vercel security headers) — one-time vercel.json block.
9. **M2, M3, M4, M5, M6, M8** — bundle into "review-fixes" cleanup PR.
10. **L1–L8** — opportunistic during A2.

---

## Next Steps

- Approve fix list → I apply HIGH-priority fixes in one pass + re-validate.
- Or: bundle into separate `a1-review-fixes.plan.md` if you want PR-style scoped changes.
- Or: defer non-blocking items to A2 sprint.
