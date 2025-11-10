'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink, Zap, DollarSign, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PixelButton } from '@/components/ui/pixel-hover-effect';
import { colors } from '@/lib/design-tokens';

interface FundingInstructionsProps {
  walletAddress: string;
  paymentMethod: 'usdc' | 'cash';
  network: 'devnet' | 'mainnet';
  onCheckBalance: () => void;
  onRequestAirdrop?: () => void;
  isCheckingBalance?: boolean;
}

export default function FundingInstructions({
  walletAddress,
  paymentMethod,
  network,
  onCheckBalance,
  onRequestAirdrop,
  isCheckingBalance = false,
}: FundingInstructionsProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const tokenName = paymentMethod.toUpperCase();
  const isDevnet = network === 'devnet';

  return (
    <Card className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border-orange-500/30">
      <CardHeader>
        <CardTitle className="text-orange-300 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Fund Your Sentinel Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Address */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300">Send funds to this address:</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 rounded-lg bg-gray-900/50 border border-gray-700">
              <p className="text-sm text-gray-200 font-mono break-all">{walletAddress}</p>
            </div>
            <button
              onClick={() => copyToClipboard(walletAddress)}
              className="p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-blue-400" />
              )}
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-300">Follow these steps:</h4>
          
          {/* Step 1: SOL */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 p-4 rounded-lg bg-gray-900/30 border border-gray-700"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              1
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h5 className="font-semibold text-white">Get SOL for transaction fees</h5>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                Minimum: <span className="text-white font-mono">0.01 SOL</span>
                {' '}(~1000 transactions)
              </p>
              {isDevnet ? (
                <div className="flex gap-2">
                  {onRequestAirdrop && (
                    <PixelButton
                      onClick={onRequestAirdrop}
                      color={colors.warning[500]}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Request Airdrop
                    </PixelButton>
                  )}
                  <a
                    href="https://faucet.solana.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-xs text-blue-400 transition-colors"
                  >
                    Solana Faucet
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Buy SOL from an exchange (Coinbase, Binance, etc.)
                </p>
              )}
            </div>
          </motion.div>

          {/* Step 2: USDC/CASH */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 p-4 rounded-lg bg-gray-900/30 border border-gray-700"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
              2
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <h5 className="font-semibold text-white">Get {tokenName} for price check payments</h5>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                Minimum: <span className="text-white font-mono">0.01 {tokenName}</span>
                {' '}(~100 checks)
              </p>
              {isDevnet ? (
                <a
                  href={paymentMethod === 'usdc' 
                    ? "https://faucet.circle.com" 
                    : "https://faucet.sonic.game"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-xs text-green-400 transition-colors"
                >
                  {tokenName} Faucet
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <p className="text-xs text-gray-500">
                  {paymentMethod === 'usdc' 
                    ? "Buy USDC from Circle or an exchange"
                    : "Get CASH tokens from Sonic"}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Check Balance Button */}
        <div className="pt-4 border-t border-gray-700">
          <PixelButton
            onClick={onCheckBalance}
            disabled={isCheckingBalance}
            color={colors.primary[500]}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCheckingBalance ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking Balance...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Balance
              </>
            )}
          </PixelButton>
        </div>

        {/* Estimated Costs */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <p className="text-xs text-blue-300">
            <strong>💡 Tip:</strong> With 0.1 SOL + 0.1 {tokenName}, you can run ~1000 price checks
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
