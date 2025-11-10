'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, TrendingDown, Minus, Clock, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getLatestAIAnalysis } from '@/lib/data-store';
import type { AIAnalysisRow } from '@/types/data';
import { colors } from '@/lib/design-tokens';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AIAnalysisHistory from './AIAnalysisHistory';

interface AIInsightsProps {
  sentinel_id: string;
}

export default function AIInsights({ sentinel_id }: AIInsightsProps) {
  const [analysis, setAnalysis] = useState<AIAnalysisRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinel_id]);

  const loadAnalysis = async () => {
    setIsLoading(true);
    try {
      const data = await getLatestAIAnalysis(sentinel_id);
      setAnalysis(data);
    } catch (error) {
      console.error('Error loading AI analysis:', error);
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

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 animate-pulse" />
            <div className="flex-1">
              <div className="h-5 w-48 bg-gray-700/50 rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-gray-700/50 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-20 bg-gray-700/30 rounded animate-pulse" />
          <div className="h-4 bg-gray-700/30 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-700/30 rounded animate-pulse" />
            <div className="h-8 w-24 bg-gray-700/30 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 backdrop-blur-xl">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI Analysis Coming Soon</h3>
            <p className="text-gray-400 text-sm">
              Need 3 checks for AI analysis
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Powered by DeepSeek AI</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const sentimentConfig = getSentimentConfig(analysis.sentiment);
  const SentimentIcon = sentimentConfig.icon;
  const confidenceColor = getConfidenceColor(analysis.confidence_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 backdrop-blur-xl overflow-hidden relative">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />
        
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Brain className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  AI Insights by DeepSeek
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </CardTitle>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(true)}
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-xs text-purple-300 transition-colors flex items-center gap-1"
            >
              <History className="w-3 h-3" />
              View History
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative">
          {/* Analysis Text */}
          <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-700/50">
            <p className="text-gray-200 leading-relaxed text-sm">
              {analysis.analysis_text}
            </p>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Confidence Score */}
            <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Confidence</span>
                <span className="text-sm font-bold" style={{ color: confidenceColor }}>
                  {analysis.confidence_score}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: confidenceColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.confidence_score}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>

            {/* Sentiment Badge */}
            <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-700/50">
              <span className="text-xs text-gray-400 block mb-2">Sentiment</span>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${sentimentConfig.color}`}>
                <SentimentIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{sentimentConfig.label}</span>
              </div>
            </div>
          </div>

          {/* Cost Badge */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Paid DeepSeek</span>
              <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/30">
                ${analysis.cost.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-purple-400">
              <Sparkles className="w-3 h-3" />
              <span>AI-powered</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis History Modal */}
      <AIAnalysisHistory 
        sentinel_id={sentinel_id}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </motion.div>
  );
}
