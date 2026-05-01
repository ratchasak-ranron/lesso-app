# Plan: A2 — Core Flows (Patient, Appointment, Course, Walk-in)

## Summary
Build the receptionist's daily working surface. Four domain entities (Patient, Appointment, Course, CourseSession) wired through the full A1 stack: Zod schemas in `@lesso/domain`, OpenAPI definitions, MSW handlers writing to localStorage, ApiClient interface methods, TanStack Query hooks, and React components on six new routes (`/`, `/patients`, `/patients/:id`, `/appointments`, `/courses`). Walk-in check-in flow connects all four entities in a single action sequence. Patient card view is the receptionist's data-rich anchor screen. Success: stopwatch test — checked-in walk-in customer in <90 seconds on iPad portrait.

## User Story
As a **receptionist at a small Thai aesthetic clinic**,
I want **a single screen to find a returning patient, see their course balance, check them in, decrement their session, and book the next visit**,
so that **I can finish a walk-in turnaround in under 90 seconds without touching Excel**.

## Problem → Solution
A1 ships an empty shell with one route + a health card. → A2 ships the receptionist's full daily surface: 6 routes, 4 entities, 30+ MSW endpoints, full walk-in flow with cross-entity state (decrement course session, mark appointment complete, prompt rebook).

## Metadata
- **Complexity**: XL (~50 files added, ~3000 lines, 22 tasks, ~7 days)
- **Source PRD**: `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md`
- **PRD Phase**: A2 — Core Flows
- **Estimated Files**: ~52 created, ~6 updated
- **Depends on**: A1 (complete) — patterns + scaffolding from A1 are load-bearing

---

## UX Design

### Before (post-A1)
```
┌──────────────────────────────────────────────┐
│ [Lesso] Today                       [EN/TH] │
│ ────────────────────────────────────────────│
│  Hello, Lesso                                │
│  Clinic A · Sukhumvit · Khun Ploy            │
│                                              │
│  [Health card → status: ok]                  │
│                                              │
└──────────────────────────────────────────────┘
[ Dev toolbar ]
```

### After (A2 — "Today" landing)
```
┌──────────────────────────────────────────────┐
│ [Lesso] Today                       [EN/TH] │
│ ────────────────────────────────────────────│
│  ┌────────────────────────────────────────┐ │
│  │ [Search patient…]    [+ New walk-in]  │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Today, 5 May 2026 · Sukhumvit              │
│                                              │
│  ┌── Walk-in queue (2) ──────────────┐      │
│  │ • Khun Mai      [Check In] [⋯]   │      │
│  │ • Khun Ploy     [Check In] [⋯]   │      │
│  └──────────────────────────────────┘       │
│                                              │
│  ┌── Appointments today (8) ────────┐       │
│  │ 09:00 · Khun Anong   · Botox     │       │
│  │        [Check In] [Reschedule]   │       │
│  │ 09:30 · Khun Som     · Filler    │       │
│  │        ✓ Checked in 09:32        │       │
│  │ 10:00 · Khun Mali    · Laser     │       │
│  │        ⚠ Course balance 0       │       │
│  │ ...                              │       │
│  └──────────────────────────────────┘       │
└──────────────────────────────────────────────┘
[ Dev toolbar ]
```

### After (A2 — Patient card / `/patients/:id`)
```
┌──────────────────────────────────────────────┐
│ ← Back to today                              │
│ ────────────────────────────────────────────│
│  Khun Anong Sornchai            [Edit]       │
│  📞 081-234-5678 · LINE: @anong              │
│  Patient since 2024-03 · 14 visits           │
│                                              │
│  ┌── Active courses (2) ──────────────┐    │
│  │ Botox 4-pack    ▓▓▓░ 1 of 4 left   │    │
│  │ Laser 6-pack    ▓░░░░░ 5 left       │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌── Alerts ─────────────────────────────┐  │
│  │ ⚠ Consent expires in 14 days         │  │
│  └───────────────────────────────────────┘  │
│                                              │
│  ┌── History ────────────────────────────┐  │
│  │ 2026-04-15 · Botox session 3 · ฿5,000│  │
│  │ 2026-03-02 · Laser session 1 · ฿8,000│  │
│  │ ...                                   │  │
│  └───────────────────────────────────────┘  │
│                                              │
│  [Check In] [Book appt] [Add course]        │
└──────────────────────────────────────────────┘
```

### Critical interaction — Walk-in check-in (3-minute test)
```
1. Receptionist taps [+ New walk-in] → search patient by name/phone
2. Selects patient → patient card opens in Sheet drawer
3. Sees course balance card (e.g., "Botox 4-pack — 1 of 4 left")
4. Taps [Check In] → walk-in queue entry created, doctor queue toast
5. After visit, taps [Complete] in queue → decrement course (3 → 2)
6. Prompt: [Take payment] → receipt mock → [Book next] or [Done]
Stopwatch target: <90s receptionist time end-to-end.
```

