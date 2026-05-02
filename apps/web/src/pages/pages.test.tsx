import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { PricingPage } from './pricing';
import { FeaturesPage } from './features';
import { AboutPage } from './about';
import { PilotPage } from './pilot';
import { PrivacyPage } from './privacy';
import { TermsPage } from './terms';
import { BlogIndexPage } from './blog';

function renderPage(Component: React.ComponentType, pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Component />
    </MemoryRouter>,
  );
}

describe('PricingPage', () => {
  it('renders 3 tiers + featured Clinic badge + tier CTAs link to /pilot (en)', () => {
    renderPage(PricingPage, '/en/pricing');
    expect(screen.getByRole('heading', { level: 3, name: 'Solo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Clinic' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Group' })).toBeInTheDocument();
    // Featured Clinic tier shows the localised "Pilot" badge.
    expect(screen.getByText('Pilot')).toBeInTheDocument();
    // After B3, tier CTAs are links to /{locale}/pilot.
    const pilotLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/en/pilot');
    expect(pilotLinks.length).toBeGreaterThanOrEqual(3);
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

describe('PilotPage', () => {
  it('renders form with all fields (en)', () => {
    renderPage(PilotPage, '/en/pilot');
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open my email' })).toBeInTheDocument();
    // Privacy + Terms links inline in the form section.
    const links = screen.getAllByRole('link');
    expect(links.some((a) => a.getAttribute('href') === '/en/privacy')).toBe(true);
    expect(links.some((a) => a.getAttribute('href') === '/en/terms')).toBe(true);
  });

  it('renders Thai copy at /th/pilot', () => {
    renderPage(PilotPage, '/th/pilot');
    expect(screen.getByText(/รุ่น Q3 2026/)).toBeInTheDocument();
  });
});

describe('PrivacyPage', () => {
  it('renders DRAFT banner + 8 sections (en)', () => {
    const { container } = renderPage(PrivacyPage, '/en/privacy');
    expect(screen.getByRole('note')).toHaveTextContent('DRAFT');
    for (const id of ['scope', 'data', 'purpose', 'sharing', 'retention', 'rights', 'transfers', 'contact']) {
      expect(container.querySelector(`#${CSS.escape(`${id}-heading`)}`)).not.toBeNull();
    }
  });
});

describe('TermsPage', () => {
  it('renders DRAFT banner + 6 sections (en)', () => {
    const { container } = renderPage(TermsPage, '/en/terms');
    expect(screen.getByRole('note')).toHaveTextContent('DRAFT');
    for (const id of ['acceptance', 'pilot', 'use', 'ip', 'liability', 'termination']) {
      expect(container.querySelector(`#${CSS.escape(`${id}-heading`)}`)).not.toBeNull();
    }
  });
});

describe('BlogIndexPage', () => {
  it('renders intro + empty-state copy when no posts exist (en)', () => {
    renderPage(BlogIndexPage, '/en/blog');
    expect(
      screen.getByRole('heading', { level: 1, name: /Notes from the operator/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/First post lands when the pilot does/)).toBeInTheDocument();
  });

  it('renders Thai copy at /th/blog', () => {
    renderPage(BlogIndexPage, '/th/blog');
    expect(screen.getByText(/บันทึกจาก operator/)).toBeInTheDocument();
  });
});
