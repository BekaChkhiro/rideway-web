import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:8000/api';

// Mock user data
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  fullName: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg',
  isVerified: true,
};

export const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

// Track state for tests
export const mockState = {
  isLoggedIn: false,
  tokenExpired: false,
  registeredEmails: new Set<string>(),
  verifiedEmails: new Set<string>(),
  passwordResetEmails: new Set<string>(),
};

export const resetMockState = () => {
  mockState.isLoggedIn = false;
  mockState.tokenExpired = false;
  mockState.registeredEmails.clear();
  mockState.verifiedEmails.clear();
  mockState.passwordResetEmails.clear();
};

export const handlers = [
  // Login endpoint
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    if (body.email === 'test@example.com' && body.password === 'Password123') {
      mockState.isLoggedIn = true;
      return HttpResponse.json({
        success: true,
        data: {
          user: mockUser,
          ...mockTokens,
        },
      });
    }

    if (body.email === 'unverified@example.com' && body.password === 'Password123') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email before logging in',
        },
      }, { status: 403 });
    }

    return HttpResponse.json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    }, { status: 401 });
  }),

  // Register endpoint
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as {
      email: string;
      username: string;
      fullName: string;
      password: string;
    };

    // Check if email already registered
    if (body.email === 'existing@example.com' || mockState.registeredEmails.has(body.email)) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already registered',
        },
      }, { status: 409 });
    }

    // Check if username taken
    if (body.username === 'existinguser') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'USERNAME_EXISTS',
          message: 'Username already taken',
        },
      }, { status: 409 });
    }

    mockState.registeredEmails.add(body.email);

    return HttpResponse.json({
      success: true,
      data: {
        message: 'Registration successful. Please verify your email.',
      },
    });
  }),

  // Verify email endpoint
  http.post(`${API_URL}/auth/verify-email`, async ({ request }) => {
    const body = await request.json() as { email: string; code: string };

    if (body.code === '123456') {
      mockState.verifiedEmails.add(body.email);
      return HttpResponse.json({
        success: true,
        data: {
          message: 'Email verified successfully',
        },
      });
    }

    return HttpResponse.json({
      success: false,
      error: {
        code: 'INVALID_CODE',
        message: 'Invalid verification code',
      },
    }, { status: 400 });
  }),

  // Resend verification email endpoint
  http.post(`${API_URL}/auth/resend-verification`, async ({ request }) => {
    const body = await request.json() as { email: string };

    if (!body.email) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Email is required',
        },
      }, { status: 400 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        message: 'Verification code sent',
      },
    });
  }),

  // Forgot password endpoint
  http.post(`${API_URL}/auth/forgot-password`, async ({ request }) => {
    const body = await request.json() as { email: string };

    if (body.email === 'nonexistent@example.com') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email',
        },
      }, { status: 404 });
    }

    mockState.passwordResetEmails.add(body.email);

    return HttpResponse.json({
      success: true,
      data: {
        message: 'Password reset email sent',
      },
    });
  }),

  // Reset password endpoint
  http.post(`${API_URL}/auth/reset-password`, async ({ request }) => {
    const body = await request.json() as { code: string; password: string };

    if (body.code === '123456') {
      return HttpResponse.json({
        success: true,
        data: {
          message: 'Password reset successfully',
        },
      });
    }

    return HttpResponse.json({
      success: false,
      error: {
        code: 'INVALID_CODE',
        message: 'Invalid or expired reset code',
      },
    }, { status: 400 });
  }),

  // Token refresh endpoint
  http.post(`${API_URL}/auth/refresh`, async ({ request }) => {
    const body = await request.json() as { refreshToken: string };

    if (mockState.tokenExpired) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Refresh token expired',
        },
      }, { status: 401 });
    }

    if (body.refreshToken === mockTokens.refreshToken) {
      return HttpResponse.json({
        success: true,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      });
    }

    return HttpResponse.json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid refresh token',
      },
    }, { status: 401 });
  }),

  // Get current user endpoint (for protected routes)
  http.get(`${API_URL}/users/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      }, { status: 401 });
    }

    return HttpResponse.json({
      success: true,
      data: mockUser,
    });
  }),
];
