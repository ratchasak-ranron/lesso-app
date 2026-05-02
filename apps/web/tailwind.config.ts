import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import { reinlyPreset } from '@reinly/ui-tokens/tailwind-preset';

export default {
  presets: [reinlyPreset],
  content: ['./index.html', './src/**/*.{ts,tsx,mdx}'],
  plugins: [animate],
} satisfies Config;
