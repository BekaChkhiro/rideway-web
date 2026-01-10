'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, X, Image as ImageIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { updatePost } from '@/lib/api';
import type { Post } from '@/types';

interface PostEditDialogProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updatedPost: Post) => void;
}

interface ExistingImage {
  id: string;
  url: string;
  markedForDeletion: boolean;
}

interface NewImage {
  id: string;
  file: File;
  preview: string;
}

const MAX_CONTENT_LENGTH = 2000;
const MAX_IMAGES = 10;

export function PostEditDialog({
  post,
  open,
  onOpenChange,
  onSuccess,
}: PostEditDialogProps) {
  const [content, setContent] = useState('');
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when dialog opens
  useEffect(() => {
    if (open && post) {
      setContent(post.content);
      setExistingImages(
        (post.images || []).map((img) => ({
          id: img.id,
          url: img.url,
          markedForDeletion: false,
        }))
      );
      setNewImages([]);
    }
  }, [open, post]);

  // Cleanup new image previews on close
  useEffect(() => {
    if (!open) {
      newImages.forEach((img) => URL.revokeObjectURL(img.preview));
    }
  }, [open, newImages]);

  const activeExistingImages = existingImages.filter((img) => !img.markedForDeletion);
  const totalImages = activeExistingImages.length + newImages.length;
  const canAddMoreImages = totalImages < MAX_IMAGES;

  const hasChanges =
    content.trim() !== post?.content ||
    existingImages.some((img) => img.markedForDeletion) ||
    newImages.length > 0;

  const canSubmit = content.trim().length > 0 && hasChanges;
  const remainingChars = MAX_CONTENT_LENGTH - content.length;

  const handleToggleDeleteImage = (imageId: string) => {
    setExistingImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, markedForDeletion: !img.markedForDeletion }
          : img
      )
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = MAX_IMAGES - totalImages;
    const filesToAdd = files.slice(0, remainingSlots);

    const newImageItems: NewImage[] = filesToAdd.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...newImageItems]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveNewImage = (id: string) => {
    setNewImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting || !post) return;

    setIsSubmitting(true);
    try {
      const deleteImageIds = existingImages
        .filter((img) => img.markedForDeletion)
        .map((img) => img.id);

      const updatedPost = await updatePost(post.id, {
        content: content.trim(),
        deleteImageIds: deleteImageIds.length > 0 ? deleteImageIds : undefined,
        newImages: newImages.length > 0 ? newImages.map((img) => img.file) : undefined,
      });

      // Cleanup previews
      newImages.forEach((img) => URL.revokeObjectURL(img.preview));

      toast.success('პოსტი განახლდა');
      onSuccess?.(updatedPost);
      onOpenChange(false);
    } catch {
      toast.error('ვერ მოხერხდა პოსტის განახლება');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>პოსტის რედაქტირება</DialogTitle>
          <DialogDescription>
            შეცვალე პოსტის ტექსტი და ფოტოები
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Text content */}
          <div>
            <Textarea
              placeholder="რა ხდება?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={MAX_CONTENT_LENGTH}
              disabled={isSubmitting}
            />
            <div className="flex justify-end mt-2">
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
            </div>
          </div>

          {/* Images section */}
          {(existingImages.length > 0 || newImages.length > 0 || canAddMoreImages) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  ფოტოები ({totalImages}/{MAX_IMAGES})
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isSubmitting || !canAddMoreImages}
                />
                {canAddMoreImages && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    დამატება
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Existing images */}
                {existingImages.map((image) => (
                  <div
                    key={image.id}
                    className={cn(
                      'relative aspect-square rounded-lg overflow-hidden bg-muted',
                      image.markedForDeletion && 'opacity-40'
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt="Post image"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant={image.markedForDeletion ? 'secondary' : 'destructive'}
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleToggleDeleteImage(image.id)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {image.markedForDeletion && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">
                          წაიშლება
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* New images */}
                {newImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-lg overflow-hidden bg-muted border-2 border-primary/30"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.preview}
                      alt="New image"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveNewImage(image.id)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-1 left-1">
                      <span className="text-xs text-white font-medium bg-primary/80 px-2 py-0.5 rounded">
                        ახალი
                      </span>
                    </div>
                  </div>
                ))}

                {/* Add button placeholder */}
                {canAddMoreImages && totalImages > 0 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-muted-foreground/50 transition-colors disabled:opacity-50"
                  >
                    <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            გაუქმება
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting || remainingChars < 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ინახება
              </>
            ) : (
              'შენახვა'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
