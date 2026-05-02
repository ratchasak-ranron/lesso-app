# Migration Plan — Supabase → Shuttle (Rust)

> Generated: 2026-05-01
> Status: Reference plan. Do NOT execute until trigger condition met.
> Context: MVP ships on Supabase. This doc preserves migration optionality.

---

## 1. Trigger Conditions

Migrate ONLY when 1+ true:

- Supabase paid tier costs exceed Shuttle + ops cost
- PDPA / TH legal requires data residency in Thailand
- Performance bottleneck unfixable in Postgres / PostgREST
- Custom logic too complex for Edge Functions (Deno)
- Vendor lock anxiety + revenue justifies infra investment

If none true → don't migrate. Premature.

---

## 2. Component Migration Map

| Supabase Piece | Replacement | Effort |
|----------------|-------------|--------|
| Postgres (DB) | Self-host PG / RDS / Neon / Shuttle Shared DB | LOW (dump/restore or logical replication) |
| PostgREST (auto REST) | Axum + sqlx + utoipa | **HIGH** (rewrite all CRUD) |
| GoTrue (Auth) | jsonwebtoken + argon2 + custom flows OR Clerk/Auth0 | MEDIUM |
| RLS policies | Keep in Postgres ✅ | NONE |
| Realtime (CDC) | tokio-tungstenite + PG LISTEN/NOTIFY | MEDIUM |
| Storage | S3 / R2 / MinIO direct | LOW |
| Edge Functions | Axum routes | LOW–MEDIUM |
| pg_cron | Keep in Postgres OR tokio-cron-scheduler | NONE–LOW |

---

## 3. Phased Plan (Strangler Pattern)

```
Phase A: Prep (do NOW, in MVP) ──┐
Phase B: Stand up Shuttle alongside Supabase │
Phase C: Move endpoints feature-by-feature │
Phase D: Cut over Auth + Realtime │
Phase E: Migrate Postgres host │
Phase F: Decommission Supabase ──┘
```

---

### Phase A — Prep (in MVP, ~2 days)

**CRITICAL**: never call `supabase-js` directly from components. Wrap behind `ApiClient` interface.

```typescript
// packages/api-client/src/index.ts
export interface ApiClient {
  patients: PatientsApi
  appointments: AppointmentsApi
  courses: CoursesApi
  auth: AuthApi
  realtime: RealtimeApi
  storage: StorageApi
}

// Today:
export const apiClient: ApiClient = createSupabaseAdapter(supabase)

// Future swap:
// export const apiClient: ApiClient = createRestAdapter('https://api.getreinly.com')
```

Components import `apiClient`, never `supabase`. Migration = swap factory + adapter.

**OpenAPI spec** = source of truth.
- Define `packages/api-spec/openapi.yaml`
- Generate TS types: `packages/api-client/types/`
- Both Supabase wrapper + future Rust impl conform to same shape.

---

### Phase B — Stand Up Shuttle (~1 week)

```bash
cargo shuttle init reinly-api
```

Tech stack:
- Axum + tokio
- sqlx (queries Supabase Postgres remote during transition)
- utoipa for OpenAPI generation
- jsonwebtoken to verify Supabase JWTs (interop period)
- tower-http for CORS, tracing, compression

Deploy minimal `/health` + 1 read endpoint. Verify Vercel → Shuttle CORS works end-to-end.

---

### Phase C — Move Endpoints Feature-by-Feature

Order by risk (low → high):

1. Read-only endpoints first (`GET /patients/search`, `GET /appointments`)
2. Write endpoints (`POST /patients`, `PATCH /appointments`)
3. Custom logic (LINE webhooks, recall jobs, scheduled reports)
4. Heavy queries (analytics aggregations)

Per endpoint:
- Implement Rust handler matching OpenAPI spec
- Add feature flag: `VITE_USE_RUST_API_<feature>=true`
- Canary 10% → 50% → 100%
- If broken: flip flag, traffic falls back to Supabase
- After 1 week stable: remove old Supabase path / Edge Function

**Sequence example**:
```
Week 1: GET /patients, GET /appointments (read)
Week 2: POST/PATCH/DELETE patients, appointments (write)
Week 3: LINE webhook handler, recall scheduler
Week 4: Reports + analytics
```

---

### Phase D — Auth + Realtime Cutover (~1–2 weeks)

**Auth migration options**:

| Option | Pro | Con |
|--------|-----|-----|
| (a) Self-host JWT | Full control, $0 | Most work, security risk |
| (b) Clerk / Auth0 / WorkOS | Drop-in, secure | $/MAU, vendor lock continues |
| (c) Keep Supabase Auth | Cheapest path | Partial migration only |

Recommendation: **(b) Clerk** for solo dev. Trade $ for time + security.

