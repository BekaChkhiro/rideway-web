'use client';

import { useQuery } from '@tanstack/react-query';

import { getDashboardStats } from '@/lib/api/admin';
import { queryKeys } from '@/types';
import {
  DashboardStats,
  DashboardStatsSkeleton,
} from '@/components/admin/dashboard-stats';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: getDashboardStats,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of platform statistics and activity.
        </p>
      </div>

      {isLoading || !stats ? (
        <DashboardStatsSkeleton />
      ) : (
        <DashboardStats stats={stats} />
      )}
    </div>
  );
}
