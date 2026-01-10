'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface BannerData {
  id: string;
  imageUrl: string;
  link?: string;
  alt: string;
}

interface MarketplaceBannerProps {
  banner: BannerData;
  className?: string;
}

export function MarketplaceBanner({ banner, className }: MarketplaceBannerProps) {
  const content = (
    <div
      className={cn(
        'relative aspect-[2/1] overflow-hidden rounded-lg bg-muted',
        className
      )}
    >
      {banner.imageUrl ? (
        <Image
          src={banner.imageUrl}
          alt={banner.alt}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
          <span className="text-lg font-medium text-muted-foreground">
            {banner.alt}
          </span>
        </div>
      )}
    </div>
  );

  if (banner.link) {
    return (
      <Link href={banner.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

interface BannerRowProps {
  banners: [BannerData, BannerData];
  className?: string;
}

export function BannerRow({ banners, className }: BannerRowProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', className)}>
      <MarketplaceBanner banner={banners[0]} />
      <MarketplaceBanner banner={banners[1]} />
    </div>
  );
}

// Placeholder banners for development
export const placeholderBanners: [BannerData, BannerData][] = [
  [
    { id: '1', imageUrl: '', link: '/marketplace/motorcycles', alt: 'მოტოციკლები' },
    { id: '2', imageUrl: '', link: '/marketplace/parts', alt: 'ნაწილები' },
  ],
  [
    { id: '3', imageUrl: '', link: '/marketplace/equipment', alt: 'ეკიპირება' },
    { id: '4', imageUrl: '', link: '/marketplace/accessories', alt: 'აქსესუარები' },
  ],
  [
    { id: '5', imageUrl: '', link: '#', alt: 'აქცია 1' },
    { id: '6', imageUrl: '', link: '#', alt: 'აქცია 2' },
  ],
  [
    { id: '7', imageUrl: '', link: '#', alt: 'სპეციალური შეთავაზება' },
    { id: '8', imageUrl: '', link: '#', alt: 'ახალი კოლექცია' },
  ],
];