### Interaction Changes
| Touchpoint | Before | After |
|---|---|---|
| Home page | Health card | Walk-in queue + today's appointments |
| Search | None | Top bar — name / phone / ID |
| Patient list | None | `/patients` data table with sort/filter |
| Patient view | None | Drawer (Sheet) from list, full page at `/patients/:id` |
| Appointment | None | Calendar (day/week/month) at `/appointments`; book dialog |
| Course | None | Active courses card on patient page; manage at `/courses` |
| Walk-in | None | Top-bar quick action; persists in localStorage |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `.claude/PRPs/plans/completed/a1-foundation.plan.md` | "Patterns to Mirror" section | Canonical patterns (naming, error, repository, service, component, test). MUST follow exactly. |
| P0 | `.claude/PRPs/reports/a1-foundation-report.md` | full | A1 deviations + open MEDIUM/LOW work — context for what's ready. |
| P0 | `.claude/PRPs/reviews/a1-foundation-review.md` | full | Reviewer-mandated patterns now baked in (errors re-export, persist schema, fetchValidated, RequestContext). |
| P0 | `apps/app/src/routes/index.tsx` | full | Existing pattern for route component + useQuery + i18n + context. Replace its body in A2. |
| P0 | `packages/api-client/src/types.ts` | full | `RequestContext` + `ApiClient` interface — extend for new resources. |
| P0 | `packages/api-client/src/adapters/mock.ts` | full | `fetchValidated<T>` + `contextHeaders` — re-use for every new endpoint. |
| P0 | `packages/mock-server/src/storage.ts` | full | Zod-validated localStorage helpers — repos use these. |
| P0 | `packages/mock-server/src/handlers/health.ts` | full | Header-first context resolution pattern; copy for every new handler. |
| P0 | `apps/app/src/components/page-shell.tsx` + `sidebar.tsx` | full | Layout — sidebar links go from stub to real `<Link>` via TanStack Router. |
| P0 | `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md` | §Design System (411–636) | Tablet-first breakpoints, density, color tokens, type scale. |
| P1 | `apps/app/src/store/dev-toolbar.ts` + `lib/persist-keys.ts` | full | Persistence pattern — extend for any new persisted state. |
| P1 | `apps/app/src/lib/i18n.ts` + `locales/{th,en}.json` | full | i18n contract — every new string MUST land in both locales. |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| TanStack Router CLI | https://tanstack.com/router/latest/docs/framework/react/cli | `tsr generate` produces `routeTree.gen.ts` from `src/routes/` file structure. Add `prebuild` + `pretypecheck` hooks. |
| TanStack Router file routing | https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing | Filename conventions: `routes/patients.tsx` = `/patients`, `routes/patients.$id.tsx` = `/patients/:id`. |
| TanStack Query mutations | https://tanstack.com/query/latest/docs/framework/react/guides/mutations | `useMutation({ onSuccess: () => qc.invalidateQueries() })` after each write. Optimistic updates via `onMutate` + rollback in `onError`. |
| shadcn Sheet | https://ui.shadcn.com/docs/components/sheet | Right-side drawer for patient detail (`apps/app/src/components/ui/sheet.tsx`). |
| shadcn Dialog / AlertDialog | https://ui.shadcn.com/docs/components/dialog | `Dialog` for booking form; `AlertDialog` for destructive (cancel appt). |
| shadcn Popover + Command | https://ui.shadcn.com/docs/components/command | Patient search combobox (typeahead). |
| shadcn DataTable | https://ui.shadcn.com/docs/components/data-table | Patient/appointment lists. Pair with TanStack Table v8. |
| shadcn Calendar | https://ui.shadcn.com/docs/components/calendar | `react-day-picker` underneath. |
| dayjs Buddhist calendar | https://day.js.org/docs/en/plugin/buddhist-era | `BE` plugin for Thai dates (2026 → 2569 BE). Toggle via user pref. |

KEY_INSIGHT: TanStack Router CLI generates `routeTree.gen.ts` synchronously — runs in <100ms. Wire as `prebuild`/`pretypecheck` so CI works. Plan A1 deferred this; A2 unblocks file-based routing.
APPLIES_TO: Task 2 (router setup).
GOTCHA: CLI watches `src/routes/` — adding/renaming routes during dev requires re-run (or use `tsr watch` in `dev` script).

KEY_INSIGHT: Use Zod `.brand<'PatientId'>()` for entity-specific ID types — prevents accidentally passing a `BranchId` to a `PatientId` parameter. Free type-safety.
APPLIES_TO: Tasks 3–6 (domain schemas).
GOTCHA: Branded types don't survive JSON deserialization at runtime — only compile-time guard. Don't rely for security.

KEY_INSIGHT: Course-session decrement is the only multi-entity write in A2. Wrap in MSW handler that reads/writes 3 keys atomically (course, sessions, appointment) with try/catch + rollback. Future Supabase swap = single transaction.
APPLIES_TO: Task 17 (walk-in check-in flow).
GOTCHA: localStorage has no atomicity — partial write on quota error breaks state. Mitigate with single combined write call.

KEY_INSIGHT: Thai phone numbers can contain `-`, `(`, `)`, spaces, leading `0`/`+66`. Normalize in Zod transform (`z.string().transform(stripNonDigits)`) before storage. Search must match against normalized form.
APPLIES_TO: Tasks 5 (Patient schema), 14 (search).
GOTCHA: International callers may key in `+66 81 234 5678` — store digits-only `66812345678` AND original. Display original.

KEY_INSIGHT: shadcn `Sheet` traps focus by default but doesn't always restore on close → keyboard users lose context. Pair every Sheet with `useSheetReturn` ref or rely on Radix's built-in focus return (which works if `<SheetTrigger>` is used).
APPLIES_TO: Task 19 (patient drawer).
GOTCHA: Programmatic Sheet open (without SheetTrigger button) needs manual focus restore. Prefer SheetTrigger pattern.

