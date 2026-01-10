'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ka } from 'date-fns/locale';
import { Check, CheckCheck, Reply, Smile, Pencil, Trash2, X, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addReaction, removeReaction, deleteMessage } from '@/lib/socket';
import { ReplyPreview } from './reply-preview';
import { MessageReactions } from './message-reactions';
import { InlineReactionPicker } from './reaction-picker';
import { MessageImages } from './message-images';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Message } from '@/types';

interface MessageItemProps {
  message: Message;
  conversationId: string;
  isOwn: boolean;
  showTime?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
}

export function MessageItem({
  message,
  conversationId,
  isOwn,
  showTime = true,
  onReply,
  onEdit,
}: MessageItemProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const time = format(new Date(message.createdAt), 'HH:mm', { locale: ka });
  const isEdited = message.editedAt !== null;

  const handleReact = async (emoji: string) => {
    const existingReaction = message.reactions?.find(
      (r) => r.emoji === emoji && r.hasReacted
    );

    if (existingReaction) {
      await removeReaction(conversationId, message.id, emoji);
    } else {
      await addReaction(conversationId, message.id, emoji);
    }
    setShowReactionPicker(false);
  };

  const handleToggleReaction = async (emoji: string) => {
    const existingReaction = message.reactions?.find(
      (r) => r.emoji === emoji && r.hasReacted
    );

    if (existingReaction) {
      await removeReaction(conversationId, message.id, emoji);
    } else {
      await addReaction(conversationId, message.id, emoji);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    await deleteMessage(conversationId, message.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  // If message is deleted, show placeholder
  if (message.isDeleted) {
    return (
      <div
        className={cn(
          'flex items-start gap-1 w-full',
          isOwn ? 'justify-end' : 'justify-start'
        )}
      >
        <div
          className={cn(
            'px-4 py-2 rounded-2xl italic text-muted-foreground',
            isOwn
              ? 'bg-primary/20 rounded-br-md'
              : 'bg-muted/50 rounded-bl-md'
          )}
        >
          <p className="text-sm">მესიჯი წაშლილია</p>
        </div>
      </div>
    );
  }

  const ActionButtons = () => (
    <div className="flex items-center gap-0.5 pt-1 opacity-40 hover:opacity-100 transition-opacity">
      {showReactionPicker ? (
        <div className="relative">
          <InlineReactionPicker onReact={handleReact} />
          <button
            onClick={() => setShowReactionPicker(false)}
            className="absolute -top-1 -right-1 p-0.5 bg-background rounded-full text-xs"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowReactionPicker(true)}
            className="p-1 hover:bg-muted rounded-full transition-colors"
            title="რეაქცია"
          >
            <Smile className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {onReply && (
            <button
              onClick={() => onReply(message)}
              className="p-1 hover:bg-muted rounded-full transition-colors"
              title="პასუხი"
            >
              <Reply className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          {isOwn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                  title="მეტი"
                >
                  <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(message)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    რედაქტირება
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  წაშლა
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      )}
    </div>
  );

  const hasImages = message.images && message.images.length > 0;
  const hasContent = message.content && message.content.trim().length > 0;

  const MessageContent = () => (
    <div
      className={cn(
        'flex flex-col max-w-[70%]',
        isOwn ? 'items-end' : 'items-start'
      )}
    >
      {/* Reply preview */}
      {message.replyTo && (
        <ReplyPreview
          replyTo={message.replyTo}
          isOwnMessage={isOwn}
          className="mb-1 max-w-full"
        />
      )}

      {/* Images (displayed above text) */}
      {hasImages && (
        <MessageImages images={message.images} />
      )}

      {/* Message bubble (only show if there's text content) */}
      {hasContent && (
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
      )}

      {/* Reactions display */}
      {message.reactions && message.reactions.length > 0 && (
        <MessageReactions
          reactions={message.reactions}
          onToggleReaction={handleToggleReaction}
          isOwnMessage={isOwn}
        />
      )}

      {/* Time, edited indicator, and read status */}
      {showTime && (
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <span>{time}</span>
          {isEdited && <span className="italic">(რედაქტირებული)</span>}
          {isOwn &&
            (message.isRead ? (
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div
        className={cn(
          'flex items-start gap-1 w-full',
          isOwn ? 'justify-end' : 'justify-start'
        )}
      >
        {/* ჩემი მესიჯი: [აიქონები] [მესიჯი] - აიქონები მარცხნივ */}
        {/* სხვისი მესიჯი: [მესიჯი] [აიქონები] - აიქონები მარჯვნივ */}
        {isOwn ? (
          <>
            <ActionButtons />
            <MessageContent />
          </>
        ) : (
          <>
            <MessageContent />
            <ActionButtons />
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>მესიჯის წაშლა</AlertDialogTitle>
            <AlertDialogDescription>
              დარწმუნებული ხართ, რომ გსურთ ამ მესიჯის წაშლა? ეს მოქმედება შეუქცევადია.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>გაუქმება</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
