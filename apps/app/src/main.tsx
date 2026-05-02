import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

async function enableMocking(): Promise<void> {
  // Gated on `VITE_ENABLE_MOCKS` only. Prototype phase ships MSW to
  // production so the demo deploy works without a backend; flip the env
  // var to `false` once the Supabase adapter is wired up (Phase A7+).
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'true') return;
  const { worker, seedIfEmpty } = await import('@reinly/mock-server');
  seedIfEmpty();
  await worker.start({ onUnhandledRequest: 'bypass' });
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
