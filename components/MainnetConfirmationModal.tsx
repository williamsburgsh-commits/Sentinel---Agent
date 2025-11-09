'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, DollarSign, Clock, TrendingUp, X } from 'lucide-react';
import { PixelButton } from '@/components/ui/pixel-hover-effect';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface MainnetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  estimatedCostPerCheck: number;
  checksPerDay: number;
}

export default function MainnetConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  estimatedCostPerCheck,
  checksPerDay,
}: MainnetConfirmationModalProps) {
  const [understood, setUnderstood] = useState(false);
  const [acceptRisk, setAcceptRisk] = useState(false);

  const dailyCost = estimatedCostPerCheck * checksPerDay;
  const monthlyCost = dailyCost * 30;

  const handleConfirm = () => {
    if (understood && acceptRisk) {
      onConfirm();
      // Reset checkboxes
      setUnderstood(false);
      setAcceptRisk(false);
    }
  };

  const handleClose = () => {
    setUnderstood(false);
    setAcceptRisk(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-gray-900 border-2 border-red-500/50 text-white p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 text-2xl font-bold mb-2">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
              </div>
              Mainnet Deployment Warning
            </div>
            <p className="text-gray-400 text-base">
              You are about to create a sentinel on Solana Mainnet using real funds
            </p>
          </div>

        <div className="space-y-6 mt-4">
          {/* Warning Banner */}
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-400">
                  REAL MONEY WILL BE USED
                </p>
                <p className="text-xs text-gray-300">
                  This sentinel will use real USDC or CASH tokens for each price check. 
                  All transactions are irreversible and will incur network fees.
                </p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              Estimated Costs
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-gray-400">Per Check</span>
                </div>
                <p className="text-lg font-bold text-white">
                  ${estimatedCostPerCheck.toFixed(6)}
                </p>
              </div>

              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-gray-400">Per Day</span>
                </div>
                <p className="text-lg font-bold text-white">
                  ${dailyCost.toFixed(4)}
                </p>
                <p className="text-xs text-gray-500">{checksPerDay} checks</p>
              </div>

              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-gray-400">Per Month</span>
                </div>
                <p className="text-lg font-bold text-white">
                  ${monthlyCost.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">~30 days</p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white">Important Notes:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400 flex-shrink-0">•</span>
                <span>Each price check will deduct real USDC or CASH from your wallet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 flex-shrink-0">•</span>
                <span>Solana network fees (~0.000005 SOL per transaction) will apply</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 flex-shrink-0">•</span>
                <span>Costs may vary based on network congestion and oracle fees</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 flex-shrink-0">•</span>
                <span>You must maintain sufficient SOL balance for transaction fees</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 flex-shrink-0">•</span>
                <span>Safety limit: Maximum 0.001 USDC/CASH per transaction</span>
              </li>
            </ul>
          </div>

          {/* Confirmation Checkboxes */}
          <div className="space-y-3 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="understood"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <Label htmlFor="understood" className="text-sm text-gray-300 cursor-pointer">
                I understand that this will use real USDC/CASH tokens and I have reviewed the estimated costs above
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="accept-risk"
                checked={acceptRisk}
                onChange={(e) => setAcceptRisk(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <Label htmlFor="accept-risk" className="text-sm text-gray-300 cursor-pointer">
                I accept the financial risk and understand that all transactions are irreversible
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <PixelButton
              onClick={handleClose}
              color="#6b7280"
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </PixelButton>

            <PixelButton
              onClick={handleConfirm}
              disabled={!understood || !acceptRisk}
              color="#ef4444"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Deploy on Mainnet
            </PixelButton>
          </div>

          {/* Bottom Warning */}
          <p className="text-xs text-center text-gray-500">
            💡 Tip: Test on devnet first with{' '}
            <code className="px-1 py-0.5 bg-gray-800 rounded text-orange-400">
              NEXT_PUBLIC_NETWORK=devnet
            </code>
          </p>
        </div>
        </Card>
      </motion.div>
    </div>
  );
}