---

## Patterns to Mirror

A1 established the canonical patterns. **A2 must follow them exactly.** Snippets below show how A1 patterns extend to A2 entities.

### REPOSITORY_PATTERN (extends A1)
```ts
// SOURCE: A1 packages/mock-server/src/seed.ts (storage + Zod read)
// File: packages/mock-server/src/repositories/patient.ts
import { PatientSchema, type Patient } from '@lesso/domain';
import { z } from 'zod';
import { storage } from '../storage';

const KEY = (tenantId: string) => `lesso:tenant:${tenantId}:patients`;

export const patientRepo = {
  findAll(tenantId: string): Patient[] {
    return storage.read(KEY(tenantId), z.array(PatientSchema)) ?? [];
  },
  findById(tenantId: string, id: string): Patient | null {
    return this.findAll(tenantId).find((p) => p.id === id) ?? null;
  },
  search(tenantId: string, query: string): Patient[] {
    const q = query.toLowerCase();
    return this.findAll(tenantId).filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.phoneDigits.includes(q.replace(/\D/g, '')),
    );
  },
  create(tenantId: string, input: Omit<Patient, 'id' | 'createdAt'>): Patient {
    const next: Patient = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    storage.write(KEY(tenantId), [...this.findAll(tenantId), next]);
    return next;
  },
  update(tenantId: string, id: string, patch: Partial<Patient>): Patient {
    const all = this.findAll(tenantId);
    const idx = all.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error(`Patient ${id} not found`);
    const next = { ...all[idx], ...patch };
    storage.write(KEY(tenantId), all.map((p, i) => (i === idx ? next : p)));
    return next;
  },
  delete(tenantId: string, id: string): void {
    storage.write(KEY(tenantId), this.findAll(tenantId).filter((p) => p.id !== id));
  },
};
```

### SERVICE_PATTERN (MSW handler — extends A1 health handler)
```ts
// SOURCE: A1 packages/mock-server/src/handlers/health.ts (header-first ctx)
// File: packages/mock-server/src/handlers/patients.ts
import { http, HttpResponse } from 'msw';
import { resolveContext } from '../context';
import { patientRepo } from '../repositories/patient';

export const patientHandlers = [
  http.get('/v1/patients', ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return HttpResponse.json({ code: 'NO_TENANT', message: 'Tenant required' }, { status: 400 });
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const data = q ? patientRepo.search(tenantId, q) : patientRepo.findAll(tenantId);
    return HttpResponse.json({ data, meta: { total: data.length } });
  }),
  http.get('/v1/patients/:id', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return HttpResponse.json({ code: 'NO_TENANT', message: 'Tenant required' }, { status: 400 });
    const patient = patientRepo.findById(tenantId, params.id as string);
    if (!patient) return HttpResponse.json({ code: 'NOT_FOUND', message: `Patient ${params.id as string} not found` }, { status: 404 });
    return HttpResponse.json({ data: patient });
  }),
  // POST, PATCH, DELETE — same pattern
];
```

### API_CLIENT_PATTERN (extends `@lesso/api-client`)
```ts
// SOURCE: A1 packages/api-client/src/types.ts
// File: packages/api-client/src/types.ts (extended)
export interface PatientResource {
  list(ctx: RequestContext, query?: { q?: string }): Promise<Patient[]>;
  get(ctx: RequestContext, id: string): Promise<Patient>;
  create(ctx: RequestContext, input: PatientCreateInput): Promise<Patient>;
  update(ctx: RequestContext, id: string, patch: PatientUpdateInput): Promise<Patient>;
  delete(ctx: RequestContext, id: string): Promise<void>;
}

export interface ApiClient {
  health: HealthResource;
  patients: PatientResource;       // ← new
  appointments: AppointmentResource;
  courses: CourseResource;
  walkIns: WalkInResource;
}
```

### QUERY_HOOK_PATTERN (new — A2 establishes)
```ts
// File: apps/app/src/features/patient/use-patients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useDevToolbar } from '@/store/dev-toolbar';
import type { Patient, PatientCreateInput } from '@lesso/domain';

function useCtx() {
  return useDevToolbar((s) => ({ tenantId: s.tenantId, branchId: s.branchId, userId: s.userId }));
}

export function usePatients(query?: string) {
  const ctx = useCtx();
  return useQuery({
    queryKey: ['patients', ctx.tenantId, query ?? ''],
    queryFn: () => apiClient.patients.list(ctx, { q: query }),
    enabled: ctx.tenantId !== null,
  });
}

export function usePatient(id: string | undefined) {
  const ctx = useCtx();
  return useQuery({
    queryKey: ['patient', ctx.tenantId, id],
    queryFn: () => apiClient.patients.get(ctx, id!),
    enabled: ctx.tenantId !== null && !!id,
  });
}

export function useCreatePatient() {
  const ctx = useCtx();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PatientCreateInput) => apiClient.patients.create(ctx, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients', ctx.tenantId] }),
  });
}
```

### FEATURE_FOLDER_PATTERN (new — A2 establishes)
```
apps/app/src/features/patient/
├── components/
│   ├── patient-list.tsx           # DataTable
│   ├── patient-search.tsx         # Combobox (Command + Popover)
│   ├── patient-card.tsx           # Sidebar / drawer summary
│   ├── patient-form.tsx           # Create / edit form (RHF + Zod)
│   └── patient-detail-sheet.tsx   # Right drawer
├── hooks/
│   └── use-patients.ts
└── index.ts                       # Barrel
```

