'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Check, Activity, Pause, type LucideIcon } from 'lucide-react';
import type { SentinelStatus } from '@/types/data';

interface StatusBadgeProps {
  status: SentinelStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconColor: string;
}

export default function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const getStatusConfig = (): StatusConfig => {
    switch (status) {
      case 'unfunded':
        return {
          label: 'Awaiting Funding',
          icon: AlertCircle,
          bgColor: 'bg-orange-500/20',
          textColor: 'text-orange-400',
          borderColor: 'border-orange-500/30',
          iconColor: 'text-orange-400',
        };
      case 'ready':
        return {
          label: 'Ready',
          icon: Check,
          bgColor: 'bg-blue-500/20',
          textColor: 'text-blue-400',
          borderColor: 'border-blue-500/30',
          iconColor: 'text-blue-400',
        };
      case 'monitoring':
        return {
          label: 'Monitoring',
          icon: Activity,
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-400',
          borderColor: 'border-green-500/30',
          iconColor: 'text-green-400',
        };
      case 'paused':
        return {
          label: 'Paused',
          icon: Pause,
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-400',
          borderColor: 'border-gray-500/30',
          iconColor: 'text-gray-400',
        };
      default:
        // Fallback for undefined or unknown status
        return {
          label: 'Unknown',
          icon: AlertCircle,
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-400',
          borderColor: 'border-gray-500/30',
          iconColor: 'text-gray-400',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all ${sizeClasses[size]} ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {showIcon && (
        <>
          {status === 'monitoring' ? (
            <div className="relative">
              <div className={`${iconSizes[size]} rounded-full bg-green-500 animate-pulse`} />
              <div className={`absolute inset-0 ${iconSizes[size]} rounded-full bg-green-500 animate-ping opacity-75`} />
            </div>
          ) : (
            <Icon className={iconSizes[size]} />
          )}
        </>
      )}
      <span>{config.label}</span>
    </motion.div>
  );
}
