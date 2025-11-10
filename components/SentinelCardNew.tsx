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
  Zap
} from 'lucide-react';
import type { Sentinel } from '@/types/data';
import { Badge } from '@/components/ui/badge';
import { PixelButton } from '@/components/ui/pixel-hover-effect';
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

  // Check balance on mount for all sentinels
  useEffect(() => {
    handleCheckBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinel.id]);

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

  // Get status-based styling
  const getStatusColor = () => {
    switch (sentinel.status) {
      case 'unfunded':
        return { 
          bg: 'from-orange-500/20 to-red-500/20', 
          border: 'border-orange-500/30', 
          glow: 'shadow-orange-500/20',
          icon: 'bg-orange-500/20 text-orange-400'
        };
      case 'ready':
        return { 
          bg: 'from-blue-500/20 to-cyan-500/20', 
          border: 'border-blue-500/30', 
          glow: 'shadow-blue-500/20',
          icon: 'bg-blue-500/20 text-blue-400'
        };
      case 'monitoring':
        return { 
          bg: 'from-green-500/20 to-emerald-500/20', 
          border: 'border-green-500/30', 
          glow: 'shadow-green-500/20',
          icon: 'bg-green-500/20 text-green-400'
        };
      case 'paused':
        return { 
          bg: 'from-gray-500/20 to-slate-500/20', 
          border: 'border-gray-500/30', 
          glow: 'shadow-gray-500/20',
          icon: 'bg-gray-500/20 text-gray-400'
        };
    }
  };

  const statusColor = getStatusColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group"
    >
      {/* Glassmorphism Card */}
      <div className={`relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br ${statusColor.bg} border ${statusColor.border} ${statusColor.glow} shadow-2xl transition-all duration-300`}>
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Monitoring pulse indicator */}
        {sentinel.status === 'monitoring' && (
          <div className="absolute top-4 right-4 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 blur-xl opacity-50 animate-pulse" />
              <div className="relative w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        )}
        
        <div className="relative p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`absolute inset-0 ${statusColor.bg} blur-xl opacity-50`} />
                <div className={`relative p-3 rounded-xl ${statusColor.icon} backdrop-blur-sm border border-white/10`}>
                  <Zap className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sentinel Agent</h3>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(sentinel.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <StatusBadge status={sentinel.status} size="md" />
          </div>
          {/* Wallet Address */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Wallet className="w-4 h-4" />
              <span>Wallet Address</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-black/30 border border-white/5">
              <code className="flex-1 text-sm text-white font-mono truncate">
                {sentinel.wallet_address}
              </code>
              <button
                onClick={() => copyToClipboard(sentinel.wallet_address)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Balances Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-black/30 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-yellow-500/20">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-xs text-gray-400">SOL Balance</span>
              </div>
              <p className="text-2xl font-bold text-white">{balances.sol.toFixed(4)}</p>
            </div>

            <div className="p-4 rounded-xl bg-black/30 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs text-gray-400">{tokenName}</span>
              </div>
              <p className="text-2xl font-bold text-white">{balances.token.toFixed(4)}</p>
            </div>
          </div>

          {/* Price Alert Info */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Price Alert</span>
              <Badge variant="outline" className="text-xs">
                {sentinel.payment_method.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {sentinel.condition === 'above' ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className="text-lg font-bold text-white">
                {sentinel.condition === 'above' ? 'Above' : 'Below'} ${sentinel.threshold.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-black/20">
              <Activity className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{activityCount}</p>
              <p className="text-xs text-gray-400">Checks</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-black/20">
              <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">${totalSpent.toFixed(4)}</p>
              <p className="text-xs text-gray-400">Spent</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-black/20">
              <Zap className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{estimatedChecks}</p>
              <p className="text-xs text-gray-400">Est. Left</p>
            </div>
          </div>

          {/* Funding Instructions */}
          {showFundingInstructions && sentinel.status === 'unfunded' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <FundingInstructions
                walletAddress={sentinel.wallet_address}
                paymentMethod={sentinel.payment_method}
                network={sentinel.network}
                onCheckBalance={handleCheckBalance}
                onRequestAirdrop={sentinel.network === 'devnet' ? handleRequestAirdrop : undefined}
                isCheckingBalance={isCheckingBalance}
              />
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {sentinel.status === 'unfunded' && (
              <PixelButton
                onClick={handleCheckBalance}
                disabled={isCheckingBalance}
                color="#3b82f6"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCheckingBalance ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check Balance
                  </>
                )}
              </PixelButton>
            )}

            {sentinel.status === 'ready' && (
              <PixelButton
                onClick={handleStartMonitoring}
                color="#10b981"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Monitoring
              </PixelButton>
            )}

            {sentinel.status === 'monitoring' && (
              <PixelButton
                onClick={handleStopMonitoring}
                color="#f59e0b"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </PixelButton>
            )}

            {sentinel.status === 'paused' && (
              <PixelButton
                onClick={handleResumeMonitoring}
                color="#10b981"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </PixelButton>
            )}

            <PixelButton
              onClick={handleView}
              color="#6366f1"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Eye className="w-4 h-4" />
            </PixelButton>

            <PixelButton
              onClick={handleDelete}
              disabled={isDeleting}
              color="#ef4444"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4" />
            </PixelButton>
          </div>

          {/* Last Check Time */}
          {lastCheckTime && (
            <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-white/5">
              <Clock className="w-3 h-3" />
              <span>Last check: {formatDistanceToNow(new Date(lastCheckTime), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

