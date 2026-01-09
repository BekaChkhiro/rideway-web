'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PostImage } from '@/types';

interface PostImagesProps {
  images: PostImage[];
  className?: string;
}

export function PostImages({ images, className }: PostImagesProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
      default:
        return 'grid-cols-2';
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      setSelectedIndex(null);
    }
  };

  return (
    <>
      <div className={cn('grid gap-1 rounded-xl overflow-hidden', getGridClass(), className)}>
        {images.slice(0, 4).map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              'relative aspect-square overflow-hidden bg-muted',
              images.length === 3 && index === 0 && 'row-span-2 aspect-auto',
              images.length > 4 && index === 3 && 'relative'
            )}
          >
            <Image
              src={image.url}
              alt={`Image ${index + 1}`}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
            {images.length > 4 && index === 3 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="text-2xl font-bold text-white">
                  +{images.length - 4}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => !open && setSelectedIndex(null)}
      >
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
          onKeyDown={handleKeyDown}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50 text-white hover:bg-white/20"
            onClick={() => setSelectedIndex(null)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20',
                  selectedIndex === 0 && 'opacity-50 cursor-not-allowed'
                )}
                onClick={handlePrev}
                disabled={selectedIndex === 0}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20',
                  selectedIndex === images.length - 1 && 'opacity-50 cursor-not-allowed'
                )}
                onClick={handleNext}
                disabled={selectedIndex === images.length - 1}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Image */}
          {selectedIndex !== null && (
            <div className="relative w-full h-[90vh] flex items-center justify-center">
              <Image
                src={images[selectedIndex]?.url ?? ''}
                alt={`Image ${selectedIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* Counter */}
          {images.length > 1 && selectedIndex !== null && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
