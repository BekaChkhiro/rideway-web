'use client';

import { useState, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { TrendingUp, Hash, Loader2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { PostCard, PostCardSkeleton } from '@/components/feed/post-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getTrendingPosts, getTrendingHashtags } from '@/lib/api';
import type { Post } from '@/types';

export default function ExplorePage() {
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
                    <PostCard key={post.id} post={post} />
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
          {/* Trending hashtags */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Hash className="h-4 w-4" />
                პოპულარული ჰეშთეგები
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isHashtagsLoading ? (
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-20 bg-muted animate-pulse rounded-full"
                    />
                  ))}
                </div>
              ) : hashtags && hashtags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((hashtag) => (
                    <Link
                      key={hashtag.id}
                      href={`/hashtag/${encodeURIComponent(hashtag.name)}`}
                    >
                      <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                        #{hashtag.name}
                        <span className="ml-1 text-xs opacity-70">
                          {hashtag.postsCount}
                        </span>
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  ჯერ არ არის ჰეშთეგები
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
