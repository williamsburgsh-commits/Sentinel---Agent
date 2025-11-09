'use client';

import { motion } from 'framer-motion';
import { Activity, CheckCircle2, AlertTriangle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  sentinel_id: string | null;
  user_id: string;
  price: number;
  cost: number;
  settlement_time: number | null;
  payment_method: string | null;
  transaction_signature: string | null;
  triggered: boolean;
  status: string;
  created_at: string;
}

interface GlobalActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

export default function GlobalActivityFeed({ activities, isLoading }: GlobalActivityFeedProps) {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getActivityIcon = (activity: ActivityItem) => {
    if (activity.triggered) return AlertTriangle;
    if (activity.status === 'error') return AlertTriangle;
    return CheckCircle2;
  };

  const getActivityColor = (activity: ActivityItem) => {
    if (activity.triggered) return 'text-red-400';
    if (activity.status === 'error') return 'text-yellow-400';
    return 'text-green-400';
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No activity yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Activity will appear here once your sentinels start monitoring
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
          <Badge variant="secondary" className="ml-auto">
            {activities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity);
            const color = getActivityColor(activity);

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-all border border-gray-700/50"
              >
                <div className={`p-2 rounded-lg ${activity.triggered ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white font-mono">
                      {activity.sentinel_id ? truncateAddress(activity.sentinel_id) : 'Unknown'}
                    </span>
                    {activity.triggered && (
                      <Badge variant="destructive" className="text-xs">
                        Alert Triggered
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      {activity.price > 0 ? (
                        <>
                          <TrendingUp className="w-3 h-3" />
                          ${activity.price.toLocaleString()}
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3" />
                          ${Math.abs(activity.price).toLocaleString()}
                        </>
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${activity.cost.toFixed(4)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
