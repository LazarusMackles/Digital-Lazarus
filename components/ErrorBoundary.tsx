import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ui';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Switched to class property syntax for state initialization.
  // The constructor-based approach was causing type errors where `this.state` and `this.props`
  // were not being recognized. This is a more modern approach and resolves the `this` context issue.
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
