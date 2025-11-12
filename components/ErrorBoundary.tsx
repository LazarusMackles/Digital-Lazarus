import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ui';

interface Props {
  // FIX: Made children optional to resolve the type error in App.tsx. An ErrorBoundary
  // without children is valid, even if not useful.
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Added a constructor to explicitly call super(props) and initialize state.
  // This ensures `this.props` is correctly typed and available on the component instance,
  // resolving the error in the render method.
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