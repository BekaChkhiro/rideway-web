'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import {
  MoreHorizontal,
  Ban,
  ShieldCheck,
  ShieldX,
  Trash2,
  Eye,
  Shield,
  User as UserIcon,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminUser, UserRole } from '@/types';

interface UsersTableProps {
  users: AdminUser[];
  onBan: (user: AdminUser) => void;
  onUnban: (userId: string) => void;
  onChangeRole: (userId: string, role: UserRole) => void;
  onDelete: (userId: string) => void;
  currentUserRole: UserRole;
}

export function UsersTable({
  users,
  onBan,
  onUnban,
  onChangeRole,
  onDelete,
  currentUserRole,
}: UsersTableProps) {
  const isAdmin = currentUserRole === 'ADMIN';

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      @{user.username}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                <StatusBadge isBanned={user.isBanned} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(user.createdAt), {
                  addSuffix: true,
                  locale: ka,
                })}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {user.lastLoginAt
                  ? formatDistanceToNow(new Date(user.lastLoginAt), {
                      addSuffix: true,
                      locale: ka,
                    })
                  : 'Never'}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/${user.username}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    {user.isBanned ? (
                      <DropdownMenuItem onClick={() => onUnban(user.id)}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Unban User
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => onBan(user)}
                        className="text-destructive"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Ban User
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                        {user.role !== 'USER' && (
                          <DropdownMenuItem
                            onClick={() => onChangeRole(user.id, 'USER')}
                          >
                            <UserIcon className="mr-2 h-4 w-4" />
                            Set as User
                          </DropdownMenuItem>
                        )}
                        {user.role !== 'MODERATOR' && (
                          <DropdownMenuItem
                            onClick={() => onChangeRole(user.id, 'MODERATOR')}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Set as Moderator
                          </DropdownMenuItem>
                        )}
                        {user.role !== 'ADMIN' && (
                          <DropdownMenuItem
                            onClick={() => onChangeRole(user.id, 'ADMIN')}
                          >
                            <ShieldX className="mr-2 h-4 w-4" />
                            Set as Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(user.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const variants: Record<UserRole, { label: string; className: string }> = {
    ADMIN: {
      label: 'Admin',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
    MODERATOR: {
      label: 'Moderator',
      className:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    USER: {
      label: 'User',
      className:
        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    },
  };

  const { label, className } = variants[role];

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

function StatusBadge({ isBanned }: { isBanned: boolean }) {
  if (isBanned) {
    return (
      <Badge variant="destructive" className="gap-1">
        <Ban className="h-3 w-3" />
        Banned
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    >
      <ShieldCheck className="h-3 w-3" />
      Active
    </Badge>
  );
}

export function UsersTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(10)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
