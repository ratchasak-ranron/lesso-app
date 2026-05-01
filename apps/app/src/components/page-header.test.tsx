import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('renders title as a level-2 heading', () => {
    render(<PageHeader title="Patients" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Patients' })).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<PageHeader title="Audit" description="Tamper-evident log" />);
    expect(screen.getByText('Tamper-evident log')).toBeInTheDocument();
  });

  it('renders actions slot', () => {
    render(<PageHeader title="x" actions={<button type="button">act</button>} />);
    expect(screen.getByRole('button', { name: 'act' })).toBeInTheDocument();
  });
});
