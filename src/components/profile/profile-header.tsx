'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Camera, MapPin, Calendar, MoreHorizontal, Ban, Flag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FollowButton } from './follow-button';
import { EditProfileModal } from './edit-profile-modal';
import { MessageButton } from '@/components/chat';
import type { UserProfile } from '@/types';

interface ProfileHeaderProps {
  user: UserProfile;
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);

  const initials = (user.fullName || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('ka-GE', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <>
      <div className="relative">
        {/* Cover Image */}
        <div className="relative h-32 sm:h-48 md:h-56 bg-gradient-to-r from-primary/20 to-primary/10 rounded-t-lg overflow-hidden">
          {user.coverUrl && (
            <img
              src={user.coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          {isOwnProfile && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-3 right-3 h-8 w-8"
              onClick={() => setEditModalOpen(true)}
            >
              <Camera className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-16 left-4 sm:left-6">
          <div className="relative">
            <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-background">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName || 'User'} />
              <AvatarFallback className="text-2xl sm:text-3xl bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            {user.isVerified && (
              <Badge className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-500 hover:bg-blue-500">
                Verified
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-20 px-4 sm:px-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Name and Bio */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{user.fullName || 'User'}</h1>
            <p className="text-muted-foreground">@{user.username}</p>

            {user.bio && (
              <p className="mt-3 text-sm whitespace-pre-wrap">{user.bio}</p>
            )}

            {/* Meta info */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {joinDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {joinDate}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-4 text-sm">
              <Link
                href={`/${user.username}/following`}
                className="hover:underline"
              >
                <span className="font-semibold">{user.followingCount ?? 0}</span>{' '}
                <span className="text-muted-foreground">Following</span>
              </Link>
              <Link
                href={`/${user.username}/followers`}
                className="hover:underline"
              >
                <span className="font-semibold">{user.followersCount ?? 0}</span>{' '}
                <span className="text-muted-foreground">Followers</span>
              </Link>
              <div>
                <span className="font-semibold">{user.postsCount ?? 0}</span>{' '}
                <span className="text-muted-foreground">Posts</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <Button variant="outline" onClick={() => setEditModalOpen(true)}>
                Edit Profile
              </Button>
            ) : (
              <>
                {!user.isBlockedBy && !user.isBlocked && (
                  <>
                    <FollowButton
                      userId={user.id}
                      isFollowing={user.isFollowing || false}
                    />
                    <MessageButton userId={user.id} />
                  </>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Ban className="h-4 w-4 mr-2" />
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        user={user}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </>
  );
}
