
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

  // FIX: Converted `render` from a class property arrow function to a standard class method.
  // The `render` method is a lifecycle method in React, and defining it as a standard method
  // is the idiomatic approach. React ensures `this` is correctly bound for lifecycle methods,
  // resolving the type error where `this.props` was not accessible.
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
