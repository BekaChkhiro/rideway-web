'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from './follow-button';
import type { UserCard as UserCardType } from '@/types';

interface UserCardProps {
  user: UserCardType;
  showFollowButton?: boolean;
  currentUserId?: string;
}

export function UserCard({
  user,
  showFollowButton = true,
  currentUserId,
}: UserCardProps) {
  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const isOwnProfile = currentUserId === user.id;

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg">
      <Link
        href={`/${user.username}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user.fullName}</p>
          <p className="text-sm text-muted-foreground truncate">
            @{user.username}
          </p>
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {user.bio}
            </p>
          )}
        </div>
      </Link>

      {showFollowButton && !isOwnProfile && (
        <FollowButton
          userId={user.id}
          isFollowing={user.isFollowing || false}
        />
      )}
    </div>
  );
}
