# Plan: A1 — Foundation (Monorepo + `apps/app` Scaffold)

## Summary
Bootstrap pnpm + Turborepo monorepo. Scaffold `apps/app` (Vite + React 18 + TS + Tailwind + shadcn/ui + TanStack stack). Stand up `packages/ui-tokens`, `packages/api-spec`, `packages/api-client`, `packages/mock-server`, `packages/domain`. Wire MSW + localStorage persistence. Build dev toolbar (tenant/branch/user switch + reset). Configure Vercel project A. Land Vitest + Playwright smoke test. Repo is greenfield — every pattern below becomes the codebase convention.

## User Story
As a **solo developer building the Lesso backoffice prototype**,
I want **a monorepo scaffold with mock backend, dev toolbar, and CI/deploy wired**,
so that **Phase A2 (core flows) can start on day 6 with zero infra friction and `apps/web` (B1) can consume `packages/ui-tokens` immediately**.

## Problem → Solution
Empty repo (only `.claude/` + `docs/`). → Working monorepo: `pnpm dev --filter=app` opens hello-world UI on iPad, dev toolbar switches mock tenant/branch/user, MSW serves seeded data from localStorage, Vercel preview deploys per PR, `pnpm build` green across all workspaces.

## Metadata
- **Complexity**: XL (~30 files, ~1500 lines including configs)
- **Source PRD**: `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md`
- **PRD Phase**: A1 — Foundation (line 686)
- **Estimated Files**: ~32 created, 0 updated (greenfield)
- **Estimated Time**: ~5 days (matches PRD)

---

## UX Design

### Before
```
┌──────────────────────────────────────────────┐
│ Empty repo                                   │
│ - .claude/ (PRDs, skills)                    │
│ - docs/ (research)                           │
│ No code, no app, no deploy.                  │
└──────────────────────────────────────────────┘
```

### After
```
┌──────────────────────────────────────────────┐
│ Lesso Backoffice (dev preview)               │
│ ┌────────────────────────────────────────┐  │
│ │ [Lesso logo] Today  Patients  Reports  │  │ ← top nav
│ └────────────────────────────────────────┘  │
│                                              │
│  Hello, Lesso 👋                             │
│  Mock tenant: Clinic A · Branch: Sukhumvit   │
│  Current user: Receptionist (Khun Ploy)      │
│                                              │
│  [API ping demo card]                        │
│  GET /v1/health → { status: "ok" } (mocked)  │
│                                              │
└──────────────────────────────────────────────┘
┌──── Dev Toolbar (bottom, collapsible) ──────┐
│ Tenant: [Clinic A ▼]  Branch: [Sukhumvit ▼] │
│ User:   [Receptionist ▼]                    │
│ Time:   [Now ▼]  [Reset data] [Toggle err]  │
└──────────────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Repo root | Empty | `pnpm install` + `pnpm dev --filter=app` works | Onboard contributor in <5 min |
| Browser | N/A | iPad portrait/landscape responsive | Tablet-first per PRD §Design System |
| Mock data | N/A | Seeded patients/branches survive page reload (localStorage) | Realistic demos |
| Tenant/branch switch | N/A | Dev toolbar dropdown → re-seed scope, refetch queries | Critical for multi-branch tests |
| Vercel | N/A | Preview deploy per PR at `https://<sha>-app.vercel.app` | Reviewable before merge |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md` | 200–250 | Apps Topology + Stack tables (locked choices) |
| P0 | `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md` | 252–340 | Monorepo Layout (exact tree to materialize) |
| P0 | `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md` | 341–360 | Architecture Decisions (ApiClient, OpenAPI as truth, dev toolbar) |
| P0 | `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md` | 411–636 | Design System (tokens, type scale, color palette — feeds `packages/ui-tokens`) |
| P0 | `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md` | 720–740 | Phase A1 detail (definitive scope) |
| P1 | `docs/research/migration-plan-supabase-to-shuttle.md` | all | ApiClient adapter contract (Supabase + future Rust) — informs `packages/api-client` interface |
| P2 | `docs/research/market-research-aesthetic-clinic-th.md` | all | Domain context for seed data names/services |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| pnpm workspaces | https://pnpm.io/workspaces | `pnpm-workspace.yaml` + `workspace:*` protocol; root scripts via `-r` (recursive) or `--filter` |
| Turborepo | https://turborepo.com/docs/getting-started/installation | `turbo.json` pipeline; `dependsOn`, `outputs`, `cache: true`. Use `turbo run dev --filter=app` |
| Vite + React | https://vite.dev/guide/ | `@vitejs/plugin-react`; React 18 strict mode; env vars via `import.meta.env.VITE_*` |
| TanStack Router | https://tanstack.com/router/latest/docs/framework/react/quick-start | File-based routing with `@tanstack/router-plugin` (Vite); `createRouter` + `RouterProvider`; type-safe `Link` |
| TanStack Query | https://tanstack.com/query/latest/docs/framework/react/overview | `QueryClient` + `QueryClientProvider`; `useQuery`/`useMutation`; pair with TanStack Router context |
| shadcn/ui (Vite) | https://ui.shadcn.com/docs/installation/vite | `npx shadcn@latest init`; CSS vars in `globals.css`; `components.json` config; copy-in components |
| Tailwind CSS v3 | https://tailwindcss.com/docs/installation | `tailwind.config.ts` with shadcn preset + `packages/ui-tokens` extend |
| MSW v2 | https://mswjs.io/docs/getting-started | `setupWorker(...handlers)` for browser; `start()` in dev only; `worker.use()` for runtime overrides |
| openapi-typescript | https://openapi-ts.dev/ | `openapi-typescript ./openapi.yaml -o ./types.ts`; generates pure types, no runtime |
| react-i18next | https://react.i18next.com/getting-started | `initReactI18next.use()`; `useTranslation()`; resources keyed by locale |
| Vitest | https://vitest.dev/guide/ | Compatible with Vite config; `test.environment: 'jsdom'`; React Testing Library plays nicely |
| Playwright | https://playwright.dev/docs/intro | `playwright.config.ts`; install browsers via `npx playwright install`; smoke = navigate + assert |
| Vercel monorepo | https://vercel.com/docs/monorepos | "Root Directory" per project = `apps/app`; build command = `pnpm turbo build --filter=app`; install command = `pnpm install` |

