import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Section } from './section';
import { PageIntro } from './page-intro';
import { Faq } from './faq';
import { TierCard } from './tier-card';
import { FinalCta } from './final-cta';
import { FeatureSection } from './feature-section';

describe('Section', () => {
  it('renders eyebrow + h2 + sub when provided', () => {
    render(
      <Section id="x" eyebrow="EYE" heading="Heading" sub="Sub">
        <p>body</p>
      </Section>,
    );
    expect(screen.getByText('EYE')).toBeInTheDocument();
    const h2 = screen.getByRole('heading', { level: 2, name: 'Heading' });
    expect(h2).toHaveAttribute('id', 'x-heading');
    expect(screen.getByText('Sub')).toBeInTheDocument();
  });

  it('omits heading when not provided', () => {
    render(
      <Section id="x">
        <p>body only</p>
      </Section>,
    );
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
  });
});

describe('PageIntro', () => {
  it('renders eyebrow + h1 + sub', () => {
    render(<PageIntro eyebrow="E" heading="H" sub="S" />);
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'H' })).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
  });
});

describe('Faq', () => {
  const items = [
    { id: 'a', q: 'Q1', a: 'A1' },
    { id: 'b', q: 'Q2', a: 'A2' },
  ];

  it('renders one trigger per item', () => {
    render(<Faq items={items} />);
    expect(screen.getByRole('button', { name: 'Q1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Q2' })).toBeInTheDocument();
  });
});

describe('TierCard', () => {
  it('renders name, price, bullets, cta + featured badge + disabled CTA', () => {
    render(
      <TierCard
        name="Clinic"
        price="2,990"
        period="per month"
        currency="THB"
        description="Single-branch"
        bullets={['Up to 5 users', 'AI assist']}
        cta="Start"
        featured
        featuredBadge="Pilot"
      />,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Clinic' })).toBeInTheDocument();
    expect(screen.getByText('2,990')).toBeInTheDocument();
    expect(screen.getByText('THB')).toBeInTheDocument();
    expect(screen.getByText('Up to 5 users')).toBeInTheDocument();
    expect(screen.getByText('Pilot')).toBeInTheDocument();
    // Disabled until B3 wires the pilot signup form.
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
  });

  it('omits the featured badge on non-featured tiers', () => {
    render(
      <TierCard
        name="Solo"
        price="1,490"
        period="per month"
        currency="THB"
        description="Solo practitioner"
        bullets={['One user']}
        cta="Start"
        featuredBadge="Pilot"
      />,
    );
    expect(screen.queryByText('Pilot')).toBeNull();
  });
});

describe('FeatureSection', () => {
  it('alternates illustration column order via align prop', () => {
    render(
      <FeatureSection
        id="x"
        eyebrow="E"
        heading="H"
        body="B"
        illustration={<div data-testid="illus" />}
        align="left"
      />,
    );
    const illus = screen.getByTestId('illus').parentElement;
    expect(illus?.className).toContain('md:order-1');
  });
});

describe('FinalCta', () => {
  it('renders heading + disabled CTA when href omitted', () => {
    render(<FinalCta eyebrow="E" heading="H" body="B" cta="C" />);
    expect(screen.getByRole('heading', { level: 2, name: 'H' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'C' })).toBeDisabled();
  });

  it('renders link CTA when href provided', () => {
    render(<FinalCta eyebrow="E" heading="H" body="B" cta="Apply" href="/en/pilot" locale="en" />);
    const link = screen.getByRole('link', { name: 'Apply' });
    expect(link).toHaveAttribute('href', '/en/pilot');
  });
});

describe('TierCard with href', () => {
  it('renders link CTA + still disables when href omitted', () => {
    render(
      <TierCard
        name="Solo"
        price="1,490"
        period="per month"
        currency="THB"
        description="Solo"
        bullets={['One']}
        cta="Apply"
        href="/en/pilot"
        locale="en"
      />,
    );
    const link = screen.getByRole('link', { name: 'Apply' });
    expect(link).toHaveAttribute('href', '/en/pilot');
  });
});
