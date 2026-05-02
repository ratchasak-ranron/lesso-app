import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { EditorialHero } from './editorial-hero';

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <EditorialHero />
    </MemoryRouter>,
  );
}

describe('EditorialHero', () => {
  it('renders eyebrow + h1 + rule + CTA + trust strip in EN locale', () => {
    renderAt('/en');

    // Eyebrow paragraph (uppercase + tracking)
    expect(screen.getByText('Premium care · Nature distilled')).toBeInTheDocument();

    // H1 contains both lines (the second wrapped in italic span)
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Less cost.');
    expect(heading).toHaveTextContent('More care.');
    expect(heading.querySelector('span.italic')).not.toBeNull();

    // Decorative HR rule with aria-hidden
    const hr = document.querySelector('hr[aria-hidden="true"]');
    expect(hr).not.toBeNull();

    // CTA button — disabled, uses translated label
    const cta = screen.getByRole('button', { name: /Join the pilot/i });
    expect(cta).toBeDisabled();

    // Trust strip — 3 list items
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(screen.getByText('PDPA compliant')).toBeInTheDocument();
    expect(screen.getByText('Thai-first')).toBeInTheDocument();
    expect(screen.getByText('No lock-in')).toBeInTheDocument();
  });

  it('renders Thai content when route locale is th', () => {
    renderAt('/th');

    expect(screen.getByText(/ดูแลระดับพรีเมียม/)).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('ลดต้นทุน');
    expect(heading).toHaveTextContent('เพิ่มคุณภาพการดูแล');
  });
});
