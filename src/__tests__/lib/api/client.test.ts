import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError, ApiClient } from '@/lib/api/client';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  getSession: vi.fn(() => Promise.resolve(null)),
  signOut: vi.fn(),
}));

describe('ApiError', () => {
  it('should create an error with default values', () => {
    const error = new ApiError('Test error');

    expect(error.message).toBe('Test error');
    expect(error.status).toBe(500);
    expect(error.code).toBe('UNKNOWN_ERROR');
    expect(error.details).toBeUndefined();
    expect(error.name).toBe('ApiError');
  });

  it('should create an error with custom values', () => {
    const details = { field: 'email', issue: 'invalid' };
    const error = new ApiError('Validation failed', 400, 'VALIDATION_ERROR', details);

    expect(error.message).toBe('Validation failed');
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual(details);
  });

  it('should be an instance of Error', () => {
    const error = new ApiError('Test');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });
});

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient('https://api.example.com');
    vi.resetAllMocks();
  });

  describe('URL building', () => {
    it('should build URL without params', async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true, data: { id: 1 } }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await client.get('/users');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should build URL with params', async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true, data: [] }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await client.get('/users', { page: 1, limit: 10, active: true });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&limit=10&active=true',
        expect.any(Object)
      );
    });

    it('should skip undefined params', async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true, data: [] }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await client.get('/users', { page: 1, filter: undefined });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1',
        expect.any(Object)
      );
    });
  });

  describe('HTTP Methods', () => {
    const successResponse = {
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ success: true, data: { id: 1, name: 'Test' } }),
    };

    it('should make GET request', async () => {
      global.fetch = vi.fn().mockResolvedValue(successResponse);

      const result = await client.get('/users/1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should make POST request with body', async () => {
      global.fetch = vi.fn().mockResolvedValue(successResponse);

      const data = { name: 'New User', email: 'user@example.com' };
      await client.post('/users', data);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      );
    });

    it('should make PUT request', async () => {
      global.fetch = vi.fn().mockResolvedValue(successResponse);

      const data = { name: 'Updated User' };
      await client.put('/users/1', data);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        })
      );
    });

    it('should make PATCH request', async () => {
      global.fetch = vi.fn().mockResolvedValue(successResponse);

      const data = { name: 'Patched User' };
      await client.patch('/users/1', data);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(data),
        })
      );
    });

    it('should make DELETE request', async () => {
      const deleteResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true, data: null }),
      };
      global.fetch = vi.fn().mockResolvedValue(deleteResponse);

      await client.delete('/users/1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw ApiError on non-ok response with JSON error', async () => {
      const errorResponse = {
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () =>
          Promise.resolve({
            error: {
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: { field: 'email' },
            },
          }),
      };
      global.fetch = vi.fn().mockResolvedValue(errorResponse);

      await expect(client.get('/users')).rejects.toThrow(ApiError);

      try {
        await client.get('/users');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(400);
        expect((error as ApiError).code).toBe('VALIDATION_ERROR');
      }
    });

    it('should throw ApiError on non-ok response without JSON', async () => {
      const errorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'text/plain' }),
      };
      global.fetch = vi.fn().mockResolvedValue(errorResponse);

      await expect(client.get('/users')).rejects.toThrow(ApiError);
    });

    it('should throw ApiError when response success is false', async () => {
      const errorResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () =>
          Promise.resolve({
            success: false,
            error: {
              message: 'User not found',
              code: 'NOT_FOUND',
            },
          }),
      };
      global.fetch = vi.fn().mockResolvedValue(errorResponse);

      await expect(client.get('/users/999')).rejects.toThrow(ApiError);
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(client.get('/users')).rejects.toThrow(ApiError);

      try {
        await client.get('/users');
      } catch (error) {
        expect((error as ApiError).code).toBe('NETWORK_ERROR');
      }
    });
  });

  describe('Headers', () => {
    it('should include Content-Type header', async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true, data: {} }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await client.get('/users', undefined, { skipAuth: true });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('File Upload', () => {
    it('should upload file with FormData', async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true, data: { url: 'https://example.com/file.jpg' } }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.jpg');

      const result = await client.upload('/upload', formData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/upload'),
        expect.objectContaining({
          method: 'POST',
          body: formData,
        })
      );
      expect(result).toEqual({ url: 'https://example.com/file.jpg' });
    });
  });
});
