'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Activity, 
  DollarSign,
  Pause,
  Play,
  Eye,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Zap,
  AlertTriangle
} from 'lucide-react';
import type { Sentinel } from '@/types/data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PixelButton } from '@/components/ui/pixel-hover-effect';
import { colors } from '@/lib/design-tokens';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from './StatusBadge';
import FundingInstructions from './FundingInstructions';
import { checkWalletBalances, requestDevnetAirdrop, calculateEstimatedChecks, type WalletBalances } from '@/lib/balance-checker';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/lib/toast';

interface SentinelCardNewProps {
  sentinel: Sentinel;
  activityCount?: number;
  totalSpent?: number;
  lastCheckTime?: string;
  onStatusChange?: (id: string, status: Sentinel['status'], isActive: boolean) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export default function SentinelCardNew({
  sentinel,
  activityCount = 0,
  totalSpent = 0,
  lastCheckTime,
  onStatusChange,
  onDelete,
  onView,
}: SentinelCardNewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balances, setBalances] = useState<WalletBalances>({ sol: 0, token: 0, isFunded: false });
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [showFundingInstructions, setShowFundingInstructions] = useState(sentinel.status === 'unfunded');

  // Check balance on mount for unfunded sentinels
  useEffect(() => {
    if (sentinel.status === 'unfunded' || sentinel.status === 'ready') {
      handleCheckBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinel.id, sentinel.status]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCheckBalance = async () => {
    setIsCheckingBalance(true);
    try {
      const result = await checkWalletBalances(
        sentinel.wallet_address,
        sentinel.payment_method,
        sentinel.network
      );
      
      setBalances(result);

      // Auto-transition from unfunded to ready if funded
      if (sentinel.status === 'unfunded' && result.isFunded) {
        showSuccessToast('Wallet Funded!', 'Your sentinel is ready to monitor');
        if (onStatusChange) {
          onStatusChange(sentinel.id, 'ready', false);
        }
        setShowFundingInstructions(false);
      }
    } catch (error) {
      console.error('Error checking balance:', error);
      showErrorToast('Balance Check Failed', 'Please try again');
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const handleRequestAirdrop = async () => {
    if (sentinel.network !== 'devnet') {
      showInfoToast('Airdrop Unavailable', 'Airdrops are only available on devnet');
      return;
    }

    try {
      showInfoToast('Requesting Airdrop', 'This may take a few moments...');
      const result = await requestDevnetAirdrop(sentinel.wallet_address, sentinel.network);
      
      if (result.success) {
        showSuccessToast('Airdrop Successful!', '1 SOL has been sent to your wallet');
        // Recheck balance after airdrop
        setTimeout(() => handleCheckBalance(), 3000);
      } else {
        showErrorToast('Airdrop Failed', result.error || 'Please try again later');
      }
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      showErrorToast('Airdrop Failed', 'Please try the Solana faucet website');
    }
  };

  const handleStartMonitoring = async () => {
    // Verify balance before starting
    const result = await checkWalletBalances(
      sentinel.wallet_address,
      sentinel.payment_method,
      sentinel.network
    );

    if (!result.isFunded) {
      showErrorToast('Insufficient Balance', 'Please fund your wallet before starting');
      return;
    }

    if (onStatusChange) {
      onStatusChange(sentinel.id, 'monitoring', true);
      showSuccessToast('Monitoring Started', 'Your sentinel is now actively monitoring');
    }
  };

  const handleStopMonitoring = () => {
    if (onStatusChange) {
      onStatusChange(sentinel.id, 'paused', false);
      showInfoToast('Monitoring Paused', 'Your sentinel has been paused');
    }
  };

  const handleResumeMonitoring = async () => {
    // Verify balance before resuming
    const result = await checkWalletBalances(
      sentinel.wallet_address,
      sentinel.payment_method,
      sentinel.network
    );

    if (!result.isFunded) {
      showErrorToast('Insufficient Balance', 'Please add funds before resuming');
      if (onStatusChange) {
        onStatusChange(sentinel.id, 'unfunded', false);
      }
      setShowFundingInstructions(true);
      return;
    }

    if (onStatusChange) {
      onStatusChange(sentinel.id, 'monitoring', true);
      showSuccessToast('Monitoring Resumed', 'Your sentinel is now actively monitoring');
    }
  };

  const handleView = () => {
    if (onView) {
      onView(sentinel.id);
    } else {
      router.push(`/dashboard/sentinel/${sentinel.id}`);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (confirm('Are you sure you want to delete this sentinel? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await onDelete(sentinel.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const estimatedChecks = calculateEstimatedChecks(balances.sol, balances.token);
  const tokenName = sentinel.payment_method.toUpperCase();

  // Get card accent color based on status
  const getCardAccent = () => {
    switch (sentinel.status) {
      case 'unfunded':
        return 'border-orange-500/30 bg-orange-900/5';
      case 'ready':
        return 'border-blue-500/30 bg-blue-900/5';
      case 'monitoring':
        return 'border-green-500/30 bg-green-900/5';
      case 'paused':
        return 'border-gray-500/30 bg-gray-900/5';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-gray-800/50 backdrop-blur-xl hover:border-gray-600 transition-all ${getCardAccent()}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Sentinel</h3>
                <p className="text-xs text-gray-400">
                  Created {formatDistanceToNow(new Date(sentinel.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
          
          {/* Status Badge - Large and Prominent */}
          <div className="flex justify-center mb-4">
            <StatusBadge status={sentinel.status} size="lg" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Wallet Address */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400 font-semibold">Wallet Address</span>
              </div>
              <button
                onClick={() => copyToClipboard(sentinel.wallet_address)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-blue-400">Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700">
              <p className="text-xs text-gray-300 font-mono break-all">
                {sentinel.wallet_address}
              </p>
            </div>
          </div>

          {/* Current Balances */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <p className="text-xs text-gray-400">SOL Balance</p>
              </div>
              <p className="text-lg font-bold text-white">{balances.sol.toFixed(4)}</p>
            </div>

            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-400" />
                <p className="text-xs text-gray-400">{tokenName} Balance</p>
              </div>
              <p className="text-lg font-bold text-white">{balances.token.toFixed(4)}</p>
            </div>
          </div>

          {/* Estimated Checks (for ready/monitoring/paused) */}
          {sentinel.status !== 'unfunded' && estimatedChecks > 0 && (
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-xs text-blue-300 text-center">
                ~{estimatedChecks} checks remaining
              </p>
            </div>
          )}

          {/* Threshold & Condition */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 border border-gray-700">
            {sentinel.condition === 'above' ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <div className="flex-1">
              <p className="text-xs text-gray-400">Price Alert</p>
              <p className="text-sm font-semibold text-white">
                {sentinel.condition === 'above' ? 'Above' : 'Below'} ${sentinel.threshold.toLocaleString()}
              </p>
            </div>
            <Badge 
              variant="outline"
              className={
                sentinel.payment_method === 'usdc'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'bg-green-500/10 text-green-400 border-green-500/30'
              }
            >
              {tokenName}
            </Badge>
          </div>

          {/* Funding Instructions (for unfunded) */}
          {sentinel.status === 'unfunded' && showFundingInstructions && (
            <FundingInstructions
              walletAddress={sentinel.wallet_address}
              paymentMethod={sentinel.payment_method}
              network={sentinel.network}
              onCheckBalance={handleCheckBalance}
              onRequestAirdrop={sentinel.network === 'devnet' ? handleRequestAirdrop : undefined}
              isCheckingBalance={isCheckingBalance}
            />
          )}

          {/* Stats (for monitoring/paused) */}
          {(sentinel.status === 'monitoring' || sentinel.status === 'paused') && activityCount > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <p className="text-xs text-gray-400">Checks</p>
                </div>
                <p className="text-lg font-bold text-white">{activityCount}</p>
              </div>

              <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-gray-400">Spent</p>
                </div>
                <p className="text-lg font-bold text-white">
                  ${totalSpent.toFixed(4)}
                </p>
              </div>
            </div>
          )}

          {/* Last Check */}
          {lastCheckTime && sentinel.status === 'monitoring' && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>
                Last check {formatDistanceToNow(new Date(lastCheckTime), { addSuffix: true })}
              </span>
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="space-y-2 pt-2">
            {sentinel.status === 'unfunded' && (
              <>
                <PixelButton
                  onClick={handleCheckBalance}
                  disabled={isCheckingBalance}
                  color={colors.primary[500]}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCheckingBalance ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Check Balance
                    </>
                  )}
                </PixelButton>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <p className="text-xs text-orange-300">
                    Fund wallet to start monitoring
                  </p>
                </div>
              </>
            )}

            {sentinel.status === 'ready' && (
              <PixelButton
                onClick={handleStartMonitoring}
                color={colors.success[500]}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Monitoring
              </PixelButton>
            )}

            {sentinel.status === 'monitoring' && (
              <PixelButton
                onClick={handleStopMonitoring}
                color={colors.danger[500]}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                <Pause className="w-4 h-4 mr-2" />
                Stop Monitoring
              </PixelButton>
            )}

            {sentinel.status === 'paused' && (
              <PixelButton
                onClick={handleResumeMonitoring}
                color={colors.success[500]}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume Monitoring
              </PixelButton>
            )}

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2">
              <PixelButton
                onClick={handleView}
                color={colors.primary[500]}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </PixelButton>

              {(sentinel.status === 'paused' || sentinel.status === 'unfunded') && onDelete && (
                <PixelButton
                  onClick={handleDelete}
                  disabled={isDeleting}
                  color="#ef4444"
                  className="bg-red-600 hover:bg-red-700 text-white text-sm py-2"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </PixelButton>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
