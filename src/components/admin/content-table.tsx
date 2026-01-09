'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import { MoreHorizontal, Trash2, Eye, Pin, Lock, Unlock } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminPost, AdminListing, AdminForumThread } from '@/types';

// Posts Table
interface PostsTableProps {
  posts: AdminPost[];
  onDelete: (postId: string) => void;
}

export function PostsTable({ posts, onDelete }: PostsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Author</TableHead>
            <TableHead className="max-w-[300px]">Content</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <Link
                  href={`/${post.user.username}`}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {post.user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium">
                    @{post.user.username}
                  </div>
                </Link>
              </TableCell>
              <TableCell className="max-w-[300px]">
                <p className="line-clamp-2 text-sm">{post.content}</p>
                {post.images && post.images.length > 0 && (
                  <Badge variant="outline" className="mt-1">
                    {post.images.length} images
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span>{post.likesCount} likes</span>
                  <span>{post.commentsCount} comments</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), {
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
                      <Link href={`/post/${post.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Post
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(post.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Post
                    </DropdownMenuItem>
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

// Listings Table
interface ListingsTableProps {
  listings: AdminListing[];
  onDelete: (listingId: string) => void;
}

export function ListingsTable({ listings, onDelete }: ListingsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Seller</TableHead>
            <TableHead>Listing</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell>
                <Link
                  href={`/${listing.user.username}`}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={listing.user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {listing.user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium">
                    @{listing.user.username}
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <div className="font-medium">{listing.title}</div>
                {listing.images && listing.images.length > 0 && (
                  <Badge variant="outline" className="mt-1">
                    {listing.images.length} images
                  </Badge>
                )}
              </TableCell>
              <TableCell className="font-medium">
                {listing.price.toLocaleString()} GEL
              </TableCell>
              <TableCell>
                {listing.status === 'SOLD' ? (
                  <Badge variant="secondary">Sold</Badge>
                ) : listing.status === 'RESERVED' ? (
                  <Badge variant="outline">Reserved</Badge>
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
                {formatDistanceToNow(new Date(listing.createdAt), {
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
                      <Link href={`/marketplace/${listing.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Listing
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(listing.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Listing
                    </DropdownMenuItem>
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

// Forum Threads Table
interface ForumThreadsTableProps {
  threads: AdminForumThread[];
  onDelete: (threadId: string) => void;
  onTogglePin: (threadId: string) => void;
  onToggleLock: (threadId: string) => void;
}

export function ForumThreadsTable({
  threads,
  onDelete,
  onTogglePin,
  onToggleLock,
}: ForumThreadsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Author</TableHead>
            <TableHead>Thread</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {threads.map((thread) => (
            <TableRow key={thread.id}>
              <TableCell>
                <Link
                  href={`/${thread.user.username}`}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={thread.user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {thread.user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium">
                    @{thread.user.username}
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <div className="font-medium">{thread.title}</div>
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {thread.content}
                </p>
              </TableCell>
              <TableCell>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span>{thread.likesCount} likes</span>
                  <span>{thread.repliesCount} replies</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {thread.isPinned && (
                    <Badge variant="secondary" className="gap-1">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </Badge>
                  )}
                  {thread.isLocked && (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Locked
                    </Badge>
                  )}
                  {!thread.isPinned && !thread.isLocked && (
                    <Badge variant="outline">Normal</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(thread.createdAt), {
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
                      <Link href={`/forum/thread/${thread.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Thread
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onTogglePin(thread.id)}>
                      <Pin className="mr-2 h-4 w-4" />
                      {thread.isPinned ? 'Unpin Thread' : 'Pin Thread'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleLock(thread.id)}>
                      {thread.isLocked ? (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Unlock Thread
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Lock Thread
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(thread.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Thread
                    </DropdownMenuItem>
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

// Skeleton
export function ContentTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Author</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(10)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="mt-1 h-3 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
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
