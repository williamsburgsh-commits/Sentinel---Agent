'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { colors } from '@/lib/design-tokens';

interface HowItWorksStepProps {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  isLast?: boolean;
}

export function HowItWorksStep({ step, icon: Icon, title, description, gradient, isLast = false }: HowItWorksStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: step * 0.15 }}
      className="relative"
    >
      {/* Step Number Badge */}
      <div className="flex items-start gap-6">
        <motion.div
          className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center relative"
          style={{ background: gradient }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
          aria-label={`Step ${step}`}
        >
          <span className="text-2xl font-black text-white">{step}</span>
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ background: gradient }}
            initial={{ opacity: 0, scale: 1.5 }}
            whileInView={{ opacity: [0, 0.3, 0], scale: [1, 1.8, 2.2] }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: step * 0.15 + 0.3 }}
            aria-hidden="true"
          />
        </motion.div>

        <div className="flex-1 space-y-3 pb-12">
          {/* Icon and Title */}
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-white" aria-hidden="true" />
            <h3 className="text-2xl font-bold text-white">{title}</h3>
          </div>
          
          {/* Description */}
          <p className="text-gray-400 leading-relaxed text-lg">
            {description}
          </p>
        </div>
      </div>

      {/* Connecting Line */}
      {!isLast && (
        <motion.div
          className="absolute left-8 top-20 w-0.5 h-12 -bottom-8"
          style={{ background: colors.gradients.primary, opacity: 0.3 }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: step * 0.15 + 0.4 }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}
