import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Section } from './section';
import { PageIntro } from './page-intro';
import { Faq } from './faq';
import { TierCard } from './tier-card';
import { FinalCta } from './final-cta';

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
  it('renders eyebrow + h1 + sub + accent rule', () => {
    const { container } = render(<PageIntro eyebrow="E" heading="H" sub="S" />);
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'H' })).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(container.querySelector('hr[aria-hidden="true"]')).not.toBeNull();
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
  it('renders name, price, bullets, cta', () => {
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
      />,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Clinic' })).toBeInTheDocument();
    expect(screen.getByText('2,990')).toBeInTheDocument();
    expect(screen.getByText('THB')).toBeInTheDocument();
    expect(screen.getByText('Up to 5 users')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });
});

describe('FinalCta', () => {
  it('renders heading + disabled CTA', () => {
    render(<FinalCta eyebrow="E" heading="H" body="B" cta="C" />);
    expect(screen.getByRole('heading', { level: 2, name: 'H' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'C' })).toBeDisabled();
  });
});
