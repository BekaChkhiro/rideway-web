'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProfileHeader, ProfileTabs } from '@/components/profile';
import { useAuth } from '@/hooks/use-auth';
import { getUserByUsername } from '@/lib/api/users';

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const { user: currentUser, isLoading: authLoading } = useAuth();

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['users', params.username],
    queryFn: () => getUserByUsername(params.username as string),
    retry: false,
    enabled: !!params.username,
  });

  if (!params.username || isLoading || authLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p>{(error as Error).message}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">User not found</h1>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden py-0">
        <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
      </Card>

      <Card className="p-4">
        <ProfileTabs userId={user.id} isOwnProfile={isOwnProfile} />
      </Card>
    </div>
  );
}
