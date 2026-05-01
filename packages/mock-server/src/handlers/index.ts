import { healthHandlers } from './health';
import { patientHandlers } from './patients';
import { appointmentHandlers } from './appointments';
import { courseHandlers } from './courses';
import { walkInHandlers } from './walk-ins';

export const handlers = [
  ...healthHandlers,
  ...patientHandlers,
  ...appointmentHandlers,
  ...courseHandlers,
  ...walkInHandlers,
];
