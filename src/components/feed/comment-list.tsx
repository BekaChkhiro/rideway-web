'use client';

import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CommentItem, CommentItemSkeleton } from './comment-item';
import { CommentForm } from './comment-form';
import { getComments, getCommentReplies } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Comment } from '@/types';

interface CommentListProps {
  postId: string;
  className?: string;
}

export function CommentList({ postId, className }: CommentListProps) {
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam = 1 }) => getComments(postId, pageParam, 20),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const comments = data?.pages.flatMap((page) => page.comments) ?? [];

  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleCommentSuccess = () => {
    refetch();
    setReplyTo(null);
  };

  const handleDelete = () => {
    refetch();
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <CommentItemSkeleton />
        <CommentItemSkeleton />
        <CommentItemSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-muted-foreground">ვერ ჩაიტვირთა კომენტარები</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-2">
          ხელახლა ცდა
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Comment Form */}
      <CommentForm
        postId={postId}
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
        onSuccess={handleCommentSuccess}
      />

      {/* Comments */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          ჯერ არ არის კომენტარები
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                onReply={handleReply}
                onDelete={handleDelete}
                showRepliesCount={!expandedReplies.has(comment.id)}
              />

              {/* Replies toggle */}
              {comment.repliesCount > 0 && (
                <div className="ml-10 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => toggleReplies(comment.id)}
                  >
                    {expandedReplies.has(comment.id) ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        დამალვა
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        {comment.repliesCount} პასუხის ნახვა
                      </>
                    )}
                  </Button>

                  {/* Replies list */}
                  {expandedReplies.has(comment.id) && (
                    <CommentReplies
                      commentId={comment.id}
                      onReply={handleReply}
                      onDelete={handleDelete}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasNextPage && (
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                იტვირთება...
              </>
            ) : (
              'მეტის ჩატვირთვა'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Replies sub-component
interface CommentRepliesProps {
  commentId: string;
  onReply: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
}

function CommentReplies({ commentId, onReply, onDelete }: CommentRepliesProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['comment-replies', commentId],
    queryFn: ({ pageParam = 1 }) => getCommentReplies(commentId, pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const replies = data?.pages.flatMap((page) => page.replies) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3 mt-3">
        <CommentItemSkeleton isReply />
        <CommentItemSkeleton isReply />
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-3">
      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onReply={onReply}
          onDelete={onDelete}
          showRepliesCount={false}
          isReply
        />
      ))}

      {hasNextPage && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs ml-10"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            'მეტი პასუხი'
          )}
        </Button>
      )}
    </div>
  );
}
