'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import { PostActions } from './post-actions';
import { PostMenu } from './post-menu';
import { PostEditDialog } from './post-edit-dialog';
import { HashtagBadge } from './hashtag-badge';
import { PostImages } from './post-images';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  onUpdate?: (updatedPost: Post) => void;
  onLikeToggle?: (postId: string, isLiked: boolean, likesCount: number) => void;
  showCommentLink?: boolean;
}

export function PostCard({
  post,
  onDelete,
  onUpdate,
  onLikeToggle,
  showCommentLink = true,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likeCount ?? 0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleEditSuccess = (updatedPost: Post) => {
    setCurrentPost(updatedPost);
    onUpdate?.(updatedPost);
  };

  const handleLikeChange = (liked: boolean, count: number) => {
    setIsLiked(liked);
    setLikesCount(count);
    onLikeToggle?.(post.id, liked, count);
  };

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ka,
  });

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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/${post.author.username}`}>
              <UserAvatar user={post.author} size="md" />
            </Link>
            <div>
              <Link
                href={`/${post.author.username}`}
                className="font-semibold hover:underline"
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
                <Link
                  href={`/post/${post.id}`}
                  className="hover:underline"
                >
                  {formattedDate}
                </Link>
              </div>
            </div>
          </div>
          <PostMenu post={currentPost} onDelete={onDelete} onEdit={handleEdit} />
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Content */}
        <div className="whitespace-pre-wrap break-words">
          {renderContent(currentPost.content)}
        </div>

        {/* Images */}
        {currentPost.images && currentPost.images.length > 0 && (
          <div className="mt-3">
            <PostImages images={currentPost.images} />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <PostActions
          postId={post.id}
          likesCount={likesCount}
          commentsCount={post.commentCount ?? 0}
          isLiked={isLiked}
          isSaved={post.isSaved}
          onLikeChange={handleLikeChange}
          showCommentLink={showCommentLink}
        />
      </CardFooter>

      <PostEditDialog
        post={currentPost}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </Card>
  );
}

// Skeleton for loading state
export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex gap-4">
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
        </div>
      </CardFooter>
    </Card>
  );
}
