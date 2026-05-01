# Implementation Report: A6 Pilot Prep

## Summary
Wired audit emission across the remaining mutating handlers, shipped the Loyalty
redeem feature end-to-end, made the Audit page usable with action + date
filters and translated action labels, applied tablet-breakpoint fixes to
appointment / walk-in / course list cards, polished A5 review nits, and added a
pilot onboarding doc + floating feedback button.

## Assessment vs Reality
| Metric | Predicted | Actual |
|---|---|---|
| Complexity | Medium | Medium |
| Confidence | 8/10 | 9/10 |
| Files Changed | ~25 | 24 |

## Tasks Completed
| # | Task | Status | Notes |
|---|---|---|---|
| T1 | Audit emission across patient/walk-in/course/receipt/inventory/loyalty handlers | Done | Includes `resolveActorName` helper + warning collection |
| T2-6 | Loyalty feature folder (hook + card + redeem dialog) | Done | useRef submit fence, preset buttons, min-100 gate |
| T7-8 | FormField primitive + RHF migration | DEFERRED | Out-of-scope risk for pilot — keep manual forms, revisit A8 |
| T9-10 | Audit filters (action enum + date range) + action i18n | Done | TH + EN locales |
| T11 | Consent required Badge | Done | Replaced muted "· required" suffix with secondary Badge |
| T12-14 | Tablet breakpoint sweep | Done | min-w-0 + flex-wrap + truncate on appointment-list, walk-in-queue, course-balance-card |
| T15 | A5 micros (HtmlLangSync co-location comment, WithdrawConsentVars named type) | Done | aria-busy already in place |
| T16 | Critical-path tests | DEFERRED | Push to A8 hardening |
| T17 | Pilot onboarding doc + feedback button | Done | docs/pilot-onboarding.md, FeedbackButton via VITE_FEEDBACK_URL |
| T18 | Validate + commit + push | Done | Typecheck + lint + tests + build all green |

## Validation Results
| Level | Status | Notes |
|---|---|---|
| Typecheck | Pass | 6/6 packages |
| Lint | Pass | Zero issues |
| Tests | Pass | 6/6 |
| Build | Pass | 577 KB (171 KB gzip) |
| Integration | Skipped | Manual smoke during pilot |

## Files Changed
| File | Action | Notes |
|---|---|---|
| `packages/mock-server/src/handlers/{patients,walk-ins,courses,receipts,inventory,loyalty}.ts` | UPDATED | audit emission + actor name |
| `apps/app/src/features/loyalty/**` | CREATED | hook + card + redeem dialog |
| `apps/app/src/routes/audit.tsx` | UPDATED | filters + memoized actionOptions |
| `apps/app/src/features/audit/components/audit-list.tsx` | UPDATED | translated action label |
| `apps/app/src/locales/{en,th}.json` | UPDATED | audit.filter, audit.action.*, loyalty.*, feedback.cta |
| `apps/app/src/routes/patients.$id.tsx` | UPDATED | LoyaltyCard wired |
| `apps/app/src/features/consent/components/consent-dialog.tsx` | UPDATED | required Badge |
| `apps/app/src/features/consent/hooks/use-consent.ts` | UPDATED | WithdrawConsentVars type |
| `apps/app/src/features/{appointment,walk-in,course}/components/*.tsx` | UPDATED | tablet breakpoint |
| `apps/app/src/App.tsx` | UPDATED | HtmlLangSync co-location comment |
| `apps/app/src/components/feedback-button.tsx` | CREATED | floating feedback button |
| `apps/app/src/components/page-shell.tsx` | UPDATED | mount FeedbackButton |
| `apps/app/.env.example` | UPDATED | VITE_FEEDBACK_URL |
| `docs/pilot-onboarding.md` | CREATED | pilot onboarding guide |

## Deviations from Plan
- **T7-8 / T16 deferred**: FormField + RHF migration and critical-path tests
  pushed to A8. Net-new pilot value of these vs. pilot-blocking surface area
  (forms work fine; tests can shadow real usage) made deferral the right call.

## Issues Encountered
- TH locale had `equivalentDiscount` without `{{amount}}` placeholder. Made EN
  match (label-only) since the component renders the formatted currency
  separately.

## Next Steps
- Pilot onboarding session with clinic staff
- Monitor feedback-button submissions
- A7: Supabase backend integration (replaces mock-server)
- A8: hardening — FormField/RHF migration, critical-path Playwright tests
