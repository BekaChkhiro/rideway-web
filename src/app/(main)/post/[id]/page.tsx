'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/ui/user-avatar';
import { PostActions } from '@/components/feed/post-actions';
import { PostMenu } from '@/components/feed/post-menu';
import { PostImages } from '@/components/feed/post-images';
import { HashtagBadge } from '@/components/feed/hashtag-badge';
import { CommentList } from '@/components/feed/comment-list';
import { PostCardSkeleton } from '@/components/feed/post-card';
import { getPost } from '@/lib/api';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const postId = params.id as string;

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['posts', postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
  });

  const handleDelete = () => {
    // Invalidate feed queries
    queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
    router.push('/');
  };

  const handleLikeChange = (isLiked: boolean, likeCount: number) => {
    queryClient.setQueryData(['posts', postId], (oldPost: typeof post) => {
      if (!oldPost) return oldPost;
      return { ...oldPost, isLiked, likeCount };
    });
  };

  // Parse content for hashtags
  const renderContent = (content: string) => {
    const parts = content.split(/(#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        const tag = part.slice(1);
        return <HashtagBadge key={index} tag={tag} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          უკან
        </Button>
        <PostCardSkeleton />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          უკან
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">პოსტი ვერ მოიძებნა</p>
          <Button variant="outline" onClick={() => router.push('/')} className="mt-4">
            მთავარზე დაბრუნება
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ka,
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        უკან
      </Button>

      {/* Post */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/${post.author.username}`}>
                <UserAvatar user={post.author} size="lg" />
              </Link>
              <div>
                <Link
                  href={`/${post.author.username}`}
                  className="font-semibold text-lg hover:underline"
                >
                  {post.author.fullName}
                </Link>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Link
                    href={`/${post.author.username}`}
                    className="hover:underline"
                  >
                    @{post.author.username}
                  </Link>
                  <span>·</span>
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
            <PostMenu post={post} onDelete={handleDelete} />
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          {/* Content */}
          <div className="text-lg whitespace-pre-wrap break-words">
            {renderContent(post.content)}
          </div>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="mt-4">
              <PostImages images={post.images} />
            </div>
          )}
        </CardContent>

        <Separator />

        <CardFooter className="py-3">
          <PostActions
            postId={post.id}
            likesCount={post.likeCount ?? 0}
            commentsCount={post.commentCount ?? 0}
            isLiked={post.isLiked ?? false}
            isSaved={post.isSaved}
            onLikeChange={handleLikeChange}
            showCommentLink={false}
          />
        </CardFooter>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">კომენტარები ({post.commentCount ?? 0})</h2>
        </CardHeader>
        <CardContent>
          <CommentList postId={post.id} />
        </CardContent>
      </Card>
    </div>
  );
}
