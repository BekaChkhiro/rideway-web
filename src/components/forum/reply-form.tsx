'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/user-avatar';
import { createReply } from '@/lib/api/forum';
import type { ThreadReply } from '@/types';

interface ReplyFormProps {
  threadId: string;
  isLocked?: boolean;
  onReplyCreated?: (reply: ThreadReply) => void;
}

export function ReplyForm({ threadId, isLocked, onReplyCreated }: ReplyFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4 text-center text-muted-foreground">
        <p>პასუხის დასაწერად გთხოვთ გაიაროთ ავტორიზაცია</p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4 text-center text-muted-foreground">
        <p>ეს თემა დაკეტილია და პასუხის დაწერა შეუძლებელია</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('გთხოვთ დაწეროთ პასუხი');
      return;
    }

    setIsSubmitting(true);
    try {
      const reply = await createReply(threadId, { content: content.trim() });
      setContent('');
      onReplyCreated?.(reply);
      toast.success('პასუხი დაემატა');
    } catch {
      toast.error('შეცდომა');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <div className="hidden sm:block">
          <UserAvatar
            user={{
              id: session.user.id,
              username: session.user.username,
              fullName: session.user.fullName,
              avatarUrl: session.user.avatarUrl,
            }}
            size="md"
          />
        </div>
        <div className="flex-1">
          <Textarea
            placeholder="დაწერეთ პასუხი..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          პასუხის გაგზავნა
        </Button>
      </div>
    </form>
  );
}
