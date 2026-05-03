import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

async function enableMocking(): Promise<void> {
  // Gated on `VITE_ENABLE_MOCKS` only. Prototype phase ships MSW to
  // production so the demo deploy works without a backend; flip the env
  // var to `false` once the Supabase adapter is wired up (Phase A7+).
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'true') return;

  // Force SW update on every boot so stale prior-deploy workers (with
  // stale CSP / handler set) get replaced immediately. Without this, an
  // old SW controlling the tab keeps intercepting requests under the
  // previous deploy's policy until every tab closes.
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.update()));
  }

  const { worker, seedIfEmpty } = await import('@reinly/mock-server');
  seedIfEmpty();
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
      options: { updateViaCache: 'none' },
    },
  });
}

void enableMocking().then(() => {
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('#root not found');
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
