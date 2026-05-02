# Plan: B3 — Waitlist + Legal (mailto prototype)

## Summary
Wire pilot signup funnel for `apps/web` as a **client-only prototype**: `/{locale}/pilot`
form (RHF + Zod) opens a pre-filled `mailto:` link to the founder, Privacy + Terms
pages (PDPA-compliant boilerplate marked DRAFT), Plausible analytics with custom
events. **No serverless function, no Resend, no Notion, no rate limit** — explicitly
deferred until pilot demand justifies real backend.

## User Story
As a Thai aesthetic clinic owner browsing `lesso.clinic`,
I want to submit my contact details for a free 30-day pilot,
So that I can be onboarded as one of the five Q3 2026 pilot clinics.

## Problem → Solution
B2 ships pilot CTAs as `disabled` buttons → all pilot CTAs (hero, tier card, final
CTA) become real `<a href>` links to `/{locale}/pilot`. Form validates client-side
(Zod) then opens user's mail client with pre-filled `mailto:` to founder. Privacy +
Terms exist so the form footer can link them per PDPA expectation.

## Metadata
- **Complexity**: Medium
- **Source PRD**: `.claude/PRPs/prds/aesthetic-clinic-backoffice-mvp.prd.md`
- **PRD Phase**: B3 — Waitlist + Legal (prototype scope)
- **Estimated Files**: ~20 (15 created, 9 updated)

---

## UX Design

### Before
```
┌──────────────────────────────────────┐
│  CTA: "Join the pilot — free 30 days"│
│       [DISABLED BUTTON]              │
│  Footer: copyright + locale only     │
└──────────────────────────────────────┘
```

### After
```
┌──────────────────────────────────────┐
│  CTA: → /{locale}/pilot              │
│                                      │
│  /pilot:                             │
│   ┌──────────────────────────────┐   │
│   │ Name  [_________________]    │   │
│   │ Clinic [________________]    │   │
│   │ Email [_________________]    │   │
│   │ Branches [v]                 │   │
│   │ Phone [_________________]    │   │
│   │ LINE  [_________________]    │   │
│   │ Message [_______________]    │   │
│   │ ☑ I agree to Privacy + Terms │   │
│   │ [Submit] → opens mail client │   │
│   └──────────────────────────────┘   │
│                                      │
│  /privacy + /terms (DRAFT banner)    │
│  Footer: + Privacy + Terms links     │
└──────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Hero pilot CTA | `<Button disabled>` | `<a href="/{locale}/pilot">` styled as Button | EditorialHero |
| Tier card CTA | `<Button disabled>` | `<a href="/{locale}/pilot">` (Group tier → mailto:hello@lesso.clinic) | TierCard |
| FinalCta | `<Button disabled>` | `<a href="/{locale}/pilot">` | FinalCta |
| Footer | Copyright + locale | + Privacy + Terms | SiteFooter |
| `/pilot` route | 404 | Form → mailto + success state | New page |
| `/privacy` route | 404 | DRAFT-banner + boilerplate | New page (noindex) |
| `/terms` route | 404 | DRAFT-banner + boilerplate | New page (noindex) |
| Plausible | absent | Script tag (env-gated) + custom events | index.html + analytics util |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `apps/web/src/lib/i18n-dict.ts` | 1–58 | `Dict`, `DICTS`, `makeT` — every form string |
| P0 | `apps/web/src/lib/use-locale.ts` | 1–48 | `useResolvedLocale()` for pages |
| P0 | `apps/web/src/routes.tsx` | 1–37 | RouteObject pattern |
| P0 | `apps/web/vite.config.ts` | 25–155, 202–258 | `PageKey`, `SUBPATH_TO_PAGE`, `PRERENDER_PATHS`, `buildSeo`, `onPageRendered` |
| P0 | `apps/web/vercel.json` | all | CSP must extend for Plausible |
| P1 | `apps/app/src/features/patient/components/patient-form.tsx` | all | Field rhythm reference |
| P1 | `apps/app/src/components/ui/{input,label,textarea,form-feedback}.tsx` | all | Port to web 1:1 |
| P1 | `apps/web/src/components/marketing/{section,page-intro,final-cta,tier-card}.tsx` | all | Marketing primitives + brand tokens |
| P1 | `apps/web/src/locales/{en,th}.json` | all | Dict shape |
| P1 | `apps/web/src/components/layout/editorial-hero.tsx` | all | Hero CTA wiring |
| P2 | `apps/web/tests/build-output.test.ts` | all | Build-output assertion pattern |
| P2 | `apps/web/src/pages/pages.test.tsx` | all | Page test pattern |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| `mailto:` URL format | RFC 6068 | `mailto:to?subject=...&body=...&cc=...`; encode body via `encodeURIComponent`; line breaks become `%0D%0A`; max URL length ~2000 chars (truncate `message` field at 1500 chars to be safe). |
| Plausible script | plausible.io/docs | `script.tagged-events.js` (NOT `script.js`) for `window.plausible()`; `defer` mandatory; CSP needs `script-src https://plausible.io` + `connect-src https://plausible.io`. |
| react-hook-form + zodResolver | react-hook-form.com | `useForm({ resolver: zodResolver(schema) })`; `register` for inputs; `Controller` for Radix Checkbox; `formState.errors` + `formState.isSubmitting`. |

---

## Patterns to Mirror

### NAMING_CONVENTION
```ts
// SOURCE: apps/web/src/components/marketing/tier-card.tsx:1-17
export interface TierCardProps { name: string; /* … */ }
export function TierCard({ name, ... }: TierCardProps) { ... }
```
Components are PascalCase function exports with co-located `*Props` interface.

