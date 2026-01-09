import { apiClient } from './client';
import type {
  ApiResponse,
  PaginationMeta,
  ServiceCategory,
  Service,
  ServiceReview,
  CreateServiceData,
  CreateReviewData,
} from '@/types';

// ==================== Categories ====================

// Get all service categories
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const response = await apiClient.get<ApiResponse<ServiceCategory[]>>(
    '/services/categories'
  );
  return response.data.data;
}

// ==================== Services ====================

// Get services with filters
export async function getServices(
  categoryId?: string,
  page = 1,
  limit = 20
): Promise<{ services: Service[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Service[]> & { meta: PaginationMeta }
  >('/services', {
    params: { categoryId, page, limit },
  });
  return { services: response.data.data, meta: response.data.meta! };
}

// Search services
export async function searchServices(
  query: string,
  page = 1,
  limit = 20
): Promise<{ services: Service[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Service[]> & { meta: PaginationMeta }
  >('/services/search', {
    params: { q: query, page, limit },
  });
  return { services: response.data.data, meta: response.data.meta! };
}

// Get user's services
export async function getUserServices(
  userId: string,
  page = 1,
  limit = 20
): Promise<{ services: Service[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<Service[]> & { meta: PaginationMeta }
  >(`/services/user/${userId}`, {
    params: { page, limit },
  });
  return { services: response.data.data, meta: response.data.meta! };
}

// Get single service
export async function getService(serviceId: string): Promise<Service> {
  const response = await apiClient.get<ApiResponse<Service>>(
    `/services/${serviceId}`
  );
  return response.data.data;
}

// Create service
export async function createService(data: CreateServiceData): Promise<Service> {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('categoryId', data.categoryId);

  if (data.location) formData.append('location', data.location);
  if (data.phone) formData.append('phone', data.phone);
  if (data.website) formData.append('website', data.website);

  if (data.images && data.images.length > 0) {
    data.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  const response = await apiClient.post<ApiResponse<Service>>(
    '/services',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
}

// Update service
export async function updateService(
  serviceId: string,
  data: Partial<Omit<CreateServiceData, 'images'>>
): Promise<Service> {
  const response = await apiClient.patch<ApiResponse<Service>>(
    `/services/${serviceId}`,
    data
  );
  return response.data.data;
}

// Delete service
export async function deleteService(serviceId: string): Promise<void> {
  await apiClient.delete(`/services/${serviceId}`);
}

// ==================== Reviews ====================

// Get reviews for service
export async function getServiceReviews(
  serviceId: string,
  page = 1,
  limit = 20
): Promise<{ reviews: ServiceReview[]; meta: PaginationMeta }> {
  const response = await apiClient.get<
    ApiResponse<ServiceReview[]> & { meta: PaginationMeta }
  >(`/services/${serviceId}/reviews`, {
    params: { page, limit },
  });
  return { reviews: response.data.data, meta: response.data.meta! };
}

// Create review
export async function createServiceReview(
  serviceId: string,
  data: CreateReviewData
): Promise<ServiceReview> {
  const response = await apiClient.post<ApiResponse<ServiceReview>>(
    `/services/${serviceId}/reviews`,
    data
  );
  return response.data.data;
}

// Delete review
export async function deleteServiceReview(serviceId: string): Promise<void> {
  await apiClient.delete(`/services/${serviceId}/reviews`);
}
