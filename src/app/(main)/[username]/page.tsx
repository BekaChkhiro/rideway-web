'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ProfileHeader, ProfileTabs } from '@/components/profile';
import { useAuth } from '@/hooks/use-auth';
import { getUserByUsername } from '@/lib/api/users';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { user: currentUser, isLoading: authLoading } = useAuth();

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['users', params.username],
    queryFn: () => getUserByUsername(params.username),
    retry: false,
  });

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    const errorMessage = (error as Error).message;
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      notFound();
    }
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold mb-2">Error loading profile</h2>
          <p className="text-muted-foreground">{errorMessage}</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    notFound();
  }

  // Check if user is blocked by the profile owner
  if (user.isBlockedBy) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Profile unavailable</h2>
          <p className="text-muted-foreground">
            You cannot view this profile.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
      </Card>

      <Card className="p-4">
        <ProfileTabs isOwnProfile={isOwnProfile} />
      </Card>
    </div>
  );
}
