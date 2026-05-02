import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from './error-boundary';

function Bomb({ msg }: { msg: string }): never {
  throw new Error(msg);
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary fallback={() => <p>fallback</p>}>
        <p>kids</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('kids')).toBeInTheDocument();
  });

  it('renders fallback with error info on render-phase throw', () => {
    // React + the boundary log to console.error on a caught throw — quiet.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={({ error }) => <p>{`caught: ${error?.message ?? ''}`}</p>}>
        <Bomb msg="boom" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('caught: boom')).toBeInTheDocument();
    spy.mockRestore();
  });
});