KEY_INSIGHT: TanStack Router Vite plugin generates `routeTree.gen.ts` automatically from `src/routes/*` — never edit manually.
APPLIES_TO: Task 6 (routing) and Task 9 (route components).
GOTCHA: Add `routeTree.gen.ts` to `.gitignore` AND `tsconfig` `exclude`? No — per docs, COMMIT `routeTree.gen.ts` for type-safety in CI. Just add to lint ignore.

KEY_INSIGHT: shadcn `init` for Vite asks for path aliases — pick `@/*` mapped to `src/*` in `tsconfig.json` AND `vite.config.ts` (`resolve.alias`). Mismatch = silent breakage.
APPLIES_TO: Task 5 (shadcn init).
GOTCHA: shadcn writes to `components/ui/*`; we want `src/components/ui/*` — set in `components.json` before running first `add`.

KEY_INSIGHT: MSW v2 requires `npx msw init public/ --save` to generate `mockServiceWorker.js` in static folder; without this, worker registration fails silently in production builds.
APPLIES_TO: Task 11 (MSW setup).
GOTCHA: Only start MSW when `import.meta.env.DEV` AND `import.meta.env.VITE_ENABLE_MOCKS === 'true'` — never in prod bundle.

KEY_INSIGHT: Vercel monorepo with Turborepo needs `installCommand = "pnpm install"` and `ignoreCommand = "npx turbo-ignore @lesso/app"` to skip rebuilds when only sibling app changes.
APPLIES_TO: Task 17 (Vercel project setup).
GOTCHA: Without `turbo-ignore`, every PR triggers both apps' deploys → wasted builds, noisy previews.

---

## Patterns to Mirror

**This is a greenfield repo — there are no existing patterns to discover.** Every pattern below becomes the codebase convention. Subsequent phases (A2+, B1+) MUST follow these. Do not improvise.

### NAMING_CONVENTION
```ts
// SOURCE: This plan (becomes convention from A1 onward)
// Files:    kebab-case          → patient-list.tsx, api-client.ts
// Folders:  kebab-case          → src/features/patient/
// Components: PascalCase        → export function PatientList()
// Hooks:    camelCase + 'use'   → useCurrentBranch()
// Types:    PascalCase          → type Patient = ...
// Constants: UPPER_SNAKE_CASE   → const MAX_BRANCHES = 10
// Utilities: camelCase          → formatThaiDate()
// Test files: *.test.ts(x)      → patient-list.test.tsx (colocated)
```

### ERROR_HANDLING
```ts
// SOURCE: This plan (convention)
// File: src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ApiError extends AppError {
  constructor(public readonly status: number, code: string, message: string, cause?: unknown) {
    super(code, message, cause);
    this.name = 'ApiError';
  }
}

// Usage in services:
if (!response.ok) {
  throw new ApiError(response.status, 'PATIENT_NOT_FOUND', `Patient ${id} not found`);
}

// Usage in UI:
const { data, error } = useQuery({ queryKey: ['patient', id], queryFn: () => apiClient.patients.get(id) });
if (error instanceof ApiError && error.code === 'PATIENT_NOT_FOUND') {
  return <EmptyState title={t('patient.notFound')} />;
}
```

### LOGGING_PATTERN
```ts
// SOURCE: This plan (convention)
// File: src/lib/logger.ts
// Browser-only structured logger. No PII in messages — pass IDs only.

type Level = 'debug' | 'info' | 'warn' | 'error';

const isDev = import.meta.env.DEV;

function log(level: Level, msg: string, ctx?: Record<string, unknown>) {
  const entry = { level, msg, ts: new Date().toISOString(), ...ctx };
  if (level === 'error') console.error(entry);
  else if (level === 'warn') console.warn(entry);
  else if (isDev) console.log(entry);
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => log('debug', msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log('error', msg, ctx),
};
```

### API_CLIENT_PATTERN (locked architecture decision)
```ts
// SOURCE: This plan + PRD §Architecture Decisions (line 343–344)
// File: packages/api-client/src/types.ts
export interface ApiClient {
  patients: PatientResource;
  appointments: AppointmentResource;
  courses: CourseResource;
  // ...
}

// File: packages/api-client/src/index.ts
export type ApiAdapter = 'mock' | 'supabase';

export function createApiClient(adapter: ApiAdapter): ApiClient {
  if (adapter === 'mock') {
    // Mock adapter: thin fetch wrapper that hits MSW handlers (which read/write localStorage)
    return createMockApiClient();
  }
  // Supabase adapter ships in Phase A7 — never imported at MVP
  throw new Error('Supabase adapter not implemented — Phase A7');
}

// Components NEVER import supabase-js or fetch directly. Always:
import { apiClient } from '@/lib/api';
const patient = await apiClient.patients.get(id);
```

### REPOSITORY_PATTERN (mock backend)
```ts
// SOURCE: This plan (convention)
// File: packages/mock-server/src/repositories/patient.ts
// Pattern: each entity gets a repository with findAll/findById/create/update/delete.
// Storage = localStorage namespace per tenant.

import { z } from 'zod';
import { Patient, PatientSchema } from '@lesso/domain';
import { storage } from '../storage';

const KEY = (tenantId: string) => `lesso:${tenantId}:patients`;

export const patientRepo = {
  findAll(tenantId: string): Patient[] {
    return storage.read(KEY(tenantId), z.array(PatientSchema)) ?? [];
  },
  findById(tenantId: string, id: string): Patient | null {
    return this.findAll(tenantId).find((p) => p.id === id) ?? null;
  },
  create(tenantId: string, input: Omit<Patient, 'id' | 'createdAt'>): Patient {
    const next: Patient = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    storage.write(KEY(tenantId), [...this.findAll(tenantId), next]);
    return next;
  },
  // ... update, delete
};
```

