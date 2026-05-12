"use client";
import * as React from "react";
import { captureException } from "@/lib/error-tracking";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureException(error, { componentStack: info.componentStack ?? undefined });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
            <div>
              <h3 className="text-sm font-semibold text-destructive">
                Něco se pokazilo
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {this.state.error?.message}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-3 text-xs underline"
              >
                Zkusit znovu
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
