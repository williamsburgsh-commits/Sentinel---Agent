'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Wifi } from 'lucide-react';
import { getNetworkDisplayInfo } from '@/lib/networks';

export default function NetworkIndicator() {
  const [networkInfo, setNetworkInfo] = useState<ReturnType<typeof getNetworkDisplayInfo> | null>(null);

  useEffect(() => {
    setNetworkInfo(getNetworkDisplayInfo());
  }, []);

  if (!networkInfo) return null;

  const colorClasses = {
    orange: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
    green: 'bg-green-500/20 border-green-500/50 text-green-400',
  };

  const colorClass = colorClasses[networkInfo.color as keyof typeof colorClasses] || colorClasses.orange;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClass} backdrop-blur-sm cursor-help transition-all hover:scale-105`}
      >
        {networkInfo.showWarning ? (
          <AlertTriangle className="w-4 h-4 animate-pulse" />
        ) : (
          <Wifi className="w-4 h-4" />
        )}
        <span className="text-xs font-semibold uppercase tracking-wide">
          {networkInfo.name}
        </span>
        {networkInfo.isMainnet && (
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${networkInfo.isMainnet ? 'bg-green-400' : 'bg-orange-400'}`} />
            <span className="text-sm font-semibold text-white">
              {networkInfo.name} Network
            </span>
          </div>
          
          {networkInfo.isMainnet ? (
            <div className="space-y-1">
              <p className="text-xs text-red-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                REAL FUNDS ACTIVE
              </p>
              <p className="text-xs text-gray-400">
                You are connected to Solana Mainnet. All transactions use real USDC/CASH and SOL.
              </p>
              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ Double-check all amounts before confirming!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-orange-400 font-semibold">
                Test Network
              </p>
              <p className="text-xs text-gray-400">
                You are connected to Solana Devnet. All tokens are for testing only and have no real value.
              </p>
              <p className="text-xs text-green-400 mt-2">
                ✓ Safe to experiment
              </p>
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 border-t border-l border-gray-700 transform rotate-45" />
      </div>
    </motion.div>
  );
}