### ROUTE_REGISTRATION
```ts
// SOURCE: apps/web/src/routes.tsx:17-27
const localeRoutes: RouteObject[] = siteConfig.locales.map((locale) => ({
  path: `/${locale}`,
  element: <RootLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: 'pricing', element: <PricingPage /> },
    // …add 'pilot' / 'privacy' / 'terms'
    { path: '*', element: <NotFoundPage /> },
  ],
}));
```

### PRERENDER_REGISTRATION
```ts
// SOURCE: apps/web/vite.config.ts:35-50, 202-207
type PageKey = 'home'|'pricing'|'features'|'about'|'notFound';
// extend with 'pilot' | 'privacy' | 'terms'
const SUBPATH_TO_PAGE = { '/pricing': { pageKey: 'pricing', relPath: '/pricing' }, /* … */ };
const PRERENDER_PATHS = siteConfig.locales.flatMap((l) => [`/${l}`, `/${l}/pricing`, /* … */]);
```
Each new page key requires:
1. Extend `PageKey` union.
2. Add to `SUBPATH_TO_PAGE`.
3. Add to `PRERENDER_PATHS`.
4. Add `meta.<pageKey>.{title,description}` in BOTH `en.json` + `th.json`.

### SECTION_LAYOUT
```ts
// SOURCE: apps/web/src/components/marketing/section.tsx:19-49
<section aria-labelledby={heading ? `${id}-heading` : undefined}>
  <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
    {/* eyebrow + h2 + body */}
  </div>
</section>
```

### FORM_FIELD_RHYTHM
```ts
// SOURCE: apps/app/src/features/patient/components/patient-form.tsx:48-70 (port to web)
<div className="space-y-1.5">
  <Label htmlFor="fullName">{t('pilot.form.fullName')}</Label>
  <Input id="fullName" {...register('fullName')}
    aria-invalid={!!errors.fullName}
    aria-describedby={errors.fullName ? 'fullName-err' : undefined} />
  {errors.fullName ? <FormError id="fullName-err">{errors.fullName.message}</FormError> : null}
</div>
```

### TEST_STRUCTURE_PAGE
```ts
// SOURCE: apps/web/src/pages/pages.test.tsx:8-14
function renderPage(Component: React.ComponentType, pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Component />
    </MemoryRouter>,
  );
}
```

### TEST_STRUCTURE_BUILD
```ts
// SOURCE: apps/web/tests/build-output.test.ts:30-50
describe('vite-react-ssg build output — Bx pages', () => {
  it.each(PAGES)('emits $file ...', ({ file, locale, canonical }) => { ... });
});
```

### CTA_HREF_VS_DISABLED
```ts
// SOURCE: apps/web/src/components/ui/button.tsx:1-47 + Radix Slot pattern
import { Slot } from '@radix-ui/react-slot';
// Extend Button with `asChild` via Slot — single source of truth for CTA styling.
// <Button asChild><a href={pilotHref}>...</a></Button>
```

---

## Files to Change

### Created (15)
| File | Action | Justification |
|---|---|---|
| `apps/web/src/components/ui/input.tsx` | CREATE | Port from `apps/app` byte-similar |
| `apps/web/src/components/ui/label.tsx` | CREATE | Port from `apps/app` |
| `apps/web/src/components/ui/textarea.tsx` | CREATE | Port from `apps/app` |
| `apps/web/src/components/ui/form-feedback.tsx` | CREATE | Port from `apps/app` |
| `apps/web/src/components/ui/checkbox.tsx` | CREATE | Radix Checkbox for consent |
| `apps/web/src/components/marketing/pilot-form.tsx` | CREATE | RHF + Zod; submit builds mailto |
| `apps/web/src/components/marketing/legal-doc.tsx` | CREATE | DRAFT-banner shell for Privacy/Terms |
| `apps/web/src/lib/waitlist-schema.ts` | CREATE | Zod schema (client-only) |
| `apps/web/src/lib/mailto.ts` | CREATE | Build pre-filled mailto URL |
| `apps/web/src/lib/analytics.ts` | CREATE | Plausible wrapper, no-op when absent |
| `apps/web/src/lib/phone.ts` | CREATE | Port `normalizePhone` from `apps/app` |
| `apps/web/src/pages/pilot.tsx` | CREATE | `/pilot` route — form + success states |
| `apps/web/src/pages/privacy.tsx` | CREATE | `/privacy` route — DRAFT boilerplate |
| `apps/web/src/pages/terms.tsx` | CREATE | `/terms` route — DRAFT boilerplate |
| `apps/web/src/types/plausible.d.ts` | CREATE | `Window.plausible` type augmentation |

### Updated (9)
| File | Action | Justification |
|---|---|---|
| `apps/web/package.json` | UPDATE | Add `react-hook-form`, `@hookform/resolvers`, `zod`, `@radix-ui/react-checkbox` |
| `apps/web/src/locales/en.json` | UPDATE | Add `pilot`, `privacy`, `terms`, `meta.{pilot,privacy,terms}`, `footer.{privacy,terms,legalNav}` |
| `apps/web/src/locales/th.json` | UPDATE | Same shape, Thai copy |
| `apps/web/src/routes.tsx` | UPDATE | Register 3 new child routes |
| `apps/web/vite.config.ts` | UPDATE | Extend `PageKey`, `SUBPATH_TO_PAGE`, `PRERENDER_PATHS`; emit noindex for legal pages; conditional Plausible script tag |
| `apps/web/vercel.json` | UPDATE | CSP: add `https://plausible.io` to `script-src` + `connect-src` |
| `apps/web/.env.example` | UPDATE | Add `VITE_PLAUSIBLE_DOMAIN`, `VITE_WAITLIST_TO` (mailto recipient) |
| `apps/web/src/components/ui/button.tsx` | UPDATE | Add `asChild` prop via Radix Slot |
| `apps/web/src/components/marketing/{tier-card,final-cta}.tsx` + `apps/web/src/components/layout/{editorial-hero,site-footer}.tsx` | UPDATE | Replace `<Button disabled>` with `<Button asChild><a>`; footer + Privacy/Terms links |
| `apps/web/tests/build-output.test.ts` | UPDATE | Extend for 6 new HTMLs; assert noindex on legal; assert Plausible tag |

