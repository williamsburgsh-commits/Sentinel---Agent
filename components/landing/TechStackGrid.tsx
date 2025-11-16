'use client';

import { motion } from 'framer-motion';
import { colors, shadows } from '@/lib/design-tokens';

interface TechItem {
  name: string;
  description: string;
  icon: string;
  color: string;
}

const techStack: TechItem[] = [
  {
    name: 'Solana',
    description: 'High-performance blockchain',
    icon: '◎',
    color: colors.gradients.primary,
  },
  {
    name: 'SPL Tokens',
    description: 'USDC & CASH payments',
    icon: '💰',
    color: colors.gradients.success,
  },
  {
    name: 'CoinMarketCap',
    description: 'Real-time price feeds',
    icon: '📊',
    color: colors.gradients.warning,
  },
  {
    name: 'DeepSeek AI',
    description: 'Intelligent pattern analysis',
    icon: '🧠',
    color: colors.gradients.primary,
  },
  {
    name: 'HTTP 402',
    description: 'Micropayment protocol',
    icon: '⚡',
    color: colors.gradients.warning,
  },
  {
    name: 'Discord',
    description: 'Instant webhook alerts',
    icon: '💬',
    color: colors.gradients.success,
  },
];

export function TechStackGrid() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {techStack.map((tech, index) => (
        <motion.div
          key={tech.name}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="group relative p-8 rounded-3xl overflow-hidden cursor-pointer"
          style={{
            background: colors.background.secondary,
            border: `1px solid ${colors.border.light}`,
            boxShadow: shadows.card,
          }}
        >
          {/* Icon */}
          <motion.div
            className="text-6xl mb-4"
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ duration: 0.3 }}
            aria-hidden="true"
          >
            {tech.icon}
          </motion.div>

          {/* Content */}
          <div className="space-y-2">
            <h4 className="text-2xl font-bold text-white">{tech.name}</h4>
            <p className="text-gray-400 leading-relaxed">{tech.description}</p>
          </div>

          {/* Hover Glow Effect */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${tech.color.match(/#[a-fA-F0-9]{6}/)?.[0] || colors.primary[500]}10, transparent 70%)`,
            }}
            aria-hidden="true"
          />

          {/* Border Glow on Hover */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              boxShadow: `0 0 20px ${tech.color.match(/#[a-fA-F0-9]{6}/)?.[0] || colors.primary[500]}40`,
            }}
            aria-hidden="true"
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
