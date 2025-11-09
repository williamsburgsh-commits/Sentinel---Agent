'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { colors } from '@/lib/design-tokens';

export function StatsCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: `${colors.background.secondary}cc`,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${colors.border.light}`,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-24 bg-gray-700" />
          <Skeleton className="h-8 w-32 bg-gray-700" />
        </div>
        <Skeleton className="w-12 h-12 rounded-xl bg-gray-700" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: `${colors.background.secondary}cc`,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${colors.border.light}`,
      }}
    >
      <div className="space-y-4">
        <Skeleton className="h-6 w-48 bg-gray-700" />
        <Skeleton className="h-4 w-full bg-gray-700" />
        <Skeleton className="h-4 w-3/4 bg-gray-700" />
        <div className="pt-4 space-y-2">
          <Skeleton className="h-10 w-full bg-gray-700" />
          <Skeleton className="h-10 w-full bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Full Width Card Skeleton */}
      <CardSkeleton />
    </div>
  );
}
