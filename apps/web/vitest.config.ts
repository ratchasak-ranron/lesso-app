/// <reference types="vitest" />
import type { UserConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig as UserConfig,
  defineConfig({
    test: {
      // Component tests need a DOM; build-output tests run in node but jsdom
      // is harmless for them.
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
      css: false,
    },
  }),
);
