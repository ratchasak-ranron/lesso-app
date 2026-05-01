import type { RouteObject } from 'react-router-dom';
import { RootLayout } from '@/components/layout/root-layout';
import { HomePage } from '@/pages/home';
import { NotFoundPage } from '@/pages/not-found';
import { siteConfig } from '@/lib/site-config';

// Each locale gets an explicit `/<locale>` parent route so vite-react-ssg
// prerenders both `/en.html` and `/th.html`. We do NOT register a `/`
// index route — Vercel's redirect (`/` → `/en`, see `vercel.json`) is the
// only entry point at the root, so a prerendered `/index.html` would only
// be a duplicate of `/en.html` (same canonical) and cause a duplicate-
// content SEO issue. Wildcard 404 routes are NOT prerendered; they only
// render at runtime.
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
    path: '*',
    element: <RootLayout />,
    children: [{ index: true, element: <NotFoundPage /> }],
  },
];
