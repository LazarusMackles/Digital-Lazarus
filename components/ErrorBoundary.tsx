import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ui';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Initializing state using a class property is a more modern and concise
  // syntax. It avoids potential misconfigurations with `this` in the constructor
  // that can lead to "Property 'state' does not exist" errors.
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  // FIX: The 'render' method was defined as an arrow function, which can cause issues with TypeScript's type inference for 'this.props' in lifecycle methods. It has been converted to a standard class method to resolve the error.
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
