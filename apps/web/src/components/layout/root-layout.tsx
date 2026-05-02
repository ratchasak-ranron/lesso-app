import { Outlet } from 'react-router-dom';
import { useResolvedLocale } from '@/lib/use-locale';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';
import { ErrorBoundary } from './error-boundary';

interface ErrorFallbackProps {
  error: Error | null;
}

function ErrorFallback({ error }: ErrorFallbackProps) {
  const { t, locale } = useResolvedLocale();
  return (
    <section
      role="alert"
      className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <p className="font-heading text-7xl font-semibold text-primary">{t('error.heading')}</p>
      <p className="text-lg text-muted-foreground">{t('error.body')}</p>
      {error && import.meta.env?.DEV ? (
        <pre className="max-w-full overflow-auto rounded bg-muted p-4 text-left text-xs">
          {error.message}
        </pre>
      ) : null}
      <a
        href={`/${locale}`}
        className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {t('error.cta')}
      </a>
    </section>
  );
}

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
        <ErrorBoundary fallback={(p) => <ErrorFallback {...p} />}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
