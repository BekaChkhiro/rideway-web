'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

import {
  getAdminForumThreads,
  deleteAdminForumThread,
  toggleThreadPin,
  toggleThreadLock,
} from '@/lib/api/admin';
import { queryKeys } from '@/types';
import type { AdminForumFilters } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { ForumThreadsTable, ContentTableSkeleton } from '@/components/admin/content-table';

export default function AdminForumPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<AdminForumFilters>({
    page: 1,
    limit: 20,
  });
  const [searchValue, setSearchValue] = useState('');
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminForumThreads(filters as Record<string, unknown>),
    queryFn: () => getAdminForumThreads(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminForumThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forum'] });
      setThreadToDelete(null);
      toast.success('Thread has been deleted');
    },
    onError: () => {
      toast.error('Failed to delete thread');
    },
  });

  const pinMutation = useMutation({
    mutationFn: toggleThreadPin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forum'] });
      toast.success('Thread pin status updated');
    },
    onError: () => {
      toast.error('Failed to update thread');
    },
  });

  const lockMutation = useMutation({
    mutationFn: toggleThreadLock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forum'] });
      toast.success('Thread lock status updated');
    },
    onError: () => {
      toast.error('Failed to update thread');
    },
  });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchValue, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      isPinned: value === 'pinned' ? true : undefined,
      isLocked: value === 'locked' ? true : undefined,
      page: 1,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Forum</h1>
        <p className="text-muted-foreground">
          Moderate forum threads - pin, lock, or delete.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search threads..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <Select
          value={
            filters.isPinned ? 'pinned' : filters.isLocked ? 'locked' : 'all'
          }
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Threads</SelectItem>
            <SelectItem value="pinned">Pinned</SelectItem>
            <SelectItem value="locked">Locked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Threads Table */}
      {isLoading ? (
        <ContentTableSkeleton />
      ) : data?.threads && data.threads.length > 0 ? (
        <>
          <ForumThreadsTable
            threads={data.threads}
            onDelete={setThreadToDelete}
            onTogglePin={(threadId) => pinMutation.mutate(threadId)}
            onToggleLock={(threadId) => lockMutation.mutate(threadId)}
          />

          {/* Pagination */}
          {data.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(data.meta.page - 1) * data.meta.limit + 1} to{' '}
                {Math.min(data.meta.page * data.meta.limit, data.meta.total)} of{' '}
                {data.meta.total} threads
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
          No threads found
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!threadToDelete}
        onOpenChange={(open) => !open && setThreadToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Thread</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this thread? This action cannot be
              undone and will also delete all replies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => threadToDelete && deleteMutation.mutate(threadToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
