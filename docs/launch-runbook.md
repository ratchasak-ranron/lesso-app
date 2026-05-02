# Lesso Launch Runbook

Run AFTER B4 merges to `main`. Sequenced checklist; sections 1–6 are gating
(skip none); sections 7–8 are post-launch monitoring.

> **Operator-only steps.** None of these are automated by code. Section 2
> requires a token with `workflow` scope — keep them in `_deferred/` until
> ready.

---

## 1. DNS cutover (Vercel)

- [ ] In Vercel project `lesso-web`: **Settings → Domains**
- [ ] Add `lesso.clinic` (apex/root) — Vercel returns A record `76.76.21.21`
- [ ] Add `www.lesso.clinic` — set as redirect to `lesso.clinic`
- [ ] At the domain registrar (Namecheap / Cloudflare / etc.), update DNS:
  - `A` record `@` → `76.76.21.21`
  - `CNAME` record `www` → `cname.vercel-dns.com`
- [ ] Wait ~5 min for HTTPS issuance (auto via Let's Encrypt)
- [ ] Confirm `https://lesso.clinic` resolves and `https://www.lesso.clinic` 301s
- [ ] No code change — `siteConfig.hostname` is already `https://lesso.clinic`

## 2. Promote deferred CI workflows

Token used to push must have `workflow` scope. Verify via `gh auth status`.

- [ ] `mv .github/_deferred/workflows/ci.yml .github/workflows/ci.yml`
- [ ] `mv .github/_deferred/workflows/lighthouse-web.yml .github/workflows/lighthouse-web.yml`
- [ ] `git rm -r .github/_deferred` (clean up empty dir)
- [ ] Commit + push — first PR after this should trigger both jobs

## 3. Search Console (Google)

- [ ] Visit https://search.google.com/search-console
- [ ] Add property `https://lesso.clinic` (Domain property recommended over URL)
- [ ] Verify via DNS TXT record (paste returned token into registrar)
- [ ] Submit sitemap: `https://lesso.clinic/sitemap.xml`
- [ ] Confirm 8 indexable URLs surface within 7 days
- [ ] **Manual check**: privacy + terms appear in sitemap but should NOT appear in search results (noindex meta — Google honors)

## 4. Bing Webmaster

- [ ] Visit https://www.bing.com/webmasters
- [ ] Import from Search Console (one-click) OR add property manually
- [ ] Verify (DNS or HTML file)
- [ ] Submit sitemap

## 5. Plausible Analytics

- [ ] Confirm `lesso.clinic` is registered on plausible.io
- [ ] Set Vercel env var: **Settings → Environment Variables → Production**
  - `VITE_PLAUSIBLE_DOMAIN=lesso.clinic`
  - `VITE_WAITLIST_TO=hello@lesso.clinic` (or chosen founder address)
- [ ] Trigger a deploy (push to `main` or click "Redeploy")
- [ ] Open the live site, click hero CTA → confirm `cta_click` event fires in Plausible dashboard
- [ ] Submit a test pilot signup → confirm `pilot_submit` event fires + mailto opens with pre-filled body

## 6. Lighthouse spot-check

- [ ] `pnpm --filter @lesso/web run lhci:web` against the deployed Vercel URL
  (override URLs in `.lighthouserc.json` to point at `https://lesso.clinic` for prod check)
- [ ] Expect ≥0.95 across all 4 categories on `/en`, `/en/pricing`, `/en/pilot`
- [ ] If `best-practices` dips: inspect CSP headers + image sizes
- [ ] If `performance` dips: check OG image meta tags aren't blocking render
- [ ] If `accessibility` dips: re-audit form field labels + colour contrast

## 7. Smoke tests

- [ ] `https://lesso.clinic` → redirects to `/en`
- [ ] `/en` renders, hero CTA → `/en/pilot`
- [ ] `/en/pilot` form opens mail client with pre-filled body
- [ ] `/en/privacy` shows DRAFT banner
- [ ] Footer Privacy + Terms links work in both locales
- [ ] Share `/en/pricing` to Twitter/LINE — preview shows `pricing-en.png`, NOT default
- [ ] iOS "Add to Home Screen" → uses 180×180 apple-touch-icon
- [ ] Android Chrome → install prompt (manifest valid)
- [ ] PWA install on `/th` opens to `/en` (manifest `start_url`); known limitation, defer per-locale manifests post-launch if Thai users complain
- [ ] DevTools → no CSP errors (verify `manifest-src 'self'` covers `manifest.webmanifest` fetch in Firefox)
- [ ] DevTools → Plausible script loads + custom events fire on interaction

## 8. Post-launch (first 14 days)

- [ ] Monitor Search Console for crawl errors
- [ ] Watch Plausible for the first organic `pilot_submit`
- [ ] Check Vercel deployment logs for ErrorBoundary catches
- [ ] If no submissions in 7 days: review homepage hero copy, A/B the CTA text
- [ ] First MDX post lands → adds `apps/web/src/blog/posts/<slug>.mdx`; `getPosts` picks it up automatically; the blog detail route lands in the same PR

---

## Reference: env var matrix

| Variable | Scope | Set on |
|---|---|---|
| `VITE_PLAUSIBLE_DOMAIN` | Public (client bundle) | Vercel Production |
| `VITE_WAITLIST_TO` | Public (mailto recipient) | Vercel Production |

No server secrets — this prototype site has no backend.

## Reference: rollback

If something breaks after cutover:

- [ ] Vercel: **Deployments** → click prior known-good → "Promote to Production"
- [ ] DNS rollback is slower (TTL up to 1h); production redeploy is the fast path
- [ ] If DNS is the issue (apex record mistyped), revert at registrar
