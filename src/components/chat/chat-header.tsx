'use client';

import Link from 'next/link';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatStore, selectIsUserOnline } from '@/stores';
import type { UserCard } from '@/types';

interface ChatHeaderProps {
  participant: UserCard;
}

export function ChatHeader({ participant }: ChatHeaderProps) {
  const isOnline = useChatStore((state) =>
    selectIsUserOnline(state, participant.id)
  );

  const initials = participant.fullName
    ? participant.fullName.slice(0, 2).toUpperCase()
    : participant.username.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-3">
        {/* Back button (mobile) */}
        <Link href="/messages" className="md:hidden">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        {/* Avatar with online indicator */}
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={participant.avatarUrl || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
          )}
        </div>

        {/* User info */}
        <div>
          <Link
            href={`/${participant.username}`}
            className="font-medium hover:underline"
          >
            {participant.fullName || participant.username}
          </Link>
          <p className="text-xs text-muted-foreground">
            {isOnline ? 'ონლაინ' : 'ოფლაინ'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/${participant.username}`}>პროფილის ნახვა</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
