'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  createSentinel,
  getSentinels,
  getActivityStats,
} from '@/lib/data-store';
import type { Sentinel } from '@/types/data';
import { 
  showSuccessToast, 
  showErrorToast,
} from '@/lib/toast';
import { PixelButton } from '@/components/ui/pixel-hover-effect';
import { ButtonSpinner } from '@/components/LoadingSpinner';
import SuccessAnimation from '@/components/SuccessAnimation';
import AnimatedInput from '@/components/AnimatedInput';
import { PriceDisplaySkeleton } from '@/components/DashboardSkeletons';
import PriceDisplay from '@/components/PriceDisplay';
import DashboardLayout from '@/components/DashboardLayout';
import GlassCard from '@/components/GlassCard';
import NetworkIndicator from '@/components/NetworkIndicator';
import AIInsights from '@/components/AIInsights';
import PriceChart from '@/components/PriceChart';
import MainnetConfirmationModal from '@/components/MainnetConfirmationModal';
import DashboardStats from '@/components/DashboardStats';
import WalletFundingSection from '@/components/WalletFundingSection';
import { colors } from '@/lib/design-tokens';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { Plus, LogOut, X, Activity, Zap } from 'lucide-react';
import { isMainnet, getNetworkDisplayInfo } from '@/lib/networks';

