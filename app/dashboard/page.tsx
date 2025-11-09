'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createBrowserClient } from '@/lib/supabase';
import {
  createSentinel,
  getSentinels,
  updateSentinel,
  deleteSentinel as deleteSentinelFromDB,
  getActivityStats,
  fetchUserActivities,
  Sentinel,
  Activity,
} from '@/lib/database';
import { 
  showSuccessToast, 
  showErrorToast, 
  showInfoToast
} from '@/lib/toast';
import { PixelButton } from '@/components/ui/pixel-hover-effect';
import { ButtonSpinner } from '@/components/LoadingSpinner';
import SuccessAnimation from '@/components/SuccessAnimation';
import AnimatedInput from '@/components/AnimatedInput';
import { SentinelCardSkeleton, PriceDisplaySkeleton } from '@/components/DashboardSkeletons';
import SentinelCard from '@/components/SentinelCard';
import PriceDisplay from '@/components/PriceDisplay';
import DashboardLayout from '@/components/DashboardLayout';
import GlassCard from '@/components/GlassCard';
import NetworkIndicator from '@/components/NetworkIndicator';
import MainnetConfirmationModal from '@/components/MainnetConfirmationModal';
import DashboardStats from '@/components/DashboardStats';
import GlobalActivityFeed from '@/components/GlobalActivityFeed';
import AIInsights from '@/components/AIInsights';
import { colors } from '@/lib/design-tokens';
import { Keypair } from '@solana/web3.js';
import { Plus, LogOut, Filter, SortDesc, Play, Pause, FileText, Search, X } from 'lucide-react';
import { isMainnet, getNetworkDisplayInfo } from '@/lib/networks';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  // Auth state
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Form state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [priceThreshold, setPriceThreshold] = useState('');
  const [condition, setCondition] = useState<'above' | 'below' | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'usdc' | 'cash'>('usdc');
  const [isCreating, setIsCreating] = useState(false);

  // Sentinels state
  const [sentinels, setSentinels] = useState<Sentinel[]>([]);
  const [activeSentinel, setActiveSentinel] = useState<Sentinel | null>(null);
  const [isSentinelsLoading, setIsSentinelsLoading] = useState(true);

  // Activities state
  const [stats, setStats] = useState<Record<string, { total_checks: number; total_spent: number; last_check?: string }>>({});
  const [globalActivities, setGlobalActivities] = useState<Activity[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);

  // Filtering and sorting
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'usdc' | 'cash'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'checks' | 'spend' | 'activity'>('created');
  const [searchQuery, setSearchQuery] = useState('');

  // Aggregate stats
  const [aggregateStats, setAggregateStats] = useState({
    totalSentinels: 0,
    activeSentinels: 0,
    totalChecks: 0,
    totalUSDCSpent: 0,
    totalCASHSpent: 0,
    avgCostPerCheck: 0,
    alertsTriggeredToday: 0,
    avgUptime: 95.5,
  });

  // Multi-sentinel monitoring
  const monitoringIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // UI state
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMainnetModal, setShowMainnetModal] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<ReturnType<typeof getNetworkDisplayInfo> | null>(null);

  // Get network info on mount
  useEffect(() => {
    setNetworkInfo(getNetworkDisplayInfo());
  }, []);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/auth/login');
          return;
        }

        setUser(session.user);
        setIsAuthLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  const loadSentinels = useCallback(async () => {
    if (!user) return;

    setIsSentinelsLoading(true);
    try {
      const userSentinels = await getSentinels(user.id);
      setSentinels(userSentinels);

      // Find active sentinel
      const active = userSentinels.find(s => s.is_active);
      setActiveSentinel(active || null);

      // Load stats for each sentinel
      const statsPromises = userSentinels.map(async (sentinel) => {
        const sentinelStats = await getActivityStats(undefined, sentinel.id);
        return { id: sentinel.id, stats: sentinelStats };
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, { total_checks: number; total_spent: number; last_check?: string }> = {};
      statsResults.forEach(({ id, stats }) => {
        statsMap[id] = stats;
      });
      setStats(statsMap);

      // Calculate aggregate stats
      calculateAggregateStats(userSentinels, statsMap);

      // Show create form if no sentinels
      if (userSentinels.length === 0) {
        setShowCreateForm(true);
      }
    } catch (error) {
      console.error('Error loading sentinels:', error);
      showErrorToast('Failed to load sentinels', 'Please refresh the page');
    } finally {
      setIsSentinelsLoading(false);
    }
  }, [user]);

  const loadGlobalActivities = useCallback(async () => {
    if (!user) return;

    setIsActivitiesLoading(true);
    try {
      const activities = await fetchUserActivities(user.id, 20);
      setGlobalActivities(activities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsActivitiesLoading(false);
    }
  }, [user]);

  const calculateAggregateStats = (sentinels: Sentinel[], statsMap: Record<string, { total_checks: number; total_spent: number; last_check?: string }>) => {
    const activeSentinels = sentinels.filter(s => s.is_active).length;
    let totalChecks = 0;
    let totalUSDCSpent = 0;
    let totalCASHSpent = 0;
    let totalCost = 0;

    sentinels.forEach(sentinel => {
      const sentinelStats = statsMap[sentinel.id];
      if (sentinelStats) {
        totalChecks += sentinelStats.total_checks || 0;
        const spent = sentinelStats.total_spent || 0;
        
        if (sentinel.payment_method === 'usdc') {
          totalUSDCSpent += spent;
        } else {
          totalCASHSpent += spent;
        }
        totalCost += spent;
      }
    });

    const avgCostPerCheck = totalChecks > 0 ? totalCost / totalChecks : 0;

    setAggregateStats({
      totalSentinels: sentinels.length,
      activeSentinels,
      totalChecks,
      totalUSDCSpent,
      totalCASHSpent,
      avgCostPerCheck,
      alertsTriggeredToday: 0,
      avgUptime: 95.5,
    });
  };

  // Load sentinels when user is authenticated
  useEffect(() => {
    if (user) {
      loadSentinels();
      loadGlobalActivities();
    }
  }, [user, loadSentinels, loadGlobalActivities]);

  const handleCreateSentinel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showErrorToast('Authentication required', 'Please sign in to create a sentinel');
      return;
    }

    // Validation
    if (!webhookUrl || !priceThreshold || !condition) {
      showErrorToast('Validation Error', 'Please fill in all required fields');
      return;
    }

    const threshold = parseFloat(priceThreshold);
    if (isNaN(threshold) || threshold <= 0) {
      showErrorToast('Invalid Threshold', 'Please enter a valid price threshold');
      return;
    }

    // Check if on mainnet and show confirmation modal
    if (isMainnet()) {
      setShowMainnetModal(true);
      return;
    }

    // Proceed with creation for devnet
    await createSentinelNow();
  };

  const createSentinelNow = async () => {
    setIsCreating(true);

    try {
      // Generate new wallet
      const keypair = Keypair.generate();
      const walletAddress = keypair.publicKey.toString();
      const privateKey = Buffer.from(keypair.secretKey).toString('base64');

      const threshold = parseFloat(priceThreshold);

      // Create sentinel in database
      const newSentinel = await createSentinel(user!.id, {
        wallet_address: walletAddress,
        private_key: privateKey,
        threshold,
        condition: condition as 'above' | 'below',
        payment_method: paymentMethod,
        discord_webhook: webhookUrl,
      });

      if (!newSentinel) {
        throw new Error('Failed to create sentinel');
      }

      // Show success animation
      setShowSuccessAnimation(true);
      showSuccessToast('Sentinel Created!', `Monitoring SOL price ${condition} $${threshold.toLocaleString()}`);

      // Reset form
      setWebhookUrl('');
      setPriceThreshold('');
      setCondition('');
      setPaymentMethod('usdc');
      setShowCreateForm(false);

      // Reload sentinels
      await loadSentinels();
    } catch (error) {
      console.error('Error creating sentinel:', error);
      showErrorToast('Failed to create sentinel', error instanceof Error ? error.message : 'Please try again');
    } finally {
      setIsCreating(false);
    }
  };

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
      // Deactivate all other sentinels first
      for (const sentinel of sentinels) {
        if (sentinel.id !== sentinelId && sentinel.is_active) {
          await updateSentinel(sentinel.id, { is_active: false });
        }
      }

      // Activate this sentinel
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
      await deleteSentinelFromDB(sentinelId);
      showSuccessToast('Sentinel Deleted', 'Sentinel has been removed');
      await loadSentinels();
    } catch (error) {
      console.error('Error deleting sentinel:', error);
      showErrorToast('Failed to delete sentinel', 'Please try again');
    }
  };

  const handlePauseAll = useCallback(async () => {
    try {
      const activeSentinels = sentinels.filter(s => s.is_active);
      await Promise.all(activeSentinels.map(s => updateSentinel(s.id, { is_active: false })));
      showInfoToast('All Paused', `Paused ${activeSentinels.length} sentinels`);
      await loadSentinels();
    } catch (err) {
      console.error('Error pausing all:', err);
      showErrorToast('Failed to pause all', 'Please try again');
    }
  }, [sentinels, loadSentinels]);

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

  const handleSignOut = async () => {
    try {
      // Clear all monitoring intervals
      monitoringIntervalsRef.current.forEach((interval) => {
        clearInterval(interval);
      });
      monitoringIntervalsRef.current.clear();

      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      showErrorToast('Failed to sign out', 'Please try again');
    }
  };

  // Cleanup monitoring intervals on unmount
  useEffect(() => {
    const intervals = monitoringIntervalsRef.current;
    return () => {
      intervals.forEach((interval) => {
        clearInterval(interval);
      });
      intervals.clear();
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      
      if (e.key === 'n') setShowCreateForm(true);
      if (e.key === 'p') handlePauseAll();
      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if (e.key === 'Escape' && searchQuery) setSearchQuery('');
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [searchQuery, handlePauseAll]);

  // Filter and sort sentinels
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

  if (isAuthLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <ButtonSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">
              Welcome back, {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NetworkIndicator />
            <PixelButton
              onClick={handleSignOut}
              color="#ef4444"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </PixelButton>
          </div>
        </div>

        {/* Mainnet Warning Banner */}
        {networkInfo?.isMainnet && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-lg"
          >
            <p className="text-red-400 font-semibold text-center">
              ⚠️ MAINNET MODE ACTIVE - Real funds will be used for all transactions!
            </p>
          </motion.div>
        )}

        {/* Aggregate Statistics */}
        {!isSentinelsLoading && sentinels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DashboardStats {...aggregateStats} />
          </motion.div>
        )}

        {/* Price Display */}
        {isSentinelsLoading ? (
          <PriceDisplaySkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PriceDisplay
              threshold={activeSentinel?.threshold}
              condition={activeSentinel?.condition}
            />
          </motion.div>
        )}

        {/* Create Sentinel Button */}
        {!showCreateForm && sentinels.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <PixelButton
              onClick={() => setShowCreateForm(true)}
              color={colors.primary[500]}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Sentinel
            </PixelButton>
          </motion.div>
        )}

        {/* Create Sentinel Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GlassCard gradient={colors.gradients.primary}>
                <Card className="bg-transparent border-0">
                  <CardHeader>
                    <CardTitle className="text-white">Create New Sentinel</CardTitle>
                    <CardDescription className="text-gray-400">
                      Set up a new price monitoring agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateSentinel} className="space-y-6">
                      {/* Discord Webhook URL */}
                      <div className="space-y-2">
                        <Label htmlFor="webhook-url" className="text-gray-200">
                          Discord Webhook URL
                        </Label>
                        <AnimatedInput
                          id="webhook-url"
                          type="text"
                          placeholder="https://discord.com/api/webhooks/..."
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          disabled={isCreating}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        />
                      </div>

                      {/* Price Threshold */}
                      <div className="space-y-2">
                        <Label htmlFor="price-threshold" className="text-gray-200">
                          Price Threshold ($)
                        </Label>
                        <AnimatedInput
                          id="price-threshold"
                          type="number"
                          placeholder="100000"
                          step="0.01"
                          value={priceThreshold}
                          onChange={(e) => setPriceThreshold(e.target.value)}
                          disabled={isCreating}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        />
                      </div>

                      {/* Condition */}
                      <div className="space-y-2">
                        <Label htmlFor="condition" className="text-gray-200">
                          Condition
                        </Label>
                        <Select value={condition} onValueChange={(value: 'above' | 'below') => setCondition(value)} disabled={isCreating}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="above">Above</SelectItem>
                            <SelectItem value="below">Below</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Payment Method */}
                      <div className="space-y-2">
                        <Label htmlFor="payment-method" className="text-gray-200">
                          Payment Method
                        </Label>
                        <Select value={paymentMethod} onValueChange={(value: 'usdc' | 'cash') => setPaymentMethod(value)} disabled={isCreating}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usdc">USDC</SelectItem>
                            <SelectItem value="cash">CASH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3">
                        <PixelButton
                          type="submit"
                          disabled={isCreating}
                          color={colors.primary[500]}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isCreating ? (
                            <span className="flex items-center justify-center gap-2">
                              <ButtonSpinner />
                              Creating...
                            </span>
                          ) : (
                            '🚀 Deploy Sentinel'
                          )}
                        </PixelButton>
                        {sentinels.length > 0 && (
                          <PixelButton
                            type="button"
                            onClick={() => setShowCreateForm(false)}
                            color="#6b7280"
                            className="bg-gray-600 hover:bg-gray-700 text-white"
                          >
                            Cancel
                          </PixelButton>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        {sentinels.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sentinels Section (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Controls Bar */}
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="search-input"
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

                    {/* Status Filter */}
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

                    {/* Payment Filter */}
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

                    {/* Sort */}
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

                  {/* Bulk Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                    <PixelButton
                      onClick={() => setShowCreateForm(true)}
                      color={colors.primary[500]}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New Sentinel
                    </PixelButton>

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

                    <PixelButton
                      onClick={() => showInfoToast('Coming Soon', 'Combined report feature')}
                      color="#6366f1"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Report
                    </PixelButton>
                  </div>
                </CardContent>
              </Card>

              {/* Sentinels Grid */}
              {isSentinelsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SentinelCardSkeleton />
                  <SentinelCardSkeleton />
                </div>
              ) : filteredAndSortedSentinels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-gray-400">No sentinels match your filters</p>
                </div>
              )}
            </div>

            {/* Activity Feed (1/3 width) */}
            <div className="lg:col-span-1 space-y-4">
              {/* AI Insights - Show for first active sentinel */}
              {activeSentinel && (
                <AIInsights sentinel_id={activeSentinel.id} />
              )}
              
              <GlobalActivityFeed 
                activities={globalActivities} 
                isLoading={isActivitiesLoading} 
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {sentinels.length === 0 && !isSentinelsLoading && (
          !showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Sentinels Yet</h3>
                <p className="text-gray-400 mb-6">
                  Create your first sentinel to start monitoring SOL prices
                </p>
                <PixelButton
                  onClick={() => setShowCreateForm(true)}
                  color={colors.primary[500]}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Sentinel
                </PixelButton>
              </div>
            </motion.div>
          )
        )}

        {/* Success Animation */}
        <SuccessAnimation
          show={showSuccessAnimation}
          message="Sentinel Created! 🎉"
          onComplete={() => setShowSuccessAnimation(false)}
        />

        {/* Mainnet Confirmation Modal */}
        <MainnetConfirmationModal
          isOpen={showMainnetModal}
          onClose={() => setShowMainnetModal(false)}
          onConfirm={() => {
            setShowMainnetModal(false);
            createSentinelNow();
          }}
          estimatedCostPerCheck={0.0001}
          checksPerDay={1440} // Assuming 1-minute intervals
        />
      </div>
    </DashboardLayout>
  );
}
