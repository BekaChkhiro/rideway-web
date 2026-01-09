// User Types

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  username: string;
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  location: string | null;
  role: UserRole;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  isFollowing?: boolean;
  isBlocked?: boolean;
  isBlockedBy?: boolean;
}

export interface UserCard {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  isFollowing?: boolean;
}

export interface UpdateProfileData {
  fullName?: string;
  username?: string;
  bio?: string;
  location?: string;
}

export interface FollowData {
  userId: string;
}
