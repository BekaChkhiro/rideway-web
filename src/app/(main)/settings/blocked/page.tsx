'use client';

import { Loader2, Ban, UserX } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserList } from '@/components/profile';
import { useAuth } from '@/hooks/use-auth';
import { getBlockedUsers } from '@/lib/api/users';

function BlockedUsersList() {
  return (
    <UserList
      queryKey={['users', 'blocked']}
      queryFn={getBlockedUsers}
      emptyTitle="No blocked users"
      emptyDescription="Users you block will appear here."
      showFollowButton={false}
    />
  );
}

export default function BlockedUsersPage() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading || !user) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Blocked Users
          </CardTitle>
          <CardDescription>
            Users you have blocked. They cannot see your profile, posts, or
            send you messages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlockedUsersList />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What happens when you block someone?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <UserX className="h-4 w-4 mt-0.5 text-destructive" />
              <span>They won&apos;t be able to find your profile or posts.</span>
            </li>
            <li className="flex items-start gap-2">
              <UserX className="h-4 w-4 mt-0.5 text-destructive" />
              <span>They can&apos;t send you messages or follow you.</span>
            </li>
            <li className="flex items-start gap-2">
              <UserX className="h-4 w-4 mt-0.5 text-destructive" />
              <span>They won&apos;t be notified that you blocked them.</span>
            </li>
            <li className="flex items-start gap-2">
              <UserX className="h-4 w-4 mt-0.5 text-destructive" />
              <span>
                If you were following each other, you will both unfollow.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
