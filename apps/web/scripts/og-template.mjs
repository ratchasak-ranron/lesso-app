// Build-time OG image template (Satori JSX-as-object).
//
// SATORI CONSTRAINTS (vital — break silently):
// - flexbox only; `display: 'grid'` produces broken output with no error
// - every container needs `display: 'flex'` even with one child (default
//   is `block`, which breaks layout silently)
// - Tailwind classes are ignored — every style must be inline `style={{}}`
// - WOFF / TTF only — no WOFF2 support
// - `fontFamily` must match `fonts[].name` exactly
// - hex colours intentional here (build-time, isolated from runtime tokens)

const BRAND = {
  cream: '#FAF7F2',
  teal: '#134E4A',
  terracotta: '#A45A3D',
  ink: '#1A1A1A',
};

export function ogTemplate({ title, eyebrow }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '630px',
        padding: '80px',
        background: BRAND.cream,
        borderLeft: `12px solid ${BRAND.teal}`,
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: 28,
              color: BRAND.terracotta,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              marginBottom: '40px',
            },
            children: eyebrow,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: 96,
              fontFamily: 'Playfair Display',
              color: BRAND.ink,
              lineHeight: 1.05,
              fontWeight: 700,
              flex: 1,
            },
            children: title,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: 32,
              color: BRAND.teal,
              fontWeight: 600,
            },
            children: 'Lesso · lesso.clinic',
          },
        },
      ],
    },
  };
}

export function iconTemplate({ size }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        background: BRAND.teal,
        color: BRAND.cream,
        fontFamily: 'Playfair Display',
        fontSize: Math.round(size * 0.55),
        fontWeight: 700,
        lineHeight: 1,
      },
      children: 'L',
    },
  };
}
