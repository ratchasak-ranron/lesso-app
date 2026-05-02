import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PilotForm } from './pilot-form';

function renderForm(onSubmitted = vi.fn(), to = 'hello@lesso.clinic') {
  return render(
    <MemoryRouter initialEntries={['/en/pilot']}>
      <PilotForm to={to} onSubmitted={onSubmitted} />
    </MemoryRouter>,
  );
}

describe('PilotForm', () => {
  beforeEach(() => {
    // Stub window.location.href so submit assignment is observable.
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  it('renders all required fields with labels', () => {
    renderForm();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Clinic name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Number of branches')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    // Consent label points at the Radix Checkbox button.
    expect(screen.getByText(/I agree to the Privacy policy/)).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: 'Open my email' }));

    await waitFor(() => {
      expect(screen.getByText('Please enter your name.')).toBeInTheDocument();
    });
    expect(screen.getByText('Please enter your clinic name.')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email.')).toBeInTheDocument();
    expect(screen.getByText('You must agree to continue.')).toBeInTheDocument();
  });

  it('opens mailto and calls onSubmitted on valid submit', async () => {
    const user = userEvent.setup();
    const onSubmitted = vi.fn();
    renderForm(onSubmitted);

    await user.type(screen.getByLabelText('Full name'), 'Dr Somchai');
    await user.type(screen.getByLabelText('Clinic name'), 'Happy Smile');
    await user.type(screen.getByLabelText('Email'), 'somchai@example.com');
    await user.type(screen.getByLabelText('Number of branches'), '2');
    await user.type(screen.getByLabelText('Phone'), '0812345678');
    // Click the consent checkbox via its label text.
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Open my email' }));

    await waitFor(() => expect(onSubmitted).toHaveBeenCalledTimes(1));
    expect(window.location.href).toMatch(/^mailto:hello%40lesso\.clinic\?subject=/);
    expect(decodeURIComponent(window.location.href)).toContain('Dr Somchai');
    expect(decodeURIComponent(window.location.href)).toContain('somchai@example.com');
  });
});
