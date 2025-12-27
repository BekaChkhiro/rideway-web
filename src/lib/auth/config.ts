import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { AuthResponse } from '@/types/auth';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

async function refreshAccessToken(token: {
  accessToken: string;
  refreshToken: string;
}) {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
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
  } catch (error) {
    console.error('Error refreshing access token:', error);
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
      },
      async authorize(credentials) {
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
              emailOrPhone: credentials.email,
              password: credentials.password,
            }),
          });

          const data: AuthResponse = await response.json();

          if (!response.ok || !data.success || !data.data) {
            throw new Error(data.error?.message || 'Invalid credentials');
          }

          const { user, accessToken, refreshToken } = data.data;

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            username: user.username,
            image: user.avatarUrl,
            isVerified: user.isVerified,
            accessToken,
            refreshToken,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error('Authentication failed');
        }
      },
    }),
    // Add OAuth providers here in the future
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.image,
          isVerified: user.isVerified,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 minutes
        };
      }

      // Handle session update (e.g., after profile update)
      if (trigger === 'update' && session) {
        return {
          ...token,
          ...session,
        };
      }

      // Return previous token if the access token has not expired yet
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        username: token.username,
        image: token.image,
        isVerified: token.isVerified,
      };
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;

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
  debug: process.env.NODE_ENV === 'development',
};
