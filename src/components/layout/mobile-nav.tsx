'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusSquare, Store } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const initials = (user?.fullName || user?.username || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const profileLink = user?.username ? `/${user.username}` : '/login';

  const navItems = [
    { href: '/', label: 'მთავარი', icon: Home },
    { href: '/explore', label: 'აღმოჩენა', icon: Compass },
    { href: '/create', label: 'დამატება', icon: PlusSquare, isCreate: true },
    { href: '/marketplace', label: 'მარკეტი', icon: Store },
    { href: profileLink, label: 'პროფილი', isProfile: true },
  ];

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden',
        className
      )}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          // Create button
          if (item.isCreate && item.icon) {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <Icon className="h-6 w-6" />
                </div>
              </Link>
            );
          }

          // Profile with avatar
          if (item.isProfile) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2 text-muted-foreground transition-colors',
                  isActive && 'text-primary'
                )}
              >
                <Avatar
                  className={cn(
                    'h-6 w-6 ring-2 ring-transparent',
                    isActive && 'ring-primary'
                  )}
                >
                  <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName || 'User'} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          }

          // Regular nav item
          if (!item.icon) return null;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2 text-muted-foreground transition-colors',
                isActive && 'text-primary'
              )}
            >
              <Icon className={cn('h-6 w-6', isActive && 'fill-current')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
}
