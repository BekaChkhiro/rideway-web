'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  MapPin,
  Eye,
  Calendar,
  MessageSquare,
  Share2,
  Flag,
  Pencil,
  Trash2,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ka } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/ui/user-avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ListingGallery,
  PriceTag,
  ConditionBadge,
  FavoriteButton,
} from '@/components/marketplace';
import { getListing, deleteListing, markListingAsSold } from '@/lib/api/listings';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const listingId = params.id as string;

  const {
    data: listing,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['listings', listingId],
    queryFn: () => getListing(listingId),
    enabled: !!listingId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteListing(listingId),
    onSuccess: () => {
      toast.success('განცხადება წაიშალა');
      router.push('/marketplace');
    },
    onError: () => {
      toast.error('შეცდომა');
    },
  });

  const markSoldMutation = useMutation({
    mutationFn: () => markListingAsSold(listingId),
    onSuccess: () => {
      toast.success('მონიშნულია როგორც გაყიდული');
      queryClient.invalidateQueries({ queryKey: ['listings', listingId] });
    },
    onError: () => {
      toast.error('შეცდომა');
    },
  });

  const isOwner = session?.user?.id === listing?.seller.id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">განცხადება ვერ მოიძებნა</p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            უკან
          </Button>
          <Button onClick={() => refetch()}>ხელახლა ცდა</Button>
        </div>
      </div>
    );
  }

  const formattedDate = formatDistanceToNow(new Date(listing.createdAt), {
    addSuffix: true,
    locale: ka,
  });

  const fullDate = format(new Date(listing.createdAt), 'dd MMMM yyyy', {
    locale: ka,
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        უკან
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <Card>
            <CardContent className="p-4">
              <ListingGallery images={listing.images} title={listing.title} />
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {listing.status === 'SOLD' && (
                    <Badge variant="destructive" className="mb-2">გაყიდულია</Badge>
                  )}
                  <CardTitle className="text-2xl">{listing.title}</CardTitle>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="secondary">{listing.category.name}</Badge>
                    <ConditionBadge condition={listing.condition} />
                    {listing.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {listing.location}
                      </span>
                    )}
                  </div>
                </div>
                <PriceTag price={listing.price} size="lg" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {listing.viewsCount} ნახვა
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formattedDate}
                </span>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">აღწერა</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {listing.description}
                </p>
              </div>

              {/* Specs */}
              {(listing.brand || listing.model || listing.year) && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">სპეციფიკაციები</h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {listing.brand && (
                        <div>
                          <dt className="text-sm text-muted-foreground">ბრენდი</dt>
                          <dd className="font-medium">{listing.brand}</dd>
                        </div>
                      )}
                      {listing.model && (
                        <div>
                          <dt className="text-sm text-muted-foreground">მოდელი</dt>
                          <dd className="font-medium">{listing.model}</dd>
                        </div>
                      )}
                      {listing.year && (
                        <div>
                          <dt className="text-sm text-muted-foreground">წელი</dt>
                          <dd className="font-medium">{listing.year}</dd>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Meta */}
              <div className="text-sm text-muted-foreground">
                <p>განთავსებულია: {fullDate}</p>
                <p>ID: {listing.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              {isOwner ? (
                <>
                  <Link href={`/marketplace/${listing.id}/edit`} className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <Pencil className="h-4 w-4" />
                      რედაქტირება
                    </Button>
                  </Link>

                  {listing.status !== 'SOLD' && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => markSoldMutation.mutate()}
                      disabled={markSoldMutation.isPending}
                    >
                      {markSoldMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      გაყიდულად მონიშვნა
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full gap-2">
                        <Trash2 className="h-4 w-4" />
                        წაშლა
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>დარწმუნებული ხართ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          ეს მოქმედება შეუქცევადია. განცხადება სამუდამოდ წაიშლება.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>გაუქმება</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'წაშლა'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <>
                  <Link href={`/messages?userId=${listing.seller.id}`} className="block">
                    <Button className="w-full gap-2">
                      <MessageSquare className="h-4 w-4" />
                      მიწერა
                    </Button>
                  </Link>

                  <FavoriteButton
                    listingId={listing.id}
                    isFavorited={listing.isFavorited ?? false}
                    showText
                    variant="outline"
                    className="w-full"
                  />
                </>
              )}

              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="flex-1">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="flex-1">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Seller */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">გამყიდველი</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/${listing.seller.username}`}
                className="flex items-center gap-3 rounded-md p-2 -m-2 hover:bg-muted transition-colors"
              >
                <UserAvatar user={listing.seller} size="lg" />
                <div>
                  <p className="font-semibold">{listing.seller.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    @{listing.seller.username}
                  </p>
                </div>
              </Link>

              {!isOwner && (
                <div className="mt-4">
                  <Link href={`/${listing.seller.username}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      პროფილის ნახვა
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Safety tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">უსაფრთხოება</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• შეხვდით საჯარო ადგილას</p>
              <p>• გადაამოწმეთ საქონელი გადახდამდე</p>
              <p>• არ გადაიხადოთ წინასწარ</p>
              <p>• ეჭვის შემთხვევაში, შეატყობინეთ</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
