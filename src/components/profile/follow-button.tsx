'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser } from '@/lib/api/users';
import { toast } from '@/lib/toast';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  className?: string;
}

export function FollowButton({
  userId,
  isFollowing: initialIsFollowing,
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: () => followUser(userId),
    onMutate: () => {
      setIsFollowing(true);
    },
    onError: () => {
      setIsFollowing(false);
      toast.error('Failed to follow user');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User followed');
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(userId),
    onMutate: () => {
      setIsFollowing(false);
    },
    onError: () => {
      setIsFollowing(true);
      toast.error('Failed to unfollow user');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User unfollowed');
    },
  });

  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  const handleClick = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}
