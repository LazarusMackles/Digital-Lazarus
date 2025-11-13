import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ui';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Replaced the constructor with a class property for state initialization.
  // The original constructor was causing type errors where `state` and `props` were not found on
  // the component type. This more modern syntax explicitly defines the state on the class
  // instance, resolving the issue.
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
