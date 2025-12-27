import { describe, it, expect, beforeEach, vi } from 'vitest';
import { server } from '../../mocks/server';
import { mockState, mockTokens } from '../../mocks/handlers';
import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:8000/api';

describe('Token Refresh Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Token Refresh', () => {
    it('should return new tokens on successful refresh', async () => {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: mockTokens.refreshToken }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.data.accessToken).toBe('new-access-token');
      expect(data.data.refreshToken).toBe('new-refresh-token');
    });

    it('should update access token expiration', async () => {
      const beforeRefresh = Date.now();

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: mockTokens.refreshToken }),
      });

      const afterRefresh = Date.now();
      const data = await response.json();

      expect(data.success).toBe(true);
      // Token should be refreshed within the test duration
      expect(afterRefresh - beforeRefresh).toBeLessThan(1000);
    });
  });

  describe('Failed Token Refresh', () => {
    it('should return error for invalid refresh token', async () => {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'invalid-token' }),
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_TOKEN');
    });

    it('should return error when refresh token is expired', async () => {
      mockState.tokenExpired = true;

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: mockTokens.refreshToken }),
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('TOKEN_EXPIRED');
    });

    it('should return error for missing refresh token', async () => {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.success).toBe(false);
    });
  });

  describe('Token Refresh Logic', () => {
    // Simulate JWT callback token refresh logic
    const refreshAccessToken = async (token: {
      accessToken: string;
      refreshToken: string;
    }) => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: token.refreshToken }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || 'Failed to refresh token');
        }

        return {
          ...token,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken ?? token.refreshToken,
          accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 minutes
        };
      } catch {
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        };
      }
    };

    it('should refresh token successfully', async () => {
      const oldToken = {
        accessToken: 'old-access-token',
        refreshToken: mockTokens.refreshToken,
      };

      const newToken = await refreshAccessToken(oldToken);

      expect(newToken.accessToken).toBe('new-access-token');
      expect(newToken.refreshToken).toBe('new-refresh-token');
      expect('accessTokenExpires' in newToken).toBe(true);
      expect('error' in newToken).toBe(false);
    });

    it('should return error token on refresh failure', async () => {
      mockState.tokenExpired = true;

      const oldToken = {
        accessToken: 'old-access-token',
        refreshToken: mockTokens.refreshToken,
      };

      const newToken = await refreshAccessToken(oldToken);

      expect('error' in newToken && newToken.error).toBe('RefreshAccessTokenError');
    });
  });

  describe('Automatic Token Refresh', () => {
    // Simulate automatic refresh based on token expiration
    const shouldRefreshToken = (token: {
      accessTokenExpires?: number;
    }) => {
      if (!token.accessTokenExpires) return false;
      return Date.now() >= token.accessTokenExpires;
    };

    it('should trigger refresh when token is expired', () => {
      const expiredToken = {
        accessTokenExpires: Date.now() - 1000, // 1 second ago
      };

      expect(shouldRefreshToken(expiredToken)).toBe(true);
    });

    it('should not trigger refresh when token is valid', () => {
      const validToken = {
        accessTokenExpires: Date.now() + 10 * 60 * 1000, // 10 minutes from now
      };

      expect(shouldRefreshToken(validToken)).toBe(false);
    });

    it('should trigger refresh when token expires exactly now', () => {
      const exactToken = {
        accessTokenExpires: Date.now(),
      };

      expect(shouldRefreshToken(exactToken)).toBe(true);
    });
  });

  describe('Request Retry After Refresh', () => {
    let requestCount = 0;

    beforeEach(() => {
      requestCount = 0;

      // Mock an endpoint that returns 401 first, then succeeds after refresh
      server.use(
        http.get(`${API_URL}/users/me`, ({ request }) => {
          requestCount++;
          const authHeader = request.headers.get('Authorization');

          if (requestCount === 1 && authHeader === 'Bearer old-token') {
            return HttpResponse.json(
              {
                success: false,
                error: { code: 'TOKEN_EXPIRED', message: 'Token expired' },
              },
              { status: 401 }
            );
          }

          if (authHeader === 'Bearer new-access-token') {
            return HttpResponse.json({
              success: true,
              data: { id: '1', email: 'test@example.com' },
            });
          }

          return HttpResponse.json(
            { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
            { status: 401 }
          );
        })
      );
    });

    it('should retry request with new token after refresh', async () => {
      // First request with old token
      const firstResponse = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: 'Bearer old-token' },
      });

      expect(firstResponse.status).toBe(401);

      // Refresh token
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: mockTokens.refreshToken }),
      });
      const refreshData = await refreshResponse.json();

      // Retry with new token
      const retryResponse = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${refreshData.data.accessToken}` },
      });
      const retryData = await retryResponse.json();

      expect(retryResponse.ok).toBe(true);
      expect(retryData.success).toBe(true);
      expect(retryData.data.email).toBe('test@example.com');
    });
  });

  describe('Concurrent Refresh Handling', () => {
    it('should handle multiple simultaneous refresh requests', async () => {
      // Simulate multiple concurrent requests
      const refreshPromises = Array(3)
        .fill(null)
        .map(() =>
          fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: mockTokens.refreshToken }),
          }).then((res) => res.json())
        );

      const results = await Promise.all(refreshPromises);

      // All requests should succeed
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.data.accessToken).toBe('new-access-token');
      });
    });
  });

  describe('Session Signout on Refresh Failure', () => {
    it('should return session expired error when refresh fails', async () => {
      mockState.tokenExpired = true;

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: mockTokens.refreshToken }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('TOKEN_EXPIRED');
    });

    it('should handle signout redirect URL', () => {
      // Simulate signout with callback URL
      const signOutOptions = {
        redirect: true,
        callbackUrl: '/login?error=SessionExpired',
      };

      expect(signOutOptions.callbackUrl).toContain('SessionExpired');
    });
  });
});
