'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3X3, Heart, Bookmark } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

interface ProfileTabsProps {
  isOwnProfile: boolean;
}

export function ProfileTabs({ isOwnProfile }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
        <TabsTrigger
          value="posts"
          className="flex-1 sm:flex-none gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          <Grid3X3 className="h-4 w-4" />
          <span className="hidden sm:inline">Posts</span>
        </TabsTrigger>
        <TabsTrigger
          value="likes"
          className="flex-1 sm:flex-none gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Likes</span>
        </TabsTrigger>
        {isOwnProfile && (
          <TabsTrigger
            value="saved"
            className="flex-1 sm:flex-none gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Saved</span>
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="posts" className="mt-6">
        <EmptyState
          icon={<Grid3X3 className="h-full w-full" />}
          title="No posts yet"
          description={
            isOwnProfile
              ? "Share your first post with the community!"
              : "This user hasn't posted anything yet."
          }
        />
      </TabsContent>

      <TabsContent value="likes" className="mt-6">
        <EmptyState
          icon={<Heart className="h-full w-full" />}
          title="No likes yet"
          description={
            isOwnProfile
              ? "Posts you like will appear here."
              : "This user hasn't liked any posts yet."
          }
        />
      </TabsContent>

      {isOwnProfile && (
        <TabsContent value="saved" className="mt-6">
          <EmptyState
            icon={<Bookmark className="h-full w-full" />}
            title="No saved posts"
            description="Save posts to view them later."
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
