import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  // FIX: Replaced the constructor with modern class property syntax for state initialization.
  // This resolves errors where `this.state` and `this.props` were not being found on the component instance.
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
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
