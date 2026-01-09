// Auth Types

import type { User } from './user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName: string;
  phone?: string;
}

export interface VerifyOtpData {
  userId: string;
  code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  userId: string;
  code: string;
  newPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  userId: string;
  message: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
