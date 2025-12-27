'use client';

import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api/client';

function handleGlobalError(error: unknown) {
  if (error instanceof ApiError) {
    // Don't show toast for 401 errors (handled by auth)
    if (error.status === 401) {
      return;
    }

    // Show user-friendly error messages
    switch (error.status) {
      case 403:
        toast.error('You do not have permission to perform this action');
        break;
      case 404:
        toast.error('The requested resource was not found');
        break;
      case 408:
        toast.error('Request timed out. Please try again.');
        break;
      case 429:
        toast.error('Too many requests. Please slow down.');
        break;
      case 500:
      case 502:
      case 503:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(error.message || 'An error occurred');
    }
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const onError = useCallback((error: Error) => {
    handleGlobalError(error);
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection time)
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors (except 408 timeout)
              if (error instanceof ApiError) {
                if (error.status >= 400 && error.status < 500 && error.status !== 408) {
                  return false;
                }
              }
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: (failureCount, error) => {
              // Don't retry mutations on 4xx errors
              if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                return false;
              }
              return failureCount < 1;
            },
            onError,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}

// Export for use in other parts of the app
export { handleGlobalError };
