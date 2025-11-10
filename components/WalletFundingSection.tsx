'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle,
  DollarSign,
  Zap,
  Copy,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PixelButton } from '@/components/ui/pixel-hover-effect';
import { colors } from '@/lib/design-tokens';
import { PublicKey } from '@solana/web3.js';
import { getSOLBalance, getUSDCBalance, getCASHBalance, requestSOLAirdrop } from '@/lib/payments';
import { isMainnet, getExplorerUrl } from '@/lib/networks';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/lib/toast';

interface WalletFundingSectionProps {
  walletAddress: string;
  paymentMethod: 'usdc' | 'cash';
  onBalanceUpdate?: (balance: number) => void;
}

export default function WalletFundingSection({
  walletAddress,
  paymentMethod,
  onBalanceUpdate,
}: WalletFundingSectionProps) {
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [isRequestingAirdrop, setIsRequestingAirdrop] = useState(false);
  const [copied, setCopied] = useState(false);

  const tokenName = paymentMethod === 'cash' ? 'CASH' : 'USDC';
  const network = isMainnet() ? 'mainnet' : 'devnet';
  const checkCost = 0.0001;

  const loadBalances = useCallback(async () => {
    setIsLoadingBalances(true);
    try {
      const publicKey = new PublicKey(walletAddress);
      
      // Load SOL balance
      const sol = await getSOLBalance(publicKey);
      setSolBalance(sol);
      
      // Load token balance (USDC or CASH)
      let token: number;
      if (paymentMethod === 'cash') {
        token = await getCASHBalance(publicKey);
      } else {
        token = await getUSDCBalance(publicKey);
      }
      setTokenBalance(token);
      
      // Notify parent of balance update
      if (onBalanceUpdate) {
        onBalanceUpdate(token);
      }
    } catch (error) {
      console.error('Failed to load balances:', error);
      showErrorToast('Failed to load balances', 'Please try again');
    } finally {
      setIsLoadingBalances(false);
    }
  }, [walletAddress, paymentMethod, onBalanceUpdate]);

  useEffect(() => {
    loadBalances();
    // Auto-refresh balances every 10 seconds
    const interval = setInterval(loadBalances, 10000);
    return () => clearInterval(interval);
  }, [loadBalances]);

  const handleRequestAirdrop = async () => {
    if (isMainnet()) {
      showErrorToast('Airdrop not available', 'Airdrops are only available on devnet');
      return;
    }

    setIsRequestingAirdrop(true);
    try {
      const publicKey = new PublicKey(walletAddress);
      await requestSOLAirdrop(publicKey, 1);
      showSuccessToast('Airdrop successful!', '1 SOL added to your wallet');
      
      // Reload balances after airdrop
      setTimeout(loadBalances, 2000);
    } catch (error) {
      console.error('Airdrop failed:', error);
      showErrorToast(
        'Airdrop failed',
        error instanceof Error ? error.message : 'Please try again later'
      );
    } finally {
      setIsRequestingAirdrop(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    showInfoToast('Address copied!', 'Wallet address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const estimatedChecks = tokenBalance !== null ? Math.floor(tokenBalance / checkCost) : 0;
  const hasInsufficientBalance = tokenBalance !== null && tokenBalance < checkCost;
  const hasLowBalance = tokenBalance !== null && tokenBalance < checkCost * 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-400" />
                Wallet Funding Required
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Fund your sentinel wallet to start monitoring
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              {network.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Wallet Address */}
          <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700">
            <p className="text-xs text-gray-400 mb-2">Wallet Address</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm text-white font-mono break-all">
                {walletAddress}
              </code>
              <button
                onClick={handleCopyAddress}
                className="flex-shrink-0 p-2 rounded hover:bg-gray-800 transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Balances Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* SOL Balance */}
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">SOL Balance</p>
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {solBalance !== null ? solBalance.toFixed(4) : '...'}
              </p>
              <p className="text-xs text-gray-500 mt-1">For transaction fees</p>
            </div>

            {/* Token Balance */}
            <div className={`p-4 rounded-lg border ${
              hasInsufficientBalance 
                ? 'bg-red-900/20 border-red-500/30' 
                : hasLowBalance
                ? 'bg-yellow-900/20 border-yellow-500/30'
                : 'bg-gray-900/50 border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">{tokenName} Balance</p>
                <DollarSign className={`w-4 h-4 ${
                  hasInsufficientBalance ? 'text-red-400' : hasLowBalance ? 'text-yellow-400' : 'text-green-400'
                }`} />
              </div>
              <p className="text-2xl font-bold text-white">
                {tokenBalance !== null ? tokenBalance.toFixed(4) : '...'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ~{estimatedChecks} checks remaining
              </p>
            </div>
          </div>

          {/* Insufficient Balance Warning */}
          {hasInsufficientBalance && (
            <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400">Insufficient Balance</p>
                <p className="text-xs text-red-300 mt-1">
                  You need at least {checkCost} {tokenName} to start monitoring. 
                  Each price check costs {checkCost} {tokenName}.
                </p>
              </div>
            </div>
          )}

          {/* Low Balance Warning */}
          {!hasInsufficientBalance && hasLowBalance && (
            <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">Low Balance</p>
                <p className="text-xs text-yellow-300 mt-1">
                  Your balance is running low. Consider adding more {tokenName} to continue monitoring.
                </p>
              </div>
            </div>
          )}

          {/* Funding Instructions */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Funding Instructions</h4>
            
            {/* SOL Funding (Devnet Only) */}
            {!isMainnet() && (
              <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white font-medium">1. Get SOL (for fees)</p>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Request devnet SOL from the faucet to pay for transaction fees
                </p>
                <PixelButton
                  onClick={handleRequestAirdrop}
                  disabled={isRequestingAirdrop}
                  color={colors.primary[500]}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isRequestingAirdrop ? 'Requesting...' : 'Request 1 SOL Airdrop'}
                </PixelButton>
              </div>
            )}

            {/* USDC/CASH Funding */}
            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white font-medium">
                  {isMainnet() ? '1' : '2'}. Get {tokenName} (for payments)
                </p>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                {paymentMethod === 'cash' 
                  ? 'Get CASH tokens from Phantom wallet on mainnet'
                  : isMainnet()
                  ? 'Transfer USDC to your sentinel wallet'
                  : 'Request devnet USDC from the token faucet'
                }
              </p>
              
              {paymentMethod === 'usdc' && !isMainnet() && (
                <a
                  href={`https://spl-token-faucet.com/?token-name=USDC`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get Devnet USDC
                </a>
              )}
              
              {paymentMethod === 'cash' && (
                <p className="text-xs text-blue-400">
                  Open Phantom wallet → Swap → Get CASH
                </p>
              )}
              
              {paymentMethod === 'usdc' && isMainnet() && (
                <p className="text-xs text-blue-400">
                  Transfer USDC from your primary wallet to this sentinel wallet
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <PixelButton
              onClick={loadBalances}
              disabled={isLoadingBalances}
              color="#10b981"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingBalances ? 'animate-spin' : ''}`} />
              {isLoadingBalances ? 'Checking...' : 'Refresh Balances'}
            </PixelButton>
            
            <a
              href={getExplorerUrl(walletAddress, 'address')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View on Solscan
            </a>
          </div>

          {/* Check Cost Info */}
          <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/30">
            <p className="text-xs text-blue-300">
              💡 Each price check costs {checkCost} {tokenName}. 
              With 0.001 {tokenName}, you can run ~10 checks.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
