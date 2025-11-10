'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SentinelActivity } from '@/types';
import { useMemo } from 'react';

interface PaymentStatsProps {
  activities: SentinelActivity[];
}

interface PaymentMethodStats {
  count: number;
  totalSpent: number;
  avgSettlementMs: number;
  minSettlementMs: number;
  maxSettlementMs: number;
}

export default function PaymentStats({ activities }: PaymentStatsProps) {
  // Calculate statistics for each payment method
  const stats = useMemo(() => {
    // Ensure activities is always an array to prevent filter errors
    const safeActivities = activities || [];
    const usdcActivities = safeActivities.filter(a => a.paymentMethod === 'usdc' && a.status === 'success');
    const cashActivities = safeActivities.filter(a => a.paymentMethod === 'cash' && a.status === 'success');

    const calculateStats = (acts: SentinelActivity[]): PaymentMethodStats => {
      if (acts.length === 0) {
        return {
          count: 0,
          totalSpent: 0,
          avgSettlementMs: 0,
          minSettlementMs: 0,
          maxSettlementMs: 0,
        };
      }

      const totalSpent = acts.reduce((sum, a) => sum + a.cost, 0);
      const settlementsWithTime = acts.filter(a => a.settlementTimeMs !== undefined);
      
      let avgSettlementMs = 0;
      let minSettlementMs = 0;
      let maxSettlementMs = 0;

      if (settlementsWithTime.length > 0) {
        const times = settlementsWithTime.map(a => a.settlementTimeMs!);
        avgSettlementMs = times.reduce((sum, t) => sum + t, 0) / times.length;
        minSettlementMs = Math.min(...times);
        maxSettlementMs = Math.max(...times);
      }

      return {
        count: acts.length,
        totalSpent,
        avgSettlementMs,
        minSettlementMs,
        maxSettlementMs,
      };
    };

    const usdcStats = calculateStats(usdcActivities);
    const cashStats = calculateStats(cashActivities);

    // Calculate speed improvement percentage
    let speedImprovement = 0;
    if (usdcStats.avgSettlementMs > 0 && cashStats.avgSettlementMs > 0) {
      speedImprovement = ((usdcStats.avgSettlementMs - cashStats.avgSettlementMs) / usdcStats.avgSettlementMs) * 100;
    }

    return {
      usdc: usdcStats,
      cash: cashStats,
      speedImprovement,
      totalPayments: usdcStats.count + cashStats.count,
    };
  }, [activities]);

  const formatTime = (ms: number) => {
    if (ms === 0) return 'N/A';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatAmount = (amount: number, method: 'usdc' | 'cash') => {
    const token = method === 'cash' ? 'CASH' : 'USDC';
    return `${amount.toFixed(6)} ${token}`;
  };

  // Don't show component if no payments have been made
  if (stats.totalPayments === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          Payment Performance Analytics
        </CardTitle>
        <CardDescription className="text-gray-400">
          Comparing USDC vs CASH payment methods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Speed Comparison Highlight */}
          {stats.cash.count > 0 && stats.usdc.count > 0 && stats.speedImprovement > 0 && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-600/20">
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
                      <path d="M12 2v20" />
                      <path d="m15 5-3-3-3 3" />
                      <path d="m9 19 3 3 3-3" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-400 font-semibold text-lg">
                      {stats.speedImprovement.toFixed(0)}% Faster
                    </p>
                    <p className="text-gray-400 text-sm">
                      CASH vs USDC average settlement time
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 text-2xl font-bold">⚡</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* USDC Stats */}
            {stats.usdc.count > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-purple-700/30">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <h3 className="text-purple-400 font-semibold">USDC Payments</h3>
                </div>

                {/* Payment Count */}
                <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-purple-400"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span className="text-gray-300 text-sm">Total Payments</span>
                    </div>
                    <span className="text-purple-300 font-bold text-lg">{stats.usdc.count}</span>
                  </div>
                </div>

                {/* Average Settlement Time */}
                <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-purple-400"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="text-gray-300 text-sm">Avg Settlement</span>
                    </div>
                    <span className="text-purple-300 font-bold">{formatTime(stats.usdc.avgSettlementMs)}</span>
                  </div>
                </div>

                {/* Total Spent */}
                <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-purple-400"
                      >
                        <line x1="12" x2="12" y1="2" y2="22" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <span className="text-gray-300 text-sm">Total Spent</span>
                    </div>
                    <span className="text-purple-300 font-bold text-sm">{formatAmount(stats.usdc.totalSpent, 'usdc')}</span>
                  </div>
                </div>

                {/* Settlement Range */}
                {stats.usdc.avgSettlementMs > 0 && (
                  <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-700/30">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
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
                        <span className="text-gray-300 text-sm">Settlement Range</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Min: {formatTime(stats.usdc.minSettlementMs)}</span>
                        <span className="text-gray-400">Max: {formatTime(stats.usdc.maxSettlementMs)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CASH Stats */}
            {stats.cash.count > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-green-700/30">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <h3 className="text-green-400 font-semibold flex items-center gap-1">
                    CASH Payments
                    <span className="text-xs">⚡</span>
                  </h3>
                </div>

                {/* Payment Count */}
                <div className="p-3 rounded-lg bg-green-900/20 border border-green-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-400"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span className="text-gray-300 text-sm">Total Payments</span>
                    </div>
                    <span className="text-green-300 font-bold text-lg">{stats.cash.count}</span>
                  </div>
                </div>

                {/* Average Settlement Time */}
                <div className="p-3 rounded-lg bg-green-900/20 border border-green-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-400"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="text-gray-300 text-sm">Avg Settlement</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-300 font-bold">{formatTime(stats.cash.avgSettlementMs)}</span>
                      <span className="text-green-400 text-xs">⚡</span>
                    </div>
                  </div>
                </div>

                {/* Total Spent */}
                <div className="p-3 rounded-lg bg-green-900/20 border border-green-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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
                      <span className="text-gray-300 text-sm">Total Spent</span>
                    </div>
                    <span className="text-green-300 font-bold text-sm">{formatAmount(stats.cash.totalSpent, 'cash')}</span>
                  </div>
                </div>

                {/* Settlement Range */}
                {stats.cash.avgSettlementMs > 0 && (
                  <div className="p-3 rounded-lg bg-green-900/20 border border-green-700/30">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-green-400"
                        >
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                        <span className="text-gray-300 text-sm">Settlement Range</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Min: {formatTime(stats.cash.minSettlementMs)}</span>
                        <span className="text-gray-400">Max: {formatTime(stats.cash.maxSettlementMs)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Visual Comparison Bar */}
          {stats.cash.avgSettlementMs > 0 && stats.usdc.avgSettlementMs > 0 && (
            <div className="p-4 rounded-lg bg-gray-700/30 border border-gray-600">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400"
                  >
                    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                  <h4 className="text-gray-300 font-semibold text-sm">Settlement Time Comparison</h4>
                </div>

                {/* CASH Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400 font-medium">CASH</span>
                    <span className="text-green-300">{formatTime(stats.cash.avgSettlementMs)}</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((stats.cash.avgSettlementMs / Math.max(stats.cash.avgSettlementMs, stats.usdc.avgSettlementMs)) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* USDC Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-400 font-medium">USDC</span>
                    <span className="text-purple-300">{formatTime(stats.usdc.avgSettlementMs)}</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((stats.usdc.avgSettlementMs / Math.max(stats.cash.avgSettlementMs, stats.usdc.avgSettlementMs)) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
