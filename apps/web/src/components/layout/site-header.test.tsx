import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { SiteHeader } from './site-header';

function renderAt(pathname: string, locale: 'en' | 'th') {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <SiteHeader locale={locale} />
    </MemoryRouter>,
  );
}

describe('SiteHeader', () => {
  it('renders the four primary nav links at /en', () => {
    renderAt('/en', 'en');
    const desktopNav = screen.getByLabelText('Primary navigation');
    const links = within(desktopNav).getAllByRole('link');
    expect(links.map((a) => a.textContent)).toEqual(['Home', 'Pricing', 'Features', 'About']);
  });

  it('marks the Pricing link aria-current=page when on /en/pricing', () => {
    renderAt('/en/pricing', 'en');
    const desktopNav = screen.getByLabelText('Primary navigation');
    const pricing = within(desktopNav).getByRole('link', { name: 'Pricing' });
    expect(pricing).toHaveAttribute('aria-current', 'page');
    const home = within(desktopNav).getByRole('link', { name: 'Home' });
    expect(home).not.toHaveAttribute('aria-current');
  });

  it('builds the locale-switch href that preserves the path', () => {
    renderAt('/en/features', 'en');
    const switchLink = screen.getByRole('link', { name: /Switch to ภาษาไทย/i });
    expect(switchLink).toHaveAttribute('href', '/th/features');
  });

  it('treats nested children as active when route starts with /<page>/', () => {
    renderAt('/th/about/team', 'th');
    const desktopNav = screen.getByLabelText('เมนูหลัก');
    const about = within(desktopNav).getByRole('link', { name: 'เกี่ยวกับ' });
    expect(about).toHaveAttribute('aria-current', 'page');
  });
});
