'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useRef } from 'react';
import { colors, shadows } from '@/lib/design-tokens';

interface ComparisonRow {
  feature: string;
  sentinel: boolean | string;
  manual: boolean | string;
}

const comparisonData: ComparisonRow[] = [
  { feature: 'Setup Time', sentinel: '< 2 minutes', manual: '30+ minutes' },
  { feature: '24/7 Monitoring', sentinel: true, manual: false },
  { feature: 'Cost per Check', sentinel: '$0.0003', manual: 'Free (your time)' },
  { feature: 'Instant Alerts', sentinel: true, manual: false },
  { feature: 'AI Analysis', sentinel: true, manual: false },
  { feature: 'Scalable', sentinel: 'Unlimited sentinels', manual: '1-2 assets max' },
  { feature: 'Maintenance Required', sentinel: false, manual: true },
  { feature: 'Discord Integration', sentinel: true, manual: false },
];

export function ComparisonTable() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-10"
        style={{ y }}
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </motion.div>

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        {/* Table Header */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <div className="hidden sm:block col-span-1" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center p-4 sm:p-6 rounded-2xl relative overflow-hidden col-span-3 sm:col-span-1"
            style={{
              background: colors.gradients.primary,
              boxShadow: shadows.primaryGlow,
            }}
          >
            <h3 className="text-xl sm:text-2xl font-black text-white">Sentinel Agent</h3>
            <p className="text-white/80 text-xs sm:text-sm mt-1">Autonomous & Smart</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden sm:block text-center p-4 sm:p-6 rounded-2xl"
            style={{
              background: colors.background.secondary,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <h3 className="text-xl sm:text-2xl font-black text-white">Manual Monitoring</h3>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Traditional Method</p>
          </motion.div>
        </div>

        {/* Table Rows */}
        <div className="space-y-2 sm:space-y-3">
          {comparisonData.map((row, index) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl"
              style={{
                background: colors.background.secondary,
                border: `1px solid ${colors.border.light}`,
              }}
            >
              {/* Feature Name */}
              <div className="flex items-center col-span-2 sm:col-span-1">
                <span className="text-white font-semibold text-sm sm:text-base">{row.feature}</span>
              </div>

              {/* Sentinel Column */}
              <div className="flex items-center justify-center sm:justify-center">
                {typeof row.sentinel === 'boolean' ? (
                  row.sentinel ? (
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                      style={{ background: colors.gradients.success }}
                      aria-label="Available"
                    >
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-700 flex items-center justify-center"
                      aria-label="Not available"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" aria-hidden="true" />
                    </motion.div>
                  )
                ) : (
                  <span className="text-green-400 font-semibold text-center text-xs sm:text-sm">{row.sentinel}</span>
                )}
              </div>

              {/* Manual Column - Hidden on mobile, shown on tablet+ */}
              <div className="hidden sm:flex items-center justify-center">
                {typeof row.manual === 'boolean' ? (
                  row.manual ? (
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                      style={{ background: colors.gradients.success }}
                      aria-label="Available"
                    >
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-700 flex items-center justify-center"
                      aria-label="Not available"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" aria-hidden="true" />
                    </motion.div>
                  )
                ) : (
                  <span className="text-gray-400 font-semibold text-center text-xs sm:text-sm">{row.manual}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 p-6 rounded-2xl text-center"
          style={{
            background: colors.background.secondary,
            border: `1px solid ${colors.border.medium}`,
          }}
        >
          <p className="text-gray-300 text-lg">
            <span className="font-bold text-white">Save hours of manual work</span> with autonomous monitoring that never sleeps
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
