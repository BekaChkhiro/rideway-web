'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { StoryItem, CreateStoryButton, StoryItemSkeleton } from './story-item';
import { StoryViewer } from './story-viewer';
import { StoryCreateDialog } from './story-create';
import { getStoriesFeed } from '@/lib/api';
import { cn } from '@/lib/utils';

interface StoryBarProps {
  className?: string;
}

export function StoryBar({ className }: StoryBarProps) {
  const { data: session } = useSession();
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: storyGroups, isLoading, refetch } = useQuery({
    queryKey: ['stories', 'feed'],
    queryFn: getStoriesFeed,
  });

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleStoryClick = (index: number) => {
    setSelectedGroupIndex(index);
  };

  const handleNextGroup = () => {
    if (storyGroups && selectedGroupIndex !== null) {
      if (selectedGroupIndex < storyGroups.length - 1) {
        setSelectedGroupIndex(selectedGroupIndex + 1);
      } else {
        setSelectedGroupIndex(null);
      }
    }
  };

  const handlePrevGroup = () => {
    if (selectedGroupIndex !== null && selectedGroupIndex > 0) {
      setSelectedGroupIndex(selectedGroupIndex - 1);
    }
  };

  const handleCloseViewer = () => {
    setSelectedGroupIndex(null);
    refetch();
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    refetch();
  };

  // Find own stories
  const ownStoryIndex = storyGroups?.findIndex(
    (group) => group.user.id === session?.user?.id
  );

  if (isLoading) {
    return (
      <div className={cn('relative', className)}>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 p-4">
            <StoryItemSkeleton />
            <StoryItemSkeleton />
            <StoryItemSkeleton />
            <StoryItemSkeleton />
            <StoryItemSkeleton />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  }

  return (
    <>
      <div className={cn('relative group', className)}>
        {/* Scroll buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
          onClick={() => handleScroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
          onClick={() => handleScroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <ScrollArea className="w-full whitespace-nowrap" ref={scrollRef}>
          <div className="flex gap-2 p-4">
            {/* Create story button */}
            {session?.user && (
              ownStoryIndex !== undefined && ownStoryIndex >= 0 ? (
                <StoryItem
                  storyGroup={storyGroups![ownStoryIndex]!}
                  onClick={() => handleStoryClick(ownStoryIndex)}
                  isOwn
                />
              ) : (
                <CreateStoryButton
                  onClick={() => setShowCreateDialog(true)}
                  avatarUrl={session.user.avatarUrl}
                />
              )
            )}

            {/* Other stories */}
            {storyGroups?.map((group, index) => {
              // Skip own stories (already shown first)
              if (group.user.id === session?.user?.id) return null;

              return (
                <StoryItem
                  key={group.user.id}
                  storyGroup={group}
                  onClick={() => handleStoryClick(index)}
                />
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Story Viewer */}
      {selectedGroupIndex !== null && storyGroups && (
        <StoryViewer
          storyGroup={storyGroups[selectedGroupIndex]!}
          onClose={handleCloseViewer}
          onNextGroup={handleNextGroup}
          onPrevGroup={handlePrevGroup}
          hasNext={selectedGroupIndex < storyGroups.length - 1}
          hasPrev={selectedGroupIndex > 0}
        />
      )}

      {/* Create Story Dialog */}
      <StoryCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
