'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  getSentinels,
  fetchUserActivities,
  getActivityStats,
} from '@/lib/data-store';
import type { Sentinel, Activity, ActivityStats } from '@/types/data';
import { showErrorToast } from '@/lib/toast';
import DashboardLayout from '@/components/DashboardLayout';
import GlobalActivityFeed from '@/components/GlobalActivityFeed';
import PriceChart from '@/components/PriceChart';
import AIInsights from '@/components/AIInsights';
import { Filter, TrendingUp, Activity as ActivityIcon } from 'lucide-react';
import { isMainnet } from '@/lib/networks';

export default function ActivityPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [sentinels, setSentinels] = useState<Sentinel[]>([]);
  const [selectedSentinel, setSelectedSentinel] = useState<string>('all');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mockUser = { id: 'dev-test-user-id', email: 'dev@test.com' };
    setUser(mockUser);
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const currentNetwork = isMainnet() ? 'mainnet' : 'devnet';
      const userSentinels = await getSentinels(user.id, currentNetwork);
      setSentinels(userSentinels);

      // Load activities
      const userActivities = await fetchUserActivities(user.id);
      setActivities(userActivities);

      // Load stats
      const activityStats = await getActivityStats(user.id, selectedSentinel === 'all' ? undefined : selectedSentinel);
      setStats(activityStats);
    } catch (error) {
      console.error('Error loading activity data:', error);
      showErrorToast('Failed to load activities', 'Please refresh the page');
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedSentinel]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const filteredActivities = selectedSentinel === 'all'
    ? activities
    : activities.filter(a => a.sentinel_id === selectedSentinel);

  const selectedSentinelData = sentinels.find(s => s.id === selectedSentinel);

  return (
    <DashboardLayout currentSection="activity">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Activity Feed</h1>
            <p className="text-gray-400">Monitor all sentinel checks and alerts</p>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Checks</p>
                    <p className="text-3xl font-bold text-white">{stats.total_checks || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ActivityIcon className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Alerts Triggered</p>
                    <p className="text-3xl font-bold text-white">{stats.alerts_triggered || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Spent</p>
                    <p className="text-3xl font-bold text-white">${(stats.total_spent || 0).toFixed(4)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xl">💰</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Avg Cost/Check</p>
                    <p className="text-3xl font-bold text-white">${(stats.avg_cost_per_check || 0).toFixed(6)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <Select value={selectedSentinel} onValueChange={setSelectedSentinel}>
                <SelectTrigger className="w-full sm:w-[300px] bg-gray-900/50 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by sentinel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentinels</SelectItem>
                  {sentinels.map(sentinel => (
                    <SelectItem key={sentinel.id} value={sentinel.id}>
                      {sentinel.wallet_address.slice(0, 8)}...{sentinel.wallet_address.slice(-6)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights - Only show if specific sentinel selected */}
        {selectedSentinel !== 'all' && selectedSentinelData && (
          <AIInsights sentinel_id={selectedSentinel} />
        )}

        {/* Price Chart - Only show if specific sentinel selected */}
        {selectedSentinel !== 'all' && selectedSentinelData && (
          <PriceChart
            sentinel_id={selectedSentinel}
            threshold={selectedSentinelData.threshold}
            condition={selectedSentinelData.condition}
          />
        )}

        {/* Activity Feed */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading activities...</div>
            ) : filteredActivities.length > 0 ? (
              <GlobalActivityFeed activities={filteredActivities} limit={50} />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <ActivityIcon className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Activity Yet</h3>
                <p className="text-gray-400">
                  {selectedSentinel === 'all'
                    ? 'Start monitoring sentinels to see activity here'
                    : 'This sentinel hasn\'t performed any checks yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
