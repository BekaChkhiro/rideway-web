'use client';

import {
  Users,
  FileText,
  MessageSquare,
  ShoppingBag,
  MessagesSquare,
  Wrench,
  TrendingUp,
  Ban,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardStats } from '@/types';

interface DashboardStatsProps {
  stats: DashboardStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="space-y-6">
      {/* Users Stats */}
      <div>
        <h3 className="mb-3 text-lg font-medium">Users</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={stats.users.total}
            icon={Users}
          />
          <StatsCard
            title="New Today"
            value={stats.users.newToday}
            icon={TrendingUp}
            variant="success"
          />
          <StatsCard
            title="New This Week"
            value={stats.users.newThisWeek}
            icon={TrendingUp}
          />
          <StatsCard
            title="Banned"
            value={stats.users.banned}
            icon={Ban}
            variant="destructive"
          />
        </div>
      </div>

      {/* Content Stats */}
      <div>
        <h3 className="mb-3 text-lg font-medium">Content</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="Posts"
            value={stats.content.posts}
            icon={FileText}
          />
          <StatsCard
            title="Comments"
            value={stats.content.comments}
            icon={MessageSquare}
          />
          <StatsCard
            title="Listings"
            value={stats.content.listings}
            icon={ShoppingBag}
          />
          <StatsCard
            title="Forum Threads"
            value={stats.content.forumThreads}
            icon={MessagesSquare}
          />
          <StatsCard
            title="Services"
            value={stats.content.services}
            icon={Wrench}
          />
        </div>
      </div>

      {/* Activity Stats */}
      <div>
        <h3 className="mb-3 text-lg font-medium">Today&apos;s Activity</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Posts Today"
            value={stats.activity.postsToday}
            icon={FileText}
            variant="primary"
          />
          <StatsCard
            title="Messages Today"
            value={stats.activity.messagesToday}
            icon={MessageSquare}
            variant="primary"
          />
          <StatsCard
            title="New Listings Today"
            value={stats.activity.newListingsToday}
            icon={ShoppingBag}
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'destructive' | 'primary';
}

function StatsCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
}: StatsCardProps) {
  const iconColorClass = {
    default: 'text-muted-foreground',
    success: 'text-green-500',
    destructive: 'text-red-500',
    primary: 'text-primary',
  }[variant];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Users Stats */}
      <div>
        <Skeleton className="mb-3 h-6 w-20" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Content Stats */}
      <div>
        <Skeleton className="mb-3 h-6 w-20" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Activity Stats */}
      <div>
        <Skeleton className="mb-3 h-6 w-32" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}
