import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormError, FormStatus } from './form-feedback';

describe('FormError', () => {
  it('renders nothing when children is empty', () => {
    const { container } = render(<FormError>{null}</FormError>);
    expect(container).toBeEmptyDOMElement();
  });

  it('exposes role="alert" with assertive live-region', () => {
    render(<FormError>boom</FormError>);
    const el = screen.getByRole('alert');
    expect(el).toHaveTextContent('boom');
    expect(el).toHaveAttribute('aria-live', 'assertive');
  });

  it('forwards id for aria-describedby linkage', () => {
    render(<FormError id="x-err">boom</FormError>);
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'x-err');
  });
});

describe('FormStatus', () => {
  it('uses role="status" with polite live-region', () => {
    render(<FormStatus>saving</FormStatus>);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });
});
