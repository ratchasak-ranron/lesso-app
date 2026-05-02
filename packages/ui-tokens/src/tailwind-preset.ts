import type { Config } from 'tailwindcss';

export const lessoPreset = {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // 16 px — used by surface containers (Card / KpiTile / SelectableCard
        // / Dialog / EmptyState). Buttons + inputs keep `lg` (8 px).
        card: 'var(--radius-card)',
      },
      boxShadow: {
        // Warm cream-tinted shadows so cards stay visible on the cream
        // background without the cool-grey "cold SaaS" look of `shadow-sm`.
        card: 'var(--shadow-card)',
        popover: 'var(--shadow-popover)',
      },
      fontFamily: {
        // Inter for Latin body. Noto Sans Thai handles Thai chars via the
        // automatic glyph-fallback chain (most browsers do per-glyph fallback).
        sans: ['Inter', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
        // Playfair Display for headings — italic accent reserved for the
        // marketing hero. Noto Sans Thai sits in the chain so Thai
        // headings get a sans fallback (Playfair has no Thai glyphs).
        heading: ['Playfair Display', 'Noto Sans Thai', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
} satisfies Partial<Config>;

export default lessoPreset;
