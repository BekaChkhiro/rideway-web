'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import {
  MessageSquare,
  Eye,
  ThumbsUp,
  Pin,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toggleThreadLike } from '@/lib/api/forum';
import { cn } from '@/lib/utils';
import type { ForumThread } from '@/types';

interface ThreadCardProps {
  thread: ForumThread;
  onDelete?: (threadId: string) => void;
  onLikeToggle?: (threadId: string, isLiked: boolean, likesCount: number) => void;
}

export function ThreadCard({ thread, onDelete, onLikeToggle }: ThreadCardProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(thread.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(thread.likesCount);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = session?.user?.id === thread.author.id;

  const formattedDate = formatDistanceToNow(new Date(thread.createdAt), {
    addSuffix: true,
    locale: ka,
  });

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error('გთხოვთ გაიაროთ ავტორიზაცია');
      return;
    }

    setIsLiking(true);
    try {
      const result = await toggleThreadLike(thread.id);
      setIsLiked(result.isLiked);
      setLikesCount(result.likesCount);
      onLikeToggle?.(thread.id, result.isLiked, result.likesCount);
    } catch {
      toast.error('შეცდომა');
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Link href={`/forum/thread/${thread.id}`}>
      <Card className={cn(
        'transition-shadow hover:shadow-md',
        thread.isPinned && 'border-primary/50 bg-primary/5'
      )}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Author avatar */}
            <div className="hidden sm:block">
              <UserAvatar user={thread.author} size="md" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {thread.isPinned && (
                      <Pin className="h-4 w-4 text-primary" />
                    )}
                    {thread.isLocked && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <h3 className="font-semibold truncate">{thread.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Link
                      href={`/${thread.author.username}`}
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      @{thread.author.username}
                    </Link>
                    <span>·</span>
                    <span>{formattedDate}</span>
                    <span>·</span>
                    <Badge variant="secondary" className="text-xs">
                      {thread.category.name}
                    </Badge>
                  </div>
                </div>

                {/* Menu */}
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/forum/thread/${thread.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          რედაქტირება
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          onDelete?.(thread.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        წაშლა
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Preview */}
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {thread.content}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <button
                  className={cn(
                    'flex items-center gap-1 hover:text-primary transition-colors',
                    isLiked && 'text-primary'
                  )}
                  onClick={handleLike}
                  disabled={isLiking}
                >
                  <ThumbsUp className={cn('h-4 w-4', isLiked && 'fill-current')} />
                  <span>{likesCount}</span>
                </button>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{thread.repliesCount}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{thread.viewsCount}</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton for loading state
export function ThreadCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="hidden sm:block">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="flex gap-4">
              <div className="h-4 w-12 bg-muted animate-pulse rounded" />
              <div className="h-4 w-12 bg-muted animate-pulse rounded" />
              <div className="h-4 w-12 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
