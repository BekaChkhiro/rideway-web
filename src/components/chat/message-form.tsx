'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { startTyping, stopTyping, sendSocketMessage } from '@/lib/socket';
import { useChatStore } from '@/stores';
import { useSocket } from '@/providers/socket-provider';
import { toast } from '@/lib/toast';

interface MessageFormProps {
  conversationId: string;
}

export function MessageForm({ conversationId }: MessageFormProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isConnected } = useSocket();

  const addMessage = useChatStore((state) => state.addMessage);
  const updateConversation = useChatStore((state) => state.updateConversation);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isConnected) return;

    startTyping(conversationId);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId);
    }, 2000);
  }, [conversationId, isConnected]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping(conversationId);
    };
  }, [conversationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent || isSending) return;

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    stopTyping(conversationId);

    setIsSending(true);

    try {
      // Send via socket for real-time delivery
      const response = await sendSocketMessage(conversationId, trimmedContent);

      if (response.success && response.message) {
        // Message will be added via socket event, but we can add it optimistically
        addMessage(conversationId, response.message);
        updateConversation(conversationId, {
          lastMessage: response.message,
          updatedAt: response.message.createdAt,
        });
        setContent('');
      } else {
        toast.error('შეტყობინების გაგზავნა ვერ მოხერხდა');
      }
    } catch {
      toast.error('შეტყობინების გაგზავნა ვერ მოხერხდა');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="დაწერეთ შეტყობინება..."
          className="min-h-[40px] max-h-[120px] resize-none"
          rows={1}
          disabled={isSending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!content.trim() || isSending}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">გაგზავნა</span>
        </Button>
      </div>
    </form>
  );
}
