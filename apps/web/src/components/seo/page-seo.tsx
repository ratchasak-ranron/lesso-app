import type { Locale } from '@/lib/site-config';

interface PageSeoProps {
  title: string;
  description: string;
  path: string;
  locale: Locale;
}

/**
 * `react-helmet-async` and `vite-react-ssg` ship two separate helmet copies
 * that split the React context — Helmet payloads never reach the prerendered
 * HTML. We compute the SEO meta deterministically per locale in
 * `vite.config.ts → ssgOptions.onPageRendered`, where the route string is
 * the source of truth and `siteConfig` carries the rest. This component is
 * intentionally a no-op so route code keeps the same shape and a future
 * helmet rewire is one diff away.
 */
export function PageSeo(_props: PageSeoProps): null {
  return null;
}
