'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import { X, ChevronLeft, ChevronRight, Pause, Play, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import { viewStory } from '@/lib/api';
import type { StoryGroup } from '@/types';

interface StoryViewerProps {
  storyGroup: StoryGroup;
  onClose: () => void;
  onNextGroup?: () => void;
  onPrevGroup?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

const STORY_DURATION = 5000; // 5 seconds per story

export function StoryViewer({
  storyGroup,
  onClose,
  onNextGroup,
  onPrevGroup,
  hasNext = false,
  hasPrev = false,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = storyGroup.stories[currentIndex];

  // Mark story as viewed
  useEffect(() => {
    if (currentStory && !currentStory.isViewed) {
      viewStory(currentStory.id).catch(() => {});
    }
  }, [currentStory]);

  // Progress timer
  useEffect(() => {
    if (isPaused || !currentStory) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story
          if (currentIndex < storyGroup.stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else if (hasNext) {
            onNextGroup?.();
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, storyGroup.stories.length, hasNext, onNextGroup, onClose, currentStory]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (hasPrev) {
      onPrevGroup?.();
    }
  }, [currentIndex, hasPrev, onPrevGroup]);

  const handleNext = useCallback(() => {
    if (currentIndex < storyGroup.stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (hasNext) {
      onNextGroup?.();
    } else {
      onClose();
    }
  }, [currentIndex, storyGroup.stories.length, hasNext, onNextGroup, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
          e.preventDefault();
          setIsPaused((prev) => !prev);
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, onClose]);

  if (!currentStory) return null;

  const formattedDate = formatDistanceToNow(new Date(currentStory.createdAt), {
    addSuffix: true,
    locale: ka,
  });

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2">
        {storyGroup.stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width:
                  index < currentIndex
                    ? '100%'
                    : index === currentIndex
                    ? `${progress}%`
                    : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-4">
        <Link href={`/${storyGroup.user.username}`} className="flex items-center gap-2">
          <UserAvatar user={storyGroup.user} size="sm" />
          <div>
            <span className="text-white font-semibold text-sm">
              {storyGroup.user.fullName}
            </span>
            <span className="text-white/70 text-xs ml-2">{formattedDate}</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setIsPaused((prev) => !prev)}
          >
            {isPaused ? (
              <Play className="h-5 w-5" />
            ) : (
              <Pause className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Story content */}
      <div
        className="relative w-full max-w-md aspect-[9/16] mx-4"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x < rect.width / 3) {
            handlePrev();
          } else if (x > (rect.width * 2) / 3) {
            handleNext();
          } else {
            setIsPaused((prev) => !prev);
          }
        }}
      >
        {currentStory.mediaType === 'IMAGE' ? (
          <Image
            src={currentStory.mediaUrl}
            alt="Story"
            fill
            className="object-contain"
            priority
            loading="eager"
            sizes="(max-width: 768px) 100vw, 448px"
          />
        ) : (
          <video
            src={currentStory.mediaUrl}
            autoPlay
            loop={false}
            muted={false}
            className="w-full h-full object-contain"
            onEnded={handleNext}
          />
        )}
      </div>

      {/* Navigation arrows */}
      {(hasPrev || currentIndex > 0) && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {(hasNext || currentIndex < storyGroup.stories.length - 1) && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
          onClick={handleNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* Views count (if own story) */}
      {currentStory.viewsCount !== undefined && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 text-white/80 text-sm">
          <Eye className="h-4 w-4" />
          <span>{currentStory.viewsCount}</span>
        </div>
      )}
    </div>
  );
}
