'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Store,
  MessageSquare,
  MapPin,
  Mail,
  Settings,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useChatStore } from '@/stores';

const mainNavItems = [
  { href: '/', label: 'მთავარი', icon: Home },
  { href: '/explore', label: 'აღმოჩენა', icon: Compass },
  { href: '/marketplace', label: 'მარკეტი', icon: Store },
  { href: '/forum', label: 'ფორუმი', icon: MessageSquare },
  { href: '/services', label: 'სერვისები', icon: MapPin },
];

const secondaryNavItems = [
  { href: '/messages', label: 'შეტყობინებები', icon: Mail },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const unreadCount = useChatStore((state) => state.unreadCount);
  const isUnreadCountLoaded = useChatStore((state) => state.isUnreadCountLoaded);

  const initials = (user?.fullName || user?.username || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const profileLink = user?.username ? `/${user.username}` : '/login';

  const NavItem = ({ item, badge, badgeLoading }: { item: typeof mainNavItems[0]; badge?: number; badgeLoading?: boolean }) => {
    const isActive = pathname === item.href ||
      (item.href !== '/' && pathname.startsWith(`${item.href}/`));
    const Icon = item.icon;

    return (
      <Link href={item.href}>
        <div
          className={cn(
            'group relative flex h-11 items-center gap-3 rounded-xl px-3 transition-all duration-200',
            isActive
              ? 'bg-gradient-to-r from-primary/15 via-primary/10 to-transparent text-primary font-medium shadow-sm'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          )}
        >
          {isActive && (
            <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
          )}
          <Icon className={cn(
            'h-5 w-5 shrink-0 transition-transform duration-200',
            !isActive && 'group-hover:scale-110'
          )} />
          <span className="truncate flex-1">{item.label}</span>
          {badgeLoading ? (
            <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
          ) : badge && badge > 0 ? (
            <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
              {badge > 99 ? '99+' : badge}
            </Badge>
          ) : null}
        </div>
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col bg-gradient-to-b from-background via-background to-muted/20',
        'border-r border-border/50',
        className
      )}
    >
      {/* Main Navigation */}
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1.5 px-3 py-4">
          {/* Main section */}
          <span className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            მენიუ
          </span>
          {mainNavItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}

          {/* Divider */}
          <div className="mx-3 my-3 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

          {/* Secondary section */}
          <span className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            კომუნიკაცია
          </span>
          {secondaryNavItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              badge={item.href === '/messages' ? unreadCount : undefined}
              badgeLoading={item.href === '/messages' && !isUnreadCountLoaded}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className={cn(
        'border-t border-border/50 p-3',
        'bg-gradient-to-t from-muted/30 to-transparent'
      )}>
        <Link href={profileLink}>
          <div className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/20 to-primary/0 opacity-0 blur transition-opacity group-hover:opacity-100" />
              <Avatar className="relative h-10 w-10 ring-2 ring-border/50 transition-all group-hover:ring-primary/30">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName || 'User'} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">
                {user?.fullName || user?.username}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                @{user?.username}
              </span>
            </div>
            <Settings className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </Link>
      </div>
    </aside>
  );
}

// Mobile sidebar (sheet variant)
interface MobileSidebarProps {
  onClose?: () => void;
}

export function MobileSidebar({ onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const unreadCount = useChatStore((state) => state.unreadCount);
  const isUnreadCountLoaded = useChatStore((state) => state.isUnreadCountLoaded);

  const initials = (user?.fullName || user?.username || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const profileLink = user?.username ? `/${user.username}` : '/login';

  const MobileNavItem = ({ item, badge, badgeLoading }: { item: typeof mainNavItems[0]; badge?: number; badgeLoading?: boolean }) => {
    const isActive = pathname === item.href ||
      (item.href !== '/' && pathname.startsWith(`${item.href}/`));
    const Icon = item.icon;

    return (
      <Link href={item.href} onClick={onClose}>
        <div
          className={cn(
            'group relative flex h-12 items-center gap-3 rounded-xl px-3 transition-all duration-200',
            isActive
              ? 'bg-gradient-to-r from-primary/15 via-primary/10 to-transparent text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          )}
        >
          {isActive && (
            <div className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
          )}
          <Icon className="h-5 w-5 shrink-0" />
          <span className="text-[15px] flex-1">{item.label}</span>
          {badgeLoading ? (
            <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
          ) : badge && badge > 0 ? (
            <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
              {badge > 99 ? '99+' : badge}
            </Badge>
          ) : null}
        </div>
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-background to-muted/20">
      {/* User section at top */}
      <div className="border-b border-border/50 p-4">
        <Link href={profileLink} onClick={onClose}>
          <div className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60">
            <div className="relative">
              <Avatar className="h-11 w-11 ring-2 ring-border/50">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName || 'User'} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{user?.fullName || user?.username}</span>
              <span className="text-sm text-muted-foreground">@{user?.username}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 px-3 py-4">
          <span className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            მენიუ
          </span>
          {mainNavItems.map((item) => (
            <MobileNavItem key={item.href} item={item} />
          ))}

          <div className="mx-3 my-3 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

          <span className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            კომუნიკაცია
          </span>
          {secondaryNavItems.map((item) => (
            <MobileNavItem
              key={item.href}
              item={item}
              badge={item.href === '/messages' ? unreadCount : undefined}
              badgeLoading={item.href === '/messages' && !isUnreadCountLoaded}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Settings at bottom */}
      <div className="border-t border-border/50 bg-gradient-to-t from-muted/30 to-transparent p-3">
        <Link href="/settings" onClick={onClose}>
          <div className="flex h-11 items-center gap-3 rounded-xl px-3 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
            <Settings className="h-5 w-5" />
            <span className="text-[15px]">პარამეტრები</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
