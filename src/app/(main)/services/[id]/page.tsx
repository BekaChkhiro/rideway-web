'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Star,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ReviewItem, ReviewItemSkeleton, ReviewForm } from '@/components/services';
import {
  getService,
  getServiceReviews,
  deleteService,
} from '@/lib/api/services';
import { cn } from '@/lib/utils';
import type { ServiceReview } from '@/types';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Service query
  const {
    data: service,
    isLoading: isLoadingService,
    isError: isServiceError,
  } = useQuery({
    queryKey: ['services', serviceId],
    queryFn: () => getService(serviceId),
  });

  // Reviews query
  const {
    data: reviewsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingReviews,
  } = useInfiniteQuery({
    queryKey: ['services', serviceId, 'reviews'],
    queryFn: ({ pageParam = 1 }) => getServiceReviews(serviceId, pageParam, 20),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!serviceId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      toast.success('სერვისი წაიშალა');
      router.push('/services');
    },
    onError: () => {
      toast.error('შეცდომა');
    },
  });

  // Auto-load more reviews when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleReviewCreated = (review: ServiceReview) => {
    // Add the new review to the cache
    queryClient.setQueryData(
      ['services', serviceId, 'reviews'],
      (oldData: typeof reviewsData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) =>
            index === 0
              ? { ...page, reviews: [review, ...page.reviews] }
              : page
          ),
        };
      }
    );
    // Update service review count and rating
    queryClient.invalidateQueries({ queryKey: ['services', serviceId] });
  };

  const handleReviewDelete = (reviewId: string) => {
    queryClient.setQueryData(
      ['services', serviceId, 'reviews'],
      (oldData: typeof reviewsData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            reviews: page.reviews.filter((r) => r.id !== reviewId),
          })),
        };
      }
    );
    // Update service review count and rating
    queryClient.invalidateQueries({ queryKey: ['services', serviceId] });
  };

  const reviews = reviewsData?.pages.flatMap((page) => page.reviews) ?? [];
  const isOwner = session?.user?.id === service?.owner.id;

  if (isLoadingService) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="aspect-video bg-muted animate-pulse rounded-lg" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isServiceError || !service) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">სერვისი ვერ მოიძებნა</p>
        <Link href="/services">
          <Button>სერვისებში დაბრუნება</Button>
        </Link>
      </div>
    );
  }

  const currentImage = service.images[selectedImage];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/services">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={service.name}
          description={
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/services/category/${service.category.slug}`}
                className="text-muted-foreground hover:underline"
              >
                {service.category.name}
              </Link>
              {service.isVerified && (
                <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3" />
                  ვერიფიცირებული
                </Badge>
              )}
            </div>
          }
        />
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/services/${service.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  რედაქტირება
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                წაშლა
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Gallery */}
      {service.images.length > 0 && (
        <div className="space-y-2">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <Image
              src={currentImage?.url || ''}
              alt={service.name}
              fill
              className="object-cover"
            />
          </div>
          {service.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {service.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    'relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2',
                    selectedImage === index
                      ? 'border-primary'
                      : 'border-transparent'
                  )}
                >
                  <Image
                    src={image.url}
                    alt={`${service.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>აღწერა</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{service.description}</p>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                შეფასებები
                <Badge variant="secondary">{service.reviewsCount}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReviewForm
                serviceId={serviceId}
                onReviewCreated={handleReviewCreated}
              />

              <Separator />

              {isLoadingReviews ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ReviewItemSkeleton key={i} />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  ჯერ არ არის შეფასებები. იყავი პირველი!
                </p>
              ) : (
                <>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewItem
                        key={review.id}
                        review={review}
                        onDelete={handleReviewDelete}
                      />
                    ))}
                  </div>

                  {/* Load more trigger */}
                  <div ref={ref} className="py-4 flex justify-center">
                    {isFetchingNextPage && (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Rating */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-5 w-5',
                        i < Math.round(service.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      )}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">
                  {service.rating > 0 ? service.rating.toFixed(1) : '-'}
                </span>
                <span className="text-muted-foreground">
                  ({service.reviewsCount} შეფასება)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Contact info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">საკონტაქტო</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {service.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span className="text-sm">{service.location}</span>
                </div>
              )}
              {service.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${service.phone}`}
                    className="text-sm hover:underline"
                  >
                    {service.phone}
                  </a>
                </div>
              )}
              {service.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={service.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline flex items-center gap-1"
                  >
                    ვებსაიტი
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Owner */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">მფლობელი</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/${service.owner.username}`}
                className="flex items-center gap-3 hover:bg-muted rounded-md p-2 -m-2 transition-colors"
              >
                <UserAvatar user={service.owner} size="md" />
                <div>
                  <p className="font-medium">{service.owner.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    @{service.owner.username}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>სერვისის წაშლა</AlertDialogTitle>
            <AlertDialogDescription>
              დარწმუნებული ხართ რომ გსურთ ამ სერვისის წაშლა? ეს მოქმედება შეუქცევადია.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              გაუქმება
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(serviceId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              წაშლა
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
