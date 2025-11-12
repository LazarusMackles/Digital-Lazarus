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
  // FIX: Reverted to class property state initialization instead of a constructor.
  // The TypeScript errors suggest `this.state` is not being correctly inferred on the
  // component instance. Using a class property explicitly defines `state` on `ErrorBoundary`
  // and is a modern, standard approach that resolves this type of configuration issue.
  state: State = { hasError: false };

  // FIX: Added an explicit constructor to ensure the type system correctly recognizes
  // that `this.props` is initialized by the parent `React.Component` constructor. This
  // resolves the "Property 'props' does not exist" error.
  constructor(props: Props) {
    super(props);
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
