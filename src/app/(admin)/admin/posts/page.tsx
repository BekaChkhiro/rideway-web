'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

import { getAdminPosts, deleteAdminPost } from '@/lib/api/admin';
import { queryKeys } from '@/types';
import type { AdminContentFilters } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { PostsTable, ContentTableSkeleton } from '@/components/admin/content-table';

export default function AdminPostsPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<AdminContentFilters>({
    page: 1,
    limit: 20,
  });
  const [searchValue, setSearchValue] = useState('');
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminPosts(filters as Record<string, unknown>),
    queryFn: () => getAdminPosts(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      setPostToDelete(null);
      toast.success('Post has been deleted');
    },
    onError: () => {
      toast.error('Failed to delete post');
    },
  });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchValue, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Posts</h1>
        <p className="text-muted-foreground">
          Moderate and manage user posts.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Posts Table */}
      {isLoading ? (
        <ContentTableSkeleton />
      ) : data?.posts && data.posts.length > 0 ? (
        <>
          <PostsTable
            posts={data.posts}
            onDelete={setPostToDelete}
          />

          {/* Pagination */}
          {data.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(data.meta.page - 1) * data.meta.limit + 1} to{' '}
                {Math.min(data.meta.page * data.meta.limit, data.meta.total)} of{' '}
                {data.meta.total} posts
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.meta.page === 1}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.meta.page === data.meta.totalPages}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          No posts found
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!postToDelete}
        onOpenChange={(open) => !open && setPostToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => postToDelete && deleteMutation.mutate(postToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