### SERVICE_PATTERN (MSW handler)
```ts
// SOURCE: This plan (convention)
// File: packages/mock-server/src/handlers/patients.ts
import { http, HttpResponse } from 'msw';
import { patientRepo } from '../repositories/patient';
import { getTenantContext } from '../context'; // reads dev-toolbar selection from localStorage

export const patientHandlers = [
  http.get('/v1/patients', () => {
    const { tenantId } = getTenantContext();
    return HttpResponse.json({ data: patientRepo.findAll(tenantId), meta: { total: patientRepo.findAll(tenantId).length } });
  }),
  http.get('/v1/patients/:id', ({ params }) => {
    const { tenantId } = getTenantContext();
    const patient = patientRepo.findById(tenantId, params.id as string);
    if (!patient) return HttpResponse.json({ error: 'PATIENT_NOT_FOUND' }, { status: 404 });
    return HttpResponse.json({ data: patient });
  }),
  // ... POST, PATCH, DELETE
];
```

### TEST_STRUCTURE
```ts
// SOURCE: This plan (convention)
// File: src/features/patient/patient-list.test.tsx (colocated)
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PatientList } from './patient-list';
import { renderWithProviders } from '@/test/utils'; // wraps in QueryClient + Router + i18n

describe('PatientList', () => {
  it('renders empty state when no patients', () => {
    // Arrange
    renderWithProviders(<PatientList patients={[]} />);
    // Act — N/A (pure render)
    // Assert
    expect(screen.getByText(/no patients/i)).toBeInTheDocument();
  });
});
```

### COMPONENT_PATTERN
```tsx
// SOURCE: This plan (convention)
// File: src/components/page-shell.tsx
// All authenticated pages render inside <PageShell>.

import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { DevToolbar } from './dev-toolbar';

interface PageShellProps {
  children: ReactNode;
  title: string;
}

export function PageShell({ children, title }: PageShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar title={title} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
      {import.meta.env.DEV ? <DevToolbar /> : null}
    </div>
  );
}
```

---

## Files to Change

### Root configs
| File | Action | Justification |
|---|---|---|
| `package.json` | CREATE | Root scripts (`dev`, `build`, `lint`, `test`), pnpm `packageManager` field |
| `pnpm-workspace.yaml` | CREATE | Declare `apps/*` + `packages/*` |
| `turbo.json` | CREATE | Pipeline: `build`, `dev`, `lint`, `test`, `test:e2e` |
| `tsconfig.base.json` | CREATE | Shared strict TS config; extended by every app/package |
| `.gitignore` | CREATE | `node_modules`, `dist`, `.turbo`, `.vercel`, `playwright-report`, `coverage`, `.env.local` |
| `.npmrc` | CREATE | `auto-install-peers=true`, `strict-peer-dependencies=false` |
| `.editorconfig` | CREATE | Tab/space + LF + UTF-8 |
| `.prettierrc.json` | CREATE | Single-quote, no semicolons-OFF (use semicolons), 100 width, trailing comma all |
| `eslint.config.js` | CREATE | Flat config; `@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks` |
| `README.md` | CREATE | Setup steps, scripts table, link to PRD |

### `packages/ui-tokens/`
| File | Action | Justification |
|---|---|---|
| `packages/ui-tokens/package.json` | CREATE | `name: "@lesso/ui-tokens"`, exports CSS + Tailwind preset |
| `packages/ui-tokens/src/css/tokens.css` | CREATE | Light + dark CSS vars from PRD §Design System Color Palette |
| `packages/ui-tokens/src/css/fonts.css` | CREATE | `@import` Figtree + Noto Sans + Noto Sans Thai + JetBrains Mono |
| `packages/ui-tokens/src/tailwind-preset.ts` | CREATE | Tailwind preset with `theme.extend.colors` mapped to CSS vars |
| `packages/ui-tokens/tsconfig.json` | CREATE | Extends base |

### `packages/domain/`
| File | Action | Justification |
|---|---|---|
| `packages/domain/package.json` | CREATE | `name: "@lesso/domain"`, exports Zod + types |
| `packages/domain/src/index.ts` | CREATE | Barrel export |
| `packages/domain/src/health.ts` | CREATE | `HealthSchema` (validates `/v1/health` response) — single endpoint at A1 |
| `packages/domain/src/common.ts` | CREATE | `IdSchema`, `IsoDateSchema`, `PaginatedResponseSchema<T>` |
| `packages/domain/tsconfig.json` | CREATE | Extends base |

### `packages/api-spec/`
| File | Action | Justification |
|---|---|---|
| `packages/api-spec/package.json` | CREATE | Holds OpenAPI YAML + codegen script |
| `packages/api-spec/openapi.yaml` | CREATE | Skeleton: `info`, `servers`, single `/v1/health` path |
| `packages/api-spec/scripts/generate.ts` | CREATE | Runs `openapi-typescript` → outputs to `packages/domain/src/generated/` |

### `packages/api-client/`
| File | Action | Justification |
|---|---|---|
| `packages/api-client/package.json` | CREATE | `name: "@lesso/api-client"`, deps on `@lesso/domain` |
| `packages/api-client/src/types.ts` | CREATE | `ApiClient` interface (with single `health` resource at A1) |
| `packages/api-client/src/index.ts` | CREATE | `createApiClient(adapter)` factory |
| `packages/api-client/src/adapters/mock.ts` | CREATE | Fetch wrapper hitting MSW |
| `packages/api-client/src/adapters/supabase.ts` | CREATE | Stub throwing "Phase A7" — proves seam exists |
| `packages/api-client/tsconfig.json` | CREATE | Extends base |

