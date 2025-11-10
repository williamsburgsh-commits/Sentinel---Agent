'use client';

import { useState } from 'react';
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
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import type { Sentinel } from '@/types/data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PixelButton } from '@/components/ui/pixel-hover-effect';
import { colors } from '@/lib/design-tokens';
import { formatDistanceToNow } from 'date-fns';

interface SentinelCardProps {
  sentinel: Sentinel;
  activityCount?: number;
  totalSpent?: number;
  lastCheckTime?: string;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export default function SentinelCard({
  sentinel,
  activityCount = 0,
  totalSpent = 0,
  lastCheckTime,
  onPause,
  onResume,
  onDelete,
  onView,
}: SentinelCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl hover:border-gray-600 transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
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
            
            {/* Status Badge */}
            <Badge 
              variant={sentinel.is_active ? 'default' : 'secondary'}
              className={sentinel.is_active 
                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }
            >
              {sentinel.is_active ? 'Active' : 'Paused'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Wallet Address - Full with Copy */}
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
              {sentinel.payment_method.toUpperCase()}
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Checks */}
            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-gray-400">Checks</p>
              </div>
              <p className="text-lg font-bold text-white">{activityCount}</p>
            </div>

            {/* Total Spent */}
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

          {/* Last Check */}
          {lastCheckTime && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>
                Last check {formatDistanceToNow(new Date(lastCheckTime), { addSuffix: true })}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {/* View Details */}
            <PixelButton
              onClick={handleView}
              color={colors.primary[500]}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </PixelButton>

            {/* Pause/Resume or Delete */}
            {sentinel.is_active ? (
              onPause && (
                <PixelButton
                  onClick={() => onPause(sentinel.id)}
                  color="#f59e0b"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2"
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </PixelButton>
              )
            ) : (
              <div className="grid grid-cols-2 gap-2 col-span-2">
                {onResume && (
                  <PixelButton
                    onClick={() => onResume(sentinel.id)}
                    color="#10b981"
                    className="bg-green-600 hover:bg-green-700 text-white text-sm py-2"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Resume
                  </PixelButton>
                )}
                {onDelete && (
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
            )}
          </div>

          {/* Warning for inactive */}
          {!sentinel.is_active && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <p className="text-xs text-yellow-400">
                This sentinel is paused and not monitoring
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
