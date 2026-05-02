import type { RouteObject } from 'react-router-dom';
import { RootLayout } from '@/components/layout/root-layout';
import { HomePage } from '@/pages/home';
import { PricingPage } from '@/pages/pricing';
import { FeaturesPage } from '@/pages/features';
import { AboutPage } from '@/pages/about';
import { PilotPage } from '@/pages/pilot';
import { PrivacyPage } from '@/pages/privacy';
import { TermsPage } from '@/pages/terms';
import { BlogIndexPage } from '@/pages/blog';
import { NotFoundPage } from '@/pages/not-found';
import { siteConfig } from '@/lib/site-config';

// Each locale gets an explicit `/<locale>` parent route so vite-react-ssg
// prerenders the index + each child as its own static HTML. We do NOT
// register a `/` index route — Vercel's redirect (`/` → `/en`, see
// `vercel.json`) is the only entry point at the root, so a prerendered
// `/index.html` would only be a duplicate of `/en.html` (same canonical)
// and cause a duplicate-content SEO issue. Wildcard 404 routes are NOT
// prerendered; they only render at runtime.
const localeRoutes: RouteObject[] = siteConfig.locales.map((locale) => ({
  path: `/${locale}`,
  element: <RootLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: 'pricing', element: <PricingPage /> },
    { path: 'features', element: <FeaturesPage /> },
    { path: 'about', element: <AboutPage /> },
    { path: 'pilot', element: <PilotPage /> },
    { path: 'privacy', element: <PrivacyPage /> },
    { path: 'terms', element: <TermsPage /> },
    { path: 'blog', element: <BlogIndexPage /> },
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
