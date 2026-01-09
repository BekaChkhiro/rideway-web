'use client';

import { format } from 'date-fns';
import { ka } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  showTime?: boolean;
}

export function MessageItem({ message, isOwn, showTime = true }: MessageItemProps) {
  const time = format(new Date(message.createdAt), 'HH:mm', { locale: ka });

  return (
    <div
      className={cn(
        'flex flex-col max-w-[75%]',
        isOwn ? 'ml-auto items-end' : 'mr-auto items-start'
      )}
    >
      <div
        className={cn(
          'px-4 py-2 rounded-2xl',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>

      {showTime && (
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <span>{time}</span>
          {isOwn && (
            message.isRead ? (
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )
          )}
        </div>
      )}
    </div>
  );
}
