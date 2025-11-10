'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SentinelConfig, SentinelActivity } from '@/types';
import WalletDisplay from '@/components/WalletDisplay';
import PriceDisplay from '@/components/PriceDisplay';
import ActivityLogTimeline from '@/components/ActivityLogTimeline';
import StatisticsPanel from '@/components/StatisticsPanel';
import BalanceCard from '@/components/BalanceCard';
import PaymentStats from '@/components/PaymentStats';
import PriceChart from '@/components/PriceChart';
import StatsOverview from '@/components/StatsOverview';
import GlassCard from '@/components/GlassCard';
import DashboardLayout from '@/components/DashboardLayout';
import { colors } from '@/lib/design-tokens';
import { PixelButton } from '@/components/ui/pixel-hover-effect';
import { 
  showSuccessToast, 
  showErrorToast, 
  showWarningToast, 
  showInfoToast,
  showAlertToast
} from '@/lib/toast';
import { ButtonSpinner } from '@/components/LoadingSpinner';
import SuccessAnimation from '@/components/SuccessAnimation';
import AnimatedInput from '@/components/AnimatedInput';
import { SentinelCardSkeleton, PriceDisplaySkeleton } from '@/components/DashboardSkeletons';

export default function DashboardPage() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [priceThreshold, setPriceThreshold] = useState('');
  const [condition, setCondition] = useState<'above' | 'below' | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'usdc' | 'cash'>('usdc'); // Default to USDC
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentinel, setSentinel] = useState<SentinelConfig | null>(null);
  const [activities, setActivities] = useState<SentinelActivity[]>([]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [cashBalance, setCashBalance] = useState<number | null>(null);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [currentSOLPrice, setCurrentSOLPrice] = useState<number>(200); // Default price

  // Fetch current SOL price for USD calculations
  const fetchCurrentSOLPrice = async () => {
    try {
      const response = await fetch('/api/check-price');
      const data = await response.json();
      if (data.success && data.price) {
        setCurrentSOLPrice(data.price);
      }
    } catch (err) {
      console.error('Failed to fetch current SOL price:', err);
      // Keep default price if fetch fails
    }
  };

  // Fetch USDC balance function
  const fetchUSDCBalance = async (walletAddress: string) => {
    try {
      const response = await fetch('/api/check-usdc-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.balance !== undefined) {
        setUsdcBalance(data.balance);
      }
    } catch (err) {
      console.error('Error fetching USDC balance:', err);
      // Don't show toast for USDC balance errors to avoid spam
    }
  };

  const fetchCASHBalance = async (walletAddress: string) => {
    try {
      // For demo mode, simulate CASH balance
      // In production, this would call getCASHBalance from lib/payments.ts
      // using the walletAddress parameter
      console.log('Fetching CASH balance for:', walletAddress);
      const simulatedBalance = 0.05; // Demo balance
      setCashBalance(simulatedBalance);
      
      // TODO: Implement real CASH balance check when on mainnet
      // const response = await fetch('/api/check-cash-balance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ walletAddress }),
      // });
      // const data = await response.json();
      // if (data.success) setCashBalance(data.balance);
    } catch (err) {
      console.error('Error fetching CASH balance:', err);
      setCashBalance(0);
    }
  };

  // Fetch wallet balance function
  const fetchWalletBalance = async (walletAddress: string) => {
    try {
      const response = await fetch(`https://api.devnet.solana.com`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [walletAddress],
        }),
      });

      if (!response.ok) {
        throw new Error(`Solana RPC error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Solana RPC error:', data.error);
        showErrorToast('Failed to fetch wallet balance', data.error.message || 'Solana network error');
        return;
      }

      if (data.result && typeof data.result.value === 'number') {
        const balanceInSOL = data.result.value / 1e9; // Convert lamports to SOL
        setWalletBalance(balanceInSOL);
      }
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
      showErrorToast('Network Error', 'Unable to connect to Solana network. Please check your connection.');
    }
  };

  // Load sentinel from localStorage on mount and fetch SOL price
  useEffect(() => {
    // Fetch current SOL price for statistics
    fetchCurrentSOLPrice();
    
    const savedSentinel = localStorage.getItem('sentinel');
    if (savedSentinel) {
      try {
        const parsed = JSON.parse(savedSentinel);
        // Convert createdAt string back to Date
        parsed.createdAt = new Date(parsed.createdAt);
        // Ensure paymentMethod exists for backward compatibility
        if (!parsed.paymentMethod) {
          parsed.paymentMethod = 'usdc';
        }
        setSentinel(parsed);
        // Fetch initial balances
        fetchWalletBalance(parsed.walletAddress);
        fetchUSDCBalance(parsed.walletAddress);
        fetchCASHBalance(parsed.walletAddress);
      } catch (err) {
        console.error('Error loading sentinel from localStorage:', err);
        localStorage.removeItem('sentinel');
        showErrorToast('Failed to load saved sentinel', 'Your saved sentinel data was corrupted and has been cleared.');
      }
    }
    
    // Set initial loading to false after a short delay
    setTimeout(() => setIsInitialLoading(false), 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate total spent whenever activities change
  useEffect(() => {
    const total = activities.reduce((sum, activity) => sum + activity.cost, 0);
    setTotalSpent(total);
  }, [activities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate form
      if (!webhookUrl || !priceThreshold || !condition) {
        const errorMsg = 'Please fill in all fields';
        setError(errorMsg);
        showErrorToast('Validation Error', errorMsg);
        setIsLoading(false);
        return;
      }

      // Validate Discord webhook URL format
      if (!webhookUrl.startsWith('https://discord.com/api/webhooks/') && 
          !webhookUrl.startsWith('https://discordapp.com/api/webhooks/')) {
        const errorMsg = 'Invalid Discord webhook URL. Must start with https://discord.com/api/webhooks/';
        setError(errorMsg);
        showErrorToast('Invalid Webhook URL', errorMsg);
        setIsLoading(false);
        return;
      }

      const threshold = parseFloat(priceThreshold);
      if (isNaN(threshold) || threshold <= 0) {
        const errorMsg = 'Price threshold must be a positive number';
        setError(errorMsg);
        showErrorToast('Validation Error', errorMsg);
        setIsLoading(false);
        return;
      }

      // Call API
      const response = await fetch('/api/create-sentinel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discordWebhook: webhookUrl,
          threshold,
          condition,
          paymentMethod, // Include payment method selection
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.error || `Server error: ${response.status}`;
        setError(errorMsg);
        showErrorToast('Failed to Create Sentinel', errorMsg);
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (!data.success) {
        const errorMsg = data.error || 'Failed to create sentinel';
        setError(errorMsg);
        showErrorToast('Failed to Create Sentinel', errorMsg);
        setIsLoading(false);
        return;
      }

      // Success - store sentinel config
      setSentinel(data.sentinel);
      
      // Save to localStorage
      try {
        localStorage.setItem('sentinel', JSON.stringify(data.sentinel));
      } catch (storageErr) {
        console.error('Failed to save to localStorage:', storageErr);
        showWarningToast('Sentinel created but not saved', 'Your sentinel was created but could not be saved locally.');
      }
      
      // Fetch initial wallet balances
      fetchWalletBalance(data.sentinel.walletAddress);
      fetchUSDCBalance(data.sentinel.walletAddress);
      fetchCASHBalance(data.sentinel.walletAddress);
      
      // Reset form
      setWebhookUrl('');
      setPriceThreshold('');
      setCondition('');
      setPaymentMethod('usdc'); // Reset to default
      
      // Show success animation and toast
      setShowSuccessAnimation(true);
      showSuccessToast('Sentinel Created Successfully!', `Monitoring SOL price ${condition} $${threshold.toLocaleString()}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMsg);
      console.error('Error creating sentinel:', err);
      showErrorToast('Network Error', 'Unable to connect to the server. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPrice = async () => {
    if (!sentinel) return;

    // Check balances before price check
    await fetchWalletBalance(sentinel.walletAddress);
    await fetchUSDCBalance(sentinel.walletAddress);
    await fetchCASHBalance(sentinel.walletAddress);

    try {
      const response = await fetch('/api/check-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sentinel),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Price check API error:', data);
        showErrorToast('Price Check Failed', data.error || `Server error: ${response.status}`);
        return;
      }

      const data = await response.json();

      if (!data.success) {
        console.error('Price check failed:', data.error);
        showErrorToast('Price Check Failed', data.error || 'Unable to check price');
        return;
      }

      if (data.activity) {
        // Add new activity to the beginning of the array
        setActivities((prev) => [data.activity, ...prev]);
        
        // Update balances after check
        await fetchWalletBalance(sentinel.walletAddress);
        await fetchUSDCBalance(sentinel.walletAddress);
        await fetchCASHBalance(sentinel.walletAddress);
        
        // Show notification if alert was triggered
        if (data.activity.triggered) {
          showAlertToast(`SOL price is ${sentinel.condition} threshold`, `$${data.activity.price.toLocaleString()}`);
        }
      }
    } catch (err) {
      console.error('Error checking price:', err);
      showErrorToast('Price Check Error', 'Failed to check price. Network or Switchboard oracle may be down.');
    }
  };

  const startMonitoring = () => {
    if (!sentinel) {
      showErrorToast('No Sentinel', 'Please create a sentinel before starting monitoring.');
      return;
    }
    
    if (isMonitoring) {
      showWarningToast('Already Monitoring', 'Monitoring is already running.');
      return;
    }

    try {
      // Run first check immediately
      checkPrice();

      // Set up interval for subsequent checks
      const interval = setInterval(() => {
        checkPrice();
      }, 30000); // 30 seconds

      setMonitoringInterval(interval);
      setIsMonitoring(true);
      
      showSuccessToast('Monitoring Started', 'Checking SOL price every 30 seconds.');
    } catch (err) {
      console.error('Error starting monitoring:', err);
      showErrorToast('Failed to Start Monitoring', 'An error occurred while starting the monitoring service.');
    }
  };

  const stopMonitoring = () => {
    try {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
        setMonitoringInterval(null);
      }
      setIsMonitoring(false);
      
      showInfoToast('Monitoring Stopped', 'Price monitoring has been stopped.');
    } catch (err) {
      console.error('Error stopping monitoring:', err);
      showErrorToast('Error Stopping Monitoring', 'An error occurred while stopping the monitoring service.');
    }
  };

  const deleteSentinel = () => {
    try {
      // Stop monitoring if running
      if (isMonitoring) {
        stopMonitoring();
      }
      
      // Clear state
      setSentinel(null);
      setActivities([]);
      setWalletBalance(null);
      setTotalSpent(0);
      
      // Clear localStorage
      localStorage.removeItem('sentinel');
      
      showSuccessToast('Sentinel Deleted', 'Your sentinel has been removed successfully.');
    } catch (err) {
      console.error('Error deleting sentinel:', err);
      showErrorToast('Failed to Delete Sentinel', 'An error occurred while deleting the sentinel.');
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  }, [monitoringInterval]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Calculate notification count (triggered alerts)
  const notificationCount = activities.filter(a => a.triggered).length;

  return (
    <DashboardLayout
      currentSection="dashboard"
      greeting={getGreeting()}
      notificationCount={notificationCount}
    >
      <div className="space-y-8">
        {/* Animated Stats Overview */}
        {sentinel && activities.length > 0 && (
          <StatsOverview
            totalChecks={activities.length}
            alertsTriggered={activities.filter(a => a.triggered).length}
            totalSpent={totalSpent}
            uptimePercentage={isMonitoring ? 99.8 : 0}
          />
        )}
        {/* Price Display - Always visible */}
        {isInitialLoading ? (
          <PriceDisplaySkeleton />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <PriceDisplay 
              threshold={sentinel?.threshold} 
              condition={sentinel?.condition}
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create New Sentinel Section */}
          <div>
            <GlassCard gradient={colors.gradients.primary}>
            <Card className="bg-transparent border-0">
              <CardHeader>
                <CardTitle className="text-white">Create New Sentinel</CardTitle>
                <CardDescription className="text-gray-400">
                  Set up a new price monitoring agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>

                  {/* Condition */}
                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-gray-200">
                      Condition
                    </Label>
                    <Select value={condition} onValueChange={(value: 'above' | 'below') => setCondition(value)} disabled={isLoading}>
                      <SelectTrigger
                        id="condition"
                        className="bg-gray-700 border-gray-600 text-white"
                      >
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="below" className="text-white hover:bg-gray-600">
                          Below
                        </SelectItem>
                        <SelectItem value="above" className="text-white hover:bg-gray-600">
                          Above
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-gray-200">Payment Method</Label>
                      <div className="group relative">
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
                          className="text-gray-400 cursor-help"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4" />
                          <path d="M12 8h.01" />
                        </svg>
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 border border-gray-600 rounded-md shadow-lg z-10">
                          <p className="text-xs text-gray-300">
                            <strong className="text-blue-400">CASH:</strong> Phantom&apos;s stablecoin with instant settlement and lower fees.
                            <br />
                            <strong className="text-purple-400">USDC:</strong> Standard stablecoin with broader compatibility.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* USDC Option */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('usdc')}
                        disabled={isLoading}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === 'usdc'
                            ? 'border-purple-500 bg-purple-900/30'
                            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'usdc' ? 'border-purple-500' : 'border-gray-500'
                          }`}>
                            {paymentMethod === 'usdc' && (
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-semibold text-sm">USDC</p>
                              <span className="px-2 py-0.5 text-xs bg-gray-600 text-gray-300 rounded">Default</span>
                            </div>
                            <p className="text-gray-400 text-xs mt-0.5">Standard stablecoin</p>
                          </div>
                        </div>
                      </button>

                      {/* CASH Option */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        disabled={isLoading}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === 'cash'
                            ? 'border-blue-500 bg-blue-900/30'
                            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'cash' ? 'border-blue-500' : 'border-gray-500'
                          }`}>
                            {paymentMethod === 'cash' && (
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-semibold text-sm">CASH</p>
                              <span className="px-2 py-0.5 text-xs bg-blue-600 text-blue-100 rounded flex items-center gap-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                </svg>
                                Instant
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs mt-0.5">Phantom stablecoin</p>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Payment Method Info */}
                    {paymentMethod === 'cash' && (
                      <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30">
                        <p className="text-blue-200 text-xs">
                          ⚡ <strong>Instant Settlement:</strong> CASH payments settle immediately with lower fees. Requires Phantom wallet with CASH balance.
                        </p>
                      </div>
                    )}
                    {paymentMethod === 'usdc' && (
                      <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-700/30">
                        <p className="text-purple-200 text-xs">
                          🔄 <strong>Broad Compatibility:</strong> USDC works with all Solana wallets and has deep liquidity.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-md bg-red-900/50 border border-red-700">
                      <p className="text-red-200 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Deploy Button with Pixel Effect */}
                  <div className="w-full">
                    <PixelButton
                      type="submit"
                      disabled={isLoading}
                      color="#3b82f6"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <ButtonSpinner />
                          Creating Sentinel...
                        </span>
                      ) : (
                        '🚀 Deploy Sentinel'
                      )}
                    </PixelButton>
                  </div>
                </form>
              </CardContent>
            </Card>
            </GlassCard>
          </div>

          {/* Active Sentinel Section */}
          <div className="space-y-8">
            {isInitialLoading ? (
              <SentinelCardSkeleton />
            ) : sentinel ? (
              <>
                {/* Balance Card */}
                <BalanceCard
                  walletAddress={sentinel.walletAddress}
                  solBalance={walletBalance}
                  usdcBalance={usdcBalance}
                  cashBalance={cashBalance}
                  paymentMethod={sentinel.paymentMethod}
                />

                {/* Sentinel Configuration Card */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Active Sentinel</CardTitle>
                    <CardDescription className="text-gray-400">
                      Monitor your current price alert
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-gray-200 text-sm">Threshold</Label>
                          <p className="text-white font-semibold">${sentinel.threshold.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-200 text-sm">Condition</Label>
                          <p className="text-white font-semibold capitalize">{sentinel.condition}</p>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="space-y-1">
                        <Label className="text-gray-200 text-sm">Payment Method</Label>
                        <div className="flex items-center gap-2">
                          {sentinel.paymentMethod === 'cash' ? (
                            <>
                              <span className="text-white font-semibold">CASH</span>
                              <span className="px-2 py-0.5 text-xs bg-blue-600 text-blue-100 rounded flex items-center gap-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                </svg>
                                Instant
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-white font-semibold">USDC</span>
                              <span className="px-2 py-0.5 text-xs bg-gray-600 text-gray-300 rounded">Standard</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Total Spent */}
                      <div className="space-y-1">
                        <Label className="text-gray-200 text-sm">Total Spent</Label>
                        <p className="text-white font-semibold text-lg">
                          {totalSpent.toFixed(6)} {sentinel.paymentMethod === 'cash' ? 'CASH' : 'USDC'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-gray-200 text-sm">Monitoring Status</Label>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                          <p className={`font-semibold ${isMonitoring ? 'text-green-400' : 'text-gray-400'}`}>
                            {isMonitoring ? 'Running' : 'Stopped'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-700">
                        <p className="text-gray-400 text-sm">
                          Created: {new Date(sentinel.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Monitoring Controls */}
                      <div className="pt-4 border-t border-gray-700 space-y-3">
                        {!isMonitoring ? (
                          <PixelButton
                            onClick={startMonitoring}
                            color="#10b981"
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
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
                              className="mr-2 inline"
                            >
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            Start Monitoring
                          </PixelButton>
                        ) : (
                          <PixelButton
                            onClick={stopMonitoring}
                            color="#ef4444"
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                          >
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
                              className="mr-2 inline"
                            >
                              <rect width="4" height="16" x="6" y="4" />
                              <rect width="4" height="16" x="14" y="4" />
                            </svg>
                            Stop Monitoring
                          </PixelButton>
                        )}
                        {isMonitoring && (
                          <p className="text-gray-400 text-xs text-center">
                            Checking price every 30 seconds
                          </p>
                        )}
                      </div>

                      {/* Delete Sentinel */}
                      <div className="pt-4 border-t border-gray-700">
                        <Button
                          onClick={deleteSentinel}
                          variant="outline"
                          className="w-full border-red-700 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                        >
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
                            className="mr-2"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" x2="10" y1="11" y2="17" />
                            <line x1="14" x2="14" y1="11" y2="17" />
                          </svg>
                          Delete Sentinel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Wallet Display Component */}
                <WalletDisplay walletAddress={sentinel.walletAddress} />
              </>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Active Sentinel</CardTitle>
                  <CardDescription className="text-gray-400">
                    Monitor your current price alert
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-500 text-center py-8">
                    No active sentinel yet
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Price Chart with Time Ranges */}
        {sentinel && activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PriceChart activities={activities} />
          </motion.div>
        )}
        
        {/* Chart Preview when no activities */}
        {sentinel && activities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl p-6 bg-gray-800/50 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Price History</h3>
                <p className="text-gray-400 text-sm">SOL/USD price over time</p>
              </div>
              <div className="px-3 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30">
                <span className="text-blue-400 text-sm font-medium">Coming Soon</span>
              </div>
            </div>
            <div className="w-full h-80 flex items-center justify-center bg-gray-900/30 rounded-xl border border-gray-700/50">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-600 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-gray-400 text-lg font-medium mb-2">Start monitoring to see your price chart</p>
                <p className="text-gray-500 text-sm">Historical price data will appear here after your first check</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment Performance Analytics */}
        {sentinel && activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <PaymentStats activities={activities} />
          </motion.div>
        )}

        {/* Statistics Panel */}
        {sentinel && activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <StatisticsPanel activities={activities} currentSOLPrice={currentSOLPrice} />
          </motion.div>
        )}

        {/* Activity Timeline - Beautiful Vertical Timeline */}
        {sentinel && activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <ActivityLogTimeline activities={activities} />
          </motion.div>
        )}

        {/* Old Activity Log (Fallback) */}
        {sentinel && activities.length === 0 && (
          <GlassCard>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-400 text-lg font-medium">No Activity Yet</p>
              <p className="text-gray-500 text-sm mt-2">Start monitoring to see your sentinel activity here</p>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccessAnimation}
        message="Sentinel Created! 🎉"
        onComplete={() => setShowSuccessAnimation(false)}
      />
    </DashboardLayout>
  );
}
