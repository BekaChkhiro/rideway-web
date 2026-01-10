'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MoreVertical, Images, User, Ban, Flag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useChatStore, selectIsUserOnline } from '@/stores';
import { blockUser } from '@/lib/api/users';
import { toast } from '@/lib/toast';
import type { UserCard } from '@/types';

interface ChatHeaderProps {
  participant: UserCard;
  onMediaClick?: () => void;
}

export function ChatHeader({ participant, onMediaClick }: ChatHeaderProps) {
  const router = useRouter();
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const isOnline = useChatStore((state) =>
    selectIsUserOnline(state, participant.id)
  );

  const handleBlock = async () => {
    setIsBlocking(true);
    try {
      await blockUser(participant.id);
      toast.success(`${participant.fullName || participant.username} დაიბლოკა`);
      setBlockDialogOpen(false);
      // Navigate back to messages list
      router.push('/messages');
    } catch (error) {
      toast.error('დაბლოკვა ვერ მოხერხდა');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleReport = () => {
    toast.info('რეპორტის ფუნქცია მალე დაემატება');
  };

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
            <Link href={`/${participant.username}`}>
              <User className="h-4 w-4 mr-2" />
              პროფილის ნახვა
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMediaClick}>
            <Images className="h-4 w-4 mr-2" />
            მედია
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleReport}>
            <Flag className="h-4 w-4 mr-2" />
            რეპორტი
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setBlockDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="h-4 w-4 mr-2" />
            დაბლოკვა
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>მომხმარებლის დაბლოკვა</AlertDialogTitle>
            <AlertDialogDescription>
              დარწმუნებული ხარ რომ გსურს{' '}
              <span className="font-semibold">
                {participant.fullName || participant.username}
              </span>
              -ის დაბლოკვა? დაბლოკვის შემდეგ ვეღარ მიიღებ მისგან შეტყობინებებს.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBlocking}>გაუქმება</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              disabled={isBlocking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBlocking ? 'იბლოკება...' : 'დაბლოკვა'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
