'use client';

import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { ListingForm } from '@/components/marketplace';
import { getListingCategories } from '@/lib/api/listings';
import type { ListingType } from '@/types';

const validTypes: ListingType[] = ['MOTORCYCLE', 'PARTS', 'EQUIPMENT', 'ACCESSORIES'];

function CreateListingContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') as ListingType | null;

  // Validate type from URL
  const defaultType: ListingType = typeParam && validTypes.includes(typeParam)
    ? typeParam
    : 'MOTORCYCLE';

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['listings', 'categories'],
    queryFn: getListingCategories,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="განცხადების დამატება"
        description="შეავსეთ ინფორმაცია თქვენი განცხადების შესახებ"
      />

      <ListingForm categories={categories} mode="create" defaultType={defaultType} />
    </div>
  );
}

function CreateListingLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <Suspense fallback={<CreateListingLoading />}>
      <CreateListingContent />
    </Suspense>
  );
}
