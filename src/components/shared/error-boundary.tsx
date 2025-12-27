'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          reset={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}

// Error fallback component
interface ErrorFallbackProps {
  error?: Error;
  reset?: () => void;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  reset,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        {error && process.env.NODE_ENV === 'development' && (
          <CardContent>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs font-mono text-muted-foreground break-all">
                {error.message}
              </p>
            </div>
          </CardContent>
        )}

        <CardFooter className="flex gap-2 justify-center">
          {reset && (
            <Button onClick={reset} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/feed">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// 404 Not Found component
export function NotFound({
  title = 'Page not found',
  description = "The page you're looking for doesn't exist or has been moved.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 text-8xl font-bold text-muted-foreground/50">
            404
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/feed">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Empty state component
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center p-8 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
