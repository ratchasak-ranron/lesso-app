# Code Review: B4 — Polish + Launch (commit `3d8239a`)

**Reviewer**: code-reviewer agent  
**Date**: 2026-05-02  
**Scope**: `apps/web` — OG images, PWA, ErrorBoundary, blog scaffold, LHCI config, launch runbook

---

## Findings

### [HIGH] Unlabelled `<section>` landmark in blog empty state

**File**: `apps/web/src/pages/blog/index.tsx:25`

`<Section id="blog-empty">` is rendered with no `heading` prop. Looking at
`section.tsx:22`, when `heading` is absent the component emits `<section>` with
`aria-labelledby={undefined}`, producing an unlabelled ARIA landmark. This is the
exact B3 pattern (`about.tsx` founder section) that triggered the prior review
fix. B3's fix was to drop `Section` and use a plain `<div>` where no heading
exists.

The posts list branch (`<Section id="blog-posts" heading={...}>`) is correctly
labelled. Only the empty-state branch is the problem.

**Fix**: Replace `<Section id="blog-empty">` with a plain `<div>`:

```tsx
// BAD — emits unlabelled <section> landmark
<Section id="blog-empty">
  <p ...>{t('blog.empty')}</p>
</Section>

// GOOD — no landmark needed for a bare paragraph
<div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
  <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
    {t('blog.empty')}
  </p>
</div>
```

This matches the precedent set in B3 and the `about.tsx` correction.

---

### [HIGH] OG font path for Inter does not resolve at runtime on CI (brittle hardcoded path)

**File**: `apps/web/scripts/og-gen.mjs:29`

The path `node_modules/@fontsource/inter/files/inter-latin-700-normal.woff` is
hardcoded. A local `ls` check confirms the file exists at that path in this
workspace (`/files/inter-latin-700-normal.woff` is 30.6 KB). However, `@fontsource`
packages reorganise their internal `files/` structure between major versions (the
v4→v5 migration renamed subset identifiers). The pin is undocumented.

The comment at line 23 says "Pinned filenames; bump when @fontsource version
changes" but there is no cross-reference to the locked version in `package.json`.
`package.json` pins `@fontsource/inter: "^5.2.8"` — a `^` range, so a minor/patch
bump (`5.3.0`) could rename or move the file, silently failing the `prebuild`
step and blocking every Vercel deploy.

The same risk applies to `@fontsource/playfair-display` and
`@fontsource/noto-sans-thai` (both also `^5.x`).

**Fix** (two complementary options):
1. Change `package.json` ranges from `^5.x.x` to exact pins (`"5.2.8"`) for all
   three `@fontsource/*` devDependencies used in the OG pipeline.
2. Add a startup assertion in `og-gen.mjs`:

```js
import { existsSync } from 'node:fs';
for (const f of fonts) {
  if (!existsSync(f.path)) {
    throw new Error(`[og-gen] font file not found: ${f.path}. Re-pin @fontsource version.`);
  }
}
```

Option 1 is the minimum; option 2 gives a clear error message instead of a
cryptic `ENOENT` during `prebuild`.

---

### [MEDIUM] `numberOfRuns: 1` in `.lighthouserc.json` — documented known issue, not mitigated

**File**: `apps/web/.lighthouserc.json:8`

