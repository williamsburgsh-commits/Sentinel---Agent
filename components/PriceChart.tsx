'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subHours, subDays, subMonths, isAfter } from 'date-fns';
import { colors, shadows, animations } from '@/lib/design-tokens';
import { getActivities } from '@/lib/data-store';
import type { Activity } from '@/types/data';

interface PriceChartProps {
  sentinelId: string;
  threshold?: number;
  condition?: 'above' | 'below';
}

type TimeRange = '1H' | '24H' | '7D' | '1M';

interface ChartDataPoint {
  timestamp: number;
  price: number;
  triggered: boolean;
  formattedTime: string;
}

export default function PriceChart({ sentinelId }: PriceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [isAnimating, setIsAnimating] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch ALL activities for this sentinel (no limit)
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        // Fetch ALL activities - no limit to fix the 20-activity bug
        const { activities: fetchedActivities } = await getActivities(sentinelId, {
          limit: 10000, // Very high limit to ensure we get all activities
          orderBy: 'created_at',
          ascending: false,
        });
        console.log(`📊 PriceChart: Loaded ${fetchedActivities.length} activities for sentinel ${sentinelId}`);
        setActivities(fetchedActivities);
      } catch (error) {
        console.error('Error fetching activities for chart:', error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();

    // Auto-refresh every 5 seconds to pick up new activities
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, [sentinelId]);

  // Filter and prepare chart data based on time range
  const chartData = useMemo(() => {
    const now = new Date();
    let cutoffDate: Date;

    switch (timeRange) {
      case '1H':
        cutoffDate = subHours(now, 1);
        break;
      case '24H':
        cutoffDate = subHours(now, 24);
        break;
      case '7D':
        cutoffDate = subDays(now, 7);
        break;
      case '1M':
        cutoffDate = subMonths(now, 1);
        break;
      default:
        cutoffDate = subHours(now, 24);
    }

    // Ensure activities is always an array to prevent filter errors
    const safeActivities = activities || [];
    
    // Filter activities within time range and sort by timestamp
    // Note: Activity type uses created_at instead of timestamp
    const filteredActivities = safeActivities
      .filter(activity => isAfter(new Date(activity.created_at), cutoffDate))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    console.log(`📊 PriceChart: Showing ${filteredActivities.length} activities for ${timeRange} range`);
    console.log(`📊 Sample prices:`, filteredActivities.slice(0, 5).map(a => ({ price: a.price, created_at: a.created_at })));

    // Convert to chart data points
    return filteredActivities.map(activity => ({
      timestamp: new Date(activity.created_at).getTime(),
      price: activity.price,
      triggered: activity.triggered,
      formattedTime: format(new Date(activity.created_at), 'MMM d, HH:mm'),
    }));
  }, [activities, timeRange]);

  const timeRangeButtons: { label: TimeRange; display: string }[] = [
    { label: '1H', display: '1H' },
    { label: '24H', display: '24H' },
    { label: '7D', display: '7D' },
    { label: '1M', display: '1M' },
  ];

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl p-4"
          style={{
            background: `${colors.background.secondary}f0`,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${colors.border.light}`,
            boxShadow: shadows.cardElevated,
          }}
        >
          <p className="text-white font-bold text-lg mb-1">
            ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-gray-400 text-sm">{data.formattedTime}</p>
          {data.triggered && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-xs font-medium">Alert Triggered</span>
            </div>
          )}
        </motion.div>
      );
    }
    return null;
  };

  // Custom dot for alert points
  const CustomDot = (props: { cx?: number; cy?: number; payload?: ChartDataPoint }) => {
    const { cx, cy, payload } = props;
    if (payload?.triggered) {
      return (
        <g>
          {/* Pulsing outer ring */}
          <circle
            cx={cx}
            cy={cy}
            r={8}
            fill="none"
            stroke="#ef4444"
            strokeWidth={2}
            opacity={0.6}
          >
            <animate
              attributeName="r"
              from="8"
              to="12"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              from="0.6"
              to="0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Inner dot */}
          <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2} />
        </g>
      );
    }
    return null;
  };

  // Format Y-axis price
  const formatYAxis = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Format X-axis time based on range
  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeRange === '1H') {
      return format(date, 'HH:mm');
    } else if (timeRange === '24H') {
      return format(date, 'HH:mm');
    } else if (timeRange === '7D') {
      return format(date, 'MMM d');
    } else {
      return format(date, 'MMM d');
    }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Price History</h3>
          <p className="text-gray-400 text-sm">SOL/USD price over time</p>
        </div>

        {/* Time Range Buttons */}
        <div className="flex gap-2">
          {timeRangeButtons.map((btn) => (
            <motion.button
              key={btn.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTimeRangeChange(btn.label)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                timeRange === btn.label
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{
                background: timeRange === btn.label ? colors.gradients.primary : `${colors.neutral[800]}60`,
                boxShadow: timeRange === btn.label ? shadows.primaryGlow : 'none',
              }}
            >
              {btn.display}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="w-full h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Loading chart data...</p>
          </div>
        </div>
      ) : chartData.length > 0 ? (
        <motion.div
          key={timeRange}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <defs>
                {/* Gradient for line fill */}
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Grid */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.border.light}
                opacity={0.3}
                vertical={false}
              />

              {/* X Axis */}
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                stroke={colors.neutral[500]}
                style={{ fontSize: '12px' }}
                tickLine={false}
                axisLine={{ stroke: colors.border.light }}
              />

              {/* Y Axis */}
              <YAxis
                tickFormatter={formatYAxis}
                stroke={colors.neutral[500]}
                style={{ fontSize: '12px' }}
                tickLine={false}
                axisLine={{ stroke: colors.border.light }}
                width={80}
              />

              {/* Tooltip */}
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.primary[500], strokeWidth: 2 }} />

              {/* Line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#priceGradient)"
                dot={<CustomDot />}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={isAnimating ? 1500 : 0}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <div className="w-full h-80 flex items-center justify-center">
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-400 text-sm">No data available for this time range</p>
            <p className="text-gray-500 text-xs mt-1">Run some price checks to see the chart</p>
          </div>
        </div>
      )}

      {/* Legend */}
      {chartData.length > 0 && (
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t" style={{ borderColor: colors.border.light }}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-400 text-sm">Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-gray-400 text-sm">Alert Triggered</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
