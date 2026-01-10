'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { togglePostLike } from '@/lib/api';

interface PostActionsProps {
  postId: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  onLikeChange?: (isLiked: boolean, likesCount: number) => void;
  showCommentLink?: boolean;
  className?: string;
}

export function PostActions({
  postId,
  likesCount,
  commentsCount,
  isLiked,
  onLikeChange,
  showCommentLink = true,
  className,
}: PostActionsProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const result = await togglePostLike(postId);
      onLikeChange?.(result.isLiked, result.likesCount);
    } catch {
      toast.error('ვერ მოხერხდა');
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rideway Post',
          url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('ლინკი დაკოპირდა');
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'წაიშალა შენახულებიდან' : 'შეინახა');
  };

  const formatCount = (count: number | undefined | null): string => {
    const safeCount = count ?? 0;
    if (safeCount >= 1000000) {
      return `${(safeCount / 1000000).toFixed(1)}M`;
    }
    if (safeCount >= 1000) {
      return `${(safeCount / 1000).toFixed(1)}K`;
    }
    return safeCount.toString();
  };

  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      <div className="flex items-center gap-1">
        {/* Like */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-1.5 hover:text-red-500',
            isLiked && 'text-red-500'
          )}
          onClick={handleLike}
          disabled={isLiking}
        >
          <Heart
            className={cn('h-5 w-5', isLiked && 'fill-current')}
          />
          <span className="text-sm">{formatCount(likesCount)}</span>
        </Button>

        {/* Comment */}
        {showCommentLink ? (
          <Button variant="ghost" size="sm" className="gap-1.5" asChild>
            <Link href={`/post/${postId}`}>
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">{formatCount(commentsCount)}</span>
            </Link>
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="gap-1.5">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">{formatCount(commentsCount)}</span>
          </Button>
        )}

        {/* Share */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Save */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(isSaved && 'text-primary')}
        onClick={handleSave}
      >
        <Bookmark
          className={cn('h-5 w-5', isSaved && 'fill-current')}
        />
      </Button>
    </div>
  );
}
