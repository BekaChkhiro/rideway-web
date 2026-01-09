'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Globe, Star, MoreHorizontal, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  onDelete?: (serviceId: string) => void;
}

export function ServiceCard({ service, onDelete }: ServiceCardProps) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === service.owner.id;
  const [imageError, setImageError] = useState(false);

  const coverImage = service.images[0]?.url;

  return (
    <Link href={`/services/${service.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        {/* Cover image */}
        <div className="relative aspect-video bg-muted">
          {coverImage && !imageError ? (
            <Image
              src={coverImage}
              alt={service.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">🔧</span>
            </div>
          )}
          {service.isVerified && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 gap-1 bg-green-500 text-white"
            >
              <CheckCircle className="h-3 w-3" />
              ვერიფიცირებული
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{service.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {service.category.name}
                </Badge>
              </div>
            </div>

            {/* Menu */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete?.(service.id);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    წაშლა
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Description */}
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {service.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1">
              <Star className={cn(
                'h-4 w-4',
                service.rating > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
              )} />
              <span className="text-sm font-medium">
                {service.rating > 0 ? service.rating.toFixed(1) : '-'}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({service.reviewsCount} შეფასება)
            </span>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-1 mt-3 text-sm text-muted-foreground">
            {service.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{service.location}</span>
              </div>
            )}
            {service.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{service.phone}</span>
              </div>
            )}
            {service.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span className="truncate">{service.website}</span>
              </div>
            )}
          </div>

          {/* Owner */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <UserAvatar user={service.owner} size="sm" />
            <span className="text-sm text-muted-foreground">
              {service.owner.fullName}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton for loading state
export function ServiceCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-8 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
        <div className="space-y-1">
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex items-center gap-2 pt-3 border-t">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
