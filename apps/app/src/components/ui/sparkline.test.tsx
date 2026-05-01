import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Sparkline } from './sparkline';

describe('Sparkline', () => {
  it('renders nothing when fewer than two data points', () => {
    const { container } = render(<Sparkline data={[]} ariaLabel="empty" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders an SVG with role=img and the supplied label', () => {
    const { container } = render(<Sparkline data={[1, 2, 3, 2]} ariaLabel="trend" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', 'trend');
  });

  it('handles a flat series without dividing by zero', () => {
    const { container } = render(<Sparkline data={[5, 5, 5]} ariaLabel="flat" />);
    const polyline = container.querySelector('polyline');
    expect(polyline).not.toBeNull();
    expect(polyline?.getAttribute('points') ?? '').toMatch(/^[\d., ]+$/);
  });
});