The plan (`b4-polish-launch.plan.md:531`) acknowledges that `numberOfRuns: 1` is
too low for statistical reliability ("bump to 3 in prod for median; default 3 is
too slow for a 5-page run on PRs"). However, the deployed config uses `1` and
there is no per-environment override. When the deferred
`lighthouse-web.yml` is promoted and runs against the Vercel preview URL, a single
cold-cache run on a loaded CI runner will frequently produce false failures at a
`minScore: 0.95` threshold, especially for `performance`. LHCI guidance is that
`numberOfRuns: 3` is the minimum for stable median scoring.

**Fix**: Add `"numberOfRuns": 3` before promoting the CI workflow. If the 5-URL
run is too slow for every PR, scope LHCI to run only on `main` merges or
conditionally on PRs touching `apps/web`. The config can stay `1` locally (fast
feedback) and `3` in CI by using environment-specific config files or the
`--runs` CLI override in the workflow YAML.

---

### [MEDIUM] `manifest-src` CSP directive absent — manifest fetch blocked in Firefox/older Chrome

**File**: `apps/web/vercel.json:17`

The CSP is:
```
default-src 'self'; script-src 'self' ...; style-src ...; font-src ...; img-src 'self' data: blob:; connect-src ...; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

There is no `manifest-src` directive. When `manifest-src` is absent, browsers
fall back to `default-src 'self'`. In practice, Chromium honours `default-src 'self'`
for manifest fetches and will load `/manifest.webmanifest` correctly. However,
Firefox 84+ enforces a separate `manifest-src` directive, and omitting it means
Firefox uses `default-src 'self'` — which should still allow the self-hosted
manifest. The practical risk is low, but the spec-correct addition costs nothing.

**Fix** (additive, zero risk):
```json
"value": "... img-src 'self' data: blob:; manifest-src 'self'; connect-src ..."
```

---

### [MEDIUM] `start_url: "/en"` — Thai users added to home screen land on English locale

**File**: `apps/web/public/manifest.webmanifest:6`

`"start_url": "/en"` is hardcoded. A Thai-speaking user who installs the PWA from
`/th` will still open to `/en` on launch. For the current scope (marketing site,
not app), this is tolerable — the `/` → `/en` redirect from `vercel.json` would
run anyway if they hit root. However, the app self-describes as "Thai-first" and
the PWA install can happen from the Thai locale.

There is no straightforward fix with a single static manifest. Options:
1. `"start_url": "/"` — hits the Vercel redirect → `/en` (same problem).
2. Serve two manifests at `/en/manifest.webmanifest` and `/th/manifest.webmanifest`
   with the appropriate `start_url`, and link the correct one from each locale's
   rendered HTML. This requires vite.config work.
3. Accept the limitation with a comment in the manifest and defer to post-launch.

Recommended path for B4 scope: add a comment and defer. Flag in runbook section 7
smoke tests (already checks "iOS Add to Home Screen").

---

### [MEDIUM] Blog `getPosts()` frontmatter validation: missing guard produces `BlogPost` with empty `description`

**File**: `apps/web/src/lib/blog.ts:29–32`

```ts
if (!fm?.slug || !fm.title || !fm.locale || !fm.publishedAt) continue;
// fm.description is NOT guarded — can be undefined, then coerced to ''
all.push({
  ...
  description: fm.description ?? '',
```

`description` is in the `BlogPost` interface as `string` (required). A future MDX
author who omits `description` silently gets an empty string in the list view —
acceptable UX, but the interface contract says `string` while the guard leaves it
optional. The interface is mildly misleading.

**Fix**: Either make the interface explicit:
```ts
description: string | '';  // intentionally empty when not provided
```
Or add `description?` as optional to `BlogPost`:
```ts
description?: string;
```
This is cosmetic type hygiene but prevents a future author from wondering why a
guard-less `description` didn't break the build.

---

### [MEDIUM] `ErrorFallback` calls `useResolvedLocale()` inside the error boundary fallback — depends on router context

**File**: `apps/web/src/components/layout/root-layout.tsx:11–12`

`ErrorFallback` calls `useResolvedLocale()` → which internally calls
`useLocation()` (React Router hook). If the RootLayout subtree breaks during
React Router context setup, the fallback itself will throw, producing a blank
screen instead of a branded error.

This is called out in the review brief as "acceptable since RootLayout is small +
tested", and the ErrorBoundary wraps only the `<Outlet>` (not the full
`RootLayout`). RootLayout rendering `<SiteHeader>`, `<SiteFooter>`, and the
`<ErrorBoundary>` itself happen outside the boundary. If `useResolvedLocale()`
inside `ErrorFallback` throws, the `componentDidCatch` will not re-catch it (a
boundary never catches its own render errors). So if `useLocation()` is
unavailable — e.g., if react-router-dom is somehow not mounted — the fallback
silently crashes.

In practice the router is always mounted before `RootLayout`, so the risk is near
zero for the current architecture. However, the fallback has no defensive path for
this case.

**Fix** (minimal): Wrap the `useResolvedLocale()` call in a nested component
that can itself be guarded, or provide hardcoded strings as a last resort:

```tsx
function ErrorFallback({ error }: ErrorFallbackProps) {
  // If locale resolution throws, fall back to hardcoded English
  let t = (_key: string) => '';
  let locale = 'en';
  try {
    const resolved = useResolvedLocale();
    t = resolved.t;
    locale = resolved.locale;
  } catch {
    // router context unavailable — use minimal fallback below
  }
  ...
}
```

This is a edge-case defensive measure, not a production bug today.

---

### [LOW] `console.error` in `ErrorBoundary.componentDidCatch` — flagged by project lint rules but intentional

**File**: `apps/web/src/components/layout/error-boundary.tsx:37`

The project's TypeScript hooks rule (`rules/ecc/typescript/hooks.md`) calls for
a stop-hook audit of `console.log` before session end. `console.error` is not
`console.log` and is appropriate here — it surfaces crashes in production without
noise (browser dev tools show errors, not logs, when no Sentry is configured).
The JSDoc comment at line 27 documents the intent ("Production logging hook lives
in `componentDidCatch`; wire to Sentry / Datadog when the backend phase (A7+)
lands"). No action needed, just confirming this is intentional and documented.

---

### [LOW] `og-gen.mjs` PAGES array does not include `blog` — no OG for `/blog` — this is intentional and documented, but deserves a comment

**File**: `apps/web/scripts/og-gen.mjs:67–73`

`blog` is absent from `PAGES` in `og-gen.mjs`. The `PER_PAGE_OG` set in
`vite.config.ts:60–66` also excludes `blog`, and the comment there says "Pages
not in this set fall back to `og/default.png` (legal pages, future blog
scaffold)". The build-output test at line 143 asserts `og/default.png` for
`en/blog.html`. This is coherent and intentional.

However, `og-gen.mjs` has no comment explaining why blog is absent, requiring a
cross-file read to confirm the intent.

**Fix** (optional, one-liner):
```js
// PAGES excludes `blog` intentionally — blog uses og/default.png until the
// first real MDX post lands. Add 'blog' here + to PER_PAGE_OG in vite.config.ts
// when blog OG images are warranted.
const PAGES = [
```

---

### [LOW] Blog detail links render without a registered route — dead code path flagged for follow-up

**File**: `apps/web/src/pages/blog/index.tsx:35–36`

`href={`/${locale}/blog/${p.slug}`}` links render only when `posts.length > 0`,
which can never happen until `src/blog/posts/` is created and contains at least
one MDX file with valid frontmatter. Today `src/blog/posts/` does not exist. So
there is no visible dead code — the link branch is never rendered.

However, when the first post ships, the route `/{locale}/blog/:slug` is **not
registered** in `routes.tsx`. The link will produce a 404 at runtime. The
runbook (`docs/launch-runbook.md:87`) does note this: "First MDX post lands →
blog detail route lands in the same PR." That note documents the forward
dependency, but it's easy to miss.

**Fix**: Add a TODO comment in `routes.tsx` adjacent to the blog route:
```tsx
{ path: 'blog', element: <BlogIndexPage /> },
// TODO: add { path: 'blog/:slug', element: <BlogDetailPage /> } when
// first MDX post lands in src/blog/posts/ — see runbook §8
```

---

### [LOW] Lighthouse `assert` block uses category-level scores — missing per-audit granularity for `best-practices`

**File**: `apps/web/.lighthouserc.json:15–19`

`categories:best-practices` at `minScore: 0.95` aggregates many sub-audits. The
plan acknowledges that LHCI running locally (no Vercel CSP headers) may fail
`best-practices` because some checks depend on security headers. When promoted
to the CI pipeline running against the Vercel preview URL this resolves
automatically. No code change needed — just confirming the local vs. CI
behaviour distinction is understood and documented.

---

### [LOW] `gitignore` exempts `default.png` correctly, but `public/apple-touch-icon.png` and `public/icon-*.png` are gitignored without a `public/default` exemption pattern that matches nothing

**File**: `apps/web/.gitignore`

Pattern is:
```
public/og/*.png
!public/og/default.png
public/apple-touch-icon.png
public/icon-192.png
public/icon-512.png
```

The exemption for `default.png` is correctly scoped to `public/og/`. The icon
files are named precisely (no glob) so they won't accidentally ignore other
files. This is clean.

One edge case: if someone adds `public/favicon-192.png` for a second favicon
size, the `public/icon-192.png` line won't catch it. This is YAGNI territory —
document only if icons are expected to grow.

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0     | pass   |
| HIGH     | 2     | warn   |
| MEDIUM   | 4     | info   |
| LOW      | 5     | note   |

**Verdict: APPROVE WITH COMMENTS**

No critical or blocking security issues. The two HIGH findings should be addressed
before the first post-launch Vercel deploy:

1. **Unlabelled `<section>` landmark** in blog empty state — violates B3's own
   accessibility fix precedent. A 3-line change: swap `<Section>` for `<div>`.
2. **Brittle font paths** — `^` semver ranges on `@fontsource/*` packages combined
   with hardcoded internal filenames could silently break `prebuild` on a minor
   version bump. Pin to exact versions or add a file-existence assertion.

The MEDIUM items (`numberOfRuns`, `manifest-src`, `start_url` locale) are
known trade-offs. The `ErrorFallback` + `useResolvedLocale` coupling is a
near-zero-risk edge case for the current architecture.

All other aspects of the B4 implementation are solid: Satori constraints are
documented and correctly applied (all containers have `display: 'flex'`; no
Tailwind classes; hex tokens in build-time scripts only with rationale comment),
Thai glyph fallback via Noto Sans Thai is present and ordered correctly (Latin
fonts first so Inter handles ASCII; Noto picks up unmatched Thai code points),
OG filename convention matches `${key}-${locale}.png` in both `og-gen.mjs` and
`vite.config.ts` `PER_PAGE_OG` → zero 404 risk, locale parity in en/th.json is
complete (`meta.blog`, `blog.intro`, `blog.empty`, `error.*` present in both),
`ErrorBoundary` class component is correct (`getDerivedStateFromError` +
`componentDidCatch`), test coverage is present for all new code paths, and the
runbook covers DNS, Search Console, Bing, Plausible, CI workflow promotion, and
rollback.

**Decision: APPROVE WITH COMMENTS** — merge is safe; resolve HIGH findings in a
follow-up commit before the first OG image is publicly cached.
