'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ThreadForm } from '@/components/forum';
import { getThread, getForumCategories } from '@/lib/api/forum';

export default function EditThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.id as string;
  const { data: session, status } = useSession();

  const { data: thread, isLoading: isLoadingThread } = useQuery({
    queryKey: ['forum', 'thread', threadId],
    queryFn: () => getThread(threadId),
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['forum', 'categories'],
    queryFn: getForumCategories,
  });

  const isLoading = isLoadingThread || isLoadingCategories || status === 'loading';

  // Check ownership
  const isOwner = session?.user?.id === thread?.author.id;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-muted animate-pulse rounded" />
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
          <div className="h-40 w-full bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">თემა ვერ მოიძებნა</p>
        <Link href="/forum">
          <Button>ფორუმში დაბრუნება</Button>
        </Link>
      </div>
    );
  }

  if (!isOwner) {
    router.push(`/forum/thread/${threadId}`);
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/forum/thread/${threadId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="თემის რედაქტირება"
          description={thread.title}
        />
      </div>

      <ThreadForm
        categories={categories}
        thread={thread}
        mode="edit"
      />
    </div>
  );
}
