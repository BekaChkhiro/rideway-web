'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';
import { createComment } from '@/lib/api';
import type { Comment } from '@/types';

interface CommentFormProps {
  postId: string;
  replyTo?: Comment | null;
  onCancelReply?: () => void;
  onSuccess?: (comment: Comment) => void;
  className?: string;
}

export function CommentForm({
  postId,
  replyTo,
  onCancelReply,
  onSuccess,
  className,
}: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when replying
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const comment = await createComment(postId, {
        content: content.trim(),
        parentId: replyTo?.id,
      });

      setContent('');
      onCancelReply?.();
      toast.success('კომენტარი დაემატა');
      onSuccess?.(comment);
    } catch {
      toast.error('ვერ მოხერხდა კომენტარის დამატება');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!session?.user) {
    return (
      <div className={cn('text-center py-4 text-muted-foreground', className)}>
        <p>კომენტარის დასაწერად გაიარეთ ავტორიზაცია</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-2">
          <span>პასუხი:</span>
          <span className="font-medium">{replyTo.author.fullName}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-3">
        <UserAvatar user={session.user} size="sm" />

        <div className="flex-1 flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder={replyTo ? 'დაწერე პასუხი...' : 'დაწერე კომენტარი...'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[40px] max-h-[120px] resize-none py-2"
            disabled={isSubmitting}
          />

          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
