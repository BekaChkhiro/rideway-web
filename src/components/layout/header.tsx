'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Menu,
  LogOut,
  User,
  Settings,
  HelpCircle,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { clearTokens } from '@/lib/api/client';
import { NotificationsDropdown } from '@/components/notifications/notifications-dropdown';

interface HeaderProps {
  onMenuClick?: () => void;
  className?: string;
}

export function Header({ onMenuClick, className }: HeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = session?.user as { id?: string; name?: string; email?: string; image?: string; username?: string; fullName?: string; avatarUrl?: string } | undefined;
  const displayName = user?.fullName || user?.name || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const handleLogout = async () => {
    clearTokens();
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-16 items-center border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm',
        className
      )}
    >
      {/* Left: Logo (matches sidebar width on desktop) */}
      <div className="flex h-full items-center gap-3 border-r border-border/50 px-6 lg:w-64">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/Rideway-logo.svg"
            alt="Rideway"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Search (starts where sidebar ends) */}
      <div className="flex flex-1 items-center px-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ძებნა..."
            className="w-full pl-9 bg-muted/50"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 px-6">
        {/* Notifications */}
        <NotificationsDropdown />

        {/* User menu */}
        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatarUrl || user?.image || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user?.username && (
                <DropdownMenuItem onClick={() => router.push(`/${user.username}`)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>პროფილი</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>პარამეტრები</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/help')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>დახმარება</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>გასვლა</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        )}
      </div>
    </header>
  );
}
