// Admin Types

import type { UserRole, User } from './user';
import type { Post, Comment } from './post';
import type { Listing } from './listing';
import type { ForumThread } from './forum';

// Dashboard Stats
export interface DashboardStats {
  users: {
    total: number;
    newToday: number;
    newThisWeek: number;
    banned: number;
  };
  content: {
    posts: number;
    comments: number;
    listings: number;
    forumThreads: number;
    services: number;
  };
  activity: {
    postsToday: number;
    messagesToday: number;
    newListingsToday: number;
  };
}

// Admin User (extended with admin-specific fields)
export interface AdminUser extends User {
  isBanned: boolean;
  bannedAt: string | null;
  bannedUntil: string | null;
  banReason: string | null;
  lastLoginAt: string | null;
}

// User filters for admin
export interface AdminUserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isBanned?: boolean;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'username';
  sortOrder?: 'asc' | 'desc';
}

// Content filters for admin
export interface AdminContentFilters {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Forum thread filters for admin
export interface AdminForumFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Ban user data
export interface BanUserData {
  reason: string;
  duration?: number; // in days, null for permanent
}

// Admin Post (with user info)
export interface AdminPost extends Post {
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

// Admin Comment (with user and post info)
export interface AdminComment extends Comment {
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
  post: {
    id: string;
    content: string;
  };
  isDeleted: boolean;
}

// Admin Listing (with user info)
export interface AdminListing extends Listing {
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

// Admin Forum Thread (with user info)
export interface AdminForumThread extends ForumThread {
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
}
