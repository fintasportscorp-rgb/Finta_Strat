import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Unhandled application error:', error, info.componentStack);
  }

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="display-caps text-2xl font-bold text-loss">Something went wrong</h1>
          <p className="max-w-md text-ink-muted">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-11 rounded-md bg-accent px-5 font-display font-semibold text-on-accent transition-colors duration-200 hover:bg-accent-hover"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
