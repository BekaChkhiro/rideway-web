import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError, ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Token storage keys
const ACCESS_TOKEN_KEY = 'rideway_access_token';
const REFRESH_TOKEN_KEY = 'rideway_refresh_token';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Token management functions
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Request interceptor - add token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// Response interceptor - handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    // If no config or already retried, reject
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Check if it's a 401 error and not a refresh token request
    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        isRefreshing = false;
        // Don't redirect - let the component handle auth errors
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<
          ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>
        >(`${API_URL}/auth/refresh`, { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
        setTokens(accessToken, newRefreshToken);

        isRefreshing = false;
        onTokenRefreshed(accessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        clearTokens();
        // Don't redirect - let the component handle auth errors
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to extract error message
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    return apiError?.error?.message || error.message || 'Something went wrong';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
}

// Helper function to check if error is API error
export function isApiError(error: unknown): error is AxiosError<ApiError> {
  return axios.isAxiosError(error) && error.response?.data?.error !== undefined;
}

export default apiClient;
