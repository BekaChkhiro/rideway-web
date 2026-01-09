'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ServiceForm } from '@/components/services';
import { getService, getServiceCategories } from '@/lib/api/services';

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  const { data: session, status } = useSession();

  const { data: service, isLoading: isLoadingService } = useQuery({
    queryKey: ['services', serviceId],
    queryFn: () => getService(serviceId),
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['services', 'categories'],
    queryFn: getServiceCategories,
  });

  const isLoading = isLoadingService || isLoadingCategories || status === 'loading';

  // Check ownership
  const isOwner = session?.user?.id === service?.owner.id;

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

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">სერვისი ვერ მოიძებნა</p>
        <Link href="/services">
          <Button>სერვისებში დაბრუნება</Button>
        </Link>
      </div>
    );
  }

  if (!isOwner) {
    router.push(`/services/${serviceId}`);
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/services/${serviceId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="სერვისის რედაქტირება"
          description={service.name}
        />
      </div>

      <ServiceForm
        categories={categories}
        service={service}
        mode="edit"
      />
    </div>
  );
}