export default function DashboardPage() {
  const router = useRouter();

  // Auth state
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Form state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [priceThreshold, setPriceThreshold] = useState('');
  const [condition, setCondition] = useState<'above' | 'below' | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'usdc' | 'cash'>('usdc');
  const [isCreating, setIsCreating] = useState(false);

  // Sentinels state (for stats only)
  const [sentinels, setSentinels] = useState<Sentinel[]>([]);
  const [isSentinelsLoading, setIsSentinelsLoading] = useState(true);

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

  // UI state
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMainnetModal, setShowMainnetModal] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<ReturnType<typeof getNetworkDisplayInfo> | null>(null);
  const [createdWalletAddress, setCreatedWalletAddress] = useState<string | null>(null);
  const [createdWalletPaymentMethod, setCreatedWalletPaymentMethod] = useState<'usdc' | 'cash'>('usdc');

  // Get network info on mount
  useEffect(() => {
    const info = getNetworkDisplayInfo();
    setNetworkInfo(info);
    console.log('🌐 Network Configuration:', info);
  }, []);

  // Mock auth
  useEffect(() => {
    const mockUser = { id: 'dev-test-user-id', email: 'dev@test.com' };
    setUser(mockUser);
    setIsAuthLoading(false);
  }, []);

  // Load sentinels for stats
  const loadSentinels = useCallback(async () => {
    if (!user) return;
    setIsSentinelsLoading(true);
    try {
      const currentNetwork = isMainnet() ? 'mainnet' : 'devnet';
      console.log('🏠 Dashboard loading sentinels for user:', user.id, 'on network:', currentNetwork);
      
      const userSentinels = await getSentinels(user.id, currentNetwork);
      console.log('🏠 Dashboard found sentinels:', userSentinels.length, userSentinels);
      
      setSentinels(userSentinels);

      // Calculate aggregate stats
      const statsPromises = userSentinels.map(sentinel => getActivityStats(undefined, sentinel.id));
      const statsResults = await Promise.all(statsPromises);

      const totalChecks = statsResults.reduce((sum, s) => sum + s.total_checks, 0);
      const totalSpent = statsResults.reduce((sum, s) => sum + s.total_spent, 0);
      const totalAlerts = statsResults.reduce((sum, s) => sum + s.alerts_triggered, 0);

      setAggregateStats({
        totalSentinels: userSentinels.length,
        activeSentinels: userSentinels.filter(s => s.is_active).length,
        totalChecks,
        totalUSDCSpent: statsResults
          .filter((_, i) => userSentinels[i].payment_method === 'usdc')
          .reduce((sum, s) => sum + s.total_spent, 0),
        totalCASHSpent: statsResults
          .filter((_, i) => userSentinels[i].payment_method === 'cash')
          .reduce((sum, s) => sum + s.total_spent, 0),
        avgCostPerCheck: totalChecks > 0 ? totalSpent / totalChecks : 0,
        alertsTriggeredToday: totalAlerts,
        avgUptime: 95.5,
      });
    } catch (error) {
      console.error('Error loading sentinels:', error);
      showErrorToast('Failed to load sentinels', 'Please refresh the page');
    } finally {
      setIsSentinelsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadSentinels();
  }, [user, loadSentinels]);

  // Create sentinel handler
  const createSentinelNow = async () => {
    if (!user) return;
    if (!webhookUrl || !priceThreshold || !condition) {
      showErrorToast('Missing fields', 'Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const keypair = Keypair.generate();
      const walletAddress = keypair.publicKey.toBase58();
      const privateKey = bs58.encode(keypair.secretKey);

      const currentNetwork = (isMainnet() ? 'mainnet' : 'devnet') as 'mainnet' | 'devnet';
      console.log('🆕 Creating new sentinel for user:', user.id, 'on network:', currentNetwork);
      
      const sentinelConfig = {
        wallet_address: walletAddress,
        private_key: privateKey,
        discord_webhook: webhookUrl,
        threshold: parseFloat(priceThreshold),
        condition: condition as 'above' | 'below',
        payment_method: paymentMethod,
        network: currentNetwork,
      };

      console.log('📝 Sentinel config:', { ...sentinelConfig, private_key: '[REDACTED]' });
      
      const created = await createSentinel(user.id, sentinelConfig);
      console.log('✅ Sentinel created with ID:', created?.id);

      setWebhookUrl('');
      setPriceThreshold('');
      setCondition('');
      setShowCreateForm(false);
      setShowSuccessAnimation(true);
      setCreatedWalletAddress(walletAddress);
      setCreatedWalletPaymentMethod(paymentMethod);

      showSuccessToast('Sentinel created successfully!', 'Fund the wallet to start monitoring');
      
      console.log('🔄 Reloading sentinels after creation...');
      await loadSentinels();
    } catch (error) {
      console.error('Error creating sentinel:', error);
      showErrorToast('Failed to create sentinel', 'Please try again');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateSentinel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMainnet()) {
      setShowMainnetModal(true);
    } else {
      await createSentinelNow();
    }
  };

  const handleSignOut = async () => {
    try {
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
      showErrorToast('Failed to sign out', 'Please try again');
    }
  };

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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
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
            className="p-6 bg-gradient-to-r from-red-600/20 to-orange-600/20 border-4 border-red-500 rounded-xl shadow-2xl shadow-red-500/20"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="text-5xl animate-pulse">🚨</div>
              <div className="text-center">
                <p className="text-red-300 font-black text-2xl mb-1">
                  ⚠️ MAINNET MODE ACTIVE ⚠️
                </p>
                <p className="text-red-200 font-bold text-lg">
                  Real funds will be used for all transactions!
                </p>
              </div>
              <div className="text-5xl animate-pulse">🚨</div>
            </div>
          </motion.div>
        )}

        {/* Wallet Funding Section */}
        {createdWalletAddress && (
          <div className="relative">
            <button
              onClick={() => setCreatedWalletAddress(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <WalletFundingSection
              walletAddress={createdWalletAddress}
              paymentMethod={createdWalletPaymentMethod}
            />
          </div>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 backdrop-blur-xl cursor-pointer hover:scale-105 transition-transform"
            onClick={() => router.push('/sentinels')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">My Sentinels</p>
                  <p className="text-3xl font-bold text-white">{aggregateStats.totalSentinels}</p>
                  <p className="text-xs text-blue-400 mt-2">View all →</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 backdrop-blur-xl cursor-pointer hover:scale-105 transition-transform"
            onClick={() => router.push('/activity')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Checks</p>
                  <p className="text-3xl font-bold text-white">{aggregateStats.totalChecks}</p>
                  <p className="text-xs text-green-400 mt-2">View activity →</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 backdrop-blur-xl cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setShowCreateForm(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Create New</p>
                  <p className="text-3xl font-bold text-white">+</p>
                  <p className="text-xs text-purple-400 mt-2">Deploy sentinel →</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Display */}
        {isSentinelsLoading ? (
          <PriceDisplaySkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PriceDisplay />
          </motion.div>
        )}

        {/* AI Insights - Show for active sentinel */}
        {!isSentinelsLoading && sentinels.length > 0 && sentinels.find(s => s.is_active) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <AIInsights sentinel_id={sentinels.find(s => s.is_active)!.id} />
          </motion.div>
        )}

        {/* Price Chart - Show for active sentinel */}
        {!isSentinelsLoading && sentinels.length > 0 && sentinels.find(s => s.is_active) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PriceChart
              sentinel_id={sentinels.find(s => s.is_active)!.id}
              threshold={sentinels.find(s => s.is_active)!.threshold}
              condition={sentinels.find(s => s.is_active)!.condition}
            />
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
                        <PixelButton
                          type="button"
                          onClick={() => setShowCreateForm(false)}
                          color="#6b7280"
                          className="bg-gray-600 hover:bg-gray-700 text-white"
                        >
                          Cancel
                        </PixelButton>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {sentinels.length === 0 && !isSentinelsLoading && !showCreateForm && (
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
          checksPerDay={1440}
        />
      </div>
    </DashboardLayout>
  );
}
