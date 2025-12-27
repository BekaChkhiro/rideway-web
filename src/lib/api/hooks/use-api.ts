import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  type UseQueryOptions,
  type QueryKey,
} from '@tanstack/react-query';
import { api } from '../client';

// Types for pagination
interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

// Factory for creating typed query hooks
export function createQueryHook<TData, TParams = void>(
  queryKey: QueryKey | ((params: TParams) => QueryKey),
  fetcher: (params: TParams) => Promise<TData>,
  defaultOptions?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
) {
  return function useCustomQuery(
    params: TParams,
    options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
  ) {
    const key = typeof queryKey === 'function' ? queryKey(params) : queryKey;

    return useQuery({
      queryKey: key,
      queryFn: () => fetcher(params),
      ...defaultOptions,
      ...options,
    });
  };
}

// Factory for creating typed mutation hooks with auto-invalidation
export function createMutationHook<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidateKeys?: QueryKey[]
) {
  return function useCustomMutation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn,
      onSuccess: () => {
        if (invalidateKeys) {
          invalidateKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: key });
          });
        }
      },
    });
  };
}

// Factory for creating infinite query hooks
export function createInfiniteQueryHook<TData>(
  queryKey: QueryKey,
  fetcher: (params: PaginationParams) => Promise<PaginatedResponse<TData>>
) {
  return function useInfiniteCustomQuery(
    params?: Omit<PaginationParams, 'page'>
  ) {
    return useInfiniteQuery({
      queryKey: [...queryKey, params],
      queryFn: ({ pageParam }) =>
        fetcher({
          ...params,
          page: pageParam as number,
          limit: (params?.limit as number) || 20,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage: PaginatedResponse<TData>) => {
        if (lastPage.meta.page < lastPage.meta.totalPages) {
          return lastPage.meta.page + 1;
        }
        return undefined;
      },
    });
  };
}

// Generic GET hook
export function useApiGet<TData>(
  endpoint: string,
  queryKey: QueryKey,
  params?: Record<string, string | number | boolean | undefined>,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => api.get<TData>(endpoint, params),
    ...options,
  });
}

// Generic POST hook with auto-invalidation
export function useApiPost<TData, TVariables>(
  endpoint: string,
  invalidateKeys?: QueryKey[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TVariables) => api.post<TData>(endpoint, variables),
    onSuccess: () => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
  });
}

// Generic PATCH hook with auto-invalidation
export function useApiPatch<TData, TVariables>(
  endpoint: string,
  invalidateKeys?: QueryKey[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TVariables) =>
      api.patch<TData>(endpoint, variables),
    onSuccess: () => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
  });
}

// Generic DELETE hook with auto-invalidation
export function useApiDelete<TData>(
  endpoint: string,
  invalidateKeys?: QueryKey[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete<TData>(endpoint),
    onSuccess: () => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
  });
}

// Hook for file upload with auto-invalidation
export function useApiUpload<TData>(
  endpoint: string,
  invalidateKeys?: QueryKey[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => api.upload<TData>(endpoint, formData),
    onSuccess: () => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
  });
}

// Hook for optimistic updates
export function useOptimisticMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  queryKey: QueryKey,
  optimisticUpdate: (old: TData | undefined, variables: TVariables) => TData
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update
      queryClient.setQueryData<TData>(queryKey, (old) =>
        optimisticUpdate(old, variables)
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
