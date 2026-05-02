import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Note: mockServiceWorker.js IS shipped to production during the prototype
// phase so the demo deploy works without a backend. Once the Supabase
// adapter lands (Phase A7+), set `VITE_ENABLE_MOCKS=false` on Vercel and
// re-introduce the build-time strip.

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
  build: {
    sourcemap: 'hidden',
  },
});
