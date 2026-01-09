'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { ListingForm } from '@/components/marketplace';
import { getListingCategories } from '@/lib/api/listings';

export default function CreateListingPage() {
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

      <ListingForm categories={categories} mode="create" />
    </div>
  );
}
