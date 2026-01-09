'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Bell,
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
  className?: string;
}

// TODO: Replace with actual user data from auth
const mockUser = {
  name: 'Demo User',
  email: 'demo@rideway.ge',
  image: null as string | null,
};

export function Header({ onMenuClick, className }: HeaderProps) {
  const router = useRouter();

  const user = mockUser;
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const handleLogout = async () => {
    // TODO: Implement logout
    console.log('Logout clicked');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border/40 bg-background/80 px-6 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm',
        className
      )}
    >
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Logo */}
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

      {/* Search */}
      <div className="flex-1 md:max-w-md lg:max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search Rideway..."
            className="w-full pl-9 bg-muted/50"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            3
          </Badge>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/help')}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
