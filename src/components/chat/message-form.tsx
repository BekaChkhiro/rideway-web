'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Smile, X, Pencil, ImageIcon } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { startTyping, stopTyping, sendSocketMessage, editMessage } from '@/lib/socket';
import { uploadChatImages } from '@/lib/api';
import { useChatStore } from '@/stores';
import { useSocket } from '@/providers/socket-provider';
import { toast } from '@/lib/toast';
import { ReplyPreview } from './reply-preview';
import { ImagePreview } from './image-preview';
import { EditImagePreview } from './edit-image-preview';
import { validateImage, compressImage } from '@/lib/upload-utils';
import type { MessageImage } from '@/types';

interface MessageFormProps {
  conversationId: string;
}

const MAX_IMAGES = 5;

export function MessageForm({ conversationId }: MessageFormProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  // For editing - track existing images and which ones to remove
  const [existingImages, setExistingImages] = useState<MessageImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isConnected } = useSocket();

  const addMessage = useChatStore((state) => state.addMessage);
  const updateConversation = useChatStore((state) => state.updateConversation);
  const replyingTo = useChatStore((state) => state.replyingTo[conversationId]);
  const clearReplyTo = useChatStore((state) => state.clearReplyTo);
  const editingMessage = useChatStore((state) => state.editingMessage[conversationId]);
  const clearEditingMessage = useChatStore((state) => state.clearEditingMessage);

  // Set content and images when editing starts
  useEffect(() => {
    if (editingMessage) {
      setContent(editingMessage.content);
      setExistingImages(editingMessage.images || []);
      setRemovedImageIds([]);
      setSelectedImages([]);
      textareaRef.current?.focus();
    } else {
      // Clear editing state when not editing
      setExistingImages([]);
      setRemovedImageIds([]);
    }
  }, [editingMessage]);

  // Handle emoji selection
  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + emojiData.emoji + content.slice(end);
      setContent(newContent);
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length);
      }, 0);
    } else {
      setContent((prev) => prev + emojiData.emoji);
    }
    setIsEmojiPickerOpen(false);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  // Focus textarea when reply is set
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isConnected || editingMessage) return; // Don't send typing while editing

    startTyping(conversationId);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId);
    }, 2000);
  }, [conversationId, isConnected, editingMessage]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping(conversationId);
    };
  }, [conversationId]);

  const handleCancelReply = () => {
    clearReplyTo(conversationId);
  };

  const handleCancelEdit = () => {
    clearEditingMessage(conversationId);
    setContent('');
    setExistingImages([]);
    setRemovedImageIds([]);
    setSelectedImages([]);
  };

  // Image handling
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max images limit (account for existing images that aren't removed)
    const keptExistingImages = existingImages.filter(img => !removedImageIds.includes(img.id));
    const currentTotal = keptExistingImages.length + selectedImages.length;
    const remainingSlots = MAX_IMAGES - currentTotal;
    if (remainingSlots <= 0) {
      toast.error(`მაქსიმუმ ${MAX_IMAGES} ფოტო შეგიძლიათ აირჩიოთ`);
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const validatedFiles: File[] = [];

    for (const file of filesToProcess) {
      // Validate
      const validation = await validateImage(file, {
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
      });

      if (!validation.valid) {
        toast.error(validation.error || 'ფოტო არასწორია');
        continue;
      }

      // Compress
      try {
        const compressed = await compressImage(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
        });
        validatedFiles.push(compressed);
      } catch {
        validatedFiles.push(file);
      }
    }

    if (validatedFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validatedFiles]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setRemovedImageIds((prev) => [...prev, imageId]);
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Calculate total images for UI
  const keptExistingImages = existingImages.filter(img => !removedImageIds.includes(img.id));
  const totalImages = keptExistingImages.length + selectedImages.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    const hasNewImages = selectedImages.length > 0;
    const hasKeptImages = keptExistingImages.length > 0;
    const hasAnyImages = hasNewImages || hasKeptImages;

    // Need either content or images
    if ((!trimmedContent && !hasAnyImages && !hasNewImages) || isSending) return;

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    stopTyping(conversationId);

    setIsSending(true);

    try {
      if (editingMessage) {
        // Edit mode - update existing message with images
        const contentChanged = trimmedContent !== editingMessage.content;
        const imagesChanged = removedImageIds.length > 0 || hasNewImages;

        if (!contentChanged && !imagesChanged) {
          // Nothing changed, just cancel
          handleCancelEdit();
          return;
        }

        // Upload new images if any
        let newImageUrls: string[] | undefined;
        if (hasNewImages) {
          setIsUploading(true);
          try {
            const uploadResult = await uploadChatImages(conversationId, selectedImages);
            newImageUrls = uploadResult.urls;
          } catch {
            toast.error('ფოტოების ატვირთვა ვერ მოხერხდა');
            setIsUploading(false);
            setIsSending(false);
            return;
          }
          setIsUploading(false);
        }

        const response = await editMessage(
          conversationId,
          editingMessage.id,
          trimmedContent,
          removedImageIds.length > 0 ? removedImageIds : undefined,
          newImageUrls
        );

        if (response.success) {
          setContent('');
          setExistingImages([]);
          setRemovedImageIds([]);
          setSelectedImages([]);
          clearEditingMessage(conversationId);
          toast.success('მესიჯი განახლდა');
        } else {
          toast.error('მესიჯის რედაქტირება ვერ მოხერხდა');
        }
      } else {
        // Normal mode - send new message
        let imageUrls: string[] | undefined;

        // Upload images first if any
        if (hasNewImages) {
          setIsUploading(true);
          try {
            const uploadResult = await uploadChatImages(conversationId, selectedImages);
            imageUrls = uploadResult.urls;
          } catch {
            toast.error('ფოტოების ატვირთვა ვერ მოხერხდა');
            setIsUploading(false);
            setIsSending(false);
            return;
          }
          setIsUploading(false);
        }

        const response = await sendSocketMessage(
          conversationId,
          trimmedContent || '',
          replyingTo?.id,
          imageUrls
        );

        if (response.success && response.message) {
          // Message will be added via socket event, but we can add it optimistically
          addMessage(conversationId, response.message);
          updateConversation(conversationId, {
            lastMessage: response.message.content || (hasNewImages ? '📷 ფოტო' : ''),
            lastMessageSenderId: response.message.senderId,
            updatedAt: response.message.createdAt,
          });
          setContent('');
          setSelectedImages([]);
          // Clear reply after sending
          if (replyingTo) {
            clearReplyTo(conversationId);
          }
        } else {
          toast.error('შეტყობინების გაგზავნა ვერ მოხერხდა');
        }
      }
    } catch {
      toast.error(editingMessage ? 'მესიჯის რედაქტირება ვერ მოხერხდა' : 'შეტყობინების გაგზავნა ვერ მოხერხდა');
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
    // Cancel on Escape
    if (e.key === 'Escape') {
      if (editingMessage) {
        handleCancelEdit();
      } else if (replyingTo) {
        handleCancelReply();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background">
      {/* Edit preview */}
      {editingMessage && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border-l-4 border-primary">
            <Pencil className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-primary font-medium">რედაქტირება</p>
              <p className="text-sm text-muted-foreground truncate">
                {editingMessage.content}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="p-1 hover:bg-background rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Reply preview */}
      {replyingTo && !editingMessage && (
        <div className="px-4 pt-3">
          <ReplyPreview
            replyTo={replyingTo}
            onCancel={handleCancelReply}
          />
        </div>
      )}

      {/* Image preview - for new messages */}
      {selectedImages.length > 0 && !editingMessage && (
        <div className="px-4 pt-3">
          <ImagePreview
            files={selectedImages}
            onRemove={handleRemoveImage}
            isUploading={isUploading}
          />
        </div>
      )}

      {/* Image preview - for editing (existing + new images) */}
      {editingMessage && (keptExistingImages.length > 0 || selectedImages.length > 0) && (
        <div className="px-4 pt-3">
          <EditImagePreview
            existingImages={keptExistingImages}
            newFiles={selectedImages}
            onRemoveExisting={handleRemoveExistingImage}
            onRemoveNew={handleRemoveImage}
            isUploading={isUploading}
          />
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleImageSelect}
        className="hidden"
      />

      <div className="p-4 flex items-end gap-2">
        <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
            >
              <Smile className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">ემოჯი</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 border-none"
            side="top"
            align="start"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              theme={Theme.AUTO}
              lazyLoadEmojis
              searchPlaceholder="ძებნა..."
              width={320}
              height={400}
            />
          </PopoverContent>
        </Popover>
        {/* Image button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={handleImageButtonClick}
          disabled={isSending || isUploading || totalImages >= MAX_IMAGES}
        >
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">ფოტო</span>
        </Button>
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            editingMessage
              ? 'შეცვალეთ შეტყობინება...'
              : replyingTo
                ? 'დაწერეთ პასუხი...'
                : 'დაწერეთ შეტყობინება...'
          }
          className="min-h-[40px] max-h-[120px] resize-none"
          rows={1}
          disabled={isSending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={(!content.trim() && selectedImages.length === 0) || isSending || isUploading}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">{editingMessage ? 'შენახვა' : 'გაგზავნა'}</span>
        </Button>
      </div>
    </form>
  );
}
