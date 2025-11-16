'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { colors, shadows } from '@/lib/design-tokens';
import { useReducedMotion } from '@/lib/use-reduced-motion';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  index?: number;
}

export function FeatureCard({ icon: Icon, title, description, gradient, index = 0 }: FeatureCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={prefersReducedMotion ? {} : { y: -8, transition: { duration: 0.2 } }}
      className="group relative p-8 rounded-3xl overflow-hidden"
      style={{
        background: colors.background.secondary,
        border: `1px solid ${colors.border.light}`,
        boxShadow: shadows.card,
      }}
    >
      <div className="relative z-10 space-y-6">
        {/* Icon */}
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: gradient }}
          whileHover={prefersReducedMotion ? {} : { rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          aria-hidden="true"
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-white">
            {title}
          </h3>
          <p className="text-gray-400 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${gradient.match(/#[a-fA-F0-9]{6}/)?.[0] || colors.primary[500]}15, transparent 70%)`,
        }}
        aria-hidden="true"
      />
    </motion.div>
  );
}
