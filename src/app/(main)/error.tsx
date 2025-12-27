'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/shared/error-boundary';

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Main layout error:', error);
  }, [error]);

  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Something went wrong"
      description="We encountered an error while loading this page. Please try again."
    />
  );
}
