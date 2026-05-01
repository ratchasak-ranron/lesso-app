import { Outlet } from 'react-router-dom';
import { useLocale } from '@/lib/use-locale';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';

// No `HelmetProvider` here — `vite-react-ssg` wraps its SSR + browser render
// roots in one already (with the helmetContext it later reads via
// `extractHelmet`). Adding our own would shadow that context and prevent
// `<Helmet>` payloads from reaching the prerendered HTML.
export function RootLayout() {
  const locale = useLocale();
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <SiteHeader locale={locale} />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
