'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = content.trim().length > 0 || images.length > 0;
  const remainingChars = MAX_CONTENT_LENGTH - content.length;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = MAX_IMAGES - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newImages: ImagePreview[] = filesToAdd.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const post = await createPost({
        content: content.trim(),
        images: images.map((img) => img.file),
      });

      // Clean up
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

  if (!session?.user) {
    return null;
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <UserAvatar user={session.user} size="md" />

          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="რა ხდება?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className={cn(
                'min-h-[60px] resize-none border-none p-0 shadow-none focus-visible:ring-0',
                isFocused && 'min-h-[100px]'
              )}
              maxLength={MAX_CONTENT_LENGTH}
              disabled={isSubmitting}
            />

            {/* Image previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveImage(image.id)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isSubmitting || images.length >= MAX_IMAGES}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting || images.length >= MAX_IMAGES}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                {images.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {images.length}/{MAX_IMAGES}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <span
                    className={cn(
                      'text-xs',
                      remainingChars < 100
                        ? remainingChars < 0
                          ? 'text-destructive'
                          : 'text-yellow-500'
                        : 'text-muted-foreground'
                    )}
                  >
                    {remainingChars}
                  </span>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting || remainingChars < 0}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      იგზავნება
                    </>
                  ) : (
                    'გამოქვეყნება'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
