'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Shield, Bell, Lock, Ban, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const settingsNav = [
  {
    title: 'პროფილი',
    href: '/settings/profile',
    icon: User,
    description: 'პროფილის ინფორმაციის რედაქტირება',
  },
  {
    title: 'ანგარიში',
    href: '/settings/account',
    icon: Settings,
    description: 'ანგარიშის პარამეტრები',
  },
  {
    title: 'კონფიდენციალურობა',
    href: '/settings/privacy',
    icon: Shield,
    description: 'კონფიდენციალურობის პარამეტრები',
  },
  {
    title: 'უსაფრთხოება',
    href: '/settings/security',
    icon: Lock,
    description: 'ანგარიშის დაცვა',
  },
  {
    title: 'შეტყობინებები',
    href: '/settings/notifications',
    icon: Bell,
    description: 'შეტყობინებების პარამეტრები',
  },
  {
    title: 'დაბლოკილი მომხმარებლები',
    href: '/settings/blocked',
    icon: Ban,
    description: 'დაბლოკილი ანგარიშები',
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">პარამეტრები</h1>
        <p className="text-muted-foreground">
          მართე შენი ანგარიშის პარამეტრები და პრეფერენციები.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:w-64 flex-shrink-0">
          <ScrollArea className="h-auto lg:h-[calc(100vh-16rem)]">
            <nav className="p-2">
              {settingsNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-3 h-auto py-3 mb-1',
                        isActive && 'bg-primary/10 text-primary'
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">
                          {item.description}
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
        </Card>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
