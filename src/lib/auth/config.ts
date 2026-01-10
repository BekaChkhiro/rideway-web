import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { User } from '@/types';

const API_URL = process.env.API_URL || 'http://localhost:8000/api/v1';

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: User;
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: User;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
  }
}

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

interface RefreshResponse {
  success: boolean;
  data: {
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

async function refreshAccessToken(token: {
  refreshToken: string;
  user: User;
  accessToken: string;
  accessTokenExpires: number;
}) {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    const data: RefreshResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error('RefreshAccessTokenError');
    }

    return {
      ...token,
      accessToken: data.data.tokens.accessToken,
      refreshToken: data.data.tokens.refreshToken,
      accessTokenExpires: Date.now() + 14 * 60 * 1000, // 14 minutes
    };
  } catch {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        // For token-based auth (after OTP verification)
        accessToken: { label: 'Access Token', type: 'text' },
        refreshToken: { label: 'Refresh Token', type: 'text' },
        userData: { label: 'User Data', type: 'text' },
      },
      async authorize(credentials) {
        // Token-based auth (after OTP verification)
        if (credentials?.accessToken && credentials?.refreshToken && credentials?.userData) {
          try {
            const user = JSON.parse(credentials.userData) as User;
            return {
              ...user,
              accessToken: credentials.accessToken,
              refreshToken: credentials.refreshToken,
            };
          } catch {
            throw new Error('Invalid user data');
          }
        }

        // Regular email/password login
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data: AuthResponse = await response.json();

          if (!response.ok || !data.success) {
            const errorData = data as unknown as {
              error?: { message?: string };
            };
            throw new Error(errorData.error?.message || 'Login failed');
          }

          // Return user with tokens
          return {
            ...data.data.user,
            accessToken: data.data.tokens.accessToken,
            refreshToken: data.data.tokens.refreshToken,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error('Login failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        const authUser = user as User & {
          accessToken: string;
          refreshToken: string;
        };
        return {
          accessToken: authUser.accessToken,
          refreshToken: authUser.refreshToken,
          accessTokenExpires: Date.now() + 14 * 60 * 1000, // 14 minutes
          user: {
            id: authUser.id,
            email: authUser.email,
            phone: authUser.phone,
            username: authUser.username,
            fullName: authUser.fullName,
            bio: authUser.bio,
            avatarUrl: authUser.avatarUrl,
            coverUrl: authUser.coverUrl,
            location: authUser.location,
            role: authUser.role,
            isVerified: authUser.isVerified,
            followersCount: authUser.followersCount,
            followingCount: authUser.followingCount,
            postsCount: authUser.postsCount,
            createdAt: authUser.createdAt,
            updatedAt: authUser.updatedAt,
          },
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.error) {
        // Handle refresh error - redirect to login
        throw new Error('RefreshAccessTokenError');
      }

      session.user = token.user;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
