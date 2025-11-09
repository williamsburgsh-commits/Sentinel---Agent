'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, TrendingUp, TrendingDown, Minus, Clock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getAIAnalysisHistory, AIAnalysisRow } from '@/lib/database';
import { colors } from '@/lib/design-tokens';
import { Card, CardContent } from '@/components/ui/card';

interface AIAnalysisHistoryProps {
  sentinel_id: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAnalysisHistory({ sentinel_id, isOpen, onClose }: AIAnalysisHistoryProps) {
  const [analyses, setAnalyses] = useState<AIAnalysisRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sentinel_id]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getAIAnalysisHistory(sentinel_id, 20);
      setAnalyses(data);
    } catch (error) {
      console.error('Error loading AI analysis history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 70) return colors.success[500];
    if (score >= 40) return colors.warning[500];
    return colors.danger[500];
  };

  const getSentimentConfig = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return {
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          icon: TrendingUp,
          label: 'Bullish',
        };
      case 'bearish':
        return {
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: TrendingDown,
          label: 'Bearish',
        };
      default:
        return {
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          icon: Minus,
          label: 'Neutral',
        };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-purple-500/30 max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-6 border-b border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    AI Analysis History
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                  </h2>
                  <p className="text-sm text-gray-400">DeepSeek insights over time</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-gray-700 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Analysis Yet</h3>
                <p className="text-gray-400 text-sm">
                  AI analysis will appear after 10 price checks
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.map((analysis, index) => {
                  const sentimentConfig = getSentimentConfig(analysis.sentiment);
                  const SentimentIcon = sentimentConfig.icon;
                  const confidenceColor = getConfidenceColor(analysis.confidence_score);
                  const isExpanded = expandedId === analysis.id;

                  return (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-purple-500/30 transition-all">
                        <CardContent className="p-4">
                          {/* Header Row */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                              </div>
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${sentimentConfig.color}`}>
                                <SentimentIcon className="w-3 h-3" />
                                {sentimentConfig.label}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold" style={{ color: confidenceColor }}>
                                {analysis.confidence_score}%
                              </span>
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : analysis.id)}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Confidence Bar */}
                          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ 
                                backgroundColor: confidenceColor,
                                width: `${analysis.confidence_score}%`
                              }}
                            />
                          </div>

                          {/* Analysis Text Preview */}
                          <p className="text-sm text-gray-300 leading-relaxed mb-2">
                            {isExpanded 
                              ? analysis.analysis_text 
                              : `${analysis.analysis_text.substring(0, 120)}${analysis.analysis_text.length > 120 ? '...' : ''}`
                            }
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-purple-400" />
                              DeepSeek AI
                            </span>
                            <span className="text-green-400">
                              ${analysis.cost.toFixed(4)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Stats */}
          {analyses.length > 0 && (
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 border-t border-purple-500/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  Total Analyses: <span className="text-white font-semibold">{analyses.length}</span>
                </span>
                <span className="text-gray-400">
                  Total Cost: <span className="text-green-400 font-semibold">
                    ${analyses.reduce((sum, a) => sum + a.cost, 0).toFixed(4)}
                  </span>
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
