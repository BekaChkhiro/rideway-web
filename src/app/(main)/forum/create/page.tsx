'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ThreadForm } from '@/components/forum';
import { getForumCategories } from '@/lib/api/forum';

function CreateThreadContent() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['forum', 'categories'],
    queryFn: getForumCategories,
  });

  // Find pre-selected category ID if slug is provided
  const preSelectedCategoryId = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.id
    : undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-muted animate-pulse rounded" />
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
          <div className="h-40 w-full bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/forum">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="ახალი თემა"
          description="შექმენი ახალი თემა ფორუმში"
        />
      </div>

      <ThreadForm
        categories={categories}
        defaultCategoryId={preSelectedCategoryId}
        mode="create"
      />
    </div>
  );
}

function CreateThreadLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-muted animate-pulse rounded" />
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </div>
      <div className="space-y-4">
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
        <div className="h-40 w-full bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

export default function CreateThreadPage() {
  return (
    <Suspense fallback={<CreateThreadLoading />}>
      <CreateThreadContent />
    </Suspense>
  );
}
