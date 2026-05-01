import { lazy, Suspense, type ReactNode } from 'react';
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
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar title={title} />
        <main className="flex-1 p-4 pb-32 md:p-6 lg:p-8">{children}</main>
      </div>
      {DevToolbar ? (
        <Suspense fallback={null}>
          <DevToolbar />
        </Suspense>
      ) : null}
    </div>
  );
}
