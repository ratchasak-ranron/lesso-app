import type { RouteObject } from 'react-router-dom';
import { RootLayout } from '@/components/layout/root-layout';
import { HomePage } from '@/pages/home';
import { NotFoundPage } from '@/pages/not-found';
import { siteConfig } from '@/lib/site-config';

// Each locale gets an explicit `/<locale>` parent route so vite-react-ssg
// prerenders both `/en/index.html` and `/th/index.html`. Wildcard routes
// are NOT prerendered — they only render at runtime, which is fine for 404.
const localeRoutes: RouteObject[] = siteConfig.locales.map((locale) => ({
  path: `/${locale}`,
  element: <RootLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: '*', element: <NotFoundPage /> },
  ],
}));

export const routes: RouteObject[] = [
  ...localeRoutes,
  {
    path: '/',
    element: <RootLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
  {
    path: '*',
    element: <RootLayout />,
    children: [{ index: true, element: <NotFoundPage /> }],
  },
];
