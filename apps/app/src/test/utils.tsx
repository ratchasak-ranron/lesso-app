import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  createMemoryHistory,
  Outlet,
} from '@tanstack/react-router';
import { render, type RenderOptions } from '@testing-library/react';
import i18n from '@/lib/i18n';

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function ProvidersWrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </QueryClientProvider>
  );
}

/**
 * Default test renderer for components that don't depend on router context.
 * Wraps with QueryClient + i18n only (cheap, fast).
 */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(<ProvidersWrapper>{ui}</ProvidersWrapper>, options);
}

/**
 * Use for components that render `<Link>` / `useNavigate` / `useRouter`.
 * Builds a memory-history router with the UI mounted at `/`.
 */
export function renderWithRouter(ui: ReactElement, options?: RenderOptions) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <>{ui}</>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return render(
    <ProvidersWrapper>
      <RouterProvider router={router} />
    </ProvidersWrapper>,
    options,
  );
}
