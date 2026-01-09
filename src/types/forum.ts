// Forum Types

import type { UserCard } from './user';

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  threadsCount: number;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: UserCard;
  category: ForumCategory;
  isPinned: boolean;
  isLocked: boolean;
  viewsCount: number;
  repliesCount: number;
  likesCount: number;
  isLiked?: boolean;
  lastReplyAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadReply {
  id: string;
  content: string;
  author: UserCard;
  threadId: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadData {
  title: string;
  content: string;
  categoryId: string;
}

export interface UpdateThreadData {
  title?: string;
  content?: string;
}

export interface CreateReplyData {
  content: string;
}

export interface ThreadFilters {
  categoryId?: string;
  sort?: 'latest' | 'oldest' | 'popular' | 'most_replies';
}

// Service Types

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  servicesCount: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  location: string | null;
  phone: string | null;
  website: string | null;
  images: ServiceImage[];
  category: ServiceCategory;
  owner: UserCard;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceImage {
  id: string;
  url: string;
  order: number;
}

export interface ServiceReview {
  id: string;
  rating: number;
  comment: string | null;
  author: UserCard;
  serviceId: string;
  createdAt: string;
}

export interface CreateServiceData {
  name: string;
  description: string;
  categoryId: string;
  location?: string;
  phone?: string;
  website?: string;
  images?: File[];
}

export interface CreateReviewData {
  rating: number;
  comment?: string;
}
