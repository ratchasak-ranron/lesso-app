import { healthHandlers } from './health';
import { patientHandlers } from './patients';
import { appointmentHandlers } from './appointments';
import { courseHandlers } from './courses';
import { walkInHandlers } from './walk-ins';
import { receiptHandlers } from './receipts';
import { commissionHandlers } from './commissions';
import { loyaltyHandlers } from './loyalty';
import { inventoryHandlers } from './inventory';

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
];