### ROUTE_PATTERN (file-based — A2 switches on)
```tsx
// File: apps/app/src/routes/patients.$id.tsx
import { createFileRoute, useParams } from '@tanstack/react-router';
import { PatientDetail } from '@/features/patient';

export const Route = createFileRoute('/patients/$id')({
  component: PatientDetailRoute,
});

function PatientDetailRoute() {
  const { id } = Route.useParams();
  return <PatientDetail patientId={id} />;
}
```

---

## Files to Change

### `packages/domain/src/` — entity schemas (4 new files)
| File | Action | Justification |
|---|---|---|
| `patient.ts` | CREATE | Patient schema + types + branded `PatientId` |
| `appointment.ts` | CREATE | Appointment + status enum + ICS-friendly fields |
| `course.ts` | CREATE | Course + CourseSession + status enum |
| `walk-in.ts` | CREATE | WalkIn entry — joined view of patient + queue |
| `index.ts` | UPDATE | Re-export all new schemas |

### `packages/api-spec/openapi.yaml` — extended endpoints
| Section | Action | Justification |
|---|---|---|
| `paths` | UPDATE | Add `/v1/patients`, `/v1/patients/:id`, `/v1/appointments`, `/v1/appointments/:id`, `/v1/courses`, `/v1/courses/:id`, `/v1/walk-ins`, `/v1/walk-ins/:id`, `/v1/courses/:id/decrement` |
| `components.schemas` | UPDATE | Patient, Appointment, Course, CourseSession, WalkIn schemas + envelope variants |

### `packages/api-client/src/` — adapter extension (4 new files)
| File | Action | Justification |
|---|---|---|
| `types.ts` | UPDATE | Add `PatientResource`, `AppointmentResource`, `CourseResource`, `WalkInResource` interfaces |
| `adapters/mock.ts` | UPDATE | Implement each resource using `fetchValidated` |
| `index.ts` | UPDATE | Re-export new types |

