'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOrCreateConversation } from '@/lib/api';
import { toast } from '@/lib/toast';

interface MessageButtonProps {
  userId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function MessageButton({
  userId,
  variant = 'outline',
  size = 'default',
  showText = true,
}: MessageButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const conversation = await getOrCreateConversation({ participantId: userId });
      router.push(`/messages/${conversation.id}`);
    } catch {
      toast.error('საუბრის შექმნა ვერ მოხერხდა');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
    >
      <MessageCircle className="h-4 w-4" />
      {showText && <span className="ml-2">შეტყობინება</span>}
    </Button>
  );
}
