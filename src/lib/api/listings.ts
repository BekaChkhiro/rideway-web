import { apiClient } from './client';
import type {
  ApiResponse,
  PaginationMeta,
  Listing,
  ListingCategory,
  ListingFilters,
  CreateListingData,
  UpdateListingData,
} from '@/types';

// ==================== Categories ====================

// Get all categories (hierarchical)
export async function getListingCategories(): Promise<ListingCategory[]> {
  const response = await apiClient.get<ApiResponse<ListingCategory[]>>(
    '/listings/categories'
  );
  return response.data.data;
}

// ==================== Listings ====================

// Get listings with filters
export async function getListings(
  filters: ListingFilters = {},
  page = 1,
  limit = 20
): Promise<{ listings: Listing[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Listing[]> & { meta: PaginationMeta }
  >('/listings', {
    params: { ...filters, page, limit },
  });
  return { listings: response.data.data, meta: response.data.meta! };
}

// Search listings
export async function searchListings(
  query: string,
  filters: ListingFilters = {},
  page = 1,
  limit = 20
): Promise<{ listings: Listing[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Listing[]> & { meta: PaginationMeta }
  >('/listings/search', {
    params: { q: query, ...filters, page, limit },
  });
  return { listings: response.data.data, meta: response.data.meta! };
}

// Get popular listings
export async function getPopularListings(
  limit = 10
): Promise<Listing[]> {
  const response = await apiClient.get<ApiResponse<Listing[]>>(
    '/listings/popular',
    { params: { limit } }
  );
  return response.data.data;
}

// Get user's listings
export async function getUserListings(
  userId: string,
  page = 1,
  limit = 20
): Promise<{ listings: Listing[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Listing[]> & { meta: PaginationMeta }
  >(`/listings/user/${userId}`, {
    params: { page, limit },
  });
  return { listings: response.data.data, meta: response.data.meta! };
}

// Get my favorites
export async function getFavoriteListings(
  page = 1,
  limit = 20
): Promise<{ listings: Listing[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Listing[]> & { meta: PaginationMeta }
  >('/listings/favorites', {
    params: { page, limit },
  });
  return { listings: response.data.data, meta: response.data.meta! };
}

// ==================== Single Listing ====================

// Get single listing
export async function getListing(listingId: string): Promise<Listing> {
  const response = await apiClient.get<ApiResponse<Listing>>(
    `/listings/${listingId}`
  );
  return response.data.data;
}

// Create listing
export async function createListing(data: CreateListingData): Promise<Listing> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('price', data.price.toString());
  formData.append('type', data.type);
  formData.append('condition', data.condition);
  formData.append('categoryId', data.categoryId);

  // Common optional fields
  if (data.brand) formData.append('brand', data.brand);
  if (data.model) formData.append('model', data.model);
  if (data.year) formData.append('year', data.year.toString());

  // Location fields
  if (data.locationType) formData.append('locationType', data.locationType);
  if (data.locationCity) formData.append('locationCity', data.locationCity);

  // Motorcycle-specific fields
  if (data.motorcycleCategory) formData.append('motorcycleCategory', data.motorcycleCategory);
  if (data.customsStatus) formData.append('customsStatus', data.customsStatus);
  if (data.engineCC) formData.append('engineCC', data.engineCC.toString());
  if (data.mileage !== undefined) formData.append('mileage', data.mileage.toString());
  if (data.transmission) formData.append('transmission', data.transmission);

  if (data.images && data.images.length > 0) {
    data.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  const response = await apiClient.post<ApiResponse<Listing>>(
    '/listings',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
}

// Update listing
export async function updateListing(
  listingId: string,
  data: UpdateListingData
): Promise<Listing> {
  const response = await apiClient.patch<ApiResponse<Listing>>(
    `/listings/${listingId}`,
    data
  );
  return response.data.data;
}

// Delete listing
export async function deleteListing(listingId: string): Promise<void> {
  await apiClient.delete(`/listings/${listingId}`);
}

// Mark as sold
export async function markListingAsSold(listingId: string): Promise<Listing> {
  const response = await apiClient.post<ApiResponse<Listing>>(
    `/listings/${listingId}/sold`
  );
  return response.data.data;
}

// ==================== Favorites ====================

// Add to favorites
export async function addToFavorites(listingId: string): Promise<void> {
  await apiClient.post(`/listings/${listingId}/favorite`);
}

// Remove from favorites
export async function removeFromFavorites(listingId: string): Promise<void> {
  await apiClient.delete(`/listings/${listingId}/favorite`);
}

// Toggle favorite (returns new state)
export async function toggleFavorite(
  listingId: string,
  isFavorited: boolean
): Promise<boolean> {
  if (isFavorited) {
    await removeFromFavorites(listingId);
    return false;
  } else {
    await addToFavorites(listingId);
    return true;
  }
}
