# Lesso Pilot Onboarding

> Audience: pilot clinic staff (front desk + clinician).
> Read time: ~15 minutes.

## What this pilot is

Lesso is a Thai aesthetic-clinic backoffice. The MVP runs entirely client-side
against a mock server: every save lives in your browser's localStorage.
Nothing leaves the device until the Supabase backend lands in phase A7.

What that means for you:

- Your data stays on this machine. Closing the tab does not lose it; clearing
  the browser site data does.
- Two staff sharing one tablet share the same data. Two tablets are two
  separate datasets.
- The Dev Toolbar (bottom-right gear) lets you switch tenant / branch / user
  to simulate different roles without re-logging.

## Day-1 setup

1. Open the app at `https://app.lesso.clinic` in Chrome / Edge / Safari.
2. The Dev Toolbar auto-seeds a demo tenant with two branches and ~10 demo
   patients. Use those for the first walkthrough — do not enter real
   patients yet.
3. Switch the language with the **ภาษาไทย / English** button in the header.
4. Confirm the audit log page works: every patient/course/receipt/walk-in
   action appears within seconds.

## Daily flow (front desk)

| Step | Where | Notes |
|---|---|---|
| Patient arrives, search | Patients page | Search by name or phone (debounced 250ms). |
| Walk-in (no booking) | Home → "+ New walk-in" | 4-step flow: pick patient → confirm course → complete → rebook. |
| Booked appointment | Home → today's list | Tap card to mark complete or take payment. |
| Take payment | Patient detail → "Take payment" | Cash / card / transfer / LINE Pay. Receipt auto-numbers, audit logs the line. |
| Use a course session | Patient detail → Active courses | Each "Use session" decrements + audit-logs. |
| Capture PDPA consent | Patient detail → "Capture consent" | Required scopes are pre-checked. Duration default 12 months. |
| Export patient data (PDPA Art. 30) | Patient detail → "Export data (PDPA)" | Single CSV — appointments + courses + receipts. Filename is date-only by design (no patient ID). |

## Daily flow (clinician / manager)

| Step | Where | Notes |
|---|---|---|
| Today's schedule | Home | Cards show consent alert icon when PDPA needs review. |
| Visit summary draft | Patient detail → "Visit summary (AI)" | Mock output. Always review before sending. |
| Recall message | Patient detail → "Draft recall message" | Same — copy → paste into LINE manually. |
| Loyalty redeem | Patient detail → Loyalty card | Min 100 points. Decrements live + audits. |
| Branch overview | Branches page | Top doctor + low-stock count per branch. |
| Monthly report | Reports page | Revenue / visits / commission. Group by doctor / service / branch. |

## What's NOT in the MVP (do not ask staff to use)

- Real backend (data only on this device).
- Real AI (visit summary / recall / slot suggestion are deterministic stubs).
- LINE OA send (you copy → paste yourself).
- KASIKORN / SCB QR (LINE Pay is a label only; no PSP integration yet).
- Multi-device sync.

## Reporting issues

- **Quick feedback**: tap the **Send feedback** button (bottom-right) — opens
  a Notion form in a new tab.
- **Bug repro**: include screenshot + the URL bar.
- **Data loss**: do NOT click "Reset data" in the Dev Toolbar — that wipes
  the localStorage tenant. Tell the dev first.

## Pilot exit checklist (after 4 weeks)

- [ ] All staff have completed at least one walk-in + one paid receipt.
- [ ] At least 20 PDPA consents captured.
- [ ] At least 10 audit-log entries reviewed by manager.
- [ ] At least one PDPA export performed and verified.
- [ ] Feedback form submitted with: time-to-checkout, language preference,
      most-used screen, biggest pain point.

## Contacts

- Product / dev: `2smooth.ai@gmail.com`
- Clinic admin: see your onboarding email
