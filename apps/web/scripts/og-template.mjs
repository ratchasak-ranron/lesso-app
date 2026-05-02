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
  bone: '#F5F2EC',
  cream: '#FAF7F1',
  slate: '#1F2328',
  sage: '#5A7060',
  clay: '#A85F3F',
  mist: '#A89E84',
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
        background: BRAND.bone,
        borderLeft: `12px solid ${BRAND.slate}`,
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: 28,
              color: BRAND.sage,
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
              color: BRAND.slate,
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
              color: BRAND.slate,
              fontWeight: 600,
            },
            children: 'Reinly · getreinly.com',
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
        background: BRAND.slate,
        color: BRAND.bone,
        fontFamily: 'Playfair Display',
        fontSize: Math.round(size * 0.55),
        fontWeight: 700,
        lineHeight: 1,
      },
      children: 'r',
    },
  };
}
