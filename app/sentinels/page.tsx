'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  getSentinels,
  updateSentinel,
  deleteSentinel,
  getActivityStats,
} from '@/lib/data-store';
import type { Sentinel, ActivityStats } from '@/types/data';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/lib/toast';
import { PixelButton } from '@/components/ui/pixel-hover-effect';
import { SentinelCardSkeleton } from '@/components/DashboardSkeletons';
import SentinelCard from '@/components/SentinelCard';
import DashboardLayout from '@/components/DashboardLayout';
import { colors } from '@/lib/design-tokens';
import { Plus, Filter, SortDesc, Play, Pause, Search, X } from 'lucide-react';
import { isMainnet } from '@/lib/networks';

export default function SentinelsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [sentinels, setSentinels] = useState<Sentinel[]>([]);
  const [stats, setStats] = useState<Record<string, ActivityStats>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'usdc' | 'cash'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'checks' | 'spend' | 'activity'>('created');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const mockUser = { id: 'dev-test-user-id', email: 'dev@test.com' };
    setUser(mockUser);
  }, []);

  const loadSentinels = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const currentNetwork = isMainnet() ? 'mainnet' : 'devnet';
      const userSentinels = await getSentinels(user.id, currentNetwork);
      setSentinels(userSentinels);

      const statsPromises = userSentinels.map(async (sentinel) => {
        const sentinelStats = await getActivityStats(undefined, sentinel.id);
        return { id: sentinel.id, stats: sentinelStats };
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, ActivityStats> = {};
      statsResults.forEach(({ id, stats }) => {
        statsMap[id] = stats;
      });
      setStats(statsMap);
    } catch (error) {
      console.error('Error loading sentinels:', error);
      showErrorToast('Failed to load sentinels', 'Please refresh the page');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadSentinels();
  }, [user, loadSentinels]);

  const handlePauseSentinel = async (sentinelId: string) => {
    try {
      await updateSentinel(sentinelId, { is_active: false });
      showInfoToast('Sentinel Paused', 'Monitoring has been paused');
      await loadSentinels();
    } catch (error) {
      console.error('Error pausing sentinel:', error);
      showErrorToast('Failed to pause sentinel', 'Please try again');
    }
  };

  const handleResumeSentinel = async (sentinelId: string) => {
    try {
      for (const s of sentinels) {
        if (s.id !== sentinelId && s.is_active) {
          await updateSentinel(s.id, { is_active: false });
        }
      }
      await updateSentinel(sentinelId, { is_active: true });
      showSuccessToast('Sentinel Resumed', 'Monitoring has been resumed');
      await loadSentinels();
    } catch (error) {
      console.error('Error resuming sentinel:', error);
      showErrorToast('Failed to resume sentinel', 'Please try again');
    }
  };

  const handleDeleteSentinel = async (sentinelId: string) => {
    try {
      await deleteSentinel(sentinelId);
      showSuccessToast('Sentinel Deleted', 'Sentinel has been removed');
      await loadSentinels();
    } catch (error) {
      console.error('Error deleting sentinel:', error);
      showErrorToast('Failed to delete sentinel', 'Please try again');
    }
  };

  const handlePauseAll = async () => {
    try {
      const activeSentinels = sentinels.filter(s => s.is_active);
      await Promise.all(activeSentinels.map(s => updateSentinel(s.id, { is_active: false })));
      showInfoToast('All Paused', `Paused ${activeSentinels.length} sentinels`);
      await loadSentinels();
    } catch (err) {
      console.error('Error pausing all:', err);
      showErrorToast('Failed to pause all', 'Please try again');
    }
  };

  const handleResumeAll = async () => {
    try {
      const pausedSentinels = sentinels.filter(s => !s.is_active);
      await Promise.all(pausedSentinels.map(s => updateSentinel(s.id, { is_active: true })));
      showSuccessToast('All Resumed', `Resumed ${pausedSentinels.length} sentinels`);
      await loadSentinels();
    } catch (err) {
      console.error('Error resuming all:', err);
      showErrorToast('Failed to resume all', 'Please try again');
    }
  };

  const filteredAndSortedSentinels = sentinels
    .filter(sentinel => {
      if (statusFilter === 'active' && !sentinel.is_active) return false;
      if (statusFilter === 'paused' && sentinel.is_active) return false;
      if (paymentFilter !== 'all' && sentinel.payment_method !== paymentFilter) return false;
      if (searchQuery && !sentinel.wallet_address.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'checks':
          return (stats[b.id]?.total_checks || 0) - (stats[a.id]?.total_checks || 0);
        case 'spend':
          return (stats[b.id]?.total_spent || 0) - (stats[a.id]?.total_spent || 0);
        case 'activity':
          const aTime = stats[a.id]?.last_check ? new Date(stats[a.id].last_check!).getTime() : 0;
          const bTime = stats[b.id]?.last_check ? new Date(stats[b.id].last_check!).getTime() : 0;
          return bTime - aTime;
        default:
          return 0;
      }
    });

  return (
    <DashboardLayout currentSection="sentinels">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Sentinels</h1>
            <p className="text-gray-400">Manage your price monitoring agents</p>
          </div>
          <PixelButton
            onClick={() => router.push('/dashboard')}
            color={colors.primary[500]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Sentinel
          </PixelButton>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by wallet address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'paused') => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-[140px] bg-gray-900/50 border-gray-700 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="paused">Paused Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={(value: 'all' | 'usdc' | 'cash') => setPaymentFilter(value)}>
                <SelectTrigger className="w-full sm:w-[140px] bg-gray-900/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment</SelectItem>
                  <SelectItem value="usdc">USDC Only</SelectItem>
                  <SelectItem value="cash">CASH Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: 'created' | 'checks' | 'spend' | 'activity') => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[160px] bg-gray-900/50 border-gray-700 text-white">
                  <SortDesc className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Newest First</SelectItem>
                  <SelectItem value="checks">Most Active</SelectItem>
                  <SelectItem value="spend">Highest Spend</SelectItem>
                  <SelectItem value="activity">Recent Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
              <PixelButton
                onClick={handlePauseAll}
                color="#f59e0b"
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                disabled={sentinels.filter(s => s.is_active).length === 0}
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause All
              </PixelButton>

              <PixelButton
                onClick={handleResumeAll}
                color="#10b981"
                className="bg-green-600 hover:bg-green-700 text-white text-sm"
                disabled={sentinels.filter(s => !s.is_active).length === 0}
              >
                <Play className="w-4 h-4 mr-1" />
                Resume All
              </PixelButton>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SentinelCardSkeleton />
            <SentinelCardSkeleton />
            <SentinelCardSkeleton />
          </div>
        ) : filteredAndSortedSentinels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredAndSortedSentinels.map((sentinel) => (
                <SentinelCard
                  key={sentinel.id}
                  sentinel={sentinel}
                  activityCount={stats[sentinel.id]?.total_checks || 0}
                  totalSpent={stats[sentinel.id]?.total_spent || 0}
                  lastCheckTime={stats[sentinel.id]?.last_check}
                  onPause={handlePauseSentinel}
                  onResume={handleResumeSentinel}
                  onDelete={handleDeleteSentinel}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Plus className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Sentinels Found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first sentinel to start monitoring'}
            </p>
            <PixelButton
              onClick={() => router.push('/dashboard')}
              color={colors.primary[500]}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Sentinel
            </PixelButton>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
