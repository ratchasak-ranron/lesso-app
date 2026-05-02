import { lazy, Suspense, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { FeedbackButton } from './feedback-button';
import { BottomTabBar } from './bottom-tab-bar';

// Show DevToolbar whenever mocks are enabled (DEV always; PROD only when
// VITE_ENABLE_MOCKS=true). Lazy-load so the mock-server bundle is excluded
// when mocks are off. Vite dead-code-eliminates the dynamic import when
// `SHOW_DEV_TOOLBAR` is `false` at build time.
const SHOW_DEV_TOOLBAR =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS === 'true';
const DevToolbar = SHOW_DEV_TOOLBAR
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
          // <sm: reserve space for the BottomTabBar (~56 px + safe-area).
          // sm+: no tab bar — fall back to the standard page padding.
          className="flex-1 p-4 pb-28 sm:p-6 sm:pb-6 lg:p-8 lg:pb-8"
        >
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
      <BottomTabBar />
      <FeedbackButton />
      {SHOW_DEV_TOOLBAR && DevToolbar ? (
        <Suspense fallback={null}>
          <DevToolbar />
        </Suspense>
      ) : null}
    </div>
  );
}
