'use client';

import { useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ImagePlus, X, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';
import { createPost } from '@/lib/api';
import type { Post } from '@/types';

interface PostFormProps {
  onSuccess?: (post: Post) => void;
  className?: string;
}

interface ImagePreview {
  id: string;
  file: File;
  preview: string;
}

const MAX_CONTENT_LENGTH = 2000;
const MAX_IMAGES = 10;

export function PostForm({ onSuccess, className }: PostFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSubmit = content.trim().length > 0 || images.length > 0;
  const remainingChars = MAX_CONTENT_LENGTH - content.length;
  const charProgress = (content.length / MAX_CONTENT_LENGTH) * 100;

  const handleImageSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - images.length;
    const validFiles = fileArray
      .filter(file => file.type.startsWith('image/'))
      .slice(0, remainingSlots);

    if (validFiles.length === 0) return;

    const newImages: ImagePreview[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [images.length]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleImageSelect(e.target.files);
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleImageSelect(e.dataTransfer.files);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const post = await createPost({
        content: content.trim(),
        images: images.map((img) => img.file),
      });

      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setContent('');
      setImages([]);
      setIsFocused(false);

      toast.success('პოსტი გამოქვეყნდა');
      onSuccess?.(post);
    } catch {
      toast.error('ვერ მოხერხდა პოსტის გამოქვეყნება');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 80)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit && !isSubmitting) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-card rounded-2xl border border-border/60 overflow-hidden',
        'shadow-sm hover:shadow-md transition-shadow duration-300',
        isFocused && 'ring-1 ring-primary/20 shadow-md',
        isDragging && 'ring-2 ring-primary/40 bg-primary/5',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Main content area */}
      <div className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <UserAvatar
            user={session.user}
            size="md"
            className="shrink-0 ring-2 ring-background"
          />

          {/* Input area */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              placeholder="რას ფიქრობ?"
              value={content}
              onChange={handleTextareaChange}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              className={cn(
                'w-full min-h-[100px] resize-none',
                'px-4 py-3 rounded-xl bg-muted/40',
                'text-[15px] leading-relaxed placeholder:text-muted-foreground/60',
                'border border-border/50 outline-none',
                'focus:border-primary/30 focus:bg-muted/60',
                'transition-all duration-200'
              )}
              maxLength={MAX_CONTENT_LENGTH}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="mt-4 pl-12">
            <div className={cn(
              'grid gap-2',
              images.length === 1 && 'grid-cols-1 max-w-sm',
              images.length === 2 && 'grid-cols-2',
              images.length >= 3 && 'grid-cols-3',
              images.length >= 5 && 'grid-cols-4'
            )}>
              {images.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    'relative group rounded-xl overflow-hidden bg-muted',
                    images.length === 1 ? 'aspect-video' : 'aspect-square'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    disabled={isSubmitting}
                    className={cn(
                      'absolute top-2 right-2 p-1.5 rounded-full',
                      'bg-black/60 text-white backdrop-blur-sm',
                      'opacity-0 group-hover:opacity-100',
                      'hover:bg-black/80 active:scale-95',
                      'transition-all duration-150',
                      'disabled:opacity-50'
                    )}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="px-4 py-3 border-t border-border/40 bg-muted/30">
        <div className="flex items-center justify-between">
          {/* Left side - attachment buttons */}
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isSubmitting || images.length >= MAX_IMAGES}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || images.length >= MAX_IMAGES}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg',
                'text-sm font-medium text-muted-foreground',
                'hover:bg-primary/10 hover:text-primary',
                'active:scale-[0.98] transition-all duration-150',
                'disabled:opacity-40 disabled:pointer-events-none'
              )}
            >
              <ImagePlus className="h-5 w-5" />
              <span className="hidden sm:inline">ფოტო</span>
            </button>

            {images.length > 0 && (
              <span className="text-xs text-muted-foreground ml-1">
                {images.length}/{MAX_IMAGES}
              </span>
            )}
          </div>

          {/* Right side - counter & submit */}
          <div className="flex items-center gap-3">
            {/* Character counter */}
            {content.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="relative h-5 w-5">
                  <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      fill="none"
                      strokeWidth="2"
                      className="stroke-muted"
                    />
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      fill="none"
                      strokeWidth="2"
                      strokeDasharray={50.27}
                      strokeDashoffset={50.27 - (charProgress / 100) * 50.27}
                      strokeLinecap="round"
                      className={cn(
                        'transition-all duration-200',
                        remainingChars < 0 ? 'stroke-destructive' :
                        remainingChars < 100 ? 'stroke-amber-500' :
                        'stroke-primary'
                      )}
                    />
                  </svg>
                </div>
                {remainingChars < 100 && (
                  <span className={cn(
                    'text-xs font-medium tabular-nums',
                    remainingChars < 0 ? 'text-destructive' : 'text-amber-500'
                  )}>
                    {remainingChars}
                  </span>
                )}
              </div>
            )}

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting || remainingChars < 0}
              size="sm"
              className={cn(
                'rounded-full px-4 gap-2 font-medium',
                'disabled:opacity-40'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">იგზავნება</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">გამოქვეყნება</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
