'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageLightbox } from './image-lightbox';
import type { MessageImage } from '@/types';

interface MessageImagesProps {
  images: MessageImage[];
}

export function MessageImages({ images }: MessageImagesProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  // Grid layout based on number of images
  const getGridClass = () => {
    switch (images.length) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-2';
      case 4:
        return 'grid-cols-2';
      case 5:
        return 'grid-cols-3';
      default:
        return 'grid-cols-2';
    }
  };

  // Get image dimensions based on number of images
  const getImageSize = (index: number) => {
    if (images.length === 1) {
      return { width: 280, height: 210 }; // 4:3 ratio
    }
    if (images.length === 3 && index === 0) {
      return { width: 280, height: 140 }; // Full width, half height
    }
    return { width: 140, height: 140 }; // Square
  };

  return (
    <>
      <div
        className={cn(
          'grid gap-1 rounded-lg overflow-hidden mb-1',
          getGridClass(),
          images.length === 1 ? 'max-w-[280px]' : 'max-w-[280px]'
        )}
      >
        {images.map((image, index) => {
          const size = getImageSize(index);
          return (
            <button
              key={image.id || index}
              type="button"
              onClick={() => openLightbox(index)}
              className={cn(
                'overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity',
                images.length === 3 && index === 0 && 'col-span-2'
              )}
            >
              <Image
                src={image.url}
                alt={`Image ${index + 1}`}
                width={size.width}
                height={size.height}
                className="object-cover w-full h-full"
              />
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
