import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// FIX: To function as an error boundary, this class must extend React.Component.
// This provides access to `this.state`, `this.props`, and component lifecycle methods, resolving the errors.
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

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
