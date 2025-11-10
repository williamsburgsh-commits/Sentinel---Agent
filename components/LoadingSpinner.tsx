'use client';

import { motion } from 'framer-motion';
import { colors } from '@/lib/design-tokens';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizes[size]} relative`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Outer gradient ring */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="url(#spinner-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="80 50"
          />
        </svg>

        {/* Inner pulsing circle */}
        <motion.div
          className="absolute inset-0 m-auto w-4 h-4 rounded-full"
          style={{ background: colors.gradients.primary }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  );
}

// Full page loading spinner
export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm z-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <motion.p
          className="mt-4 text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}

// Inline loading spinner for buttons
export function ButtonSpinner() {
  return (
    <motion.div
      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}
