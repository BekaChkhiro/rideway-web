'use client';

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { StoryBar } from '@/components/feed/story-bar';
import { PostForm } from '@/components/feed/post-form';
import { PostCard, PostCardSkeleton } from '@/components/feed/post-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { getFeed } from '@/lib/api';
import type { Post } from '@/types';

export default function FeedPage() {
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts', 'feed'],
    queryFn: ({ pageParam = 1 }) => getFeed(pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Auto-load more when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  const handlePostCreated = (newPost: Post) => {
    // Optimistically add the new post to the feed
    queryClient.setQueryData(['posts', 'feed'], (oldData: typeof data) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page, index) => {
          if (index === 0) {
            return {
              ...page,
              posts: [newPost, ...page.posts],
            };
          }
          return page;
        }),
      };
    });
  };

  const handlePostDeleted = (postId: string) => {
    queryClient.setQueryData(['posts', 'feed'], (oldData: typeof data) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          posts: page.posts.filter((p) => p.id !== postId),
        })),
      };
    });
  };

  const handleLikeToggle = (
    postId: string,
    isLiked: boolean,
    likesCount: number
  ) => {
    queryClient.setQueryData(['posts', 'feed'], (oldData: typeof data) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          posts: page.posts.map((p) =>
            p.id === postId ? { ...p, isLiked, likesCount } : p
          ),
        })),
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Stories */}
      <StoryBar className="bg-card rounded-xl" />

      {/* Create Post */}
      <PostForm onSuccess={handlePostCreated} />

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            ვერ ჩაიტვირთა პოსტები
          </p>
          <Button onClick={() => refetch()}>ხელახლა ცდა</Button>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="ჯერ არ არის პოსტები"
          description="გამოიწერე მომხმარებლები რომ ნახო მათი პოსტები, ან თვითონ დაწერე პირველი პოსტი!"
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handlePostDeleted}
              onLikeToggle={handleLikeToggle}
            />
          ))}

          {/* Load more trigger */}
          <div ref={ref} className="py-4 flex justify-center">
            {isFetchingNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
