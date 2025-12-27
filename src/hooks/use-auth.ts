'use client';

import { useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { user, setUser, setLoading, logout: storeLogout } = useAuthStore();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  // Sync session with Zustand store
  useEffect(() => {
    setLoading(isLoading);

    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        username: session.user.username,
        image: session.user.image,
        isVerified: session.user.isVerified,
      });
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
  }, [session, status, setUser, setLoading, isLoading]);

  // Handle token refresh errors
  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      // Session expired, logout user
      signOut({ redirect: false }).then(() => {
        router.push('/login?error=SessionExpired');
      });
    }
  }, [session?.error, router]);

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    router.refresh();
    return result;
  };

  const logout = async () => {
    storeLogout();
    await signOut({ redirect: false });
    router.push('/login');
  };

  return {
    user: session?.user ?? user,
    isLoading,
    isAuthenticated,
    accessToken: session?.accessToken,
    login,
    logout,
    session,
  };
}

export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isLoading, isAuthenticated };
}

export function useRedirectIfAuthenticated(redirectTo = '/feed') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isLoading, isAuthenticated };
}
