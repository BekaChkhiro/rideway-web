'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Header } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return <MainLayoutSkeleton />;
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return <MainLayoutSkeleton />;
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Mobile sidebar sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <MobileSidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            <Sidebar
              isCollapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 pb-20 lg:pb-0">
          <div className="container mx-auto max-w-4xl px-4 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}

// Skeleton for loading state
function MainLayoutSkeleton() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-32" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </header>

      <div className="flex">
        {/* Sidebar skeleton */}
        <div className="hidden w-64 border-r lg:block">
          <div className="p-4 space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>

        {/* Content skeleton */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}
