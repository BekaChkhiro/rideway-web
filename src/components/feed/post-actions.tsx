'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { togglePostLike, togglePostSave } from '@/lib/api';

interface PostActionsProps {
  postId: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved?: boolean;
  onLikeChange?: (isLiked: boolean, likesCount: number) => void;
  onSaveChange?: (isSaved: boolean) => void;
  showCommentLink?: boolean;
  className?: string;
}

export function PostActions({
  postId,
  likesCount,
  commentsCount,
  isLiked,
  isSaved: initialSaved = false,
  onLikeChange,
  onSaveChange,
  showCommentLink = true,
  className,
}: PostActionsProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);

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

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const result = await togglePostSave(postId);
      setIsSaved(result.saved);
      onSaveChange?.(result.saved);
      toast.success(result.saved ? 'შეინახა' : 'წაიშალა შენახულებიდან');
    } catch {
      toast.error('ვერ მოხერხდა');
    } finally {
      setIsSaving(false);
    }
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
        disabled={isSaving}
      >
        <Bookmark
          className={cn('h-5 w-5', isSaved && 'fill-current')}
        />
      </Button>
    </div>
  );
}
