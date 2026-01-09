'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserList } from '@/components/profile';
import { useAuth } from '@/hooks/use-auth';
import { getUserByUsername, getFollowers } from '@/lib/api/users';

interface FollowersPageProps {
  params: {
    username: string;
  };
}

export default function FollowersPage({ params }: FollowersPageProps) {
  const { user: currentUser } = useAuth();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['users', params.username],
    queryFn: () => getUserByUsername(params.username),
  });

  if (userLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${params.username}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">{user.fullName}</h1>
          <p className="text-sm text-muted-foreground">@{params.username}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Followers ({user.followersCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <UserList
            queryKey={['users', user.id, 'followers']}
            queryFn={(page) => getFollowers(user.id, page)}
            emptyTitle="No followers yet"
            emptyDescription="When people follow this account, they'll appear here."
            currentUserId={currentUser?.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