### `packages/mock-server/`
| File | Action | Justification |
|---|---|---|
| `packages/mock-server/package.json` | CREATE | `name: "@lesso/mock-server"`, deps on `msw`, `@lesso/domain`, `zod` |
| `packages/mock-server/src/index.ts` | CREATE | Barrel: `worker`, `handlers`, `seed`, `resetData` |
| `packages/mock-server/src/storage.ts` | CREATE | localStorage read/write with Zod validation |
| `packages/mock-server/src/context.ts` | CREATE | Reads dev-toolbar tenant/branch/user from localStorage |
| `packages/mock-server/src/seed.ts` | CREATE | Seeds 2 tenants × 2 branches × 3 users on first run |
| `packages/mock-server/src/handlers/index.ts` | CREATE | Exports all handler arrays combined |
| `packages/mock-server/src/handlers/health.ts` | CREATE | `GET /v1/health` → `{ status: 'ok', tenantId, branchId, userId }` |
| `packages/mock-server/src/worker.ts` | CREATE | `setupWorker(...handlers)` |
| `packages/mock-server/tsconfig.json` | CREATE | Extends base |

### `apps/app/`
| File | Action | Justification |
|---|---|---|
| `apps/app/package.json` | CREATE | `name: "@lesso/app"`, all runtime + dev deps |
| `apps/app/index.html` | CREATE | Vite entry HTML with `<html lang="th">`, viewport meta, font preconnect |
| `apps/app/vite.config.ts` | CREATE | `react()` + `tanstackRouter()` plugins, alias `@/*` → `src/*` |
| `apps/app/tsconfig.json` | CREATE | Extends base, paths `@/*` |
| `apps/app/tsconfig.node.json` | CREATE | For Vite/test config files |
| `apps/app/tailwind.config.ts` | CREATE | Uses `@lesso/ui-tokens` preset; content scans `src/**/*.{ts,tsx}` |
| `apps/app/postcss.config.js` | CREATE | tailwindcss + autoprefixer |
| `apps/app/components.json` | CREATE | shadcn config; `style: "new-york"`, `baseColor: "neutral"`, alias `@/*` |
| `apps/app/.env.example` | CREATE | `VITE_ENABLE_MOCKS=true`, `VITE_API_BASE_URL=/v1` |
| `apps/app/public/mockServiceWorker.js` | CREATE | Generated via `npx msw init` (commit it) |
| `apps/app/src/main.tsx` | CREATE | App entry: bootstrap MSW (dev) → render `<App />` |
| `apps/app/src/App.tsx` | CREATE | Providers: QueryClient, Router, i18n, Toaster |
| `apps/app/src/styles/globals.css` | CREATE | Tailwind directives + `@import '@lesso/ui-tokens/css/tokens.css'` + fonts |
| `apps/app/src/lib/api.ts` | CREATE | `export const apiClient = createApiClient('mock')` |
| `apps/app/src/lib/errors.ts` | CREATE | `AppError`, `ApiError` (per Patterns) |
| `apps/app/src/lib/logger.ts` | CREATE | Structured logger (per Patterns) |
| `apps/app/src/lib/i18n.ts` | CREATE | `i18next` init with th + en resources |
| `apps/app/src/lib/query-client.ts` | CREATE | TanStack Query `QueryClient` with default options |
| `apps/app/src/locales/th.json` | CREATE | Thai keys (~20 base strings: nav, common, errors) |
| `apps/app/src/locales/en.json` | CREATE | English mirror |
| `apps/app/src/store/dev-toolbar.ts` | CREATE | Zustand store: tenant, branch, user, time-mock; persisted to localStorage |
| `apps/app/src/components/dev-toolbar.tsx` | CREATE | Bottom-fixed UI; shadcn `Select` + `Button` |
| `apps/app/src/components/page-shell.tsx` | CREATE | App-shell layout (sidebar + topbar + main + DevToolbar) |
| `apps/app/src/components/sidebar.tsx` | CREATE | Stub nav: Today, Patients, Reports |
| `apps/app/src/components/top-bar.tsx` | CREATE | Page title + lang toggle |
| `apps/app/src/components/ui/*` | CREATE | shadcn-generated: button, card, select, input, label, sonner (toast) |
| `apps/app/src/routes/__root.tsx` | CREATE | TanStack Router root route (renders `<PageShell><Outlet /></PageShell>`) |
| `apps/app/src/routes/index.tsx` | CREATE | Hello-world landing: greeting + tenant/branch/user banner + health-check card |
| `apps/app/src/test/setup.ts` | CREATE | Vitest setup: jest-dom, MSW server-side worker for tests |
| `apps/app/src/test/utils.tsx` | CREATE | `renderWithProviders` helper |
| `apps/app/vitest.config.ts` | CREATE | `environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']` |
| `apps/app/playwright.config.ts` | CREATE | Webkit + Chromium; `webServer.command: "pnpm dev"` |
| `apps/app/tests/e2e/smoke.spec.ts` | CREATE | Open `/`, assert greeting visible, dev toolbar visible, switch tenant → URL persists |

### CI / Deploy
| File | Action | Justification |
|---|---|---|
| `.github/workflows/ci.yml` | CREATE | pnpm install, turbo lint + typecheck + test + build (filter changed) |
| `vercel.json` (in `apps/app`) | CREATE | `buildCommand`, `outputDirectory: "dist"`, `installCommand: "cd ../.. && pnpm install"`, `ignoreCommand: "npx turbo-ignore @lesso/app"` |

---

## NOT Building

Explicit out-of-scope for A1 (these belong to later phases):

- ❌ Patient / Appointment / Course / Billing models or routes (A2/A3)
- ❌ Multi-branch dashboard / reports (A4)
- ❌ AI feature stubs (A4)
- ❌ PDPA consent flows (A5)
- ❌ Real Supabase adapter (A7) — only stub that throws
- ❌ Real LINE OAuth (A7)
- ❌ Real photo storage (A7)
- ❌ `apps/web` scaffold (B1 — separate plan)
- ❌ shadcn block layouts beyond `dashboard-01` primitives needed for shell
- ❌ Accessibility audit (A5 owns final pass — A1 just sets correct primitives)
- ❌ Storybook (deferred; PRD §15 lists optional)
- ❌ Figma sync (deferred)
- ❌ Sentry / error reporting (post-MVP)
- ❌ Deep i18n coverage — only ~20 base strings; full coverage in A5

