import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { SiteFooter } from './site-footer';

function renderAt(pathname: string, locale: 'en' | 'th') {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <SiteFooter locale={locale} />
    </MemoryRouter>,
  );
}

describe('SiteFooter', () => {
  it('renders Privacy + Terms links pointing to locale-prefixed routes (en)', () => {
    renderAt('/en', 'en');
    const nav = screen.getByLabelText('Legal links');
    expect(within(nav).getByRole('link', { name: 'Privacy' })).toHaveAttribute(
      'href',
      '/en/privacy',
    );
    expect(within(nav).getByRole('link', { name: 'Terms' })).toHaveAttribute(
      'href',
      '/en/terms',
    );
  });

  it('renders Thai legal labels at /th', () => {
    renderAt('/th', 'th');
    const nav = screen.getByLabelText('ลิงก์ทางกฎหมาย');
    expect(within(nav).getByRole('link', { name: 'นโยบายความเป็นส่วนตัว' })).toHaveAttribute(
      'href',
      '/th/privacy',
    );
    expect(within(nav).getByRole('link', { name: 'ข้อกำหนด' })).toHaveAttribute(
      'href',
      '/th/terms',
    );
  });
});
