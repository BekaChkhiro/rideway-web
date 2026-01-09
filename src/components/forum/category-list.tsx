'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ForumCategory } from '@/types';

interface CategoryListProps {
  categories: ForumCategory[];
  activeCategory?: string;
}

export function CategoryList({ categories, activeCategory }: CategoryListProps) {
  const pathname = usePathname();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          კატეგორიები
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <Link
          href="/forum"
          className={cn(
            'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
            pathname === '/forum' && !activeCategory && 'bg-muted font-medium'
          )}
        >
          <span>ყველა თემა</span>
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/forum/category/${category.slug}`}
            className={cn(
              'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
              activeCategory === category.slug && 'bg-muted font-medium'
            )}
          >
            <span>{category.name}</span>
            <Badge variant="secondary" className="text-xs">
              {category.threadsCount}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

// Skeleton for loading state
export function CategoryListSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="h-5 w-24 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-md px-3 py-2"
          >
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-5 w-8 bg-muted animate-pulse rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