### `packages/mock-server/src/` — repos + handlers (10 new files)
| File | Action | Justification |
|---|---|---|
| `context.ts` | UPDATE | Add `resolveContext(request)` helper that combines header + localStorage fallback |
| `repositories/patient.ts` | CREATE | Patient repo |
| `repositories/appointment.ts` | CREATE | Appointment repo + helpers (today's by branch) |
| `repositories/course.ts` | CREATE | Course + sessions repo + atomic decrement |
| `repositories/walk-in.ts` | CREATE | Walk-in queue repo |
| `handlers/patients.ts` | CREATE | CRUD + search |
| `handlers/appointments.ts` | CREATE | CRUD + by-date queries |
| `handlers/courses.ts` | CREATE | CRUD + decrement endpoint |
| `handlers/walk-ins.ts` | CREATE | CRUD + check-in transitions |
| `handlers/index.ts` | UPDATE | Aggregate new handlers |
| `seed.ts` | UPDATE | Seed 200 patients, 50 courses, 6 months appointment history |

### `apps/app/src/features/` — feature folders (24 new files)
| Folder | Files | Justification |
|---|---|---|
| `patient/` | `hooks/use-patients.ts`, `components/{patient-list,patient-search,patient-card,patient-form,patient-detail-sheet}.tsx`, `index.ts` | Full CRUD + search + detail |
| `appointment/` | `hooks/use-appointments.ts`, `components/{appointment-list,appointment-calendar,appointment-form,appointment-row}.tsx`, `index.ts` | List + calendar + book |
| `course/` | `hooks/use-courses.ts`, `components/{course-list,course-balance-card,course-form,decrement-button}.tsx`, `index.ts` | Active courses + decrement |
| `walk-in/` | `hooks/use-walk-ins.ts`, `components/{walk-in-queue,walk-in-button,check-in-flow}.tsx`, `index.ts` | Queue + check-in orchestrator |

### `apps/app/src/routes/` — file-based routes (6 new files, 1 updated)
| File | Action | Path |
|---|---|---|
| `__root.tsx` | UPDATE | Add proper PageShell title resolution per route |
| `index.tsx` | REWRITE | "Today" landing — walk-in queue + appointments today |
| `patients.tsx` | CREATE | `/patients` list view |
| `patients.$id.tsx` | CREATE | `/patients/:id` detail |
| `appointments.tsx` | CREATE | `/appointments` calendar |
| `courses.tsx` | CREATE | `/courses` list |
| `routeTree.gen.ts` | DELETE | Auto-generated by `tsr generate` |

### `apps/app/src/components/ui/` — shadcn primitives (8 new)
| File | Justification |
|---|---|
| `sheet.tsx` | Patient drawer |
| `dialog.tsx` | Booking + create forms |
| `alert-dialog.tsx` | Cancel / delete confirmations |
| `popover.tsx` | Search + filters |
| `command.tsx` | Combobox typeahead |
| `calendar.tsx` | Date picker (react-day-picker) |
| `tabs.tsx` | Calendar day/week/month switch |
| `data-table.tsx` | Generic DataTable wrapper around TanStack Table |

### `apps/app/src/lib/` — utilities (3 new)
| File | Action | Justification |
|---|---|---|
| `format.ts` | CREATE | `formatDate(d, locale)`, `formatBE(d)`, `formatPhone(d)`, `formatCurrency(amount, locale)` |
| `phone.ts` | CREATE | `normalizePhone`, `displayPhone` — Thai phone helpers |
| `dates.ts` | CREATE | `dayjs` setup with BE plugin + locales |

### `apps/app/src/locales/{th,en}.json` — i18n keys
| Section | Action | Justification |
|---|---|---|
| `patient.*` | CREATE | All patient strings |
| `appointment.*` | CREATE | Calendar, statuses, booking |
| `course.*` | CREATE | Balance, decrement, expiry |
| `walkIn.*` | CREATE | Queue, check-in flow |

### Root + tooling
| File | Action |
|---|---|
| `apps/app/package.json` | UPDATE — add `@tanstack/router-cli`, `@tanstack/react-table`, `@radix-ui/react-{dialog,popover,tabs,alert-dialog}`, `cmdk`, `react-day-picker`, `date-fns`, `dayjs` |
| `apps/app/package.json` `scripts` | UPDATE — add `prebuild`, `pretypecheck`, `predev` running `tsr generate` |
| `apps/app/vite.config.ts` | UPDATE — re-add `TanStackRouterVite` plugin |
| `apps/app/components.json` | (already configured) |

---

## NOT Building

- ❌ **Real photo upload** — image picker + UI placeholder only; storage in A7
- ❌ **Real LINE booking integration** — UI form only; webhook in A7
- ❌ **PDF receipt** — toast + mock URL only; PDF gen in A3
- ❌ **AI features** — visit summary / recall drafter / photo tag — all A4
- ❌ **Multi-branch dashboard** — A4
- ❌ **Doctor commission tracking** — A3
- ❌ **Member points / loyalty** — A3
- ❌ **Inventory** — A3
- ❌ **Doctor's UI / queue** — A2 ships notification toast only; full doctor screen is A3+
- ❌ **PDPA consent capture** — UI flag in patient view only; full flow in A5
- ❌ **Audit log writes** — A5
- ❌ **Real-time multi-user sync** — A7 (Supabase Realtime)
- ❌ **Calendar drag-to-reschedule** — clickable reschedule button only; drag-drop deferred
- ❌ **Time-off / doctor schedule blocking** — A3 or later
- ❌ **Recurring appointments** — single-instance booking only

---

## Step-by-Step Tasks

### Task 1: Install A2 dependencies + wire `tsr generate`
- **ACTION**: Add new deps + restore TanStack Router file-based routing.
- **IMPLEMENT**:
  - `pnpm --filter @lesso/app add @tanstack/react-table cmdk react-day-picker date-fns dayjs @radix-ui/react-{dialog,popover,tabs,alert-dialog,slot}`
  - `pnpm --filter @lesso/app add -D @tanstack/router-cli @tanstack/router-plugin`
  - `apps/app/package.json` scripts: `"predev": "tsr generate"`, `"prebuild": "tsr generate"`, `"pretypecheck": "tsr generate"`
  - `apps/app/vite.config.ts`: re-add `TanStackRouterVite({ routesDirectory: './src/routes', generatedRouteTree: './src/routeTree.gen.ts', autoCodeSplitting: true })` BEFORE `react()`
  - Delete hand-authored `apps/app/src/routeTree.gen.ts` (generator overwrites)
- **MIRROR**: External docs §TanStack Router CLI.
- **GOTCHA**: `tsr generate` runs synchronously; if `src/routes/` is empty, fails loudly. Create at least one file route first.
- **VALIDATE**: `pnpm typecheck` passes after adding `routes/index.tsx` rewrite (next task).

### Task 2: Generate shadcn primitives (Sheet, Dialog, AlertDialog, Popover, Command, Calendar, Tabs, DataTable)
- **ACTION**: Run shadcn generators.
- **IMPLEMENT**: `cd apps/app && pnpm dlx shadcn@latest add sheet dialog alert-dialog popover command calendar tabs sonner`. Manually author `data-table.tsx` (shadcn's DataTable docs page provides the canonical version — copy in).
- **MIRROR**: PRD §Component Patterns.
- **GOTCHA**: shadcn `add` may overwrite existing `cn` util — diff before commit. Run with clean working tree.
- **VALIDATE**: Each new file compiles standalone; `pnpm typecheck` clean.

### Task 3: Domain — `packages/domain/src/patient.ts`
- **ACTION**: Patient Zod schema.
- **IMPLEMENT**:
  ```ts
  import { z } from 'zod';
  import { IdSchema, IsoDateSchema } from './common';

  export const ConsentStatusSchema = z.enum(['valid', 'expiring_soon', 'expired', 'missing']);
  export type ConsentStatus = z.infer<typeof ConsentStatusSchema>;

  export const PatientSchema = z.object({
    id: IdSchema,
    tenantId: IdSchema,
    fullName: z.string().min(1).max(120),
    phoneDigits: z.string().regex(/^\d{8,15}$/),
    phoneDisplay: z.string().min(1).max(40),
    lineId: z.string().optional(),
    nationalId: z.string().regex(/^\d{13}$/).optional(),
    birthDate: z.string().date().optional(),
    notes: z.string().max(2000).optional(),
    consentStatus: ConsentStatusSchema.default('missing'),
    consentExpiresAt: IsoDateSchema.optional(),
    createdAt: IsoDateSchema,
    updatedAt: IsoDateSchema,
  });
  export type Patient = z.infer<typeof PatientSchema>;

  export const PatientCreateSchema = PatientSchema.omit({
    id: true, tenantId: true, createdAt: true, updatedAt: true,
  });
  export type PatientCreateInput = z.infer<typeof PatientCreateSchema>;

  export const PatientUpdateSchema = PatientCreateSchema.partial();
  export type PatientUpdateInput = z.infer<typeof PatientUpdateSchema>;
  ```
- **MIRROR**: A1 `packages/domain/src/tenant.ts`.
- **GOTCHA**: PII field names — `fullName`, `phoneDigits`, `nationalId`, `lineId` — already in `logger.ts` PII set. Verify before merging.
- **VALIDATE**: `pnpm --filter @lesso/domain typecheck`.

### Task 4: Domain — `packages/domain/src/appointment.ts`
- **ACTION**: Appointment Zod schema.
- **IMPLEMENT**:
  ```ts
  export const AppointmentStatusSchema = z.enum([
    'scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'no_show', 'cancelled',
  ]);
  export const AppointmentSchema = z.object({
    id: IdSchema,
    tenantId: IdSchema,
    branchId: IdSchema,
    patientId: IdSchema,
    doctorId: IdSchema.optional(),
    serviceName: z.string().min(1).max(120),
    startAt: IsoDateSchema,
    endAt: IsoDateSchema,
    status: AppointmentStatusSchema,
    courseId: IdSchema.optional(), // links to Course if redeeming session
    notes: z.string().max(2000).optional(),
    createdAt: IsoDateSchema,
    updatedAt: IsoDateSchema,
  });
  ```
- **MIRROR**: Task 3.
- **VALIDATE**: typecheck.

### Task 5: Domain — `packages/domain/src/course.ts`
- **ACTION**: Course + Session schemas.
- **IMPLEMENT**:
  ```ts
  export const CourseStatusSchema = z.enum(['active', 'completed', 'expired', 'refunded']);
  export const CourseSchema = z.object({
    id: IdSchema,
    tenantId: IdSchema,
    patientId: IdSchema,
    serviceName: z.string().min(1).max(120),
    sessionsTotal: z.number().int().positive().max(100),
    sessionsUsed: z.number().int().nonnegative(),
    pricePaid: z.number().nonnegative(),
    expiresAt: IsoDateSchema.optional(),
    status: CourseStatusSchema,
    createdAt: IsoDateSchema,
    updatedAt: IsoDateSchema,
  });
  // sessionsRemaining = sessionsTotal - sessionsUsed (computed in UI)
  ```
- **GOTCHA**: Validate `sessionsUsed <= sessionsTotal` via `.refine()`.
- **VALIDATE**: typecheck.

### Task 6: Domain — `packages/domain/src/walk-in.ts`
- **ACTION**: Walk-in queue entry.
- **IMPLEMENT**:
  ```ts
  export const WalkInStatusSchema = z.enum(['waiting', 'in_progress', 'completed', 'cancelled']);
  export const WalkInSchema = z.object({
    id: IdSchema,
    tenantId: IdSchema,
    branchId: IdSchema,
    patientId: IdSchema,
    arrivedAt: IsoDateSchema,
    status: WalkInStatusSchema,
    appointmentId: IdSchema.optional(), // set when promoted from walk-in to appointment
    notes: z.string().max(500).optional(),
  });
  ```
- **VALIDATE**: typecheck.

### Task 7: Update `packages/domain/src/index.ts` barrel
- **ACTION**: Re-export all new schemas.
- **VALIDATE**: typecheck.

### Task 8: Update OpenAPI spec
- **ACTION**: Add new paths + schemas to `packages/api-spec/openapi.yaml`.
- **IMPLEMENT**: 9 new paths (CRUD × 4 entities + decrement). Each path documents query params, request body, response envelope.
- **MIRROR**: A1 `/health` path structure.
- **VALIDATE**: `pnpm --filter @lesso/api-spec generate` produces non-empty types in `packages/domain/src/generated/api.d.ts`.

### Task 9: Mock-server context helper
- **ACTION**: Add `resolveContext(request)` that combines header-first + localStorage fallback.
- **IMPLEMENT**: In `packages/mock-server/src/context.ts` — extract logic currently in `health.ts` into reusable helper.
- **MIRROR**: existing `health.ts:headerOrNull`.
- **VALIDATE**: Existing health tests still pass.

### Task 10: Mock-server repos — patient, appointment, course, walk-in (4 files)
- **ACTION**: Implement repository pattern per entity.
- **MIRROR**: REPOSITORY_PATTERN above.
- **GOTCHA**: Course `decrement` operation — ensure single `storage.write` call to maintain atomicity.
- **VALIDATE**: Add unit test per repo (`*.test.ts` colocated): create + findById + update + delete.

### Task 11: Mock-server handlers — patients (CRUD + search)
- **ACTION**: 5 endpoints — list (with `?q`), get, create, patch, delete.
- **MIRROR**: SERVICE_PATTERN above.
- **VALIDATE**: Vitest unit test exercising each via direct handler invocation.

### Task 12: Mock-server handlers — appointments
- **ACTION**: 5 endpoints — list (filter by `?date`, `?branchId`, `?patientId`), get, create, patch, delete.
- **VALIDATE**: tests.

### Task 13: Mock-server handlers — courses + decrement
- **ACTION**: 5 endpoints + 1 special — POST `/courses/:id/decrement` atomically increments `sessionsUsed` and creates a CourseSession record.
- **GOTCHA**: 409 Conflict when `sessionsUsed >= sessionsTotal`.
- **VALIDATE**: tests including decrement-past-limit case.

### Task 14: Mock-server handlers — walk-ins + status transitions
- **ACTION**: CRUD + transitions (`waiting → in_progress → completed`).
- **VALIDATE**: tests.

### Task 15: Update `seed.ts` — realistic demo data
- **ACTION**: Generate 200 patients, 50 courses, 6 months appointment history per tenant.
- **IMPLEMENT**: Use deterministic UUIDs (e.g., `crypto.randomUUID` seeded via fixed seed) so tests are reproducible. Names from a Thai-name list. Phone numbers `08XXXXXXXX`. Realistic time spread (mostly 9am–7pm).
- **GOTCHA**: Don't run on every load — only first-time after `SEED_VERSION` bump. Bump to `2`.
- **VALIDATE**: After fresh `localStorage` clear, dev page shows real data.

### Task 16: Extend ApiClient adapter (mock + Supabase stub)
- **ACTION**: Implement `PatientResource`, `AppointmentResource`, `CourseResource`, `WalkInResource` in `mock.ts`. Stub same in `supabase.ts`.
- **MIRROR**: A1 `health.get` pattern; reuse `fetchValidated`.
- **VALIDATE**: typecheck across `@lesso/api-client`.

### Task 17: Feature — `apps/app/src/features/patient/`
- **ACTION**: Build patient feature folder.
- **IMPLEMENT**: hooks (`use-patients.ts`), components (list/search/card/form/detail-sheet), barrel.
- **MIRROR**: QUERY_HOOK_PATTERN, FEATURE_FOLDER_PATTERN.
- **GOTCHA**: Patient form uses RHF + Zod — bind `PatientCreateSchema` directly via `zodResolver`.
- **VALIDATE**: Component tests for list (renders rows) + search (filters).

### Task 18: Feature — `apps/app/src/features/appointment/`
- **ACTION**: Same pattern.
- **IMPLEMENT**: Calendar uses `react-day-picker` for month + custom grid for day/week.
- **VALIDATE**: tests.

### Task 19: Feature — `apps/app/src/features/course/`
- **ACTION**: Course list + active-balance card + decrement button.
- **IMPLEMENT**: `course-balance-card` shows progress bar (sessionsUsed/sessionsTotal). Decrement triggers mutation; optimistic update via `onMutate`.
- **VALIDATE**: tests including decrement-past-limit error UI.

### Task 20: Feature — `apps/app/src/features/walk-in/` + check-in orchestrator
- **ACTION**: Queue UI + check-in flow component.
- **IMPLEMENT**: `check-in-flow.tsx` orchestrates: pick patient → confirm course (if any) → create walk-in → on complete: decrement course + mark complete + offer rebook.
- **GOTCHA**: This is the multi-mutation seam. Wrap in single component using sequential `useMutation` calls; rollback toast if any step fails.
- **VALIDATE**: E2E Playwright test: complete walk-in start to finish in <90s with all mutations succeeding.

### Task 21: Routes — file-based
- **ACTION**: Create 6 route files using `createFileRoute`. Update sidebar to use `<Link>` (drop "stub" classes from A1).
- **IMPLEMENT**:
  - `routes/index.tsx` — Today (walk-in queue + appointments today)
  - `routes/patients.tsx` — list
  - `routes/patients.$id.tsx` — detail
  - `routes/appointments.tsx` — calendar
  - `routes/courses.tsx` — list
- **MIRROR**: ROUTE_PATTERN above.
- **VALIDATE**: `tsr generate` produces valid `routeTree.gen.ts`; typecheck clean.

### Task 22: i18n + dates + format utilities
- **ACTION**: Wire `dayjs` with BE locale, `format.ts` helpers, locale files.
- **IMPLEMENT**:
  - `apps/app/src/lib/dates.ts` — `dayjs` setup + BE plugin
  - `apps/app/src/lib/format.ts` — `formatDate`, `formatBE`, `formatPhone`, `formatCurrency`
  - Add ~40 new keys to th + en JSON
- **GOTCHA**: BE year = Gregorian + 543. Toggle stored in user pref; default `th` → BE, `en` → Gregorian.
- **VALIDATE**: Unit test for each format function.

### Task 23: Validation — full pipeline + Playwright walk-in test
- **ACTION**: Run all checks; add the stopwatch test.
- **IMPLEMENT**:
  - Add `apps/app/tests/e2e/walk-in.spec.ts` — drives full check-in flow. Asserts wall-clock under 90s.
  - Update existing `smoke.spec.ts` if needed.
- **VALIDATE**:
  - `pnpm turbo lint typecheck test build` green
  - `pnpm test:e2e` walk-in flow passes
  - Manual: receptionist persona on iPad portrait simulator hits 90s

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected | Edge |
|---|---|---|---|
| `patientRepo.search('081')` | seeded patients | matches by phoneDigits | Yes — `+66`-format input |
| `courseRepo.decrement(id)` when `sessionsUsed === sessionsTotal` | full course | throws/409 | Yes |
| `usePatients(query='')` | tenant set | returns patients list | No |
| `usePatient(undefined)` | no id | query disabled, no fetch | Yes |
| `useCheckIn().mutate({ patient, course })` | valid | walk-in created + course decremented + appt updated | Critical happy path |
| `useCheckIn().mutate(...)` | course at 0 | rolls back walk-in creation | Yes |
| `formatPhone('+66 81 234 5678')` | various inputs | normalized + display | Yes |
| `formatBE(2026-05-01)` | gregorian | `1 พ.ค. 2569` | No |

### Edge Cases Checklist
- [ ] Empty patient list — empty state with [+ New patient] CTA
- [ ] Patient with 0 active courses — UI hides course card
- [ ] Search with no results — empty state
- [ ] Invalid phone format — Zod error shown inline
- [ ] Concurrent decrements (race) — second 409s, toast error
- [ ] Course expired — UI flags but allows manual override (with confirmation)
- [ ] Tenant unset — all routes show "Pick tenant in dev toolbar" empty state
- [ ] Locale switch mid-flow — strings update, dates re-format
- [ ] Tablet portrait (768×1024) — patient drawer fills 80% width
- [ ] Tablet landscape — drawer 50% width
- [ ] iPad keyboard navigation — Tab order through walk-in flow

### E2E (Playwright)
- [ ] Walk-in flow happy path — under 90s
- [ ] Patient search → drawer → check-in
- [ ] Calendar — book appointment → appears in today view
- [ ] Course decrement → balance card updates

---

## Validation Commands

```bash
# Static analysis
pnpm turbo typecheck
EXPECT: zero errors across 6 workspaces (no new ones introduced)

# Lint
pnpm turbo lint
EXPECT: zero errors, zero warnings

# Unit tests (target: 80%+ coverage on new code)
pnpm --filter @lesso/app test --coverage
pnpm --filter @lesso/mock-server test

# OpenAPI codegen
pnpm --filter @lesso/api-spec generate
EXPECT: non-empty types matching new schemas

# Build
pnpm turbo build
EXPECT: bundle ≤ 600 KB gzipped (A1 was 130 KB; A2 adds ~250-400 KB)

# E2E
pnpm --filter @lesso/app exec playwright install chromium webkit
pnpm --filter @lesso/app test:e2e
EXPECT: walk-in flow under 90s on chromium

# Manual stopwatch
# Open http://localhost:5173 on iPad portrait simulator
# Pick tenant → search "Anong" → drawer → Check In → decrement → Complete
# Target: <90s wall clock
```

---

## Acceptance Criteria
- [ ] All 23 tasks complete
- [ ] All validation commands pass
- [ ] Walk-in flow stopwatch <90s on iPad
- [ ] 80%+ test coverage on new code
- [ ] No new lint warnings
- [ ] No new type errors
- [ ] Bundle size <600 KB gzipped
- [ ] iPad portrait + landscape layouts intact
- [ ] th + en locales complete for all new strings
- [ ] All forms use RHF + Zod (no raw `useState` for inputs)
- [ ] Every list view has empty state, error state, loading skeleton
- [ ] Sidebar navigation uses real `<Link>` (no stub spans)

## Completion Checklist
- [ ] Code follows A1 NAMING_CONVENTION (kebab files, PascalCase components, camelCase utils)
- [ ] All errors flow through `AppError`/`ApiError` (imported from `@/lib/errors`)
- [ ] All async UI states handled (loading + error + empty)
- [ ] All buttons disabled during in-flight mutations
- [ ] All `console.*` calls go through `logger`
- [ ] No emoji as icon (Lucide only)
- [ ] No PII in logger context (verified by `logger.ts` PII guard)
- [ ] All clicks have `cursor-pointer` and 44×44 min touch
- [ ] `prefers-reduced-motion` respected
- [ ] PRD A2 status flips `pending` → `in-progress` → `complete`

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 7-day estimate slips | H | Phase A3 starts late | Start with Patient + Walk-in (critical path); cut Calendar to list-only if needed; defer Photo placeholder; defer doctor-queue notification |
| Walk-in flow doesn't hit 90s | M | Hypothesis fails | Profile each step in dev tools; cut steps if necessary; raise target to 120s as fallback |
| TanStack Router CLI breaks tsc | L | Build red | `tsr generate` is fast + deterministic; commit `routeTree.gen.ts`; CI runs `tsr generate` before typecheck |
| Mock data atomicity (race) | M | Inconsistent state | Single `storage.write` per multi-key op; document non-atomic windows |
| shadcn add breaks existing components | L | Visual regression | Diff before commit; lock components.json |
| Bundle size blows past 600KB | M | Slow load on tablet | Code-split heavy routes (calendar via `lazy()`); audit with `pnpm dlx vite-bundle-visualizer` |
| Thai phone normalization wrong | M | Search returns no results | Test fixture with 10+ phone formats; normalize at write + read |

## Notes

- A2 is the largest single phase. Do not start A3 until walk-in flow demos clean.
- Keep the dev toolbar — receptionist user testing requires fast tenant/branch switching.
- Photo placeholder = a slot that says "Photos (added in v2)" — don't try to wire `<input type=file>` until A3+.
- Doctor's UI gets a notification toast only ("Doctor queue: Khun Anong checked in") — not a real screen.
- Coverage threshold raises to 80% in A5; A2 baseline 60% acceptable for MVP velocity.
- After A2 ships clean, B2/B3 (marketing) can run in parallel with A3 — solo dev sequences A3 first.
- **Confidence: 7/10** — well-understood patterns, but 22 tasks is the largest plan to date. Risk concentrates in Task 20 (walk-in orchestrator) and Task 15 (seed data realism).
