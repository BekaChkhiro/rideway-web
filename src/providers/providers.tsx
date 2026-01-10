'use client';

import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';
import { SocketProvider } from './socket-provider';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        disableTransitionOnChange
      >
        <QueryProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
          <Toaster position="bottom-right" richColors closeButton />
        </QueryProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
