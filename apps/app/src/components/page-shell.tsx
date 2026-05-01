import { lazy, Suspense, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';

// Lazy-load dev toolbar so mock-server bundle only ships in DEV.
// Vite guarantees the dynamic-import chunk is excluded when the static
// `import.meta.env.DEV` branch is dead-code-eliminated in production.
const DevToolbar = import.meta.env.DEV
  ? lazy(() => import('./dev-toolbar').then((m) => ({ default: m.DevToolbar })))
  : null;

interface PageShellProps {
  children: ReactNode;
  title: string;
}

export function PageShell({ children, title }: PageShellProps) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Skip-to-main keyboard shortcut for screen-reader / Tab users. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t('common.skipToMain')}
      </a>
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar title={title} />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 pb-32 md:p-6 lg:p-8"
        >
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
      {DevToolbar ? (
        <Suspense fallback={null}>
          <DevToolbar />
        </Suspense>
      ) : null}
    </div>
  );
}
