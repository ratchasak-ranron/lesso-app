import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SelectableCard } from './selectable-card';

describe('SelectableCard', () => {
  it('renders as a button with the supplied accessible name', () => {
    render(
      <SelectableCard ariaLabel="Khun A, 0812345678, valid">
        <span>row content</span>
      </SelectableCard>,
    );
    const btn = screen.getByRole('button', { name: 'Khun A, 0812345678, valid' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('row content');
  });

  it('reflects selected state via aria-pressed', () => {
    render(
      <SelectableCard ariaLabel="row" selected>
        x
      </SelectableCard>,
    );
    expect(screen.getByRole('button', { name: 'row' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('fires onClick', async () => {
    const onClick = vi.fn();
    render(
      <SelectableCard ariaLabel="row" onClick={onClick}>
        x
      </SelectableCard>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'row' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
