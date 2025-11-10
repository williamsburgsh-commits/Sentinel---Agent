'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { SentinelActivity } from '@/types';
import { colors, shadows, animations } from '@/lib/design-tokens';
import { toast } from 'sonner';

interface ActivityLogProps {
  activities: SentinelActivity[];
}

export default function ActivityLogTimeline({ activities }: ActivityLogProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatCost = (cost: number, paymentMethod?: 'usdc' | 'cash') => {
    const token = paymentMethod === 'cash' ? 'CASH' : 'USDC';
    return `${cost.toFixed(6)} ${token}`;
  };


  const getSolscanUrl = (signature: string) => {
    return `https://solscan.io/tx/${signature}?cluster=devnet`;
  };

  const formatSettlementTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const copyToClipboard = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied!', { description: 'Transaction signature copied to clipboard' });
    } catch {
      toast.error('Failed to copy');
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getEventIcon = (activity: SentinelActivity) => {
    if (activity.status === 'failed') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    if (activity.triggered) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    if (activity.paymentMethod === 'cash') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  const getEventColor = (activity: SentinelActivity) => {
    if (activity.status === 'failed') return { bg: '#7f1d1d', border: '#991b1b', icon: '#ef4444' };
    if (activity.triggered) return { bg: '#7f1d1d', border: '#991b1b', icon: '#ef4444' };
    if (activity.paymentMethod === 'cash') return { bg: '#1e3a8a', border: '#1e40af', icon: '#3b82f6' };
    return { bg: '#064e3b', border: '#065f46', icon: '#10b981' };
  };

  return (
    <motion.div
      variants={animations.fadeIn}
      initial="initial"
      animate="animate"
      className="rounded-2xl p-6"
      style={{
        background: `${colors.background.secondary}cc`,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${colors.border.light}`,
        boxShadow: shadows.card,
      }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-1">Activity Timeline</h3>
        <p className="text-gray-400 text-sm">Real-time price checks and alerts</p>
      </div>

      {sortedActivities.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400 text-sm">No activity yet</p>
          <p className="text-gray-500 text-xs mt-1">Start monitoring to see your sentinel activity here</p>
        </div>
      ) : (
        <div className="relative max-h-[600px] overflow-y-auto pr-2">
          <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ background: colors.border.medium }} />

          <div className="space-y-6">
            {sortedActivities.map((activity, index) => {
              const eventColor = getEventColor(activity);
              const isExpanded = expandedIndex === index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="relative flex gap-6"
                >
                  <div className="relative z-10 flex-shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                      style={{
                        background: eventColor.icon,
                        boxShadow: `0 0 20px ${eventColor.icon}60`,
                      }}
                    >
                      {getEventIcon(activity)}
                    </motion.div>
                  </div>

                  <motion.div
                    whileHover={{ y: -2 }}
                    onClick={() => toggleExpand(index)}
                    className="flex-1 cursor-pointer"
                  >
                    <div
                      className="rounded-xl p-5"
                      style={{
                        background: `${colors.background.secondary}cc`,
                        backdropFilter: 'blur(12px)',
                        border: `2px solid ${eventColor.border}`,
                        boxShadow: shadows.card,
                      }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-semibold">
                              {activity.status === 'failed' ? 'Check Failed' : activity.triggered ? 'Alert Triggered' : 'Price Check'}
                            </h4>
                            {activity.paymentMethod && (
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{
                                  background: activity.paymentMethod === 'cash' ? `${colors.primary[500]}30` : `${colors.primary[600]}30`,
                                  color: activity.paymentMethod === 'cash' ? colors.primary[400] : colors.primary[300],
                                }}
                              >
                                {activity.paymentMethod === 'cash' ? '⚡ CASH' : 'USDC'}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </p>
                        </div>

                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-gray-400"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </div>

                      <div className="flex items-center gap-6 mb-3">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Price</p>
                          <p className="text-white font-bold text-lg">{formatPrice(activity.price)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Cost</p>
                          <p className="text-gray-300 text-sm font-medium">{formatCost(activity.cost, activity.paymentMethod)}</p>
                        </div>
                        {activity.settlementTimeMs !== undefined && (
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Settlement</p>
                            <p className={`text-sm font-medium ${activity.settlementTimeMs < 1000 ? 'text-green-400' : 'text-gray-300'}`}>
                              {formatSettlementTime(activity.settlementTimeMs)}
                              {activity.settlementTimeMs < 1000 && ' ⚡'}
                            </p>
                          </div>
                        )}
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-4 border-t" style={{ borderColor: colors.border.light }}>
                              {activity.transactionSignature && (
                                <div className="mb-3">
                                  <p className="text-gray-400 text-xs mb-2">Transaction Signature</p>
                                  <div className="flex items-center gap-2">
                                    <code className="flex-1 text-xs text-gray-300 font-mono bg-gray-800/50 px-3 py-2 rounded">
                                      {activity.transactionSignature}
                                    </code>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={(e) => copyToClipboard(activity.transactionSignature!, e)}
                                      className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                                      style={{ background: `${colors.neutral[800]}80` }}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    </motion.button>
                                    <a
                                      href={getSolscanUrl(activity.transactionSignature)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                                      style={{ background: `${colors.neutral[800]}80` }}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </a>
                                  </div>
                                </div>
                              )}

                              {activity.status === 'failed' && activity.errorMessage && (
                                <div className="p-3 rounded-lg" style={{ background: '#7f1d1d40', border: `1px solid #991b1b` }}>
                                  <p className="text-red-400 text-xs font-semibold mb-1">Error Details</p>
                                  <p className="text-red-300 text-xs">{activity.errorMessage}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
