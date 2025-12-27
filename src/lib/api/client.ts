import { getSession, signOut } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Error class for API errors
export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: unknown;

  constructor(
    message: string,
    status: number = 500,
    code: string = 'UNKNOWN_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Request configuration
interface RequestConfig extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
  timeout?: number;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    return headers;
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      if (isJson) {
        const errorData = await response.json();
        throw new ApiError(
          errorData.error?.message || 'Request failed',
          response.status,
          errorData.error?.code || 'REQUEST_FAILED',
          errorData.error?.details
        );
      }

      throw new ApiError(
        response.statusText || 'Request failed',
        response.status,
        'REQUEST_FAILED'
      );
    }

    if (!isJson) {
      return {} as T;
    }

    const data: ApiResponse<T> = await response.json();

    if (!data.success && data.error) {
      throw new ApiError(
        data.error.message,
        response.status,
        data.error.code,
        data.error.details
      );
    }

    return data.data as T;
  }

  private async handleTokenRefresh(
    originalRequest: () => Promise<Response>
  ): Promise<Response> {
    if (this.isRefreshing) {
      // Wait for token refresh
      return new Promise((resolve) => {
        this.subscribeTokenRefresh(async () => {
          resolve(await originalRequest());
        });
      });
    }

    this.isRefreshing = true;

    try {
      const session = await getSession();

      if (!session?.refreshToken) {
        throw new Error('No refresh token available');
      }

      // Try to refresh the token
      const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Token refresh failed');
      }

      const refreshData = await refreshResponse.json();

      if (!refreshData.success) {
        throw new Error('Token refresh failed');
      }

      // Update session (this would be handled by NextAuth callbacks)
      this.onTokenRefreshed(refreshData.data.accessToken);

      // Retry original request
      return await originalRequest();
    } catch {
      // Refresh failed, logout user
      await signOut({ redirect: true, callbackUrl: '/login?error=SessionExpired' });
      throw new ApiError('Session expired', 401, 'SESSION_EXPIRED');
    } finally {
      this.isRefreshing = false;
    }
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig & { body?: unknown } = {}
  ): Promise<T> {
    const { params, skipAuth, timeout = 30000, body, ...init } = config;
    const url = this.buildUrl(endpoint, params);

    const headers = skipAuth
      ? { 'Content-Type': 'application/json' }
      : await this.getAuthHeaders();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const makeRequest = async (): Promise<Response> => {
      return fetch(url, {
        ...init,
        headers: {
          ...headers,
          ...init.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    };

    try {
      let response = await makeRequest();

      // Handle 401 - try token refresh
      if (response.status === 401 && !skipAuth) {
        response = await this.handleTokenRefresh(makeRequest);
      }

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408, 'TIMEOUT');
        }
        throw new ApiError(error.message, 500, 'NETWORK_ERROR');
      }

      throw new ApiError('Unknown error occurred', 500, 'UNKNOWN_ERROR');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // HTTP Methods
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'GET',
      params,
    });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }

  // File upload
  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: Omit<RequestConfig, 'body'>
  ): Promise<T> {
    const { skipAuth, timeout = 60000, ...init } = config || {};

    const session = skipAuth ? null : await getSession();
    const headers: HeadersInit = {};

    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.buildUrl(endpoint), {
        ...init,
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Upload timeout', 408, 'TIMEOUT');
        }
        throw new ApiError(error.message, 500, 'UPLOAD_ERROR');
      }

      throw new ApiError('Upload failed', 500, 'UPLOAD_ERROR');
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export class for testing or custom instances
export { ApiClient };
