import Link from 'next/link';
import { Bike } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Bike className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Rideway</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Rideway. ყველა უფლება დაცულია.</p>
      </footer>
    </div>
  );
}
