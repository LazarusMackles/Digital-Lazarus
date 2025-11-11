import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// FIX: The errors indicate that the ErrorBoundary was not a valid class component.
// React Error Boundaries must be class components to use lifecycle methods like
// `getDerivedStateFromError` and `componentDidCatch`. This implementation converts
// the component to a proper class that extends `React.Component`, which resolves
// the errors related to accessing `this.state` and `this.props`.
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
