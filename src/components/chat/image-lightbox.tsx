'use client';

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MessageImage } from '@/types';

interface ImageLightboxProps {
  images: MessageImage[];
  initialIndex: number;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  initialIndex,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleDownload = () => {
    const image = images[currentIndex];
    if (image) {
      const link = document.createElement('a');
      link.href = image.url;
      link.download = `image-${currentIndex + 1}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToPrevious, goToNext]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>

        <span className="text-sm">
          {currentIndex + 1} / {images.length}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="text-white hover:bg-white/20"
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>

      {/* Image container */}
      <div
        className="flex-1 flex items-center justify-center relative px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous button */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-4 text-white hover:bg-white/20 z-10"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {/* Image */}
        <div className="relative max-w-full max-h-[80vh] w-full h-full">
          <Image
            src={currentImage.url}
            alt={`Image ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        {/* Next button */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-4 text-white hover:bg-white/20 z-10"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}
      </div>

      {/* Thumbnails (if more than 1 image) */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 p-4">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`relative w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-white opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-75'
              }`}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="48px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
