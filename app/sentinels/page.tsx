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
import type { Sentinel, ActivityStats, SentinelStatus } from '@/types/data';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { PixelButton } from '@/components/ui/pixel-hover-effect';
import { SentinelCardSkeleton } from '@/components/DashboardSkeletons';
import SentinelCardNew from '@/components/SentinelCardNew';
import DashboardLayout from '@/components/DashboardLayout';
import { colors } from '@/lib/design-tokens';
import { Plus, Filter, SortDesc, Search, X } from 'lucide-react';
import { isMainnet } from '@/lib/networks';
import { startMonitoring, stopMonitoring, stopAllMonitoring } from '@/lib/monitoring-service';

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
      console.log('🔍 Loading sentinels for user:', user.id, 'on network:', currentNetwork);
      
      const userSentinels = await getSentinels(user.id, currentNetwork);
      console.log('📊 Found sentinels:', userSentinels.length, userSentinels);
      
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
      console.error('❌ Error loading sentinels:', error);
      showErrorToast('Failed to load sentinels', 'Please refresh the page');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadSentinels();
  }, [user, loadSentinels]);

  // Start monitoring for active sentinels on mount
  useEffect(() => {
    const activeSentinels = sentinels.filter(s => s.status === 'monitoring' && s.is_active);
    
    activeSentinels.forEach(sentinel => {
      console.log(`🚀 Auto-starting monitoring for sentinel ${sentinel.id}`);
      startMonitoring(sentinel);
    });

    // Cleanup: stop all monitoring when component unmounts
    return () => {
      console.log('🛑 Stopping all monitoring (component unmount)');
      stopAllMonitoring();
    };
  }, [sentinels]);

  const handleStatusChange = async (sentinelId: string, newStatus: SentinelStatus) => {
    try {
      const sentinel = sentinels.find(s => s.id === sentinelId);
      if (!sentinel) return;

      const updates: Partial<Sentinel> = { status: newStatus };
      
      // Update is_active based on status
      if (newStatus === 'monitoring') {
        updates.is_active = true;
        // Start monitoring
        await updateSentinel(sentinelId, updates);
        await loadSentinels();
        
        // Get updated sentinel
        const updatedSentinels = await getSentinels(user!.id, isMainnet() ? 'mainnet' : 'devnet');
        const updatedSentinel = updatedSentinels.find(s => s.id === sentinelId);
        if (updatedSentinel) {
          startMonitoring(updatedSentinel);
        }
      } else if (newStatus === 'paused' || newStatus === 'unfunded') {
        updates.is_active = false;
        // Stop monitoring
        stopMonitoring(sentinelId);
        await updateSentinel(sentinelId, updates);
        await loadSentinels();
      } else {
        await updateSentinel(sentinelId, updates);
        await loadSentinels();
      }
    } catch (error) {
      console.error('Error updating sentinel status:', error);
      showErrorToast('Failed to update status', 'Please try again');
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
                <SentinelCardNew
                  key={sentinel.id}
                  sentinel={sentinel}
                  onStatusChange={handleStatusChange}
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
