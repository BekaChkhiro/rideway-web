'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  ThumbsUp,
  Pin,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Separator } from '@/components/ui/separator';
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
import { ReplyItem, ReplyItemSkeleton, ReplyForm } from '@/components/forum';
import {
  getThread,
  getThreadReplies,
  deleteThread,
  toggleThreadLike,
} from '@/lib/api/forum';
import { cn } from '@/lib/utils';
import type { ThreadReply } from '@/types';

export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.id as string;
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Thread query
  const {
    data: thread,
    isLoading: isLoadingThread,
    isError: isThreadError,
  } = useQuery({
    queryKey: ['forum', 'thread', threadId],
    queryFn: () => getThread(threadId),
  });

  // Sync like state when thread loads
  useEffect(() => {
    if (thread) {
      setIsLiked(thread.isLiked ?? false);
      setLikesCount(thread.likesCount);
    }
  }, [thread]);

  // Replies query
  const {
    data: repliesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingReplies,
  } = useInfiniteQuery({
    queryKey: ['forum', 'thread', threadId, 'replies'],
    queryFn: ({ pageParam = 1 }) => getThreadReplies(threadId, pageParam, 20),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!threadId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteThread,
    onSuccess: () => {
      toast.success('თემა წაიშალა');
      router.push('/forum');
    },
    onError: () => {
      toast.error('შეცდომა');
    },
  });

  // Auto-load more replies when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLike = async () => {
    if (!session) {
      toast.error('გთხოვთ გაიაროთ ავტორიზაცია');
      return;
    }

    setIsLiking(true);
    try {
      const result = await toggleThreadLike(threadId);
      setIsLiked(result.isLiked);
      setLikesCount(result.likesCount);
    } catch {
      toast.error('შეცდომა');
    } finally {
      setIsLiking(false);
    }
  };

  const handleReplyCreated = (reply: ThreadReply) => {
    // Add the new reply to the cache
    queryClient.setQueryData(
      ['forum', 'thread', threadId, 'replies'],
      (oldData: typeof repliesData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) =>
            index === 0
              ? { ...page, replies: [reply, ...page.replies] }
              : page
          ),
        };
      }
    );
    // Increment reply count
    queryClient.setQueryData(
      ['forum', 'thread', threadId],
      (oldThread: typeof thread) => {
        if (!oldThread) return oldThread;
        return { ...oldThread, repliesCount: oldThread.repliesCount + 1 };
      }
    );
  };

  const handleReplyUpdate = (updatedReply: ThreadReply) => {
    queryClient.setQueryData(
      ['forum', 'thread', threadId, 'replies'],
      (oldData: typeof repliesData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            replies: page.replies.map((r) =>
              r.id === updatedReply.id ? updatedReply : r
            ),
          })),
        };
      }
    );
  };

  const handleReplyDelete = (replyId: string) => {
    queryClient.setQueryData(
      ['forum', 'thread', threadId, 'replies'],
      (oldData: typeof repliesData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            replies: page.replies.filter((r) => r.id !== replyId),
          })),
        };
      }
    );
    // Decrement reply count
    queryClient.setQueryData(
      ['forum', 'thread', threadId],
      (oldThread: typeof thread) => {
        if (!oldThread) return oldThread;
        return { ...oldThread, repliesCount: Math.max(0, oldThread.repliesCount - 1) };
      }
    );
  };

  const replies = repliesData?.pages.flatMap((page) => page.replies) ?? [];
  const isOwner = session?.user?.id === thread?.author.id;

  const formattedDate = thread
    ? formatDistanceToNow(new Date(thread.createdAt), {
        addSuffix: true,
        locale: ka,
      })
    : '';

  if (isLoadingThread) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isThreadError || !thread) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">თემა ვერ მოიძებნა</p>
        <Link href="/forum">
          <Button>ფორუმში დაბრუნება</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/forum">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={thread.title}
          description={
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/forum/category/${thread.category.slug}`}
                className="text-muted-foreground hover:underline"
              >
                {thread.category.name}
              </Link>
              {thread.isPinned && (
                <Badge variant="outline" className="gap-1">
                  <Pin className="h-3 w-3" />
                  მიმაგრებული
                </Badge>
              )}
              {thread.isLocked && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  დაკეტილი
                </Badge>
              )}
            </div>
          }
        />
      </div>

      {/* Thread content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href={`/${thread.author.username}`}>
                <UserAvatar user={thread.author} size="lg" />
              </Link>
              <div>
                <Link
                  href={`/${thread.author.username}`}
                  className="font-semibold hover:underline"
                >
                  {thread.author.fullName}
                </Link>
                <p className="text-sm text-muted-foreground">
                  @{thread.author.username} · {formattedDate}
                </p>
              </div>
            </div>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
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
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    წაშლა
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{thread.content}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t text-sm text-muted-foreground">
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
              <span>{thread.repliesCount} პასუხი</span>
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{thread.viewsCount} ნახვა</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Reply form */}
      <ReplyForm
        threadId={threadId}
        isLocked={thread.isLocked}
        onReplyCreated={handleReplyCreated}
      />

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          პასუხები ({thread.repliesCount})
        </h2>

        {isLoadingReplies ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <ReplyItemSkeleton key={i} />
            ))}
          </div>
        ) : replies.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              ჯერ არ არის პასუხები. იყავი პირველი!
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  onUpdate={handleReplyUpdate}
                  onDelete={handleReplyDelete}
                />
              ))}
            </div>

            {/* Load more trigger */}
            <div ref={ref} className="py-4 flex justify-center">
              {isFetchingNextPage && (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>თემის წაშლა</AlertDialogTitle>
            <AlertDialogDescription>
              დარწმუნებული ხართ რომ გსურთ ამ თემის წაშლა? ეს მოქმედება შეუქცევადია.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              გაუქმება
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(threadId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              წაშლა
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
