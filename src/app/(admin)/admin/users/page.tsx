'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

import {
  getAdminUsers,
  banUser,
  unbanUser,
  changeUserRole,
  deleteUser,
} from '@/lib/api/admin';
import { queryKeys } from '@/types';
import type { AdminUser, AdminUserFilters, BanUserData, UserRole } from '@/types';
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
import { UsersTable, UsersTableSkeleton } from '@/components/admin/users-table';
import { BanUserModal } from '@/components/admin/ban-user-modal';

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<AdminUserFilters>({
    page: 1,
    limit: 20,
  });
  const [searchValue, setSearchValue] = useState('');
  const [userToBan, setUserToBan] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminUsers(filters as Record<string, unknown>),
    queryFn: () => getAdminUsers(filters),
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: BanUserData }) =>
      banUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setUserToBan(null);
      toast.success('User has been banned');
    },
    onError: () => {
      toast.error('Failed to ban user');
    },
  });

  const unbanMutation = useMutation({
    mutationFn: unbanUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User has been unbanned');
    },
    onError: () => {
      toast.error('Failed to unban user');
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      changeUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User role has been updated');
    },
    onError: () => {
      toast.error('Failed to change user role');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setUserToDelete(null);
      toast.success('User has been deleted');
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchValue, page: 1 }));
  };

  const handleRoleFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      role: value === 'all' ? undefined : (value as UserRole),
      page: 1,
    }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      isBanned: value === 'all' ? undefined : value === 'banned',
      page: 1,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <Select
          value={filters.role || 'all'}
          onValueChange={handleRoleFilter}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="MODERATOR">Moderator</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={
            filters.isBanned === undefined
              ? 'all'
              : filters.isBanned
                ? 'banned'
                : 'active'
          }
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <UsersTableSkeleton />
      ) : data?.users ? (
        <>
          <UsersTable
            users={data.users}
            onBan={setUserToBan}
            onUnban={(userId) => unbanMutation.mutate(userId)}
            onChangeRole={(userId, role) =>
              changeRoleMutation.mutate({ userId, role })
            }
            onDelete={setUserToDelete}
            currentUserRole={(session?.user?.role as UserRole) || 'USER'}
          />

          {/* Pagination */}
          {data.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(data.meta.page - 1) * data.meta.limit + 1} to{' '}
                {Math.min(data.meta.page * data.meta.limit, data.meta.total)} of{' '}
                {data.meta.total} users
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
          No users found
        </div>
      )}

      {/* Ban Modal */}
      <BanUserModal
        user={userToBan}
        open={!!userToBan}
        onOpenChange={(open) => !open && setUserToBan(null)}
        onBan={async (userId, data) => {
          await banMutation.mutateAsync({ userId, data });
        }}
        isLoading={banMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone and will permanently remove all user data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => userToDelete && deleteMutation.mutate(userToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
