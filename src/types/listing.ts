// Listing Types

import type { UserCard } from './user';

export type ListingCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'PARTS';
export type ListingStatus = 'ACTIVE' | 'SOLD' | 'RESERVED' | 'EXPIRED';

export interface ListingCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  children?: ListingCategory[];
  listingsCount?: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: ListingCondition;
  status: ListingStatus;
  location: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  images: ListingImage[];
  category: ListingCategory;
  seller: UserCard;
  viewsCount: number;
  favoritesCount: number;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListingImage {
  id: string;
  url: string;
  order: number;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  condition: ListingCondition;
  categoryId: string;
  location?: string;
  brand?: string;
  model?: string;
  year?: number;
  images?: File[];
}

export interface UpdateListingData {
  title?: string;
  description?: string;
  price?: number;
  condition?: ListingCondition;
  categoryId?: string;
  location?: string;
  brand?: string;
  model?: string;
  year?: number;
}

export interface ListingFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ListingCondition;
  location?: string;
  brand?: string;
  status?: ListingStatus;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular';
}
