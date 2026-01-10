'use client';

import { X, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReplyInfo, Message } from '@/types';

interface ReplyPreviewProps {
  replyTo: ReplyInfo | Message;
  isOwnMessage?: boolean;
  onCancel?: () => void;
  className?: string;
}

export function ReplyPreview({
  replyTo,
  isOwnMessage,
  onCancel,
  className,
}: ReplyPreviewProps) {
  const truncatedContent =
    replyTo.content.length > 100
      ? replyTo.content.substring(0, 100) + '...'
      : replyTo.content;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg',
        isOwnMessage
          ? 'bg-primary/20 border-l-2 border-primary'
          : 'bg-muted border-l-2 border-muted-foreground/30',
        className
      )}
    >
      <Reply className="h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="flex-1 text-sm text-muted-foreground truncate">
        {truncatedContent}
      </p>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