---

## Step-by-Step Tasks

### Task 1: Initialize repo metadata
- **ACTION**: Create root config files.
- **IMPLEMENT**: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.gitignore`, `.npmrc`, `.editorconfig`, `.prettierrc.json`, `eslint.config.js`, `README.md`.
- **MIRROR**: NAMING_CONVENTION.
- **IMPORTS**: N/A.
- **GOTCHA**: `package.json` MUST set `"packageManager": "pnpm@<version>"` (Vercel reads this). Use pnpm 9.x.
- **VALIDATE**: `pnpm install` runs clean; `pnpm -v` matches packageManager field.

```jsonc
// package.json
{
  "name": "lesso-app",
  "private": true,
  "packageManager": "pnpm@9.12.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "turbo": "^2.1.0",
    "prettier": "^3.3.0",
    "typescript": "^5.6.0",
    "eslint": "^9.13.0"
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```jsonc
// turbo.json
{
  "$schema": "https://turborepo.com/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".vercel/output/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "typecheck": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "test:e2e": { "dependsOn": ["^build"], "outputs": ["playwright-report/**"] }
  }
}
```

### Task 2: Build `packages/ui-tokens`
- **ACTION**: Materialize Design System tokens from PRD §2.
- **IMPLEMENT**: CSS vars (light + dark), font imports, Tailwind preset.
- **MIRROR**: PRD §Design System (color hex values exact).
- **IMPORTS**: `tailwindcss/types`.
- **GOTCHA**: Tailwind preset must export `Config` type for v3 — use `satisfies Config` from `tailwindcss`.
- **VALIDATE**: `pnpm --filter @lesso/ui-tokens build` (if buildable) or just `tsc --noEmit`.

```css
/* packages/ui-tokens/src/css/tokens.css */
:root {
  --primary: 192 91% 36%;        /* #0891B2 cyan-600 */
  --primary-foreground: 0 0% 100%;
  --secondary: 187 85% 53%;      /* #22D3EE */
  --success: 158 84% 31%;        /* #059669 */
  --warning: 32 94% 44%;         /* #D97706 */
  --destructive: 0 72% 51%;      /* #DC2626 */
  --info: 217 91% 60%;           /* #2563EB */
  --background: 183 100% 96%;    /* #ECFEFF */
  --card: 0 0% 100%;
  --muted: 210 40% 96%;          /* slate-100 */
  --border: 215 28% 89%;         /* slate-200 */
  --foreground: 192 49% 23%;     /* #164E63 cyan-900 */
  --muted-foreground: 215 16% 35%; /* slate-600 */
  --radius: 0.5rem;
}

.dark {
  --background: 222 47% 11%;     /* slate-900 */
  --card: 217 33% 17%;           /* slate-800 */
  --border: 215 25% 27%;         /* slate-700 */
  --foreground: 210 40% 96%;     /* slate-100 */
  --muted-foreground: 215 20% 65%; /* slate-400 */
  --primary: 187 85% 53%;        /* #22D3EE cyan-400 */
  --success: 158 64% 52%;        /* #34D399 */
}
```

```ts
// packages/ui-tokens/src/tailwind-preset.ts
import type { Config } from 'tailwindcss';

export const lessoPreset = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: 'hsl(var(--secondary))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        destructive: 'hsl(var(--destructive))',
        info: 'hsl(var(--info))',
        background: 'hsl(var(--background))',
        card: 'hsl(var(--card))',
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        border: 'hsl(var(--border))',
        foreground: 'hsl(var(--foreground))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Noto Sans', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
        heading: ['Figtree', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
} satisfies Partial<Config>;
```

### Task 3: Build `packages/domain`
- **ACTION**: Skeleton Zod schemas + types.
- **IMPLEMENT**: `IdSchema`, `IsoDateSchema`, `PaginatedResponseSchema`, `HealthSchema`. Generated types directory placeholder.
- **MIRROR**: PRD §Architecture Decisions ("OpenAPI as truth"). Use Zod for runtime + infer types.
- **IMPORTS**: `zod`.
- **GOTCHA**: A2+ phases will add models — keep `index.ts` barrel pattern so additions don't restructure.
- **VALIDATE**: `tsc --noEmit` clean.

### Task 4: Build `packages/api-spec` + codegen
- **ACTION**: OpenAPI YAML skeleton + codegen script.
- **IMPLEMENT**: `openapi.yaml` with `info`, `servers: [{ url: '/v1' }]`, single `/health` path. `scripts/generate.ts` runs `openapi-typescript` → writes to `packages/domain/src/generated/api.d.ts`.
- **MIRROR**: PRD §Architecture Decisions ("OpenAPI as truth").
- **IMPORTS**: `openapi-typescript`, `tsx`.
- **GOTCHA**: A1 only validates pipeline — paths are sparse. Don't over-spec; A2 adds patient/appointment.
- **VALIDATE**: `pnpm --filter @lesso/api-spec generate` produces non-empty `.d.ts`.

### Task 5: Build `packages/api-client` (interface + adapters)
- **ACTION**: ApiClient interface + factory + Mock adapter + Supabase stub.
- **IMPLEMENT**: Per API_CLIENT_PATTERN above. Mock adapter is `fetch('/v1/...')` — MSW intercepts.
- **MIRROR**: API_CLIENT_PATTERN, ERROR_HANDLING.
- **IMPORTS**: `@lesso/domain`.
- **GOTCHA**: Adapter functions must be pure — no React, no global state. Tenant/branch context flows via headers from MSW context (Task 9), NOT adapter args.
- **VALIDATE**: `tsc --noEmit` clean; importing `apiClient.health.get()` resolves to typed return.

### Task 6: Build `packages/mock-server`
- **ACTION**: MSW handlers + localStorage-backed repos + tenant context + seed.
- **IMPLEMENT**: `storage.ts` (Zod-validated read/write), `context.ts` (reads dev-toolbar state), `seed.ts` (idempotent on first run), `handlers/health.ts`, `worker.ts`.
- **MIRROR**: REPOSITORY_PATTERN, SERVICE_PATTERN.
- **IMPORTS**: `msw`, `@lesso/domain`, `zod`.
- **GOTCHA**: Seed must check existing data before overwriting — receptionist will lose state on every reload otherwise. Use `if (!storage.read(KEY)) seed(...)`.
- **VALIDATE**: Manual: open browser, network tab shows `/v1/health` mocked.

### Task 7: Scaffold `apps/app` Vite + React + TS
- **ACTION**: Initialize Vite app with `pnpm create vite apps/app --template react-ts`.
- **IMPLEMENT**: Customize `vite.config.ts` (alias `@/*`, TanStack Router plugin), `tsconfig.json` (strict + paths), `index.html` (lang, viewport, font preconnect).
- **MIRROR**: NAMING_CONVENTION.
- **IMPORTS**: `@vitejs/plugin-react`, `@tanstack/router-plugin`.
- **GOTCHA**: Set `base: '/'` and `server: { port: 5173 }`; Vercel needs `dist/` output (Vite default — leave alone).
- **VALIDATE**: `pnpm --filter @lesso/app dev` → http://localhost:5173 shows default Vite page (before next tasks override).

### Task 8: Wire Tailwind + shadcn/ui in `apps/app`
- **ACTION**: Install Tailwind, init shadcn, generate base components.
- **IMPLEMENT**:
  1. `pnpm --filter @lesso/app add -D tailwindcss postcss autoprefixer`; `npx tailwindcss init -p`.
  2. `tailwind.config.ts` extends `lessoPreset` from `@lesso/ui-tokens`.
  3. `src/styles/globals.css`: `@tailwind base/components/utilities` + `@import '@lesso/ui-tokens/css/tokens.css'` + font imports.
  4. `pnpm dlx shadcn@latest init` — pick alias `@/*`, base color neutral, CSS vars.
  5. `pnpm dlx shadcn@latest add button card select input label sonner separator badge`.
- **MIRROR**: PRD §Design System; PRD §Component Patterns.
- **IMPORTS**: N/A (config).
- **GOTCHA**: After shadcn init, `components.json` defaults to `components/ui` — change to `src/components/ui` BEFORE first `add`. Re-running `init` is destructive; verify config first.
- **VALIDATE**: `<Button>` renders with `bg-primary` color matching cyan-600.

### Task 9: Routing — TanStack Router
- **ACTION**: File-based routes with root + index.
- **IMPLEMENT**:
  - `src/routes/__root.tsx`: root route component, renders `<PageShell><Outlet /></PageShell>` + `<TanStackRouterDevtools />` in dev.
  - `src/routes/index.tsx`: home page.
  - `src/main.tsx`: import generated `routeTree.gen.ts`, create router, render `<RouterProvider router={router} />`.
- **MIRROR**: COMPONENT_PATTERN.
- **IMPORTS**: `@tanstack/react-router`.
- **GOTCHA**: `routeTree.gen.ts` is auto-generated by Vite plugin — never hand-edit. Add to `.gitattributes` as `linguist-generated=true` (cosmetic on GitHub).
- **VALIDATE**: Hot reload of `routes/index.tsx` updates browser without reload.

### Task 10: TanStack Query + i18n + Zustand wiring
- **ACTION**: Bootstrap providers in `App.tsx`.
- **IMPLEMENT**:
  - `src/lib/query-client.ts`: `new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } })`.
  - `src/lib/i18n.ts`: `i18next.use(initReactI18next).init({ resources: { th, en }, lng: 'th', fallbackLng: 'en' })`.
  - `src/store/dev-toolbar.ts`: Zustand store with persist middleware (localStorage key `lesso:dev-toolbar`).
  - `src/App.tsx`: composes `<QueryClientProvider><I18nextProvider><Toaster /><RouterProvider /></...>`.
- **MIRROR**: COMPONENT_PATTERN.
- **IMPORTS**: `@tanstack/react-query`, `i18next`, `react-i18next`, `zustand`, `zustand/middleware`.
- **GOTCHA**: Zustand persist must declare `name` AND `version` from day 1 — schema migrations later need it.
- **VALIDATE**: Browser localStorage shows `lesso:dev-toolbar` key after first interaction.

### Task 11: MSW bootstrap
- **ACTION**: Generate worker file, conditional start in `main.tsx`.
- **IMPLEMENT**:
  ```ts
  // src/main.tsx (top)
  async function enableMocking() {
    if (!import.meta.env.DEV) return;
    if (import.meta.env.VITE_ENABLE_MOCKS !== 'true') return;
    const { worker } = await import('@lesso/mock-server');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
  enableMocking().then(() => ReactDOM.createRoot(...).render(...));
  ```
- **MIRROR**: SERVICE_PATTERN.
- **IMPORTS**: `@lesso/mock-server`.
- **GOTCHA**: `npx msw init apps/app/public/ --save` must run BEFORE first dev start. Worker file 404 = silent failure; check `Application > Service Workers` in DevTools.
- **VALIDATE**: DevTools console logs `[MSW] Mocking enabled`; network tab shows `/v1/health` returning mock.

### Task 12: Dev toolbar UI
- **ACTION**: Bottom-fixed collapsible toolbar with shadcn `Select`.
- **IMPLEMENT**: `src/components/dev-toolbar.tsx`. Reads/writes Zustand store. On change, calls `queryClient.invalidateQueries()` to refetch with new tenant/branch.
- **MIRROR**: COMPONENT_PATTERN; PRD §Architecture Decisions ("Dev toolbar").
- **IMPORTS**: shadcn `Select`, Zustand store, `useQueryClient`.
- **GOTCHA**: Toolbar MUST NOT render in prod build (`{ import.meta.env.DEV ? <DevToolbar /> : null }` in PageShell).
- **VALIDATE**: Switch tenant in toolbar → home page banner updates → network refetches.

### Task 13: Hello-world home page
- **ACTION**: Functional landing showing system is alive.
- **IMPLEMENT**: `src/routes/index.tsx`:
  - i18n greeting (`t('home.greeting')`)
  - Banner showing current tenant/branch/user (from Zustand)
  - Card with `useQuery({ queryKey: ['health'], queryFn: () => apiClient.health.get() })` → renders `{status: 'ok'}` JSON
  - Lang toggle button (`i18n.changeLanguage('en')`)
- **MIRROR**: ERROR_HANDLING (handle ApiError in render), COMPONENT_PATTERN.
- **IMPORTS**: `@/lib/api`, `@/store/dev-toolbar`, `react-i18next`, shadcn `Card`, `Button`.
- **GOTCHA**: Use `tabular-nums` Tailwind class on any numeric output (PRD §Typography).
- **VALIDATE**: Page renders both Thai and English; switching tenant updates banner; health card shows `ok`.

### Task 14: Reduced motion + a11y baselines
- **ACTION**: Global CSS for `prefers-reduced-motion`, focus-visible rings.
- **IMPLEMENT**: Append to `globals.css`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
  :focus-visible { outline: 2px solid hsl(var(--primary)); outline-offset: 2px; border-radius: var(--radius); }
  ```
- **MIRROR**: PRD §Design System §10.
- **IMPORTS**: N/A.
- **GOTCHA**: Don't use `outline: none` on shadcn primitives — Tailwind's `focus-visible:ring-2` is correct alternative; verify on `<Button>`.
- **VALIDATE**: Tab through page; every interactive shows visible ring.

### Task 15: Vitest + Testing Library setup
- **ACTION**: Configure Vitest, test utils, smoke unit test.
- **IMPLEMENT**:
  - `vitest.config.ts`: extends `vite.config.ts`, `test.environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`.
  - `src/test/setup.ts`: `import '@testing-library/jest-dom/vitest'`.
  - `src/test/utils.tsx`: `renderWithProviders` wraps `QueryClientProvider` + `I18nextProvider` + `MemoryRouter` (TanStack `createMemoryHistory`).
  - `src/routes/index.test.tsx`: smoke test rendering greeting.
- **MIRROR**: TEST_STRUCTURE.
- **IMPORTS**: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`.
- **GOTCHA**: TanStack Router needs `createMemoryHistory` for tests — don't reuse browser history. Wrap in `RouterProvider` with test router.
- **VALIDATE**: `pnpm --filter @lesso/app test` passes; coverage report generates.

### Task 16: Playwright E2E smoke
- **ACTION**: One smoke test verifying full bootstrap.
- **IMPLEMENT**:
  - `playwright.config.ts`: `webServer.command: "pnpm dev"`, base URL `http://localhost:5173`, projects: chromium + webkit.
  - `tests/e2e/smoke.spec.ts`:
    1. Navigate to `/`
    2. Assert greeting visible (Thai default)
    3. Assert `text=ok` (health card)
    4. Open dev toolbar, switch tenant, assert banner updates
    5. Toggle lang to English, assert greeting changes
- **MIRROR**: TEST_STRUCTURE.
- **IMPORTS**: `@playwright/test`.
- **GOTCHA**: First run needs `npx playwright install chromium webkit` — document in README setup.
- **VALIDATE**: `pnpm --filter @lesso/app test:e2e` green; `playwright-report/` HTML opens.

### Task 17: Vercel project A configuration
- **ACTION**: Create Vercel project pointed at `apps/app`.
- **IMPLEMENT**:
  - `apps/app/vercel.json`:
    ```json
    {
      "buildCommand": "cd ../.. && pnpm turbo build --filter=@lesso/app",
      "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
      "outputDirectory": "dist",
      "ignoreCommand": "cd ../.. && npx turbo-ignore @lesso/app"
    }
    ```
  - In Vercel dashboard: Root Directory = `apps/app`. Framework preset = Vite.
  - Env var: `VITE_ENABLE_MOCKS=true` for Preview + Production (MVP only — flip to false in A7).
- **MIRROR**: External docs §Vercel monorepo.
- **IMPORTS**: N/A.
- **GOTCHA**: Without `--frozen-lockfile`, Vercel can drift from local. Without `ignoreCommand`, every PR rebuilds even pure-marketing changes (B1 onward).
- **VALIDATE**: Push to PR branch → Vercel comment appears with preview URL → URL renders home page with mocks.

### Task 18: GitHub Actions CI
- **ACTION**: Lint + typecheck + test on every PR.
- **IMPLEMENT**: `.github/workflows/ci.yml`:
  ```yaml
  name: CI
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v4
          with: { version: 9 }
        - uses: actions/setup-node@v4
          with: { node-version: 20, cache: pnpm }
        - run: pnpm install --frozen-lockfile
        - run: pnpm turbo lint typecheck test --filter=...[origin/main]
  ```
- **MIRROR**: External docs §Turborepo (`--filter=...[origin/main]` only rebuilds changed).
- **IMPORTS**: N/A.
- **GOTCHA**: Use `actions/setup-node` cache: pnpm AFTER `pnpm/action-setup` — order matters or cache misses.
- **VALIDATE**: PR shows CI green check; second push to same PR uses Turbo cache (faster).

### Task 19: README onboarding doc
- **ACTION**: Document setup, scripts, structure.
- **IMPLEMENT**: `README.md` with:
  - Prerequisites (Node 20, pnpm 9)
  - `pnpm install && pnpm --filter @lesso/app dev` quickstart
  - Scripts table
  - Directory map (1-line per workspace)
  - Link to PRD
- **MIRROR**: PRD §Header.
- **IMPORTS**: N/A.
- **GOTCHA**: Don't duplicate PRD content — link to it.
- **VALIDATE**: New machine can clone + setup in <5 min following README only.

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| `renderWithProviders(<HomePage />)` | empty store | renders Thai greeting | No |
| `renderWithProviders(<HomePage />)` after `i18n.changeLanguage('en')` | en locale | renders English greeting | No |
| `useQuery({ queryFn: apiClient.health.get })` | MSW responds 200 | `data.status === 'ok'` | No |
| Zustand `setTenant('clinic-b')` | initial = clinic-a | persisted to localStorage | No |
| `apiClient.health.get()` when MSW returns 500 | `VITE_ENABLE_MOCKS=true` + `worker.use(http.get('/v1/health', () => HttpResponse.json({}, { status: 500 })))` | throws `ApiError` with status 500 | Yes |
| `createApiClient('supabase')` | adapter='supabase' | throws "Phase A7" | Yes |

### Edge Cases Checklist
- [ ] `localStorage` disabled (private browsing) — Zustand persist falls back to memory; no crash
- [ ] First load with no seed — seed runs idempotently
- [ ] Switch tenant mid-flight query — TanStack Query cancels stale requests
- [ ] Lang toggle while on page — text updates without reload
- [ ] iPad viewport (768px) — sidebar collapses appropriately
- [ ] iPad landscape (1024px) — sidebar expanded
- [ ] `prefers-reduced-motion: reduce` — animations disabled
- [ ] Keyboard tab through home page — focus rings visible on every interactive

### E2E Smoke
- [ ] App boots, MSW reports enabled in console
- [ ] Greeting visible
- [ ] Health card shows `ok`
- [ ] Tenant switch updates banner + refetches
- [ ] Lang toggle works

---

## Validation Commands

### Static Analysis
```bash
pnpm turbo typecheck
```
EXPECT: Zero type errors across all workspaces.

```bash
pnpm turbo lint
```
EXPECT: Zero lint errors.

### Unit Tests
```bash
pnpm --filter @lesso/app test
```
EXPECT: All tests pass; coverage ≥ 60% (A1 baseline; 80% gate kicks in by A5).

### Build
```bash
pnpm turbo build
```
EXPECT: All workspaces build green; `apps/app/dist/index.html` exists; size budget — initial JS < 200 KB gzipped.

### E2E
```bash
pnpm --filter @lesso/app exec playwright install chromium webkit
pnpm --filter @lesso/app test:e2e
```
EXPECT: Smoke spec passes on chromium + webkit.

### Manual Validation
- [ ] `pnpm install` clean from scratch in <60s
- [ ] `pnpm --filter @lesso/app dev` opens http://localhost:5173 in <3s
- [ ] DevTools Console: `[MSW] Mocking enabled`
- [ ] DevTools Application > Service Workers: `mockServiceWorker.js` active
- [ ] Network tab: `/v1/health` returns 200 with mocked JSON
- [ ] Lighthouse on `/`: Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 95
- [ ] iPad portrait (use DevTools device toolbar @ iPad Pro 11"): layout intact
- [ ] iPad landscape: layout intact
- [ ] Switch tenant via toolbar → banner updates → re-fetches
- [ ] Tab through page → all focus rings visible
- [ ] Lang toggle TH ↔ EN → text updates
- [ ] Vercel preview deploy renders identical to local

---

## Acceptance Criteria

- [ ] All 19 tasks completed
- [ ] All validation commands pass
- [ ] `pnpm dev --filter=app` opens hello-world in <3s
- [ ] Dev toolbar switches tenant/branch/user; queries refetch
- [ ] MSW serves seeded data from localStorage; survives reload
- [ ] `packages/ui-tokens` consumed by `apps/app` (verified) and importable from `apps/web` (verified by attempting import in B1 — does not block A1 acceptance)
- [ ] Vercel preview URL works
- [ ] CI green on main + PR
- [ ] No type errors, no lint errors
- [ ] iPad portrait + landscape render correctly

## Completion Checklist

- [ ] Code follows NAMING_CONVENTION (kebab files, PascalCase components, camelCase utilities)
- [ ] All errors flow through `AppError` / `ApiError`
- [ ] All async UI states handled (loading + error + empty)
- [ ] All interactive elements have visible focus rings
- [ ] All buttons reach `min-h-11 min-w-11` (44px) on tablet
- [ ] No hardcoded color hex — only `bg-primary` etc.
- [ ] No emoji as icon (use Lucide)
- [ ] No `any` types — use `unknown` if escape needed, narrow before use
- [ ] PRD updated: A1 status `pending` → `in-progress` → `complete`
- [ ] Plan referenced from PRD A1 row PRP column

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| TanStack Router file-based plugin generates broken `routeTree.gen.ts` after upgrade | M | Build red | Pin minor version; add `pnpm dedupe` step; commit generated file so diffs surface in PRs |
| MSW worker registration silently fails on Vercel preview | M | Mocks don't load in preview | Verify with `[MSW]` console log; add Playwright assertion checking for it; document in README |
| shadcn `add` command overwrites custom token mappings | L | Brand drift | Always run `add` against clean tree; commit before; review diff |
| pnpm + Turbo + Vercel root-dir interaction | M | Deploy fails | Test deploy on day 1, not day 5 — surfaces issues early |
| Solo dev underestimates 5-day cap | M | Bleeds into A2 | Cut Storybook (already deferred); cut blog (B-track only); cap shadcn primitives to 7 listed |

## Notes

- **Greenfield reality**: every "Patterns to Mirror" snippet here is canonical for the project. Future phases must follow these exactly. Treat this plan as the founding architectural contract for the codebase.
- **Codebase exploration was minimal**: only `.claude/` and `docs/` exist pre-A1. Patterns derived from PRD §Technical Approach + §Design System + §Architecture Decisions + external library docs.
- **B1 (`apps/web`) starts in parallel**: A1 must publish `packages/ui-tokens` to workspace by ~day 3 so B1 has tokens to consume. Communicate token shape early.
- **PDPA-relevant code paths absent at A1**: no PII flows through home page. Compliance hardening lands in A5.
- **Confidence: 8/10** — well-known stack, clear PRD, single primary risk is solo-dev time. Bumps to 9 if shadcn init goes clean on first try.