### Test Files (4 created)
| File | Action |
|---|---|
| `apps/web/src/lib/waitlist-schema.test.ts` | Schema unit tests |
| `apps/web/src/lib/mailto.test.ts` | URL build + encoding edge cases |
| `apps/web/src/lib/analytics.test.ts` | track() no-op when absent |
| `apps/web/src/components/marketing/pilot-form.test.tsx` | RHF + Zod errors, mailto opened on submit |

## NOT Building

- **Vercel serverless `/api/waitlist`** — explicitly deferred (mailto prototype)
- **Resend transactional email** — N/A
- **Notion CRM** — N/A
- **Upstash rate limit** — N/A (mailto is user-initiated, no abuse vector)
- **Honeypot** — N/A (no server endpoint to abuse)
- **Server-side schema** — schema is client-only validation
- **Cookie consent banner** — Plausible is cookieless
- **Blog scaffold / OG images / Lighthouse CI** — that's B4
- **Multi-step form / draft persistence**
- **Editorial copy review** — DRAFT banner makes ownership explicit; legal copy is placeholder boilerplate, NOT lawyer-approved

---

## Step-by-Step Tasks

### Task 1: Add dependencies
- **ACTION**: Add deps to `apps/web/package.json`.
- **IMPLEMENT**:
  ```bash
  pnpm --filter @lesso/web add react-hook-form @hookform/resolvers zod @radix-ui/react-checkbox
  ```
- **MIRROR**: existing dep alphabetization in `package.json`.
- **GOTCHA**: NO server packages (no `resend`, `@notionhq/client`, `@upstash/*`, `@vercel/node`) — this is a prototype.
- **VALIDATE**: `pnpm install` succeeds; `pnpm --filter @lesso/web typecheck` still green.

### Task 2: Port form primitives to apps/web/components/ui
- **ACTION**: Copy `input.tsx`, `label.tsx`, `textarea.tsx`, `form-feedback.tsx` from `apps/app/src/components/ui/` to `apps/web/src/components/ui/`. Add cross-reference comment at top of each.
- **IMPLEMENT**: Files byte-identical except for `// NOTE: byte-similar to apps/app/src/components/ui/<name>.tsx — keep in sync.` header.
- **MIRROR**: SOURCE comment style from `apps/web/src/components/ui/sheet.tsx:1-3`.
- **GOTCHA**: Preserve `apps/app` Input's `shadow-sm` brand-token comment.
- **VALIDATE**: `pnpm --filter @lesso/web typecheck` clean.

### Task 3: Create Checkbox primitive
- **ACTION**: Add `apps/web/src/components/ui/checkbox.tsx` (Radix root + indicator).
- **IMPLEMENT**:
  ```tsx
  import * as React from 'react';
  import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
  import { Check } from 'lucide-react';
  import { cn } from '@/lib/utils';

  export const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
  >(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'peer h-5 w-5 shrink-0 rounded border border-input bg-background',
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  ));
  Checkbox.displayName = 'Checkbox';
  ```
- **MIRROR**: shadcn checkbox; brand tokens only (no hex).
- **GOTCHA**: Radix Checkbox.Root is `<button role="checkbox">`, NOT `<input type="checkbox">` — RHF `register` won't bind directly. Use `Controller` for this field.
- **VALIDATE**: Renders; keyboard space toggles state.

### Task 4: Port phone helper
- **ACTION**: Create `apps/web/src/lib/phone.ts` (1:1 from `apps/app/src/lib/phone.ts`).
- **MIRROR**: SOURCE `apps/app/src/lib/phone.ts:1-19`.
- **VALIDATE**: typecheck clean.

### Task 5: Define waitlist Zod schema (client-only)
- **ACTION**: Create `apps/web/src/lib/waitlist-schema.ts`.
- **IMPLEMENT**:
  ```ts
  import { z } from 'zod';
  import { siteConfig } from './site-config';

  // Error messages are KEYS — UI translates via t('pilot.errors.<key>').
  // Never ship raw English Zod messages.
  export const WaitlistInputSchema = z.object({
    fullName: z.string().min(2, 'fullNameRequired').max(120, 'fullNameTooLong'),
    clinic: z.string().min(2, 'clinicRequired').max(120, 'clinicTooLong'),
    email: z.string().email('emailInvalid').max(120, 'emailTooLong'),
    branches: z.coerce.number({ invalid_type_error: 'branchesInvalid' })
      .int('branchesInvalid').min(1, 'branchesInvalid').max(50, 'branchesInvalid'),
    phone: z.string().min(8, 'phoneInvalid').max(20, 'phoneInvalid')
      .regex(/^[\d+\-\s()]+$/, 'phoneInvalid'),
    lineId: z.string().max(60, 'lineIdTooLong').optional().or(z.literal('')),
    message: z.string().max(1500, 'messageTooLong').optional().or(z.literal('')),
    consent: z.literal(true, { errorMap: () => ({ message: 'consentRequired' }) }),
    locale: z.enum(siteConfig.locales),
  });
  export type WaitlistInput = z.infer<typeof WaitlistInputSchema>;
  ```
- **MIRROR**: SOURCE `apps/app/src/lib/persist-keys.ts:1-21`.
- **GOTCHA**:
  1. `message` capped at 1500 chars (mailto URL ~2000-char browser limit; subject + name + clinic + boilerplate ~400 chars).
  2. `consent` uses `z.literal(true)` — unchecked submit fails at parse, not custom refine.
- **VALIDATE**: `waitlist-schema.test.ts` covers: empty fullName, branches=0, branches=51, branches='abc' (coerce fails), phone with letters, lineId 61 chars, consent=false, locale='fr', message > 1500 chars.

