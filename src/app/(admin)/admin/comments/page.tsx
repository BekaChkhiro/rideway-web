'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import { Search, MoreHorizontal, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { getAdminComments, deleteAdminComment } from '@/lib/api/admin';
import { queryKeys } from '@/types';
import type { AdminContentFilters } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { ContentTableSkeleton } from '@/components/admin/content-table';

export default function AdminCommentsPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<AdminContentFilters>({
    page: 1,
    limit: 20,
  });
  const [searchValue, setSearchValue] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminComments(filters as Record<string, unknown>),
    queryFn: () => getAdminComments(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] });
      setCommentToDelete(null);
      toast.success('Comment has been deleted');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchValue, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comments</h1>
        <p className="text-muted-foreground">
          Moderate and manage user comments.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search comments..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Comments Table */}
      {isLoading ? (
        <ContentTableSkeleton />
      ) : data?.comments && data.comments.length > 0 ? (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead className="max-w-[300px]">Comment</TableHead>
                  <TableHead>On Post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <Link
                        href={`/${comment.user.username}`}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.user.avatarUrl || undefined} />
                          <AvatarFallback>
                            {comment.user.fullName?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium">
                          @{comment.user.username}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="line-clamp-2 text-sm">{comment.content}</p>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/post/${comment.post.id}`}
                        className="line-clamp-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        {comment.post.content.substring(0, 50)}...
                      </Link>
                    </TableCell>
                    <TableCell>
                      {comment.isDeleted ? (
                        <Badge variant="secondary">Deleted</Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: ka,
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/post/${comment.post.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Post
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setCommentToDelete(comment.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Comment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(data.meta.page - 1) * data.meta.limit + 1} to{' '}
                {Math.min(data.meta.page * data.meta.limit, data.meta.total)} of{' '}
                {data.meta.total} comments
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
          No comments found
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!commentToDelete}
        onOpenChange={(open) => !open && setCommentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => commentToDelete && deleteMutation.mutate(commentToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
