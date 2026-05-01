// Hand-authored route tree (A4 — 8 routes).
// File-based generation via @tanstack/router-plugin/vite is deferred until the
// route count crosses ~10 or nested routes proliferate. Filename retained as
// `routeTree.gen.ts` so the generator can overwrite this file in place later.
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

export const routeTree = rootRoute.addChildren([
  indexRoute,
  patientsRoute,
  patientDetailRoute,
  appointmentsRoute,
  coursesRoute,
  reportsRoute,
  inventoryRoute,
  branchesRoute,
]);
