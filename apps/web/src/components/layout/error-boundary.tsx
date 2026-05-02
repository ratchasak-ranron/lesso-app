import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  readonly hasError: boolean;
  readonly error: Error | null;
}

interface ErrorFallbackProps {
  error: Error | null;
}

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback: (props: ErrorFallbackProps) => ReactNode;
}

/**
 * Render-phase error boundary for the marketing site. Catches crashes in
 * route components during client-side navigation and renders a branded
 * fallback UI. Does NOT catch:
 *   - Errors in event handlers (`onClick`, etc.)
 *   - Async errors (use `window.addEventListener('unhandledrejection', ...)`)
 *   - SSR errors (vite-react-ssg build step — those fail the build outright)
 *
 * Class component is intentional — React 18 has no hooks-equivalent.
 * Production logging hook lives in `componentDidCatch`; wire to Sentry /
 * Datadog when the backend phase (A7+) lands.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback({ error: this.state.error });
    }
    return this.props.children;
  }
}