Password migration:
- Supabase uses bcrypt
- Rust `bcrypt` crate compatible → no forced re-login
- For Argon2 target: migrate on next login (verify bcrypt → rehash argon2)

**Realtime migration**:
- PG LISTEN/NOTIFY + tokio-tungstenite
- OR NATS for higher scale
- Frontend swaps `supabase.channel(...)` → `apiClient.realtime.subscribe(...)` (same interface)
- Run Supabase Realtime + Shuttle Realtime parallel 2 weeks before cutover

---

### Phase E — Migrate Postgres Host (~3–5 days)

Target options:

| Host | Pro | Con |
|------|-----|-----|
| Stay on Supabase PG | Simplest, no migration | Vendor lock remains |
| Neon | Branching, $0 free tier | US/EU regions only |
| Fly.io Postgres | TH-near (Singapore) | Single-region by default |
| AWS RDS Singapore | Production-grade | $$$, ops |
| Self-host TH | PDPA residency ✅ | Ops burden, on-call |

Zero-downtime migration via logical replication:

```bash
1. Stand up target Postgres
2. Enable logical replication on Supabase source (wal2json)
3. Create publication on source, subscription on target
4. Wait for catch-up (monitor replication lag)
5. Pause writes (5–30s window)
6. Switch app DB connection string
7. Verify writes flowing
8. Decommission source after 1 week safety window
```

---

### Phase F — Decommission Supabase

Checklist:
- [ ] All endpoints migrated + verified
- [ ] All Edge Functions migrated
- [ ] Storage files migrated to S3/R2 (rclone copy)
- [ ] Auth users migrated (or Clerk live)
- [ ] DNS / env vars updated
- [ ] Cancel Supabase project (export billing receipts first)
- [ ] Archive RLS policy SQL (now enforced in Rust + Postgres)
- [ ] Update CLAUDE.md / runbook

---

## 4. Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| RLS dropped → data leak | M | CRITICAL | Keep RLS in Postgres. Don't rewrite as Rust-only checks. |
| sqlx compile-time queries lock to schema | L | M | Use `sqlx::query_as!` with care. Schema migrations handle. |
| Realtime regression breaks multi-branch | M | H | Run parallel 2 weeks before cutover |
| Auth user re-login churn | H | M | Migrate bcrypt hashes (compatible) |
| Solo dev burnout (8–14 weeks total) | H | H | Stay on Supabase until revenue justifies |
| PDPA breach during migration | L | CRITICAL | Maintenance window communicated. Audit log preserved. |
| Cost overrun (Shuttle + extras > Supabase) | M | M | Cost model before each phase. Abort if uneconomic. |

---

## 5. Cost Estimate (Solo Dev)

| Phase | Time | Notes |
|-------|------|-------|
| A: Prep abstraction | 2 days | Done in MVP, sunk cost |
| B: Shuttle bootstrap | 3 days | New work |
| C: Endpoint migration | 1–2 days × N features | Linear with feature count |
| D: Auth + Realtime | 1–2 weeks | Risky, plan window |
| E: DB host migration | 3–5 days | Logical replication |
| F: Decommission | 1 day | Cleanup |
| **Total (full)** | **8–14 weeks** | Solo dev |

Infra cost during transition (running both):
- Supabase Pro: $25/mo
- Shuttle: $0 (Hobby) → $20/mo (Pro)
- Vercel: $0–20/mo
- **Peak**: ~$65/mo for 2–3 months overlap

---

## 6. Recommendation

1. **MVP**: ship on Supabase. Don't pre-optimize.
2. **Hard rule**: implement `ApiClient` interface from day 1 (Phase A prep). Cheap insurance.
3. **Migrate only when triggered** by real signal (cost, performance, residency, legal).
4. **Likely path**: never fully migrate. Stay on Supabase + add Shuttle microservice for one heavy thing (analytics, ML, custom integration). Keep DB on Supabase.

---

## 7. Open Questions

- [ ] PDPA legal review — does Supabase Singapore region satisfy Section 29 cross-border with DPA?
- [ ] Auth provider final choice — self-host vs Clerk vs WorkOS pricing at 1k clinic scale
- [ ] Postgres residency — is TH soil legally required, or is Singapore + DPA sufficient?
- [ ] Realtime replacement — PG NOTIFY scales to how many concurrent connections per branch?

---

## 8. Sources

- [Shuttle.dev](https://www.shuttle.dev/)
- [utoipa OpenAPI Rust](https://github.com/juhaku/utoipa)
- [utoipa-axum](https://crates.io/crates/utoipa-axum)
- [sqlx](https://github.com/launchbadge/sqlx)
- [Postgres logical replication](https://www.postgresql.org/docs/current/logical-replication.html)
- [Supabase self-hosting](https://supabase.com/docs/guides/self-hosting)
