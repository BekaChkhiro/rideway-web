'use client';

import { NoPosts } from '@/components/shared/empty-state';

export default function FeedPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Feed</h1>

      {/* TODO: Replace with actual feed content */}
      <NoPosts />
    </div>
  );
}
