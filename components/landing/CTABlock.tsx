'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { colors, shadows } from '@/lib/design-tokens';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useReducedMotion } from '@/lib/use-reduced-motion';

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 10 + 15,
  delay: Math.random() * 5,
}));

export function CTABlock() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {/* Base gradient */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3), transparent 50%), radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.3), transparent 50%)',
          }}
        />
        
        {/* Animated mesh orbs */}
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: colors.gradients.primary }}
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: colors.gradients.success }}
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Floating Particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="relative max-w-5xl mx-auto p-12 sm:p-16 rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors.border.medium}`,
          boxShadow: shadows.cardElevated,
        }}
      >
        {/* Sparkle Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: colors.gradients.primary }}
          >
            <Sparkles className="w-10 h-10 text-white" aria-hidden="true" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center mb-6"
        >
          Ready to Deploy Your Sentinel?
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-10"
        >
          Join the autonomous agent economy. Set up your first price sentinel in under 2 minutes—no credit card required.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          {/* Primary CTA */}
          <Link href="/auth/signup">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Button
                size="lg"
                className="relative text-xl px-12 py-8 font-bold text-white overflow-hidden group"
                style={{
                  background: colors.gradients.primary,
                  boxShadow: shadows.primaryGlow,
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </span>
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: colors.gradients.primaryHover }}
                />
              </Button>
            </motion.div>
          </Link>

          {/* Secondary CTA */}
          <Link href="/dashboard">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Button
                size="lg"
                variant="outline"
                className="text-xl px-12 py-8 font-bold text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10 bg-transparent backdrop-blur-sm"
              >
                View Dashboard
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 text-center"
        >
          <p className="text-gray-400 text-sm">
            🔒 Secure • ⚡ Fast • 💎 Built on Solana
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