### Task 6: mailto builder
- **ACTION**: Create `apps/web/src/lib/mailto.ts`.
- **IMPLEMENT**:
  ```ts
  import type { WaitlistInput } from './waitlist-schema';

  /**
   * Build a pre-filled mailto: URL for pilot waitlist submissions.
   * RFC 6068 — encode each field via encodeURIComponent; CRLF for line breaks.
   *
   * Browser address-bar limit is ~2000 chars; the schema caps `message` at
   * 1500 to leave headroom for subject + boilerplate + other fields.
   */
  export function buildWaitlistMailto(to: string, data: WaitlistInput): string {
    const subject = `Pilot application — ${data.fullName} · ${data.clinic}`;
    const lines = [
      `Name:     ${data.fullName}`,
      `Clinic:   ${data.clinic}`,
      `Email:    ${data.email}`,
      `Branches: ${data.branches}`,
      `Phone:    ${data.phone}`,
      data.lineId ? `LINE ID:  ${data.lineId}` : null,
      `Locale:   ${data.locale}`,
      '',
      data.message ? `Message:\n${data.message}` : null,
      '',
      '— Sent from lesso.clinic/pilot',
    ].filter((l): l is string => l !== null);
    const body = lines.join('\r\n');
    return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  ```
- **MIRROR**: utility shape `apps/web/src/lib/utils.ts` (small, single-export).
- **GOTCHA**:
  1. Use CRLF (`\r\n`), NOT `\n` — some Windows mail clients break on bare LF.
  2. `encodeURIComponent` on the recipient too (handles `+` in addresses).
  3. Don't set `cc` or `bcc` — many clients block headers other than subject/body for security.
- **VALIDATE**: `mailto.test.ts` covers: subject contains name + clinic, body contains all fields except empty optionals, CRLF used, special chars in clinic name (`&`, `?`, `#`, Thai chars) properly encoded, output starts with `mailto:`.

### Task 7: Plausible analytics + Window typing
- **ACTION**: Create `apps/web/src/lib/analytics.ts` and `apps/web/src/types/plausible.d.ts`.
- **IMPLEMENT**:
  ```ts
  // analytics.ts
  type Props = Record<string, string | number | boolean>;
  /** Fire a Plausible custom event. No-op when the script is not loaded. */
  export function track(eventName: string, props?: Props): void {
    if (typeof window === 'undefined') return;
    const fn = window.plausible;
    if (typeof fn !== 'function') return;
    try { fn(eventName, props ? { props } : undefined); } catch { /* swallow */ }
  }

  // plausible.d.ts
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
  }
  ```
- **GOTCHA**:
  1. `track` MUST be safe to call before script loads (page transitions, SSG hydration).
  2. The try/catch is intentional — analytics must never break form submission.
- **VALIDATE**: `analytics.test.ts` — window absent (server) silently returns; plausible undefined silently returns; plausible defined called with args; plausible throws → caught.

### Task 8: Build pilot form (RHF + zodResolver + mailto)
- **ACTION**: Create `apps/web/src/components/marketing/pilot-form.tsx`.
- **IMPLEMENT**: `useForm({ resolver: zodResolver(WaitlistInputSchema) })`. Render fields via Input/Textarea/Checkbox + Label + FormError. Error messages translated via `t('pilot.errors.' + errors.<field>.message)`. The `locale` field is hidden (`<input type="hidden" {...register('locale')} value={locale} />`). On valid submit:
  1. Call `track('pilot_submit', { locale })`.
  2. Build mailto URL via `buildWaitlistMailto(to, data)` where `to = import.meta.env.VITE_WAITLIST_TO ?? 'hello@lesso.clinic'`.
  3. Set `window.location.href = mailtoUrl`.
  4. Set local state `submitted = true` so success message replaces form.
- **MIRROR**: SOURCE `apps/app/src/features/patient/components/patient-form.tsx:1-90` (field rhythm).
- **IMPORTS**: `useForm`, `Controller` from `react-hook-form`; `zodResolver` from `@hookform/resolvers/zod`; local schema, primitives, `track`, `buildWaitlistMailto`, `useResolvedLocale`.
- **GOTCHA**:
  1. Radix Checkbox needs `Controller` not `register`.
  2. `branches` rendered as `<Input type="number" inputMode="numeric">`; Zod `coerce.number` handles string→number; do NOT pass `valueAsNumber: true` to register (NaN on empty).
  3. `window.location.href = 'mailto:...'` is the standard pattern; some browsers prefer creating a hidden `<a>` and clicking it — both work, prefer the simpler assignment.
  4. After setting `window.location.href`, the page does NOT navigate (mailto opens external app); UI must still update. Show success state via `useState`.
  5. `locale` field is registered hidden — RHF needs it in the registered fields, otherwise Zod's enum validation gets `undefined`. Use `defaultValues: { locale }` in `useForm`.
- **VALIDATE**: `pilot-form.test.tsx` — empty submit shows N error messages; valid submit calls `track` then sets `window.location.href` to a `mailto:` URL containing fullName + email; success state renders.

### Task 9: Build /pilot page
- **ACTION**: Create `apps/web/src/pages/pilot.tsx`.
- **IMPLEMENT**: Compose `PageIntro` + `Section` containing `<PilotForm>` + `<Section>` for legal blurb (links to /privacy + /terms). Local `useState<'idle'|'submitted'>('idle')`; `submitted` state replaces form with thank-you `<Section>`.
- **MIRROR**: SOURCE `apps/web/src/pages/pricing.tsx:1-68` (PageIntro + Section composition).
- **GOTCHA**: Keep `<PageSeo>` no-op invocation for shape parity (vite.config injects real SEO).
- **VALIDATE**: `pages.test.tsx` extended: form renders, h1 from intro, /privacy + /terms link hrefs locale-prefixed.

