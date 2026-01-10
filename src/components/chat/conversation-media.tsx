'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Images, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getConversationMedia, type MediaItem } from '@/lib/api/chat';
import { ImageLightbox } from './image-lightbox';
import type { MessageImage } from '@/types';

interface ConversationMediaProps {
  conversationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConversationMedia({
  conversationId,
  open,
  onOpenChange,
}: ConversationMediaProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch media when dialog opens
  useEffect(() => {
    if (open) {
      setMedia([]);
      setPage(1);
      fetchMedia(1);
    }
  }, [open, conversationId]);

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

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  // Convert media items to MessageImage format for lightbox
  const lightboxImages: MessageImage[] = media.map((item) => ({
    id: item.id,
    url: item.url,
    order: 0,
  }));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Images className="h-5 w-5" />
              მედია
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {isLoading && media.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : media.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Images className="h-12 w-12 mb-3 opacity-50" />
                <p>ფოტოები არ არის</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-1">
                  {media.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openLightbox(index)}
                      className="aspect-square relative overflow-hidden rounded-sm hover:opacity-90 transition-opacity"
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
        </DialogContent>
      </Dialog>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
