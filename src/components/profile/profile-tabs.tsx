'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3X3, Heart, Bookmark, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { PostCard, PostCardSkeleton } from '@/components/feed';
import { Button } from '@/components/ui/button';
import { getPostsByUser, getLikedPosts, getSavedPosts } from '@/lib/api/posts';
import type { Post } from '@/types';

interface ProfileTabsProps {
  userId: string;
  isOwnProfile: boolean;
}

export function ProfileTabs({ userId, isOwnProfile }: ProfileTabsProps) {
  // Fetch user's posts
  const {
    data: postsData,
    isLoading: postsLoading,
    fetchNextPage: fetchMorePosts,
    hasNextPage: hasMorePosts,
    isFetchingNextPage: isFetchingMorePosts,
  } = useInfiniteQuery({
    queryKey: ['posts', 'user', userId],
    queryFn: ({ pageParam = 1 }) => getPostsByUser(userId, pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Fetch user's liked posts
  const {
    data: likedData,
    isLoading: likedLoading,
    fetchNextPage: fetchMoreLiked,
    hasNextPage: hasMoreLiked,
    isFetchingNextPage: isFetchingMoreLiked,
  } = useInfiniteQuery({
    queryKey: ['posts', 'liked', userId],
    queryFn: ({ pageParam = 1 }) => getLikedPosts(userId, pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Fetch saved posts (only for own profile)
  const {
    data: savedData,
    isLoading: savedLoading,
    fetchNextPage: fetchMoreSaved,
    hasNextPage: hasMoreSaved,
    isFetchingNextPage: isFetchingMoreSaved,
  } = useInfiniteQuery({
    queryKey: ['posts', 'saved'],
    queryFn: ({ pageParam = 1 }) => getSavedPosts(pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: isOwnProfile,
  });

  const allPosts = postsData?.pages.flatMap((page) => page.posts) ?? [];
  const allLikedPosts = likedData?.pages.flatMap((page) => page.posts) ?? [];
  const allSavedPosts = savedData?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
        <TabsTrigger
          value="posts"
          className="flex-1 sm:flex-none gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          <Grid3X3 className="h-4 w-4" />
          <span className="hidden sm:inline">Posts</span>
        </TabsTrigger>
        <TabsTrigger
          value="likes"
          className="flex-1 sm:flex-none gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Likes</span>
        </TabsTrigger>
        {isOwnProfile && (
          <TabsTrigger
            value="saved"
            className="flex-1 sm:flex-none gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Saved</span>
          </TabsTrigger>
        )}
      </TabsList>

      {/* Posts Tab */}
      <TabsContent value="posts" className="mt-6">
        {postsLoading ? (
          <div className="space-y-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : allPosts.length === 0 ? (
          <EmptyState
            icon={<Grid3X3 className="h-full w-full" />}
            title="No posts yet"
            description={
              isOwnProfile
                ? "Share your first post with the community!"
                : "This user hasn't posted anything yet."
            }
          />
        ) : (
          <div className="space-y-4">
            {allPosts.map((post: Post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {hasMorePosts && (
              <div className="flex justify-center py-4">
                <Button
                  variant="outline"
                  onClick={() => fetchMorePosts()}
                  disabled={isFetchingMorePosts}
                >
                  {isFetchingMorePosts ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </TabsContent>

      {/* Likes Tab */}
      <TabsContent value="likes" className="mt-6">
        {likedLoading ? (
          <div className="space-y-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : allLikedPosts.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-full w-full" />}
            title="No likes yet"
            description={
              isOwnProfile
                ? "Posts you like will appear here."
                : "This user hasn't liked any posts yet."
            }
          />
        ) : (
          <div className="space-y-4">
            {allLikedPosts.map((post: Post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {hasMoreLiked && (
              <div className="flex justify-center py-4">
                <Button
                  variant="outline"
                  onClick={() => fetchMoreLiked()}
                  disabled={isFetchingMoreLiked}
                >
                  {isFetchingMoreLiked ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </TabsContent>

      {/* Saved Tab */}
      {isOwnProfile && (
        <TabsContent value="saved" className="mt-6">
          {savedLoading ? (
            <div className="space-y-4">
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          ) : allSavedPosts.length === 0 ? (
            <EmptyState
              icon={<Bookmark className="h-full w-full" />}
              title="No saved posts"
              description="Save posts to view them later."
            />
          ) : (
            <div className="space-y-4">
              {allSavedPosts.map((post: Post) => (
                <PostCard key={post.id} post={post} />
              ))}
              {hasMoreSaved && (
                <div className="flex justify-center py-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchMoreSaved()}
                    disabled={isFetchingMoreSaved}
                  >
                    {isFetchingMoreSaved ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load more'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      )}
    </Tabs>
  );
}