### Task 10: Build /privacy + /terms (DRAFT)
- **ACTION**: Create `apps/web/src/components/marketing/legal-doc.tsx` and `apps/web/src/pages/privacy.tsx`, `apps/web/src/pages/terms.tsx`.
- **IMPLEMENT**:
  - `LegalDoc` accepts `eyebrow`, `heading`, `lastUpdated`, `draftLabel`, `sections: { id, heading, body }[]`.
  - DRAFT banner: `<div role="note" className="border-l-4 border-secondary bg-secondary/10 px-4 py-3 text-secondary">{draftLabel}</div>` (terracotta token; avoids one-off warning token).
  - PageIntro for h1, then `<Section>` per item.
  - Privacy: 8 sections — Scope, Data Collected, Purpose, Sharing, Retention, Subject Rights, Cross-Border, Contact.
  - Terms: 6 sections — Acceptance, Pilot Definition, Use Restrictions, IP, Liability, Termination.
- **MIRROR**: SOURCE `apps/web/src/pages/about.tsx` (h2/h3 hierarchy + Section composition).
- **GOTCHA**: Both pages emit `noindex` (DRAFT). Handle in vite.config — treat as `index: false` like notFound.
- **VALIDATE**: `pages.test.tsx` renders DRAFT banner with `role="note"`, all section ids present, h1 in PageIntro.

### Task 11: Register routes
- **ACTION**: Edit `apps/web/src/routes.tsx`.
- **IMPLEMENT**:
  ```tsx
  children: [
    { index: true, element: <HomePage /> },
    { path: 'pricing', element: <PricingPage /> },
    { path: 'features', element: <FeaturesPage /> },
    { path: 'about', element: <AboutPage /> },
    { path: 'pilot', element: <PilotPage /> },
    { path: 'privacy', element: <PrivacyPage /> },
    { path: 'terms', element: <TermsPage /> },
    { path: '*', element: <NotFoundPage /> },
  ],
  ```
- **MIRROR**: SOURCE `apps/web/src/routes.tsx:17-27`.
- **GOTCHA**: `*` wildcard remains last child.
- **VALIDATE**: Build emits 14 prerendered HTMLs (was 8).

