'use client';

import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryProvider>{children}</QueryProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
