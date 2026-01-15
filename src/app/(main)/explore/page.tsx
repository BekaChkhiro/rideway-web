'use client';

import { useState, useEffect } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { TrendingUp, Hash, Loader2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { PostCard, PostCardSkeleton } from '@/components/feed/post-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getTrendingPosts, getTrendingHashtags } from '@/lib/api';
import { AdBanner } from '@/components/ads/ad-banner';
import type { Post } from '@/types';

export default function ExplorePage() {
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();
  const [activeTab, setActiveTab] = useState('trending');

  // Trending posts query
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isPostsLoading,
    isError: isPostsError,
    refetch: refetchPosts,
  } = useInfiniteQuery({
    queryKey: ['posts', 'trending'],
    queryFn: ({ pageParam = 1 }) => getTrendingPosts(pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Trending hashtags query
  const { data: hashtags, isLoading: isHashtagsLoading } = useQuery({
    queryKey: ['hashtags', 'trending'],
    queryFn: () => getTrendingHashtags(20),
  });

  // Auto-load more when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = postsData?.pages.flatMap((page) => page.posts) ?? [];

  const handlePostDeleted = (postId: string) => {
    queryClient.setQueryData(['posts', 'trending'], (oldData: typeof postsData) => {
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
    queryClient.setQueryData(['posts', 'trending'], (oldData: typeof postsData) => {
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
      <PageHeader
        title="აღმოჩენა"
        description="პოპულარული პოსტები და ტრენდები"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="trending" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                ტრენდში
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="mt-4 space-y-4">
              {isPostsLoading ? (
                <>
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </>
              ) : isPostsError ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    ვერ ჩაიტვირთა პოსტები
                  </p>
                  <Button onClick={() => refetchPosts()}>ხელახლა ცდა</Button>
                </div>
              ) : posts.length === 0 ? (
                <EmptyState
                  title="ჯერ არ არის ტრენდული პოსტები"
                  description="ჯერ არ არის საკმარისი პოსტები ტრენდების საჩვენებლად"
                />
              ) : (
                <>
                  {posts.map((post: Post) => (
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
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ad Banner */}
          <AdBanner size="medium" />

          {/* Trending hashtags */}
          <Card className="border-border/50 shadow-premium">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Hash className="h-4 w-4 text-primary" />
                </div>
                პოპულარული ჰეშთეგები
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isHashtagsLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              ) : hashtags && hashtags.length > 0 ? (
                <div className="space-y-1">
                  {hashtags.map((hashtag, index) => (
                    <Link
                      key={hashtag.id}
                      href={`/hashtag/${encodeURIComponent(hashtag.name)}`}
                      className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-muted-foreground w-4">
                          {index + 1}
                        </span>
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          #{hashtag.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {hashtag.postsCount} პოსტი
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                    <Hash className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ჯერ არ არის ჰეშთეგები
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
