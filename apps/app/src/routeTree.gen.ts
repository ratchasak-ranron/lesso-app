// Hand-authored route tree (A5 — 9 routes).
// File-based generation via @tanstack/router-plugin/vite still deferred;
// will switch when nested routes appear.
import { createRootRoute, createRoute } from '@tanstack/react-router';
import { RootLayout } from './routes/__root';
import { HomePage } from './routes/index';
import { PatientsPage } from './routes/patients';
import { PatientDetailRouteComponent } from './routes/patients.$id.route';
import { AppointmentsPage } from './routes/appointments';
import { CoursesPage } from './routes/courses';
import { ReportsPage } from './routes/reports';
import { InventoryPage } from './routes/inventory';
import { BranchesPage } from './routes/branches';
import { AuditPage } from './routes/audit';
import { ConsentPage } from './routes/consent';

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const patientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/patients',
  component: PatientsPage,
});

const patientDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/patients/$id',
  component: PatientDetailRouteComponent,
});

const appointmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/appointments',
  component: AppointmentsPage,
});

const coursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/courses',
  component: CoursesPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: ReportsPage,
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inventory',
  component: InventoryPage,
});

const branchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/branches',
  component: BranchesPage,
});

const auditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/audit',
  component: AuditPage,
});

const consentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/consent',
  component: ConsentPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  patientsRoute,
  patientDetailRoute,
  appointmentsRoute,
  coursesRoute,
  reportsRoute,
  inventoryRoute,
  branchesRoute,
  auditRoute,
  consentRoute,
]);
