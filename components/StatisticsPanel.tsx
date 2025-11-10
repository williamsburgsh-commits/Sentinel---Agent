'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SentinelActivity } from '@/types';

interface StatisticsPanelProps {
  activities: SentinelActivity[];
  currentSOLPrice?: number;
}

export default function StatisticsPanel({ activities, currentSOLPrice = 200 }: StatisticsPanelProps) {
  // Ensure activities is always an array to prevent filter errors
  const safeActivities = activities || [];
  // Calculate statistics
  const totalChecks = safeActivities.length;
  const totalAlerts = safeActivities.filter(a => a.triggered).length;
  const averagePrice = totalChecks > 0
    ? safeActivities.reduce((sum, a) => sum + a.price, 0) / totalChecks
    : 0;
  const totalCostSOL = safeActivities.reduce((sum, a) => sum + a.cost, 0);
  const totalCostUSD = totalCostSOL * currentSOLPrice;
  
  // Calculate uptime (assuming all checks in activities were successful)
  // In a real scenario, you'd track failed checks separately
  const uptimePercentage = 100; // Since we only store successful checks

  const stats = [
    {
      title: 'Total Checks',
      value: totalChecks.toLocaleString(),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-400"
        >
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
      description: 'Price checks performed',
      color: 'from-blue-900/40 to-blue-800/40',
      borderColor: 'border-blue-700/50',
    },
    {
      title: 'Alerts Triggered',
      value: totalAlerts.toLocaleString(),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-400"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" x2="12" y1="9" y2="13" />
          <line x1="12" x2="12.01" y1="17" y2="17" />
        </svg>
      ),
      description: 'Threshold conditions met',
      color: 'from-red-900/40 to-red-800/40',
      borderColor: 'border-red-700/50',
    },
    {
      title: 'Average Price',
      value: totalChecks > 0 ? `$${averagePrice.toFixed(2)}` : '$0.00',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-green-400"
        >
          <line x1="12" x2="12" y1="2" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      description: 'Across all checks',
      color: 'from-green-900/40 to-green-800/40',
      borderColor: 'border-green-700/50',
    },
    {
      title: 'Uptime',
      value: `${uptimePercentage.toFixed(1)}%`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-purple-400"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      description: 'Successful checks',
      color: 'from-purple-900/40 to-purple-800/40',
      borderColor: 'border-purple-700/50',
    },
    {
      title: 'Total Cost (SOL)',
      value: totalCostSOL.toFixed(6),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-orange-400"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
          <path d="M12 18V6" />
        </svg>
      ),
      description: 'Transaction fees',
      color: 'from-orange-900/40 to-orange-800/40',
      borderColor: 'border-orange-700/50',
    },
    {
      title: 'Total Cost (USD)',
      value: `$${totalCostUSD.toFixed(4)}`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-yellow-400"
        >
          <line x1="12" x2="12" y1="2" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      description: `At $${currentSOLPrice.toFixed(2)}/SOL`,
      color: 'from-yellow-900/40 to-yellow-800/40',
      borderColor: 'border-yellow-700/50',
    },
  ];

  if (totalChecks === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 text-gray-600"
            >
              <line x1="18" x2="18" y1="20" y2="10" />
              <line x1="12" x2="12" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="14" />
            </svg>
            <p className="text-lg font-semibold">No Statistics Yet</p>
            <p className="text-sm mt-2">Start monitoring to see statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg bg-gradient-to-br ${stat.color} border ${stat.borderColor} transition-transform hover:scale-105`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-300 text-sm font-medium mb-1">
                    {stat.title}
                  </p>
                  <p className="text-white text-2xl font-bold mb-1">
                    {stat.value}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {stat.description}
                  </p>
                </div>
                <div className="ml-3 flex-shrink-0">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