### Task 12: Extend SSG SEO + Plausible script + prerender list
- **ACTION**: Edit `apps/web/vite.config.ts`.
- **IMPLEMENT**:
  ```ts
  type PageKey = 'home'|'pricing'|'features'|'about'|'pilot'|'privacy'|'terms'|'notFound';
  const SUBPATH_TO_PAGE = {
    '/pricing': { pageKey: 'pricing', relPath: '/pricing' },
    '/features': { pageKey: 'features', relPath: '/features' },
    '/about':    { pageKey: 'about', relPath: '/about' },
    '/pilot':    { pageKey: 'pilot', relPath: '/pilot' },
    '/privacy':  { pageKey: 'privacy', relPath: '/privacy' },
    '/terms':    { pageKey: 'terms', relPath: '/terms' },
  };
  function pageForRoute(route: string): PageEntry {
    const stripped = route.replace(/^\/(en|th)/, '') || '/';
    if (stripped === '/' || stripped === '') return { pageKey: 'home', relPath: '/', index: true };
    const known = SUBPATH_TO_PAGE[stripped];
    if (known) {
      const noIndex = known.pageKey === 'privacy' || known.pageKey === 'terms';
      return { ...known, index: !noIndex };
    }
    return { pageKey: 'notFound', relPath: '/404', index: false };
  }
  const PRERENDER_PATHS = siteConfig.locales.flatMap((l) => [
    `/${l}`, `/${l}/pricing`, `/${l}/features`, `/${l}/about`,
    `/${l}/pilot`, `/${l}/privacy`, `/${l}/terms`,
  ]);

  function renderPlausibleTag(): string {
    const domain = process.env.VITE_PLAUSIBLE_DOMAIN;
    if (!domain) return '';
    return `<script defer data-domain="${escapeHtml(domain)}" src="https://plausible.io/js/script.tagged-events.js"></script>`;
  }
  // in onPageRendered:
  const plausible = renderPlausibleTag();
  return setHtmlLang(html, locale)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(seo.fullTitle)}</title>`)
    .replace('</head>', `    ${tags}\n    ${plausible}\n  </head>`);
  ```
- **MIRROR**: SOURCE `apps/web/vite.config.ts:25-50, 41-50, 202-207, 63-86, 249-256`.
- **GOTCHA**:
  1. `dict.meta[pageKey]` is shape-checked at compile time — adding `pilot`/`privacy`/`terms` requires `meta.<key>.{title,description}` in BOTH `en.json` and `th.json` (Task 13).
  2. `script.tagged-events.js` not `script.js` — required for `window.plausible()`.
  3. `defer` is mandatory.
  4. Sitemap should EXCLUDE `/privacy` + `/terms` (already noindex). Update `dynamicRoutes` for `vite-plugin-sitemap`:
     ```ts
     dynamicRoutes: [...PRERENDER_PATHS].filter(p => !p.endsWith('/privacy') && !p.endsWith('/terms')),
     ```
- **VALIDATE**: typecheck green; build produces 14 HTMLs; legal pages contain `<meta name="robots" content="noindex">`; sitemap has 8 routes.

### Task 13: Extend locale dicts
- **ACTION**: Edit `apps/web/src/locales/en.json` + `apps/web/src/locales/th.json`.
- **IMPLEMENT** (en sketch):
  ```json
  "footer": {
    "copyright": "© {{year}} Lesso. All rights reserved.",
    "privacy": "Privacy", "terms": "Terms", "legalNav": "Legal links"
  },
  "meta": {
    "pilot":   { "title": "Join the pilot", "description": "Apply for the Lesso pilot — first 30 days free for the Q3 2026 cohort." },
    "privacy": { "title": "Privacy",        "description": "Lesso privacy policy — DRAFT pending legal review." },
    "terms":   { "title": "Terms",          "description": "Lesso terms of service — DRAFT pending legal review." }
  },
  "pilot": {
    "intro": {
      "eyebrow": "Pilot",
      "heading": "Apply for the Q3 2026 cohort.",
      "sub": "We onboard at most five clinics. After the 30-day pilot you continue on the Clinic tier or cancel — no questions asked. Your details are sent to the founder via your email client; no data hits our servers."
    },
    "form": {
      "fullName": "Full name", "clinic": "Clinic name", "email": "Email",
      "branches": "Number of branches", "phone": "Phone",
      "lineId": "LINE ID (optional)", "message": "Anything we should know? (optional)",
      "consent": "I agree to the Privacy policy and Terms.",
      "submit": "Open my email", "submitting": "Opening…"
    },
    "errors": {
      "fullNameRequired": "Please enter your name.",
      "fullNameTooLong":  "Name is too long.",
      "clinicRequired":   "Please enter your clinic name.",
      "clinicTooLong":    "Clinic name is too long.",
      "emailInvalid":     "Please enter a valid email.",
      "emailTooLong":     "Email is too long.",
      "branchesInvalid":  "Branches must be 1–50.",
      "phoneInvalid":     "Please enter a valid phone number.",
      "lineIdTooLong":    "LINE ID is too long.",
      "messageTooLong":   "Message must be under 1500 characters.",
      "consentRequired":  "You must agree to continue."
    },
    "success": {
      "heading": "Your email is on the way.",
      "body": "We've opened your mail client with your details pre-filled. Just hit send and we'll be in touch within 2 working days.",
      "fallback": "If your mail client didn't open, email us at {{email}}."
    },
    "legal": "By submitting you agree to our",
    "privacyLinkText": "Privacy policy",
    "termsLinkText": "Terms of service"
  },
  "privacy": {
    "draftLabel": "DRAFT — pending legal review.",
    "lastUpdated": "Last updated: 2026-05-02",
    "sections": [
      { "id": "scope", "heading": "Scope", "body": "..." },
      { "id": "data", "heading": "Data we collect", "body": "..." },
      { "id": "purpose", "heading": "Purpose of processing", "body": "..." },
      { "id": "sharing", "heading": "Sharing with third parties", "body": "..." },
      { "id": "retention", "heading": "Retention", "body": "..." },
      { "id": "rights", "heading": "Your rights under PDPA", "body": "..." },
      { "id": "transfers", "heading": "Cross-border transfers", "body": "Patient data is stored on Supabase (Singapore region) under PDPA cross-border transfer terms..." },
      { "id": "contact", "heading": "Contact", "body": "Email: privacy@lesso.clinic" }
    ]
  },
  "terms": {
    "draftLabel": "DRAFT — pending legal review.",
    "lastUpdated": "Last updated: 2026-05-02",
    "sections": [
      { "id": "acceptance", "heading": "Acceptance", "body": "..." },
      { "id": "pilot", "heading": "Pilot definition", "body": "..." },
      { "id": "use", "heading": "Use restrictions", "body": "..." },
      { "id": "ip", "heading": "Intellectual property", "body": "..." },
      { "id": "liability", "heading": "Limitation of liability", "body": "..." },
      { "id": "termination", "heading": "Termination", "body": "..." }
    ]
  }
  ```
- **MIRROR**: SOURCE `apps/web/src/locales/en.json:300-321` (existing `meta` shape).
- **GOTCHA**:
  1. `Dict = typeof en` enforces th.json structurally matches.
  2. Section arrays must keep same length + `id` keys per locale to avoid runtime shape drift.
- **VALIDATE**: typecheck green (Dict parity); existing `i18n-dict.test.ts` covers parity.

### Task 14: Wire CTA hrefs (replace `disabled` buttons)
- **ACTION**: Add `asChild` to Button; switch hero/tier/finalCta CTAs to anchor-styled buttons pointing to `/{locale}/pilot`. Group tier → `mailto:hello@lesso.clinic` (or keep linking to `/pilot` — pick `/pilot` for simplicity).
- **IMPLEMENT**:
  - `Button` adds `asChild?: boolean`; uses Radix Slot when true:
    ```tsx
    import { Slot } from '@radix-ui/react-slot';
    const Comp = asChild ? Slot : 'button';
    return <Comp ref={ref} type={asChild ? undefined : type} className={cn(...)} {...props} />;
    ```
  - `EditorialHero`:
    ```tsx
    const { t, locale } = useResolvedLocale();
    const pilotHref = `/${locale}/pilot`;
    <Button size="lg" asChild className="shadow-card">
      <a href={pilotHref} onClick={() => track('cta_click', { source: 'hero', locale })}>
        {t('home.pilotComingSoonCta')}
      </a>
    </Button>
    ```
  - `FinalCta`: accept new `href: string` prop (required); render anchor.
  - `TierCard`: accept `href: string` prop (required); caller (PricingPage) passes `pilotHref` for all tiers (cleanest).
  - All CTA anchors call `track('cta_click', { source, locale })` `onClick`.
- **MIRROR**: shadcn `Button` `asChild` pattern.
- **GOTCHA**:
  1. Radix Slot strips wrapping element — anchor child must be the only child.
  2. With `asChild`, `disabled` no longer applies (anchors don't have it). Drop `disabled` from these CTAs.
  3. `track` must no-op when `window.plausible` undefined — handled in Task 7.
- **VALIDATE**: `marketing.test.tsx` updated: TierCard renders `<a>` (role 'link'), no longer `<button>` disabled; `editorial-hero.test.tsx` asserts hero CTA is link to `/en/pilot`; FinalCta test asserts link not disabled button.

### Task 15: Footer + nav legal links
- **ACTION**: Edit `apps/web/src/components/layout/site-footer.tsx`.
- **IMPLEMENT**:
  ```tsx
  <footer ...>
    <div ...>
      <span>{t('footer.copyright', { year })}</span>
      <nav aria-label={t('footer.legalNav')} className="flex items-center gap-4 text-xs">
        <a href={`/${locale}/privacy`} className="hover:text-foreground">{t('footer.privacy')}</a>
        <a href={`/${locale}/terms`} className="hover:text-foreground">{t('footer.terms')}</a>
        <span lang={locale} className="uppercase tracking-wide">{locale}</span>
      </nav>
    </div>
  </footer>
  ```
- **MIRROR**: SOURCE `apps/web/src/components/layout/site-header.tsx:46-68`.
- **GOTCHA**: Don't add legal pages to primary header nav — footer-only.
- **VALIDATE**: `apps/web/src/components/layout/site-footer.test.tsx` (NEW): renders Privacy + Terms locale-prefixed; aria-labelled nav.

### Task 16: Extend Vercel CSP
- **ACTION**: Edit `apps/web/vercel.json` Content-Security-Policy.
- **IMPLEMENT**: Append `https://plausible.io` to `script-src` and `connect-src`:
  ```json
  "value": "default-src 'self'; script-src 'self' https://plausible.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://plausible.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  ```
