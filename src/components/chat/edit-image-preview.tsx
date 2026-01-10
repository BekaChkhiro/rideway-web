'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageImage } from '@/types';

interface EditImagePreviewProps {
  existingImages: MessageImage[];
  newFiles: File[];
  onRemoveExisting: (imageId: string) => void;
  onRemoveNew: (index: number) => void;
  isUploading?: boolean;
  className?: string;
}

export function EditImagePreview({
  existingImages,
  newFiles,
  onRemoveExisting,
  onRemoveNew,
  isUploading = false,
  className,
}: EditImagePreviewProps) {
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  useEffect(() => {
    // Create object URLs for new file previews
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setNewPreviews(urls);

    // Cleanup on unmount or when files change
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newFiles]);

  if (existingImages.length === 0 && newFiles.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* Existing images */}
      {existingImages.map((image) => (
        <div
          key={image.id}
          className="relative group w-16 h-16 rounded-lg overflow-hidden border bg-muted"
        >
          <Image
            src={image.url}
            alt="Existing image"
            fill
            className="object-cover"
            sizes="64px"
          />
          <button
            type="button"
            onClick={() => onRemoveExisting(image.id)}
            className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3 text-white" />
          </button>
        </div>
      ))}

      {/* New file previews */}
      {newPreviews.map((preview, index) => (
        <div
          key={`new-${index}`}
          className="relative group w-16 h-16 rounded-lg overflow-hidden border-2 border-dashed border-primary bg-muted"
        >
          <Image
            src={preview}
            alt={`New image ${index + 1}`}
            fill
            className="object-cover"
            sizes="64px"
          />
          {isUploading ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onRemoveNew(index)}
              className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
