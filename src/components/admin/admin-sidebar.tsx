'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  ShoppingBag,
  MessagesSquare,
  ArrowLeft,
  Shield,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/listings', label: 'Listings', icon: ShoppingBag },
  { href: '/admin/forum', label: 'Forum', icon: MessagesSquare },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border/40 bg-background/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex h-16 items-center gap-2 border-b border-border/40 px-4">
        <Shield className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">Admin Panel</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-2">
          {adminNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/20'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Back to site */}
      <div className="border-t border-border/40 p-3">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Site</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
