import { apiClient, setTokens, clearTokens } from './client';
import type {
  ApiResponse,
  RegisterData,
  RegisterResponse,
  VerifyOtpData,
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
  User,
} from '@/types';

// Register a new user
export async function register(data: RegisterData): Promise<RegisterResponse> {
  const response = await apiClient.post<ApiResponse<RegisterResponse>>(
    '/auth/register',
    data
  );
  return response.data.data;
}

// Verify OTP code
export async function verifyOtp(data: VerifyOtpData): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/verify-otp',
    data
  );

  // Store tokens
  const { accessToken, refreshToken } = response.data.data;
  setTokens(accessToken, refreshToken);

  return response.data.data;
}

// Resend OTP
export async function resendOtp(userId: string): Promise<{ message: string }> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    '/auth/resend-otp',
    { userId }
  );
  return response.data.data;
}

// Forgot password - request reset code
export async function forgotPassword(
  data: ForgotPasswordData
): Promise<{ userId: string; message: string }> {
  const response = await apiClient.post<
    ApiResponse<{ userId: string; message: string }>
  >('/auth/forgot-password', data);
  return response.data.data;
}

// Reset password with code
export async function resetPassword(
  data: ResetPasswordData
): Promise<{ message: string }> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    '/auth/reset-password',
    data
  );
  return response.data.data;
}

// Get current user
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>('/auth/me');
  return response.data.data;
}

// Logout
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    clearTokens();
  }
}

// Login (direct API call, not through NextAuth)
export async function loginDirect(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    '/auth/login',
    { email, password }
  );

  // Store tokens
  const { accessToken, refreshToken } = response.data.data;
  setTokens(accessToken, refreshToken);

  return response.data.data;
}
