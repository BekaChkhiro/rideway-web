'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface ReactionPickerProps {
  onReact: (emoji: string) => void;
  className?: string;
}

export function ReactionPicker({ onReact, className }: ReactionPickerProps) {
  const [showFullPicker, setShowFullPicker] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onReact(emojiData.emoji);
    setShowFullPicker(false);
  };

  const handleQuickReaction = (emoji: string) => {
    onReact(emoji);
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleQuickReaction(emoji)}
          className="p-1.5 hover:bg-muted rounded-full transition-colors text-base"
          title={emoji}
        >
          {emoji}
        </button>
      ))}
      <Popover open={showFullPicker} onOpenChange={setShowFullPicker}>
        <PopoverTrigger asChild>
          <button
            className="p-1.5 hover:bg-muted rounded-full transition-colors"
            title="More reactions"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none" align="end">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={300}
            height={400}
            searchPlaceHolder="ძიება..."
            previewConfig={{ showPreview: false }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Inline version for message hover actions
interface InlineReactionPickerProps {
  onReact: (emoji: string) => void;
  className?: string;
}

export function InlineReactionPicker({ onReact, className }: InlineReactionPickerProps) {
  const [showFullPicker, setShowFullPicker] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onReact(emojiData.emoji);
    setShowFullPicker(false);
  };

  return (
    <div className={cn('flex items-center bg-background border rounded-full shadow-sm px-1', className)}>
      {QUICK_REACTIONS.slice(0, 4).map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="p-1 hover:bg-muted rounded-full transition-colors text-sm"
        >
          {emoji}
        </button>
      ))}
      <Popover open={showFullPicker} onOpenChange={setShowFullPicker}>
        <PopoverTrigger asChild>
          <button className="p-1 hover:bg-muted rounded-full transition-colors">
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none" align="end" side="top">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={300}
            height={400}
            searchPlaceHolder="ძიება..."
            previewConfig={{ showPreview: false }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
