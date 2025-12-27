import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { api } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { parseApiError } from '../errors';
import type {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  VerifyOtpData,
  AuthResponse,
} from '@/types/auth';

// Login mutation using NextAuth
export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      toast.success('Welcome back!');
      router.push('/feed');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

// Register mutation
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: Omit<RegisterData, 'confirmPassword' | 'acceptTerms'>) => {
      return api.post<AuthResponse['data']>(API_ENDPOINTS.AUTH.REGISTER, data, {
        skipAuth: true,
      });
    },
    onSuccess: (_data, variables) => {
      toast.success('Account created! Please verify your email.');
      router.push(`/verify?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Verify OTP mutation
export function useVerifyOtp() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: VerifyOtpData) => {
      return api.post<{ verified: boolean }>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data, {
        skipAuth: true,
      });
    },
    onSuccess: () => {
      toast.success('Email verified successfully!');
      router.push('/login');
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Resend verification code
export function useResendVerification() {
  return useMutation({
    mutationFn: async (email: string) => {
      return api.post<{ sent: boolean }>(
        API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
        { email },
        { skipAuth: true }
      );
    },
    onSuccess: () => {
      toast.success('Verification code sent!');
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Forgot password mutation
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      return api.post<{ sent: boolean }>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data,
        { skipAuth: true }
      );
    },
    onSuccess: () => {
      toast.success('Password reset email sent!');
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Reset password mutation
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { email: string; code: string; password: string }) => {
      return api.post<{ reset: boolean }>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data, {
        skipAuth: true,
      });
    },
    onSuccess: () => {
      toast.success('Password reset successfully!');
      router.push('/login');
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Change password mutation (for authenticated users)
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return api.post<{ changed: boolean }>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Logout mutation
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Optionally call backend logout endpoint
      try {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT, {});
      } catch {
        // Ignore errors from backend logout
      }

      // Clear client-side session
      await signOut({ redirect: false });
    },
    onSuccess: () => {
      // Clear all cached queries
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: () => {
      // Still logout even if backend call fails
      signOut({ redirect: true, callbackUrl: '/login' });
    },
  });
}

// Refresh token (used internally, exposed for manual refresh if needed)
export function useRefreshToken() {
  return useMutation({
    mutationFn: async (refreshToken: string) => {
      return api.post<{ accessToken: string; refreshToken: string }>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refreshToken },
        { skipAuth: true }
      );
    },
  });
}

// Check if email exists
export function useCheckEmail() {
  return useMutation({
    mutationFn: async (email: string) => {
      return api.post<{ exists: boolean }>(
        '/auth/check-email',
        { email },
        { skipAuth: true }
      );
    },
  });
}

// Check if username exists
export function useCheckUsername() {
  return useMutation({
    mutationFn: async (username: string) => {
      return api.post<{ exists: boolean }>(
        '/auth/check-username',
        { username },
        { skipAuth: true }
      );
    },
  });
}

// Types for auth hooks responses
export interface AuthHookResponse<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}
