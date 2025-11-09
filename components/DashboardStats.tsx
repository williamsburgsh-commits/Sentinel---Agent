'use client';

import { motion } from 'framer-motion';
import { 
  Activity, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardStatsProps {
  totalSentinels: number;
  activeSentinels: number;
  totalChecks: number;
  totalUSDCSpent: number;
  totalCASHSpent: number;
  avgCostPerCheck: number;
  alertsTriggeredToday: number;
  avgUptime: number;
}

export default function DashboardStats({
  totalSentinels,
  activeSentinels,
  totalChecks,
  totalUSDCSpent,
  totalCASHSpent,
  avgCostPerCheck,
  alertsTriggeredToday,
  avgUptime,
}: DashboardStatsProps) {
  const stats = [
    {
      label: 'Total Sentinels',
      value: totalSentinels,
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      label: 'Active Now',
      value: activeSentinels,
      icon: Zap,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      badge: true,
    },
    {
      label: 'Total Checks',
      value: totalChecks.toLocaleString(),
      icon: CheckCircle2,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
    {
      label: 'USDC Spent',
      value: `$${totalUSDCSpent.toFixed(4)}`,
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      label: 'CASH Spent',
      value: `$${totalCASHSpent.toFixed(4)}`,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      label: 'Avg Cost/Check',
      value: `$${avgCostPerCheck.toFixed(6)}`,
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    {
      label: 'Alerts Today',
      value: alertsTriggeredToday,
      icon: AlertCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    {
      label: 'Avg Uptime',
      value: `${avgUptime.toFixed(1)}%`,
      icon: Clock,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className={`bg-gray-800/50 border ${stat.borderColor} backdrop-blur-xl hover:bg-gray-800/70 transition-all`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.badge && stat.value > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
