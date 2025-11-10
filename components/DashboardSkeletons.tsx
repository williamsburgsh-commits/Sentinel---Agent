'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Skeleton for stat cards
export function StatsCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-6"
    >
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 bg-gray-700" />
              <Skeleton className="h-8 w-32 bg-gray-700" />
              <Skeleton className="h-3 w-20 bg-gray-700" />
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}

// Skeleton for price display
export function PriceDisplaySkeleton() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <Skeleton className="h-6 w-48 bg-gray-700" />
        <Skeleton className="h-4 w-64 bg-gray-700 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="text-center py-6 space-y-4">
          <Skeleton className="h-16 w-48 mx-auto bg-gray-700" />
          <Skeleton className="h-4 w-32 mx-auto bg-gray-700" />
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton for activity timeline
export function ActivityTimelineSkeleton() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <Skeleton className="h-6 w-40 bg-gray-700" />
        <Skeleton className="h-4 w-56 bg-gray-700 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <Skeleton className="w-10 h-10 rounded-full bg-gray-700" />
                {i < 3 && <div className="w-0.5 h-16 bg-gray-700 mt-2" />}
              </div>
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-5 w-48 bg-gray-700" />
                <Skeleton className="h-4 w-full bg-gray-700" />
                <Skeleton className="h-3 w-32 bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton for price chart
export function PriceChartSkeleton() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 bg-gray-700" />
            <Skeleton className="h-4 w-56 bg-gray-700" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-12 bg-gray-700" />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-end gap-2">
          {[...Array(12)].map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 bg-gray-700"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton for sentinel card
export function SentinelCardSkeleton() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <Skeleton className="h-6 w-40 bg-gray-700" />
        <Skeleton className="h-4 w-56 bg-gray-700 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 bg-gray-700" />
              <Skeleton className="h-6 w-32 bg-gray-700" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 bg-gray-700" />
              <Skeleton className="h-6 w-24 bg-gray-700" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-gray-700" />
            <Skeleton className="h-6 w-40 bg-gray-700" />
          </div>
          <div className="pt-4 border-t border-gray-700">
            <Skeleton className="h-10 w-full bg-gray-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Full dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-8">
      <StatsCardSkeleton />
      <PriceDisplaySkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SentinelCardSkeleton />
        <SentinelCardSkeleton />
      </div>
      <PriceChartSkeleton />
      <ActivityTimelineSkeleton />
    </div>
  );
}
