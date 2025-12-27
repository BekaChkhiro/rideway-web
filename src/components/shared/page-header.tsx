'use client';

import { type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  showBack?: boolean;
  backHref?: string;
  actions?: ReactNode;
  menuItems?: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    destructive?: boolean;
  }>;
  className?: string;
  titleClassName?: string;
  sticky?: boolean;
  loading?: boolean;
}

export function PageHeader({
  title,
  description,
  showBack = false,
  backHref,
  actions,
  menuItems,
  className,
  titleClassName,
  sticky = false,
  loading = false,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  if (loading) {
    return <PageHeaderSkeleton showBack={showBack} className={className} />;
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4 pb-6',
        sticky && 'sticky top-16 z-10 bg-background pt-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              className="mt-0.5 shrink-0"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Button>
          )}

          <div className="space-y-1">
            <h1
              className={cn(
                'text-2xl font-bold tracking-tight',
                titleClassName
              )}
            >
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions}

          {menuItems && menuItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {menuItems.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={item.onClick}
                    className={cn(
                      item.destructive && 'text-destructive focus:text-destructive'
                    )}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}

// Skeleton for loading state
function PageHeaderSkeleton({
  showBack,
  className,
}: {
  showBack?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4 pb-6', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {showBack && <Skeleton className="h-10 w-10" />}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Section header (smaller, for sections within pages)
interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4 pb-4', className)}
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// Card header for cards/panels
interface CardHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  description,
  icon,
  actions,
  className,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b px-6 py-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div className="space-y-1">
          <h3 className="font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
