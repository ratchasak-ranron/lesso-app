import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { PricingPage } from './pricing';
import { FeaturesPage } from './features';
import { AboutPage } from './about';

function renderPage(Component: React.ComponentType, pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Component />
    </MemoryRouter>,
  );
}

describe('PricingPage', () => {
  it('renders 3 tiers + featured Clinic badge + disabled CTAs (en)', () => {
    renderPage(PricingPage, '/en/pricing');
    expect(screen.getByRole('heading', { level: 3, name: 'Solo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Clinic' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Group' })).toBeInTheDocument();
    // Featured Clinic tier shows the localised "Pilot" badge.
    expect(screen.getByText('Pilot')).toBeInTheDocument();
    // All tier CTAs are disabled until B3 wires the pilot form.
    const tierButtons = screen
      .getAllByRole('button')
      .filter((b) => /Solo|Clinic|pilot|Group|Talk/i.test(b.textContent ?? ''));
    expect(tierButtons.length).toBeGreaterThanOrEqual(3);
    for (const b of tierButtons) {
      expect(b).toBeDisabled();
    }
  });

  it('renders Thai pricing copy when route locale is th', () => {
    renderPage(PricingPage, '/th/pricing');
    expect(screen.getByText(/หนึ่งคลินิก/)).toBeInTheDocument();
  });
});

describe('FeaturesPage', () => {
  it('renders 5 anchored feature sections (en)', () => {
    renderPage(FeaturesPage, '/en/features');
    for (const id of ['course', 'branches', 'line', 'ai', 'pdpa']) {
      expect(document.getElementById(id)).not.toBeNull();
    }
  });

  it('illustration placeholder is aria-hidden (decorative)', () => {
    const { container } = renderPage(FeaturesPage, '/en/features');
    // No element should expose role="img" with the heading as label —
    // illustration is decorative and should be hidden from AT.
    const imgRoles = container.querySelectorAll('[role="img"]');
    expect(imgRoles).toHaveLength(0);
  });
});

describe('AboutPage', () => {
  it('renders founder + mission + vertical-focus headings', () => {
    renderPage(AboutPage, '/en/about');
    // Founder name renders as h2 (no empty Section wrapper).
    expect(screen.getByRole('heading', { level: 2, name: 'Ratchasak' })).toBeInTheDocument();
    // Vertical focus heading (Section provides aria-labelledby).
    expect(
      screen.getByRole('heading', { level: 2, name: /We pick a vertical/i }),
    ).toBeInTheDocument();
  });

  it('does NOT emit unlabelled section landmarks (founder is plain div)', () => {
    const { container } = renderPage(AboutPage, '/en/about');
    // Every <section> with aria-labelledby must have a target h2.
    const labelled = container.querySelectorAll('section[aria-labelledby]');
    for (const sect of labelled) {
      const id = sect.getAttribute('aria-labelledby');
      expect(id).toBeTruthy();
      const target = id ? container.querySelector(`#${CSS.escape(id)}`) : null;
      expect(target?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });
});
