# Lesso — Aesthetic Clinic Backoffice

Single monorepo, two apps:

- `apps/app` — Backoffice prototype (Vite + React 18 SPA) → `app.lesso.clinic`
- `apps/web` — Marketing site (Vite + `vite-react-ssg`) → `lesso.clinic` _(Phase B1, not yet scaffolded)_

Shared `packages/*` provide the API spec, typed client, mock server, domain schemas, and design tokens.

> Full product spec: [`.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md`](.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md)
> Active phase plan: [`.claude/PRPs/plans/a1-foundation.plan.md`](.claude/PRPs/plans/a1-foundation.plan.md)

## Prerequisites

- Node.js 20+
- pnpm 10+ (`corepack enable && corepack use pnpm@10`)

## Quick start

```bash
pnpm install

# First-time only: generate the MSW worker into apps/app/public/
pnpm --filter @lesso/app exec msw init public/ --save

# Run the backoffice
pnpm --filter @lesso/app dev
# → http://localhost:5173
```

## Scripts (root)

| Command | What it does |
|---|---|
| `pnpm dev` | Run all apps in dev (Turbo persistent) |
| `pnpm build` | Build all apps + packages |
| `pnpm typecheck` | TypeScript across all workspaces |
| `pnpm lint` | ESLint across all workspaces |
| `pnpm test` | Vitest across all workspaces |
| `pnpm test:e2e` | Playwright E2E |
| `pnpm format` | Prettier write |

Filter to one workspace:

```bash
pnpm turbo dev --filter=@lesso/app
pnpm turbo build --filter=@lesso/app
```

## Repo layout

```
lesso-app/
├── apps/
│   ├── app/        # Backoffice (Vite + React)
│   └── web/        # Marketing site (Phase B1)
├── packages/
│   ├── api-spec/   # OpenAPI YAML — source of truth
│   ├── api-client/ # Typed client + Mock/Supabase adapters
│   ├── domain/     # Zod schemas + shared TS types
│   ├── mock-server/# MSW handlers + localStorage persistence
│   └── ui-tokens/  # Design tokens (CSS vars + Tailwind preset)
└── docs/           # Research, migration plans
```

## Environment

Copy `.env.example` per app and adjust:

```bash
cp apps/app/.env.example apps/app/.env.local
```

| Var | Default | Purpose |
|---|---|---|
| `VITE_ENABLE_MOCKS` | `true` | Toggle MSW; flip to `false` after Phase A7 |
| `VITE_API_BASE_URL` | `/v1` | API root |

## Architecture

- **API contract** lives in `packages/api-spec/openapi.yaml`. Both MSW handlers and the future Supabase adapter conform to it.
- **`apiClient`** abstraction is the only allowed call site for backend access — never import `supabase-js` or `fetch` directly in components.
- **Mock data** persists to `localStorage` via Zod-validated `storage` helpers. Switch tenant/branch/user from the dev toolbar (bottom of screen, dev-only).

## Contributing

1. Branch from `main`.
2. Follow naming: kebab files, PascalCase components, camelCase utilities.
3. Tests are colocated (`*.test.ts(x)`).
4. Open PR — Vercel posts a preview URL automatically.
