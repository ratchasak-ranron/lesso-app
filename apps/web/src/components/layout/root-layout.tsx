import { Outlet } from 'react-router-dom';
import { useResolvedLocale } from '@/lib/use-locale';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';

// `vite-react-ssg` already wraps SSR + browser render roots in
// `HelmetProvider`. Adding our own would shadow the SSG-provided context
// and stop helmet payloads from reaching the prerendered HTML — see
// `vite.config.ts → ssgOptions.onPageRendered` for the SEO injection
// path that replaces Helmet.
export function RootLayout() {
  const { locale, t } = useResolvedLocale();
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t('common.skipToMain')}
      </a>
      <SiteHeader locale={locale} />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
