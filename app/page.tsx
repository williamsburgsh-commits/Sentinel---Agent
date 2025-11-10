'use client';

import Link from 'next/link';
import { motion, useInView, useAnimation } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { colors, animations, shadows } from '@/lib/design-tokens';
import { Brain, Shield, Sparkles, Users, TrendingUp, Image, Vault, Coins } from 'lucide-react';

// Animated counter component
function AnimatedCounter({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
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
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start('animate');
  }, [controls]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        
        {/* Floating Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: colors.gradients.primary }}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: colors.gradients.success }}
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-15 blur-3xl"
          style={{ background: colors.gradients.warning }}
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              Sentinel
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  className="text-white"
                  style={{
                    background: colors.gradients.primary,
                  }}
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={animations.staggerContainer}
              className="space-y-8"
            >
              {/* Main Heading */}
              <motion.div variants={animations.fadeIn} className="space-y-4">
                <motion.h1
                  className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight"
                  style={{
                    background: colors.gradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Sentinel
                </motion.h1>
                <motion.div
                  className="h-2 w-32 mx-auto rounded-full"
                  style={{ background: colors.gradients.primary }}
                  initial={{ width: 0 }}
                  animate={{ width: 128 }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </motion.div>

              {/* Subheading - "AI that works for you" */}
              <motion.p
                variants={animations.slideUp}
                className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-200 max-w-4xl mx-auto"
              >
                AI that works for you
              </motion.p>

              {/* Description */}
              <motion.p
                variants={animations.slideUp}
                className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
              >
                Set price alerts, monitor Solana blockchain activity, and receive instant notifications—all running autonomously with pay-per-use micropayments.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={animations.scale} className="pt-8 flex flex-wrap gap-4 justify-center">
                <Link href="/dashboard">
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
                      <span className="relative z-10">Launch Dashboard</span>
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: colors.gradients.primaryHover }}
                      />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="#features">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-xl px-12 py-8 font-bold text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10 bg-transparent"
                    >
                      Learn More
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Scroll Indicator */}
              <motion.div
                variants={animations.fadeIn}
                className="pt-16"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-gray-500 text-sm"
                >
                  <svg
                    className="w-6 h-6 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-100px' }}
              variants={animations.staggerContainer}
              className="space-y-16"
            >
              {/* Section Title */}
              <motion.div variants={animations.fadeIn} className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                  Powerful Features
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Everything you need for autonomous blockchain monitoring
                </p>
              </motion.div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1: Autonomous Monitoring */}
                <motion.div
                  variants={animations.slideUp}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
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
                      style={{ background: colors.gradients.primary }}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                        />
                      </svg>
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-white">
                        Autonomous Monitoring
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        Set it and forget it. Your Sentinel runs 24/7, continuously monitoring price movements with Switchboard oracles.
                      </p>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${colors.primary[500]}15, transparent 70%)`,
                    }}
                  />
                </motion.div>

                {/* Feature 2: Micropayments */}
                <motion.div
                  variants={animations.slideUp}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
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
                      style={{ background: colors.gradients.success }}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-white">
                        Micropayments
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        Pay only for what you use. Each price check costs just $0.0001 in USDC or CASH—true pay-per-use pricing.
                      </p>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${colors.success[500]}15, transparent 70%)`,
                    }}
                  />
                </motion.div>

                {/* Feature 3: Instant Alerts */}
                <motion.div
                  variants={animations.slideUp}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
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
                      style={{ background: colors.gradients.warning }}
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-white">
                        Instant Alerts
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        Get notified the moment your price threshold is hit. Discord webhooks deliver alerts instantly, wherever you are.
                      </p>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${colors.warning[500]}15, transparent 70%)`,
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-100px' }}
              variants={animations.staggerContainer}
              className="relative p-12 sm:p-16 rounded-3xl overflow-hidden"
              style={{
                background: colors.background.secondary,
                border: `1px solid ${colors.border.medium}`,
                boxShadow: shadows.cardElevated,
              }}
            >
              {/* Background Gradient */}
              <div
                className="absolute inset-0 opacity-30"
                style={{ background: colors.gradients.dark }}
              />

              {/* Content */}
              <div className="relative z-10">
                <motion.div variants={animations.fadeIn} className="text-center mb-16">
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                    Trusted by the Community
                  </h2>
                  <p className="text-xl text-gray-400">
                    Join thousands of users monitoring the blockchain
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {/* Stat 1 */}
                  <motion.div
                    variants={animations.slideUp}
                    className="text-center space-y-3"
                  >
                    <div
                      className="text-5xl sm:text-6xl font-black"
                      style={{
                        background: colors.gradients.primary,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      <AnimatedCounter end={1247} />
                    </div>
                    <div className="text-xl text-gray-300 font-semibold">
                      Sentinels Deployed
                    </div>
                    <div className="text-sm text-gray-500">
                      Active monitoring agents
                    </div>
                  </motion.div>

                  {/* Stat 2 */}
                  <motion.div
                    variants={animations.slideUp}
                    className="text-center space-y-3"
                  >
                    <div
                      className="text-5xl sm:text-6xl font-black"
                      style={{
                        background: colors.gradients.success,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      <AnimatedCounter end={45892} />
                    </div>
                    <div className="text-xl text-gray-300 font-semibold">
                      Checks Performed
                    </div>
                    <div className="text-sm text-gray-500">
                      Total price checks executed
                    </div>
                  </motion.div>

                  {/* Stat 3 */}
                  <motion.div
                    variants={animations.slideUp}
                    className="text-center space-y-3"
                  >
                    <div
                      className="text-5xl sm:text-6xl font-black"
                      style={{
                        background: colors.gradients.warning,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      $0.0001
                    </div>
                    <div className="text-xl text-gray-300 font-semibold">
                      Cost per Check
                    </div>
                    <div className="text-sm text-gray-500">
                      Affordable micropayments
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Section Header */}
            <motion.div
              initial="hidden"
              whileInView="animate"
              viewport={{ once: true }}
              variants={animations.fadeIn}
              className="text-center mb-20"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">What&apos;s Next</span>
              </motion.div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                The Future of Sentinel
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Building the autonomous agent economy, one Sentinel at a time
              </p>
            </motion.div>

            {/* Phase 1: Agent Economy */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                <div className="pl-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4">
                    <span className="text-xs font-bold text-blue-400">PHASE 1</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">The Agent Economy</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 backdrop-blur-xl"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/20">
                          <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">Agent-to-Agent Marketplace</h4>
                          <p className="text-gray-400 text-sm">
                            Your Analyst Sentinel can sell verified AI analyses to other Sentinels - agents paying agents for insights
                          </p>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 backdrop-blur-xl"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                          <Brain className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">Multi-Model AI Consensus</h4>
                          <p className="text-gray-400 text-sm">
                            Sentinels pay multiple AI models (Claude, GPT-4) for consensus recommendations - trustless analysis through verification
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Phase 2: Specialized Sentinels */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-16"
            >
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                <div className="pl-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
                    <span className="text-xs font-bold text-purple-400">PHASE 2</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Specialized Sentinels</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        icon: TrendingUp,
                        title: 'DeFi Trader',
                        description: 'Alert on JUP/USDC 5% price movements',
                        color: 'from-green-500 to-emerald-600',
                        iconBg: 'bg-green-500/20',
                        iconColor: 'text-green-400'
                      },
                      {
                        icon: Image,
                        title: 'NFT Collector',
                        description: 'Alert on Mad Lads floor price drops below 100 SOL',
                        color: 'from-pink-500 to-rose-600',
                        iconBg: 'bg-pink-500/20',
                        iconColor: 'text-pink-400'
                      },
                      {
                        icon: Vault,
                        title: 'DAO Treasurer',
                        description: 'Alert on treasury balance drops below $500K',
                        color: 'from-blue-500 to-cyan-600',
                        iconBg: 'bg-blue-500/20',
                        iconColor: 'text-blue-400'
                      },
                      {
                        icon: Coins,
                        title: 'Staker',
                        description: 'Alert on Marinade APY changes over 0.25%',
                        color: 'from-orange-500 to-amber-600',
                        iconBg: 'bg-orange-500/20',
                        iconColor: 'text-orange-400'
                      }
                    ].map((sentinel, index) => (
                      <motion.div
                        key={sentinel.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -8 }}
                        className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 backdrop-blur-xl group cursor-pointer"
                      >
                        <div className={`p-3 rounded-xl ${sentinel.iconBg} mb-4 inline-block group-hover:scale-110 transition-transform`}>
                          <sentinel.icon className={`w-6 h-6 ${sentinel.iconColor}`} />
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">{sentinel.title}</h4>
                        <p className="text-gray-400 text-sm">{sentinel.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Phase 3: Intelligence & Identity */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-red-500 rounded-full" />
                <div className="pl-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 mb-4">
                    <span className="text-xs font-bold text-pink-400">PHASE 3</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Intelligence & Identity</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 backdrop-blur-xl"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-pink-500/20">
                          <Sparkles className="w-6 h-6 text-pink-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">Sentinel Personality & Memory</h4>
                          <p className="text-gray-400 text-sm">
                            Agents get smarter over time with personalized AI that remembers past analyses
                          </p>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 backdrop-blur-xl"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-red-500/20">
                          <Shield className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">On-Chain Performance & Reputation</h4>
                          <p className="text-gray-400 text-sm">
                            Verifiable, immutable track record of each Sentinel&apos;s recommendations
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={animations.fadeIn}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              Ready to Start Monitoring?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Deploy your first Sentinel in seconds. No credit card required.
            </p>
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
                  <span className="relative z-10">Get Started Free</span>
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: colors.gradients.primaryHover }}
                  />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t" style={{ borderColor: colors.border.light }}>
          <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
            <p>© 2024 Sentinel. Built on Solana with ❤️</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
