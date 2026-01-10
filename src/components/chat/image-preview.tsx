'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  isUploading?: boolean;
  className?: string;
}

export function ImagePreview({
  files,
  onRemove,
  isUploading = false,
  className,
}: ImagePreviewProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    // Create object URLs for preview
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    // Cleanup on unmount or when files change
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  if (files.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {previews.map((preview, index) => (
        <div
          key={index}
          className="relative group w-16 h-16 rounded-lg overflow-hidden border bg-muted"
        >
          <Image
            src={preview}
            alt={`Preview ${index + 1}`}
            fill
            className="object-cover"
          />
          {isUploading ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onRemove(index)}
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
