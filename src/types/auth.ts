export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  isVerified: boolean;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  fullName?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyOtpData {
  email: string;
  code: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
