'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { colors, shadows, animations } from '@/lib/design-tokens';

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon: React.ReactNode;
  gradient: string;
  isAnimated?: boolean;
  format?: 'number' | 'currency' | 'percentage';
}

function AnimatedNumber({ end, duration = 2, format = 'number', suffix = '' }: { end: number; duration?: number; format?: 'number' | 'currency' | 'percentage'; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setCount(progress * end);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  const formatValue = (value: number) => {
    if (format === 'currency') {
      return `$${value.toFixed(4)}`;
    } else if (format === 'percentage') {
      return `${value.toFixed(1)}%`;
    } else {
      return Math.floor(value).toLocaleString();
    }
  };

  return <span ref={ref}>{formatValue(count)}{suffix}</span>;
}

function StatCard({ title, value, suffix = '', icon, gradient, isAnimated = false, format = 'number' }: StatCardProps) {
  return (
    <motion.div
      variants={animations.slideUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: `${colors.background.secondary}cc`,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${colors.border.light}`,
        boxShadow: shadows.card,
      }}
    >
      {/* Background Gradient Accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl"
        style={{ background: gradient }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-white">
            {isAnimated && typeof value === 'number' ? (
              <AnimatedNumber end={value} format={format} suffix={suffix} />
            ) : (
              <>
                {typeof value === 'number' ? (
                  format === 'currency' ? `$${value.toFixed(4)}` :
                  format === 'percentage' ? `${value.toFixed(1)}%` :
                  value.toLocaleString()
                ) : value}
                {suffix}
              </>
            )}
          </p>
        </div>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: gradient }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

interface StatsOverviewProps {
  totalChecks: number;
  alertsTriggered: number;
  totalSpent: number;
  uptimePercentage: number;
}

export default function StatsOverview({
  totalChecks,
  alertsTriggered,
  totalSpent,
  uptimePercentage,
}: StatsOverviewProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={animations.staggerContainer}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <StatCard
        title="Total Checks"
        value={totalChecks}
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        }
        gradient={colors.gradients.primary}
        isAnimated
      />

      <StatCard
        title="Alerts Triggered"
        value={alertsTriggered}
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        }
        gradient={colors.gradients.warning}
        isAnimated
      />

      <StatCard
        title="Total Spent"
        value={totalSpent}
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        gradient={colors.gradients.success}
        isAnimated
        format="currency"
      />

      <StatCard
        title="Uptime"
        value={uptimePercentage}
        suffix="%"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
        gradient={colors.gradients.primary}
        isAnimated
        format="percentage"
      />
    </motion.div>
  );
}
