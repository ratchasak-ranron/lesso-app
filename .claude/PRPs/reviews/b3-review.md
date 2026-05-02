# B3 Code Review — Waitlist + Legal mailto prototype

**Reviewer:** code-reviewer agent  
**Date:** 2026-05-02  
**Scope:** `apps/web` — pilot signup flow, legal pages, analytics wrapper, routing, locale parity  
**Prototype channel:** client-only `mailto:` — no server, no API. Server-side concerns (SSRF, SQL, auth, rate-limit) deliberately out of scope.

---

## CRITICAL

None.

---

## HIGH

**1. `onSubmitted()` called unconditionally — fires even when `window.location.href` assignment is a no-op**  
File: `apps/web/src/components/marketing/pilot-form.tsx:57-61`

```tsx
// CURRENT — onSubmitted fires regardless
if (typeof window !== 'undefined') {
  window.location.href = url;
}
onSubmitted();   // always runs, even in SSR / test environments where the branch above is skipped

// FIX — keep onSubmitted inside the guard
if (typeof window !== 'undefined') {
  window.location.href = url;
  onSubmitted();
}
```

The SSR guard is correct in intent (this is a prerendered SPA so it won't actually fire server-side), but `onSubmitted` calling unconditionally creates a logic gap: the success state renders even though the mail client was never triggered. In the existing test the `window.location` stub is set up in `beforeEach`, so the test passes; but any future environment where `typeof window === 'undefined'` would incorrectly show the "email is on the way" UI without opening a mail client.

---

**2. `formState.isSubmitting` never returns `true` — submit button stays enabled during the `window.location` assignment**  
File: `apps/web/src/components/marketing/pilot-form.tsx:181`

`isSubmitting` in RHF only reflects an async `onSubmit` handler. `onValid` is synchronous, so `isSubmitting` will never be `true` and the button label `t('pilot.form.submitting')` / disabled state will never render. This is a silent no-op: the guard works, but the "Opening…" copy and disabled state are dead code. Either make `onValid` async (even a trivial `await Promise.resolve()`) or remove the `isSubmitting` branch.

```tsx
// SIMPLEST FIX — make the handler async so RHF tracks it
async function onValid(data: WaitlistInput) {
  track('pilot_submit', { locale: data.locale });
  const url = buildWaitlistMailto(to, data);
  if (typeof window !== 'undefined') {
    window.location.href = url;
    onSubmitted();
  }
}
```

---

**3. `Section id="pilot-form"` renders with no heading — `aria-labelledby` silently points at nothing**  
File: `apps/web/src/pages/pilot.tsx:48`

```tsx
<Section id="pilot-form">   // no heading prop → aria-labelledby is omitted by Section
```

`Section` only emits `aria-labelledby` when a `heading` prop is present (correct — the component is self-defensive). But the `<section>` element still renders without any accessible name. Screen-reader users encounter an unlabelled landmark. The B2 review caught the same pattern. Fix: either pass a visually-hidden heading via `heading` + SR-only class, or wrap the form in a plain `<div>` instead of `<Section>` since `PageIntro` already provides the page-level `h1`.

---

**4. `TierCard` — `bullets` list uses bullet string as key — breaks on duplicate bullet text**  
File: `apps/web/src/components/marketing/tier-card.tsx:65`

```tsx
{bullets.map((b) => (
  <li key={b} ...>
```

Bullet strings are not guaranteed unique. The `en.json` / `th.json` pricing tiers currently have unique strings per tier, but "Email support" appears in both `solo` and `clinic` tiers (same component instance won't re-use both tiers' bullets simultaneously, so no runtime crash today). However the project convention requires field-level or index-free stable keys. Switch to index as a last resort or, better, expose a `{ id, text }` shape in the locale dict.

---

## MEDIUM

**5. `consent: false as unknown as true` double-cast in defaultValues**  
File: `apps/web/src/components/marketing/pilot-form.tsx:44`

```tsx
consent: false as unknown as true,
```

This bypasses `WaitlistInput`'s `z.literal(true)` type. It works at runtime (RHF accepts `false` in `defaultValues` for an uncontrolled checkbox), but it suppresses TypeScript's type-checker from catching future misuse. The idiomatic fix is to type `defaultValues` as `DefaultValues<WaitlistInput>` which already allows `false` for a `literal(true)` field:

```tsx
const {
  register,
  handleSubmit,
  control,
  formState: { errors, isSubmitting },
} = useForm<WaitlistInput, unknown, WaitlistInput>({
  resolver: zodResolver(WaitlistInputSchema),
  defaultValues: {
    fullName: '',
    clinic: '',
    email: '',
    phone: '',
    lineId: '',
    message: '',
    consent: false,   // DefaultValues<WaitlistInput> permits false for literal(true)
    locale,
  },
});
```

---

**6. `mailto:` URL length not capped — assembler can exceed browser limit when all fields are at max**  
File: `apps/web/src/lib/mailto.ts`

The schema comment correctly explains the 1500-char message cap leaves ~400 chars headroom, but no assertion validates this. If a future schema change increases other field limits, the URL can silently exceed ~2000 chars. Add a defensive truncation or at minimum a runtime `console.warn` in dev:

```ts
const result = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
// Consider: if (result.length > 2000) console.warn('[buildWaitlistMailto] URL length', result.length);
return result;
```

This is MEDIUM not HIGH because the schema guards cap individual fields well and the comment documents the math.

---

**7. `SITEMAP_PATHS` constant defined but its only consumer is the `sitemap` plugin call — dead reference comment says "documentation"**  
File: `apps/web/vite.config.ts:228-231`

```ts
const SITEMAP_PATHS: ReadonlyArray<string> = PRERENDER_PATHS.filter(...);
```

The variable is used on line 255 (`dynamicRoutes: [...SITEMAP_PATHS]`). This is not dead code — the prompt description was slightly misleading. No action needed. *(Checked: valid usage.)*

---

**8. `PrivacyPage` and `TermsPage` reuse `meta.privacy.title` as both `eyebrow` and `heading` — duplicate text for AT users**  
File: `apps/web/src/pages/privacy.tsx:16-17`, `apps/web/src/pages/terms.tsx:16-17`

```tsx
<LegalDoc
  eyebrow={t('meta.privacy.title')}   // "Privacy"
  heading={t('meta.privacy.title')}   // "Privacy" — same string
```

Screen readers announce "Privacy — heading level 1" immediately after the eyebrow "Privacy" in the `PageIntro`. The eyebrow should be a distinct short label (e.g. `t('privacy.draftLabel')` or a new `privacy.intro.eyebrow` key) rather than repeating the title. This is a minor a11y quality issue, not a blocking defect.

---

**9. `form-action 'self'` in CSP blocks `window.location.href = mailto:...` on some browsers**  
File: `apps/web/vercel.json:17`

```json
"form-action 'self'"
```

`form-action` restricts `<form action>` submissions, not `window.location.href` assignments, so mailto navigation is unaffected. However on older Firefox (<= 52) `form-action` was incorrectly applied to JS navigations. Modern browsers (Chrome 59+, Firefox 53+) are correct. Given the Thai B2B clinic audience this is a low-risk edge case but worth a comment in `vercel.json` explaining why `form-action 'self'` is intentionally narrow.

---

**10. `pilot-form.test.tsx` — no test for the `branches` field validation path**  
File: `apps/web/src/components/marketing/pilot-form.test.tsx`

The "shows validation errors on empty submit" test does not assert that `branches` shows an error when empty. The field has `type="number"` so a blank submission sends an empty string that `z.coerce.number` parses as `NaN`, triggering the `'branchesInvalid'` error. This error message path is untested in the form test (it is covered in the schema unit test, but not the rendered component test). Add an assertion for `screen.getByText('Branches must be 1–50.')`.

---

## LOW

**11. `eslint-disable` comment at top of `vite.config.ts` lacks `file:line` scoping**  
File: `apps/web/vite.config.ts:1`

```ts
/* eslint-disable security/detect-object-injection -- locale + pageKey are constant union literals */
```

The disable fires for the entire file. Prefer an inline `// eslint-disable-next-line` at the two exact lines where object-injection is triggered (`dict.meta[pageKey]`). This is a style preference per project convention.

---

**12. `SiteFooter` receives `locale` as a prop but also calls `useResolvedLocale()` — prop is redundant**  
File: `apps/web/src/components/layout/site-footer.tsx:4,9`

`useResolvedLocale()` already returns `locale`, so the prop is unused for logic (only used in `/${locale}/privacy` hrefs). Either read `locale` from the hook instead of the prop, or remove the prop. The current code is technically correct but the duplication is confusing.

---

**13. `TODOs` / cross-app sync comments — no issue ticket reference**  
Files: `input.tsx`, `label.tsx`, `textarea.tsx`, `form-feedback.tsx` (all `apps/web/src/components/ui/`)

Each file has a "NOTE: byte-similar to `apps/app/…` — keep in sync until promoted to shared package." These are useful, but per project conventions TODOs should reference an issue number. Add a ticket ID when the shared-package promotion is tracked.

---

**14. `pilot.tsx` success section reuses `pilot.intro.eyebrow` — intentional but undocumented**  
File: `apps/web/src/pages/pilot.tsx:34`

```tsx
<Section
  id="pilot-success"
  eyebrow={t('pilot.intro.eyebrow')}   // "Pilot" — correct brand voice but not obvious
  heading={t('pilot.success.heading')}
```

Fine as-is, just surprising on first read. A brief inline comment would clarify intent.

---

## Checklist Verification

| Check | Result |
|---|---|
| Schema vs form drift — all fields registered | PASS — `fullName`, `clinic`, `email`, `branches`, `phone`, `lineId`, `message`, `consent` (Controller), `locale` (hidden input) |
| `consent` uses Controller not register | PASS |
| `locale` hidden field defaulted from hook | PASS |
| mailto RFC 6068 — every interpolated value encoded | PASS — `encodeURIComponent(to)`, `encodeURIComponent(subject)`, `encodeURIComponent(body)` |
| CRLF line breaks | PASS — `lines.join('\r\n')` |
| mailto length ceiling | PARTIAL — schema caps message at 1500; no runtime assertion (see finding #6) |
| a11y: htmlFor↔id parity | PASS — all 7 visible inputs have matching Label `htmlFor` |
| a11y: aria-invalid + aria-describedby | PASS — all inputs wire to FormError ids |
| FormError role="alert" | PASS |
| DRAFT banner role="note" | PASS |
| pilot-form Section missing heading | FAIL — see finding #3 |
| CTA hrefs pointing at /{locale}/pilot | PASS — hero, FinalCta, all TierCards |
| Disabled CTA fallback when href absent | PASS — both FinalCta and TierCard render `disabled` button |
| Plausible no-op when undefined | PASS |
| try/catch around track() | PASS |
| SSR guard in analytics | PASS |
| CSP script-src plausible.io | PASS |
| CSP connect-src plausible.io | PASS |
| CSP form-action blocking mailto | NOT BLOCKED (form-action only restricts `<form action>`) |
| Routes: pilot/privacy/terms as locale children | PASS |
| Wildcard `*` last in children array | PASS |
| PageKey union includes pilot/privacy/terms | PASS |
| PRERENDER_PATHS includes pilot/privacy/terms | PASS |
| Dict parity — en vs th pilot.* keys | PASS — all 20+ keys match |
| Dict parity — meta.{pilot,privacy,terms} | PASS — both locales |
| Dict parity — footer.{privacy,terms,legalNav} | PASS |
| privacy/terms section arrays same length + same ids | PASS — privacy 8 sections, terms 6 sections, both locales identical |
| noindex for privacy + terms | PASS — `NOINDEX_PAGES` set drives `seo.index = false` → `<meta name="robots" content="noindex">` |
| noindex verified by build-output test | NOT TESTED — `pages.test.tsx` doesn't assert `<meta>` noindex (PageSeo is a no-op component; coverage depends on vite.config.ts integration test) |
| as unknown as / as any | 1 INSTANCE — `consent: false as unknown as true` (finding #5) |
| Missing return types on exports | PASS — all public exports typed |
| Test: schema 16 cases | PASS — 16 describe cases covering all fields |
| Test: mailto Thai + special chars | PASS |
| Test: form valid submit path | PASS |
| Test: form validation errors | PARTIAL — `branches` error not asserted in form test (finding #10) |

---

## Review Summary

| Severity | Count | Status |
|---|---|---|
| CRITICAL | 0 | pass |
| HIGH | 4 | warn |
| MEDIUM | 4 | info |
| LOW | 4 | note |

**Verdict: APPROVE WITH COMMENTS**

No CRITICAL issues. The four HIGH issues are all correctness or a11y defects that should be fixed before the pilot goes live, but none block a prototype merge:

- **#1** (onSubmitted unconditional) and **#2** (isSubmitting never true) are both in the same 8-line `onValid` function — one async fix resolves both.
- **#3** (unlabelled Section landmark) requires adding a visually-hidden heading or switching to `<div>`.
- **#4** (bullet key collision risk) requires a minor locale dict shape change or index key.

Fix the HIGH issues and the two MEDIUM test gaps (#10, #6) before shipping to real users.
