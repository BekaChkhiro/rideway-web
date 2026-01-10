'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { OnlineFriends } from '@/components/feed/online-friends';
import { AdBanner } from '@/components/ads/ad-banner';

// Routes that need wider layout
const wideRoutes = ['/marketplace', '/forum', '/services', '/admin', '/settings', '/messages', '/explore'];

// Routes that need full height (no padding, no scroll)
const fullHeightRoutes = ['/messages'];

// Routes that show right sidebar with online friends
const rightSidebarRoutes = ['/'];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isWideLayout = wideRoutes.some((route) => pathname.startsWith(route));
  const isFullHeight = fullHeightRoutes.some((route) => pathname.startsWith(route));
  const showRightSidebar = rightSidebarRoutes.includes(pathname);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex h-[calc(100vh-4rem)] sticky top-16" />

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <MobileSidebar onClose={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className={`flex-1 ${isFullHeight ? 'h-[calc(100vh-4rem)] overflow-hidden' : 'min-h-[calc(100vh-4rem)]'}`}>
          <div className={`mx-auto flex gap-6 ${isFullHeight ? 'h-full' : 'py-6 px-4 md:px-6 pb-20 lg:pb-6'} ${showRightSidebar ? 'max-w-6xl' : isWideLayout ? 'max-w-6xl' : 'max-w-3xl'}`}>
            {/* Main content area */}
            <div className={`${showRightSidebar ? 'flex-1 min-w-0' : 'w-full'}`}>
              {children}
            </div>

            {/* Right Sidebar - Ad + Online Friends */}
            {showRightSidebar && (
              <aside className="hidden xl:block w-80 shrink-0 sticky top-20 h-fit space-y-4">
                <AdBanner size="medium" />
                <OnlineFriends />
              </aside>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (hidden on messages) */}
      {!isFullHeight && <MobileNav />}
    </div>
  );
}
