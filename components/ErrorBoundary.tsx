import React from 'react';
import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Reverted to class field state initialization. The constructor-based approach
  // was causing type errors where `this.props` and `this.state` were not
  // recognized on the component instance. The class field syntax is a standard
  // and more concise way to achieve the same result and resolves the issue.
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
