import type { Config } from 'tailwindcss';

export const reinlyPreset = {
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
        // Brand sage — surface-only fill (#9CAE9F). Use for decorative
        // accents, divider tints, badges. Not text-safe on bone.
        sage: '#9CAE9F',
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
        // Bone-tinted shadows so cards stay visible on the warm bone/cream
        // background without the cool-grey "cold SaaS" look of `shadow-sm`.
        card: 'var(--shadow-card)',
        popover: 'var(--shadow-popover)',
      },
      fontFamily: {
        // Inter for Latin body. IBM Plex Sans Thai Looped handles Thai
        // chars via automatic per-glyph fallback (most browsers do this).
        // Looped Thai glyphs match the readability conventions Thai
        // clinic users expect — Western-style loopless sans (Noto Sans
        // Thai) reads cold/foreign in this context.
        sans: ['Inter', 'IBM Plex Sans Thai Looped', 'system-ui', 'sans-serif'],
        // Playfair Display for headings — italic accent reserved for
        // the marketing hero. Noto Serif Thai sits in the chain so Thai
        // headings get a serif fallback that matches the editorial feel
        // (Playfair Display has no Thai glyphs).
        heading: ['Playfair Display', 'Noto Serif Thai', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
} satisfies Partial<Config>;

export default reinlyPreset;
