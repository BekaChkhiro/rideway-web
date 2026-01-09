'use client';

import { useParams, useRouter } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { ArrowLeft, Hash, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PostCard, PostCardSkeleton } from '@/components/feed/post-card';
import { EmptyState } from '@/components/shared/empty-state';
import { getPostsByHashtag } from '@/lib/api';

export default function HashtagPage() {
  const params = useParams();
  const router = useRouter();
  const { ref, inView } = useInView();
  const tag = decodeURIComponent(params.tag as string);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts', 'hashtag', tag],
    queryFn: ({ pageParam = 1 }) => getPostsByHashtag(tag, pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!tag,
  });

  // Auto-load more when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];
  const totalPosts = data?.pages[0]?.meta.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          უკან
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Hash className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">#{tag}</h1>
            <p className="text-muted-foreground">
              {totalPosts} {totalPosts === 1 ? 'პოსტი' : 'პოსტი'}
            </p>
          </div>
        </div>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">ვერ ჩაიტვირთა პოსტები</p>
          <Button onClick={() => refetch()}>ხელახლა ცდა</Button>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="პოსტები ვერ მოიძებნა"
          description={`ჰეშთეგით #${tag} პოსტები არ არსებობს`}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
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
