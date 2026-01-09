'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useAuthStore } from '@/stores';
import { clearTokens } from '@/lib/api';
import type { User } from '@/types';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setUser, logout: logoutStore } = useAuthStore();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user as User | undefined;

  // Login with credentials
  const login = useCallback(
    async (email: string, password: string, redirectTo = '/') => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        router.push(redirectTo);
        router.refresh();
      }
    },
    [router]
  );

  // Logout
  const logout = useCallback(async () => {
    clearTokens();
    logoutStore();
    await signOut({ redirect: false });
    router.push('/login');
  }, [router, logoutStore]);

  // Update user in store when session changes
  if (user && !isLoading) {
    setUser(user);
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    session,
    login,
    logout,
  };
}
