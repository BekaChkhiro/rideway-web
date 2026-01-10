'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ArrowLeft, Images, Loader2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getConversationMedia, type MediaItem } from '@/lib/api/chat';
import { cn } from '@/lib/utils';

interface ConversationMediaViewProps {
  conversationId: string;
  onBack: () => void;
}

export function ConversationMediaView({
  conversationId,
  onBack,
}: ConversationMediaViewProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Fetch media on mount
  useEffect(() => {
    fetchMedia(1);
  }, [conversationId]);

  const fetchMedia = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const result = await getConversationMedia(conversationId, pageNum, 30);
      if (pageNum === 1) {
        setMedia(result.media);
      } else {
        setMedia((prev) => [...prev, ...result.media]);
      }
      setHasMore(pageNum < result.meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMedia(nextPage);
  };

  const openImage = (item: MediaItem) => {
    setSelectedImage(item);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const closeImage = () => {
    setSelectedImage(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  // Handle mouse/touch drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom((prev) => {
      const newZoom = Math.max(1, Math.min(prev + delta, 4));
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage) {
        if (e.key === 'Escape') {
          closeImage();
        } else if (e.key === '+' || e.key === '=') {
          handleZoomIn();
        } else if (e.key === '-') {
          handleZoomOut();
        }
      } else if (e.key === 'Escape') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, onBack]);

  // Navigate between images
  const currentIndex = selectedImage ? media.findIndex(m => m.id === selectedImage.id) : -1;

  const goToPrevious = () => {
    const prevItem = media[currentIndex - 1];
    if (currentIndex > 0 && prevItem) {
      openImage(prevItem);
    }
  };

  const goToNext = () => {
    const nextItem = media[currentIndex + 1];
    if (currentIndex < media.length - 1 && nextItem) {
      openImage(nextItem);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Images className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">მედია</h2>
          {media.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({media.length})
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && media.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Images className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg">ფოტოები არ არის</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-1">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openImage(item)}
                  className="aspect-square relative overflow-hidden rounded-sm hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <Image
                    src={item.url}
                    alt="Media"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, 200px"
                  />
                </button>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center py-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      იტვირთება...
                    </>
                  ) : (
                    'მეტის ჩატვირთვა'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fullscreen Image Viewer with Zoom */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black flex flex-col"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Viewer Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <Button
              variant="ghost"
              size="icon"
              onClick={closeImage}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="text-white text-sm">
              {currentIndex + 1} / {media.length}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="text-white hover:bg-white/20 disabled:opacity-50"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <span className="text-white text-sm min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 4}
                className="text-white hover:bg-white/20 disabled:opacity-50"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Image Container */}
          <div
            className={cn(
              'flex-1 flex items-center justify-center overflow-hidden',
              zoom > 1 ? 'cursor-grab' : 'cursor-default',
              isDragging && 'cursor-grabbing'
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
          >
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              }}
            >
              <Image
                src={selectedImage.url}
                alt="Full size"
                width={1200}
                height={900}
                className="max-h-[85vh] max-w-[95vw] object-contain select-none"
                draggable={false}
                priority
              />
            </div>
          </div>

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          )}
          {currentIndex < media.length - 1 && (
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ArrowLeft className="h-6 w-6 rotate-180" />
            </button>
          )}

          {/* Zoom hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs">
            სქროლით ან +/- ღილაკებით გადიდება
          </div>
        </div>
      )}
    </div>
  );
}
