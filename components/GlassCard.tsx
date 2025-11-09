'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { colors, shadows } from '@/lib/design-tokens';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: string;
}

export default function GlassCard({ children, className = '', hover = true, gradient }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`relative overflow-hidden rounded-2xl p-6 ${className}`}
      style={{
        background: `${colors.background.secondary}cc`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${colors.border.light}`,
        boxShadow: shadows.card,
      }}
    >
      {/* Optional gradient accent */}
      {gradient && (
        <div
          className="absolute top-0 right-0 w-64 h-64 opacity-10 blur-3xl pointer-events-none"
          style={{ background: gradient }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
