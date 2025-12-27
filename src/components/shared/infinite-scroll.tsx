'use client';

import { useEffect, useRef, useCallback, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from './spinner';
import { cn } from '@/lib/utils';

interface InfiniteScrollProps {
  children: ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  isError?: boolean;
  onLoadMore: () => void;
  onRetry?: () => void;
  threshold?: number;
  rootMargin?: string;
  loadingComponent?: ReactNode;
  endMessage?: ReactNode;
  errorMessage?: string;
  className?: string;
}

export function InfiniteScroll({
  children,
  hasMore,
  isLoading,
  isError = false,
  onLoadMore,
  onRetry,
  threshold = 0.1,
  rootMargin = '100px',
  loadingComponent,
  endMessage,
  errorMessage = 'Failed to load more items',
  className,
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target?.isIntersecting && hasMore && !isLoading && !isError) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, isError, onLoadMore]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold, rootMargin]);

  return (
    <div className={className}>
      {children}

      {/* Intersection observer target */}
      <div ref={loadMoreRef} className="w-full">
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-8">
            {loadingComponent || <Spinner size="lg" />}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                Try again
              </Button>
            )}
          </div>
        )}

        {/* End of list */}
        {!hasMore && !isLoading && !isError && (
          <div className="py-8 text-center">
            {endMessage || (
              <p className="text-sm text-muted-foreground">
                You&apos;ve reached the end
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Load more button (manual trigger alternative)
interface LoadMoreButtonProps {
  hasMore: boolean;
  isLoading: boolean;
  isError?: boolean;
  onLoadMore: () => void;
  onRetry?: () => void;
  className?: string;
}

export function LoadMoreButton({
  hasMore,
  isLoading,
  isError = false,
  onLoadMore,
  onRetry,
  className,
}: LoadMoreButtonProps) {
  if (!hasMore && !isError) {
    return (
      <div className={cn('py-4 text-center', className)}>
        <p className="text-sm text-muted-foreground">No more items to load</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('flex flex-col items-center gap-2 py-4', className)}>
        <p className="text-sm text-destructive">Failed to load more</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex justify-center py-4', className)}>
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={isLoading}
        className="min-w-[120px]"
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Loading...
          </>
        ) : (
          'Load more'
        )}
      </Button>
    </div>
  );
}

// Hook for managing infinite scroll state with TanStack Query
export function useInfiniteScrollState<T>({
  pages,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  isError,
  refetch,
}: {
  pages: T[][] | undefined;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isError: boolean;
  refetch: () => void;
}) {
  const items = pages?.flat() ?? [];

  return {
    items,
    hasMore: hasNextPage,
    isLoading: isFetchingNextPage,
    isError,
    onLoadMore: fetchNextPage,
    onRetry: refetch,
  };
}

// Virtualized scroll container for large lists
export function VirtualizedScrollContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('overflow-auto', className)}>
      {children}
    </div>
  );
}
