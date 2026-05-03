import { http, passthrough } from 'msw';
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

// Explicit passthrough for cross-origin font + asset CDNs. The MSW service
// worker has origin scope, so it intercepts even cross-origin fetches —
// `onUnhandledRequest: 'bypass'` handles same-origin gracefully, but the
// SW interception of woff2 fetches against fonts.gstatic.com surfaces as
// `net::ERR_FAILED` in some browsers (range-request / opaque-response
// edge cases). Declaring a handler that returns `passthrough()` short-
// circuits MSW and lets the browser fetch directly.
const passthroughHandlers = [
  http.get('https://fonts.googleapis.com/*', () => passthrough()),
  http.get('https://fonts.gstatic.com/*', () => passthrough()),
];

export const handlers = [
  ...passthroughHandlers,
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
