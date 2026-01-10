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
      emptyTitle="დაბლოკილი მომხმარებლები არ არის"
      emptyDescription="დაბლოკილი მომხმარებლები აქ გამოჩნდებიან."
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
            დაბლოკილი მომხმარებლები
          </CardTitle>
          <CardDescription>
            მომხმარებლები რომლებიც დაბლოკე. ისინი ვერ ხედავენ შენს პროფილს, პოსტებს
            და ვერ გწერენ შეტყობინებებს.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlockedUsersList />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>რა ხდება როცა ვინმეს დაბლოკავ?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <UserX className="h-4 w-4 mt-0.5 text-destructive" />
              <span>ისინი ვერ იპოვიან შენს პროფილს და პოსტებს.</span>
            </li>
            <li className="flex items-start gap-2">
              <UserX className="h-4 w-4 mt-0.5 text-destructive" />
              <span>ვერ გამოგიგზავნიან შეტყობინებას და ვერ მოგყვებიან.</span>
            </li>
            <li className="flex items-start gap-2">
              <UserX className="h-4 w-4 mt-0.5 text-destructive" />
              <span>მათ არ მიიღებენ შეტყობინებას დაბლოკვის შესახებ.</span>
            </li>
            <li className="flex items-start gap-2">
              <UserX className="h-4 w-4 mt-0.5 text-destructive" />
              <span>
                თუ ერთმანეთს მიყვებოდით, ორივე გაუნფოლოვდებით.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
