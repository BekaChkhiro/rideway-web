'use client';

import { cn } from '@/lib/utils';
import type { MessageReaction } from '@/types';

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onToggleReaction: (emoji: string) => void;
  isOwnMessage?: boolean;
  className?: string;
}

export function MessageReactions({
  reactions,
  onToggleReaction,
  isOwnMessage,
  className,
}: MessageReactionsProps) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1 mt-1', className)}>
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => onToggleReaction(reaction.emoji)}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors',
            reaction.hasReacted
              ? isOwnMessage
                ? 'bg-primary-foreground/30 text-primary-foreground'
                : 'bg-primary/20 text-primary'
              : isOwnMessage
                ? 'bg-primary-foreground/10 text-primary-foreground/80 hover:bg-primary-foreground/20'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          )}
        >
          <span>{reaction.emoji}</span>
          <span className="font-medium">{reaction.count}</span>
        </button>
      ))}
    </div>
  );
}
