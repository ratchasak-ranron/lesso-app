import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import { lessoPreset } from '@lesso/ui-tokens/tailwind-preset';

export default {
  presets: [lessoPreset],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  plugins: [animate],
} satisfies Config;
