import { healthHandlers } from './health';
import { patientHandlers } from './patients';
import { appointmentHandlers } from './appointments';
import { courseHandlers } from './courses';
import { walkInHandlers } from './walk-ins';
import { receiptHandlers } from './receipts';
import { commissionHandlers } from './commissions';
import { loyaltyHandlers } from './loyalty';
import { inventoryHandlers } from './inventory';
import { branchHandlers } from './branches';
import { reportHandlers } from './reports';
import { aiHandlers } from './ai';
import { auditHandlers } from './audit';
import { consentHandlers } from './consent';

// Note: cross-origin font URLs (fonts.googleapis.com / fonts.gstatic.com)
// are bypassed at the service worker fetch event level in
// `apps/app/public/mockServiceWorker.js` — early-return before MSW gets
// a chance to handle them. That avoids the SW re-issuing the request
// under its own (possibly stale) CSP, which used to surface as a
// `connect-src 'self'` violation.

export const handlers = [
  ...healthHandlers,
  ...patientHandlers,
  ...appointmentHandlers,
  ...courseHandlers,
  ...walkInHandlers,
  ...receiptHandlers,
  ...commissionHandlers,
  ...loyaltyHandlers,
  ...inventoryHandlers,
  ...branchHandlers,
  ...reportHandlers,
  ...aiHandlers,
  ...auditHandlers,
  ...consentHandlers,
];
