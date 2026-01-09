'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ServiceForm } from '@/components/services';
import { getServiceCategories } from '@/lib/api/services';

function CreateServiceContent() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['services', 'categories'],
    queryFn: getServiceCategories,
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
        <Link href="/services">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="ახალი სერვისი"
          description="დაამატე შენი სერვისი კატალოგში"
        />
      </div>

      <ServiceForm
        categories={categories}
        defaultCategoryId={preSelectedCategoryId}
        mode="create"
      />
    </div>
  );
}

function CreateServiceLoading() {
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

export default function CreateServicePage() {
  return (
    <Suspense fallback={<CreateServiceLoading />}>
      <CreateServiceContent />
    </Suspense>
  );
}
