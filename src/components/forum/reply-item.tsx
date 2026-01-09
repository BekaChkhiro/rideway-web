'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import { ThumbsUp, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/user-avatar';
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
import { toggleReplyLike, updateReply, deleteReply } from '@/lib/api/forum';
import { cn } from '@/lib/utils';
import type { ThreadReply } from '@/types';

interface ReplyItemProps {
  reply: ThreadReply;
  onUpdate?: (reply: ThreadReply) => void;
  onDelete?: (replyId: string) => void;
}

export function ReplyItem({ reply, onUpdate, onDelete }: ReplyItemProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(reply.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(reply.likesCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = session?.user?.id === reply.author.id;

  const formattedDate = formatDistanceToNow(new Date(reply.createdAt), {
    addSuffix: true,
    locale: ka,
  });

  const handleLike = async () => {
    if (!session) {
      toast.error('გთხოვთ გაიაროთ ავტორიზაცია');
      return;
    }

    setIsLiking(true);
    try {
      const result = await toggleReplyLike(reply.id);
      setIsLiked(result.isLiked);
      setLikesCount(result.likesCount);
    } catch {
      toast.error('შეცდომა');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    setIsSaving(true);
    try {
      const updatedReply = await updateReply(reply.id, editContent);
      onUpdate?.(updatedReply);
      setIsEditing(false);
      toast.success('პასუხი განახლდა');
    } catch {
      toast.error('შეცდომა');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteReply(reply.id);
      onDelete?.(reply.id);
      toast.success('პასუხი წაიშალა');
    } catch {
      toast.error('შეცდომა');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Author avatar */}
            <Link href={`/${reply.author.username}`} className="hidden sm:block">
              <UserAvatar user={reply.author} size="md" />
            </Link>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Link
                    href={`/${reply.author.username}`}
                    className="font-semibold hover:underline"
                  >
                    {reply.author.fullName}
                  </Link>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{formattedDate}</span>
                </div>

                {/* Menu */}
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        რედაქტირება
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        წაშლა
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Content */}
              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isSaving || !editContent.trim()}
                    >
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      შენახვა
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(reply.content);
                      }}
                      disabled={isSaving}
                    >
                      გაუქმება
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 whitespace-pre-wrap">{reply.content}</p>
              )}

              {/* Actions */}
              <div className="mt-3">
                <button
                  className={cn(
                    'flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors',
                    isLiked && 'text-primary'
                  )}
                  onClick={handleLike}
                  disabled={isLiking}
                >
                  <ThumbsUp className={cn('h-4 w-4', isLiked && 'fill-current')} />
                  <span>{likesCount}</span>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>პასუხის წაშლა</AlertDialogTitle>
            <AlertDialogDescription>
              დარწმუნებული ხართ რომ გსურთ ამ პასუხის წაშლა?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>გაუქმება</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              წაშლა
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Skeleton for loading state
export function ReplyItemSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="hidden sm:block">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
