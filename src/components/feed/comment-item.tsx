'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';
import { toggleCommentLike, deleteComment as deleteCommentApi } from '@/lib/api';
import type { Comment } from '@/types';

interface CommentItemProps {
  comment: Comment;
  onReply?: (comment: Comment) => void;
  onDelete?: (commentId: string) => void;
  onEdit?: (comment: Comment) => void;
  showRepliesCount?: boolean;
  isReply?: boolean;
}

export function CommentItem({
  comment,
  onReply,
  onDelete,
  onEdit,
  showRepliesCount = true,
  isReply = false,
}: CommentItemProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(comment.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(comment.likeCount ?? 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = session?.user?.id === comment.author.id;

  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: ka,
  });

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const result = await toggleCommentLike(comment.id);
      setIsLiked(result.isLiked);
      setLikesCount(result.likesCount);
    } catch {
      toast.error('ვერ მოხერხდა');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCommentApi(comment.id);
      toast.success('კომენტარი წაიშალა');
      onDelete?.(comment.id);
    } catch {
      toast.error('ვერ მოხერხდა წაშლა');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className={cn('flex gap-3', isReply && 'ml-10')}>
        <Link href={`/${comment.author.username}`}>
          <UserAvatar user={comment.author} size="sm" />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="bg-muted rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <Link
                href={`/${comment.author.username}`}
                className="font-semibold text-sm hover:underline"
              >
                {comment.author.fullName}
              </Link>
              <span className="text-xs text-muted-foreground">
                {formattedDate}
              </span>
            </div>
            <p className="text-sm mt-1 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-6 px-2 text-xs gap-1 hover:text-red-500',
                isLiked && 'text-red-500'
              )}
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className={cn('h-3.5 w-3.5', isLiked && 'fill-current')} />
              {likesCount > 0 && likesCount}
            </Button>

            {onReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs gap-1"
                onClick={() => onReply(comment)}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                პასუხი
              </Button>
            )}

            {showRepliesCount && comment.repliesCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {comment.repliesCount} პასუხი
              </span>
            )}

            {/* Menu */}
            {(isOwner || onEdit) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {onEdit && isOwner && (
                    <DropdownMenuItem onClick={() => onEdit(comment)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      რედაქტირება
                    </DropdownMenuItem>
                  )}
                  {isOwner && (
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      წაშლა
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>კომენტარის წაშლა</AlertDialogTitle>
            <AlertDialogDescription>
              დარწმუნებული ხარ რომ გინდა ამ კომენტარის წაშლა?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>გაუქმება</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'იშლება...' : 'წაშლა'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Skeleton
export function CommentItemSkeleton({ isReply = false }: { isReply?: boolean }) {
  return (
    <div className={cn('flex gap-3', isReply && 'ml-10')}>
      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      <div className="flex-1">
        <div className="bg-muted rounded-xl px-3 py-2">
          <div className="h-4 w-24 bg-background/50 rounded animate-pulse mb-2" />
          <div className="h-4 w-full bg-background/50 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
