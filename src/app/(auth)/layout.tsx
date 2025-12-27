import Link from 'next/link';
import { Bike } from 'lucide-react';
import { ThemeToggleSimple } from '@/components/shared/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header */}
      <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <Bike className="h-8 w-8 text-primary" />
          <span className="font-display text-xl font-bold">Bike Area</span>
        </Link>
        <ThemeToggleSimple />
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4 py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Bike Area. All rights reserved.</p>
      </footer>
    </div>
  );
}
