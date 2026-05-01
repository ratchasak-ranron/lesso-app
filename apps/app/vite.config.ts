import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { rm } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Removes the MSW service worker from the production build output.
 * The worker is required in `public/` for dev but must never ship to prod.
 */
function excludeMswWorkerFromBuild(): Plugin {
  return {
    name: 'lesso:exclude-msw-worker',
    apply: 'build',
    async closeBundle() {
      const target = resolve(__dirname, 'dist/mockServiceWorker.js');
      await rm(target, { force: true });
    },
  };
}

export default defineConfig({
  plugins: [react(), excludeMswWorkerFromBuild()],
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