- **MIRROR**: SOURCE `apps/web/vercel.json:13-15`.
- **GOTCHA**: `mailto:` links work despite CSP — `form-action 'self'` does NOT block mailto navigations because we're using `window.location.href` assignment, not a `<form action>` post.
- **VALIDATE**: Manual: DevTools → no CSP-blocked entries on `/pilot` after Plausible load; mailto opens mail client.

### Task 17: Update env.example
- **ACTION**: Edit `apps/web/.env.example`.
- **IMPLEMENT**:
  ```
  # Plausible — domain registered on plausible.io (e.g. lesso.clinic).
  # Build emits the script tag only when this is set.
  VITE_PLAUSIBLE_DOMAIN=

  # Pilot waitlist mailto recipient. The /pilot form opens this address
  # in the user's mail client with their details pre-filled. No backend
  # involved — this is the prototype submission channel.
  VITE_WAITLIST_TO=hello@lesso.clinic
  ```
- **MIRROR**: existing `.env.example` style.
- **GOTCHA**: `VITE_*` vars leak to client bundle — that's intentional for both these vars (mailto recipient is public anyway; Plausible domain is public).
- **VALIDATE**: `grep -c "VITE_" apps/web/.env.example` returns 2.

### Task 18: Extend build-output test
- **ACTION**: Edit `apps/web/tests/build-output.test.ts`.
- **IMPLEMENT**:
  ```ts
  const PAGES = [
    // … existing 8 …
    { file: 'en/pilot.html',   locale: 'en', canonical: 'https://lesso.clinic/en/pilot',   noindex: false },
    { file: 'th/pilot.html',   locale: 'th', canonical: 'https://lesso.clinic/th/pilot',   noindex: false },
    { file: 'en/privacy.html', locale: 'en', canonical: 'https://lesso.clinic/en/privacy', noindex: true },
    { file: 'th/privacy.html', locale: 'th', canonical: 'https://lesso.clinic/th/privacy', noindex: true },
    { file: 'en/terms.html',   locale: 'en', canonical: 'https://lesso.clinic/en/terms',   noindex: true },
    { file: 'th/terms.html',   locale: 'th', canonical: 'https://lesso.clinic/th/terms',   noindex: true },
  ];
  it.each(PAGES)('emits $file noindex=$noindex', ({ file, noindex }) => {
    const html = read(file);
    if (noindex) expect(html).toContain('<meta name="robots" content="noindex"');
    else expect(html).not.toContain('<meta name="robots" content="noindex"');
  });

  it('emits Plausible script tag when env set', () => {
    for (const file of ['en.html', 'en/pilot.html']) {
      expect(read(file)).toContain('plausible.io/js/script.tagged-events.js');
    }
  });

  it('sitemap excludes legal pages', () => {
    const xml = read('sitemap.xml');
    expect(xml).not.toContain('/privacy');
    expect(xml).not.toContain('/terms');
  });
  ```
- **MIRROR**: SOURCE `apps/web/tests/build-output.test.ts:30-86`.
- **GOTCHA**: `test:build` requires `VITE_PLAUSIBLE_DOMAIN=lesso.clinic` set inline or the script-tag assertion fails.
- **VALIDATE**: `VITE_PLAUSIBLE_DOMAIN=lesso.clinic pnpm --filter @lesso/web test:build` green.

### Task 19: Site-wide validation pass
- **ACTION**: Run full validation matrix.
- **IMPLEMENT**:
  ```bash
  pnpm typecheck
  pnpm lint
  pnpm test
  VITE_PLAUSIBLE_DOMAIN=lesso.clinic pnpm --filter @lesso/web test:build
  pnpm --filter @lesso/web build
  ```
