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

        // Section accents. Use bare token for surface fill, `-ink` for
        // text-on-bone, `-soft` for wash backgrounds.
        indigo: {
          DEFAULT: 'hsl(var(--indigo))',
          ink: 'hsl(var(--indigo-ink))',
          soft: 'hsl(var(--indigo-soft))',
        },
        sky: {
          DEFAULT: 'hsl(var(--sky))',
          ink: 'hsl(var(--sky-ink))',
          soft: 'hsl(var(--sky-soft))',
        },
        emerald: {
          DEFAULT: 'hsl(var(--emerald))',
          ink: 'hsl(var(--emerald-ink))',
          soft: 'hsl(var(--emerald-soft))',
        },
        violet: {
          DEFAULT: 'hsl(var(--violet))',
          ink: 'hsl(var(--violet-ink))',
          soft: 'hsl(var(--violet-soft))',
        },
        amber: {
          DEFAULT: 'hsl(var(--amber))',
          ink: 'hsl(var(--amber-ink))',
          soft: 'hsl(var(--amber-soft))',
        },
        rose: {
          DEFAULT: 'hsl(var(--rose))',
          ink: 'hsl(var(--rose-ink))',
          soft: 'hsl(var(--rose-soft))',
        },
        zinc: {
          DEFAULT: 'hsl(var(--zinc))',
          ink: 'hsl(var(--zinc-ink))',
          soft: 'hsl(var(--zinc-soft))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // 20px — surface containers (Card, KpiTile, Dialog).
        card: 'var(--radius-card)',
        // 10px — form inputs.
        input: 'var(--radius-input)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        popover: 'var(--shadow-popover)',
        hover: 'var(--shadow-hover)',
      },
      fontFamily: {
        // Geist Sans for Latin body + headings. IBM Plex Sans Thai Looped
        // handles Thai chars via per-glyph fallback. Multi-word names are
        // quoted to survive any CSS pipeline that splits unquoted
        // whitespace identifiers.
        sans: ['Geist', '"IBM Plex Sans Thai Looped"', 'system-ui', 'sans-serif'],
        // No separate display font — heading and body share the family,
        // using weight + size for hierarchy. Map `font-heading` to the
        // same chain so existing components compile.
        heading: ['Geist', '"IBM Plex Sans Thai Looped"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
} satisfies Partial<Config>;

export default reinlyPreset;