- **VALIDATE**:
  - typecheck: 7 projects pass
  - lint: 0 warnings
  - tests: ~75+ green (web ~55, app ~19, packages 1)
  - test:build: ~10 cases green
  - build: 14 prerendered HTMLs, sitemap with 8 routes (privacy + terms excluded).

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| `waitlist-schema empty fullName` | `{ fullName: '', ... }` | parse fails, key `fullNameRequired` | Yes |
| `waitlist-schema branches=0` | branches=0 | parse fails, `branchesInvalid` | Yes |
| `waitlist-schema branches=51` | branches=51 | parse fails | Yes |
| `waitlist-schema branches='abc'` | coerce fails | parse fails, `branchesInvalid` | Yes |
| `waitlist-schema phone with letters` | `'abc123'` | parse fails | Yes |
| `waitlist-schema email invalid` | `'notanemail'` | parse fails | Yes |
| `waitlist-schema lineId 61 chars` | 61 chars | parse fails | Yes |
| `waitlist-schema message > 1500` | 1501 chars | parse fails | Yes |
| `waitlist-schema consent=false` | unchecked | parse fails | Yes |
| `waitlist-schema valid` | full valid obj | `{ success: true, data }` | No |
| `mailto subject` | data | subject `Pilot application — <name> · <clinic>` | No |
| `mailto body all fields` | full data | body contains every field | No |
| `mailto omits empty optionals` | no lineId/message | body lacks those lines | Yes |
| `mailto special chars` | clinic with `&?#` + Thai | encoded; output URL parseable | Yes |
| `mailto CRLF` | data | body uses `\r\n` | Yes |
| `analytics.track no window` | server context | no throw | Yes |
| `analytics.track no plausible` | window without plausible | no throw | Yes |
| `analytics.track works` | window.plausible mock | called with name + props | No |
| `analytics.track plausible throws` | mock throws | swallowed | Yes |
| `pilot-form empty submit` | empty fields → submit | shows N error messages | Yes |
| `pilot-form valid submit` | filled valid | calls track + sets window.location.href | No |

### Edge Cases Checklist
- [x] Empty input — schema rejects required fields
- [x] Maximum size — message capped at 1500
- [x] Invalid types — branches coerced; non-numeric rejected
- [x] mailto URL too long — message cap prevents overflow
- [x] Plausible domain unset in dev — script omitted, track no-ops
- [x] Mail client doesn't open — fallback message in success state with raw email

---

## Validation Commands

### Static Analysis
```bash
pnpm --filter @lesso/web typecheck
pnpm --filter @lesso/web lint
```
EXPECT: Zero type errors, zero lint warnings.

### Unit Tests
```bash
pnpm --filter @lesso/web test
```
EXPECT: All tests pass.

### Build Output
```bash
VITE_PLAUSIBLE_DOMAIN=lesso.clinic pnpm --filter @lesso/web test:build
```
EXPECT: 14 HTMLs; legal pages noindex; Plausible script in all; sitemap excludes legal.

### Full Repo
```bash
pnpm typecheck && pnpm lint && pnpm test
```
EXPECT: All workspaces green.

### Build
```bash
pnpm --filter @lesso/web build
```
EXPECT: Build succeeds; `dist/` contains 14 HTMLs + sitemap + robots.

### Manual Validation (browser)
- [ ] `/en/pilot` form renders, all fields labelled, tab order linear
- [ ] Submit empty → inline errors per field
- [ ] Submit valid → mail client opens with pre-filled message; success state shown on the page
- [ ] DevTools → no CSP errors
- [ ] DevTools → Plausible script loads (when env set)
- [ ] `pilot_submit` event fires on submit
- [ ] `cta_click` fires on hero / final-cta / tier CTAs
- [ ] `/en/privacy` + `/en/terms` show DRAFT banner + sections
- [ ] Footer Privacy + Terms links resolve to locale-prefixed pages
- [ ] `/th/pilot` Thai copy renders

---

## Acceptance Criteria
- [ ] All 19 tasks completed
- [ ] All validation commands pass
- [ ] Tests written and passing (target: +20 web tests)
- [ ] No type errors / lint warnings
- [ ] 14 prerendered HTMLs (was 8); 8 sitemap entries (legal excluded)
- [ ] /pilot, /privacy, /terms reachable from footer + CTAs
- [ ] Pilot form opens mailto on valid submit
- [ ] Plausible loads + custom events fire when env set

## Completion Checklist
- [ ] Code follows discovered patterns (Section, PageIntro, FormError)
- [ ] Tests follow test patterns (renderPage helper, build-output it.each)
- [ ] No hardcoded values (every string in dict; URLs via siteConfig or env)
- [ ] Documentation updated (.env.example complete)
- [ ] No unnecessary scope additions (no Resend, no Notion, no API)
- [ ] Self-contained — no questions needed during implementation

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| User's mail client doesn't open | Low | Medium | Show fallback in success state with raw `mailto:` link + email address. |
| mailto URL too long → truncation | Low | Medium | Schema caps message at 1500 chars; ~400 chars headroom. |
| Bots scrape the mailto recipient | Certain | Low | Acceptable — same risk as a `<a href="mailto:">` anywhere. Mitigation deferred. |
| CSP blocks Plausible | Medium | High | Test in preview deployment; CSP additions explicit in Task 16. |
| RHF + Radix Checkbox binding bug | Medium | Low | Use `Controller` not `register`; documented Task 8. |
| `branches` `valueAsNumber` produces NaN on empty | High | Medium | Use Zod `coerce.number()` only — don't pass `valueAsNumber: true` to register. |
| Legal copy not lawyer-reviewed | Certain | Medium | DRAFT banner on every legal page. PRD Decisions Log already notes "Privacy + Terms boilerplate, marked DRAFT pending legal review." |

## Notes

- **Mailto prototype scope** confirmed by user. Real backend (`/api/waitlist` → Resend → Notion) deferred until pilot demand justifies infra.
- **Email field added** vs PRD spec ("name/clinic/branches/phone/LINE"): prefilled-mailto recipient is the founder, but applicants need to provide an email so reply works. Deviation documented in implementation report.
- **`asChild` Button refactor** touches 3 marketing components but mechanical (`disabled` → `asChild` + anchor). Single styling source.
- **DRAFT banner** uses `secondary` (terracotta) brand token at 10% — fits editorial premium palette without a one-off `warning` token.
- **Sitemap excludes Privacy + Terms** — already noindex; no point indexing.
- **Plausible cookieless** — no consent banner needed under PDPA / GDPR.
- **Confidence Score**: 9/10. Pure client-side prototype, no infra unknowns. Risk concentrated in mail-client UX (fallback handles it).
