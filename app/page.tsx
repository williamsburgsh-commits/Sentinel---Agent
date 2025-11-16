'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useInView, useAnimation } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { colors, animations, shadows } from '@/lib/design-tokens';
import { Brain, Shield, Sparkles, Users, TrendingUp, Image, Vault, Coins, Zap, Bell, DollarSign, Activity, Lock, Rocket, Play, ArrowRight } from 'lucide-react';
import { FeatureCard, HowItWorksStep, ComparisonTable, TechStackGrid, CTABlock } from '@/components/landing';

const Hero3D = dynamic(() => import('@/components/landing/Hero3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-green-900/20 rounded-3xl animate-pulse">
      <div className="text-white/50 text-lg">Loading 3D Scene...</div>
    </div>
  ),
});

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
      {/* Dark Premium Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#14141F] to-black" />
        
        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(20, 241, 149, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(20, 241, 149, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Solana Accent Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #9945FF 0%, transparent 70%)' }}
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #14F195 0%, transparent 70%)' }}
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
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #9945FF 0%, transparent 70%)' }}
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
        <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-6 bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
                }}
              >
                Sentinel
              </span>
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
                  className="text-white font-semibold relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
                  }}
                >
                  <span className="relative z-10">Sign Up</span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section - Premium Split Layout */}
        <section className="min-h-screen flex items-center px-4 sm:px-6 lg:px-8 pt-24">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              {/* Left Content - 60% on desktop (3 columns) */}
              <motion.div
                initial="initial"
                animate="animate"
                variants={animations.staggerContainer}
                className="lg:col-span-3 space-y-8 text-center lg:text-left"
              >
                {/* Main Heading */}
                <motion.div variants={animations.fadeIn} className="space-y-6">
                  <motion.h1
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight"
                  >
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
                      }}
                    >
                      Autonomous
                    </span>
                    <br />
                    <span className="text-white">
                      AI Agents on
                    </span>
                    <br />
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, #14F195 0%, #9945FF 100%)',
                      }}
                    >
                      Solana
                    </span>
                  </motion.h1>
                  
                  {/* Subheadline */}
                  <motion.p
                    variants={animations.slideUp}
                    className="text-xl sm:text-2xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                  >
                    Deploy intelligent sentinels that monitor blockchain activity 24/7.
                    Pay only for what you use with HTTP 402 micropayments.
                  </motion.p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  variants={animations.scale}
                  className="flex flex-wrap gap-4 justify-center lg:justify-start"
                >
                  <Link href="/dashboard">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="relative text-lg px-10 py-7 font-bold text-white overflow-hidden group"
                        style={{
                          background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
                          boxShadow: '0 0 30px rgba(153, 69, 255, 0.4)',
                        }}
                      >
                        <Rocket className="w-5 h-5 mr-2 inline-block" />
                        <span className="relative z-10">Deploy Sentinel</span>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="#features">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="text-lg px-10 py-7 font-bold text-white border-2 border-white/30 hover:border-[#14F195] hover:bg-white/10 bg-transparent relative overflow-hidden group"
                      >
                        <Play className="w-5 h-5 mr-2 inline-block" />
                        <span className="relative z-10">Watch Demo</span>
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                          style={{ background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)' }}
                        />
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Live Stats Row */}
                <motion.div
                  variants={animations.slideUp}
                  className="pt-8 grid grid-cols-3 gap-6 max-w-2xl mx-auto lg:mx-0"
                >
                  <div className="text-center lg:text-left">
                    <div
                      className="text-3xl sm:text-4xl font-black mb-1"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      <AnimatedCounter end={1247} />
                    </div>
                    <div className="text-sm text-gray-400">Active Sentinels</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div
                      className="text-3xl sm:text-4xl font-black mb-1"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, #14F195 0%, #9945FF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      <AnimatedCounter end={45892} />
                    </div>
                    <div className="text-sm text-gray-400">Checks Run</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div
                      className="text-3xl sm:text-4xl font-black mb-1"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      $0.0003
                    </div>
                    <div className="text-sm text-gray-400">Per Check</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Content - 40% on desktop (2 columns) - 3D Hero */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="lg:col-span-2 h-[400px] sm:h-[500px] lg:h-[600px] relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-green-900/10 rounded-3xl" />
                <Hero3D className="rounded-3xl" />
                
                {/* Shimmering particles overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-gray-500"
              >
                <ArrowRight className="w-6 h-6 rotate-90" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section - Six Feature Grid */}
        <section id="features" className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="space-y-16"
            >
              {/* Section Title */}
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                  Powerful Features
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Everything you need for autonomous blockchain monitoring
                </p>
              </div>

              {/* Feature Cards - Six Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard
                  icon={Activity}
                  title="Autonomous Monitoring"
                  description="Set it and forget it. Your Sentinel runs 24/7, continuously monitoring price movements with real-time oracles."
                  gradient={colors.gradients.primary}
                  index={0}
                />
                <FeatureCard
                  icon={DollarSign}
                  title="Micropayments"
                  description="Pay only for what you use. Each price check costs just $0.0003 in USDC or CASH—true pay-per-use pricing."
                  gradient={colors.gradients.success}
                  index={1}
                />
                <FeatureCard
                  icon={Bell}
                  title="Instant Alerts"
                  description="Get notified the moment your price threshold is hit. Discord webhooks deliver alerts instantly, wherever you are."
                  gradient={colors.gradients.warning}
                  index={2}
                />
                <FeatureCard
                  icon={Brain}
                  title="AI-Powered Analysis"
                  description="DeepSeek AI analyzes price patterns and provides intelligent insights to help you make informed decisions."
                  gradient={colors.gradients.primary}
                  index={3}
                />
                <FeatureCard
                  icon={Lock}
                  title="Secure & Non-Custodial"
                  description="Your Sentinel uses its own wallet. You maintain full control—no intermediaries, no risk to your funds."
                  gradient={colors.gradients.success}
                  index={4}
                />
                <FeatureCard
                  icon={Zap}
                  title="Lightning Fast"
                  description="Built on Solana's high-performance blockchain. Sub-second transactions and real-time price feeds."
                  gradient={colors.gradients.warning}
                  index={5}
                />
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
                      $0.0003
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

        {/* How It Works Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="space-y-16"
            >
              {/* Section Title */}
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                  How It Works
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Deploy your autonomous price sentinel in four simple steps
                </p>
              </div>

              {/* Timeline Steps */}
              <div className="space-y-8">
                <HowItWorksStep
                  step={1}
                  icon={Rocket}
                  title="Create Your Sentinel"
                  description="Sign up and configure your first Sentinel with your target price and alert threshold. Takes less than 2 minutes."
                  gradient={colors.gradients.primary}
                />
                <HowItWorksStep
                  step={2}
                  icon={DollarSign}
                  title="Fund Your Wallet"
                  description="Add a small amount of USDC or CASH to your Sentinel's wallet. Each price check costs just $0.0003."
                  gradient={colors.gradients.success}
                />
                <HowItWorksStep
                  step={3}
                  icon={Activity}
                  title="Activate Monitoring"
                  description="Your Sentinel starts monitoring autonomously, checking prices every 30 seconds using HTTP 402 micropayments."
                  gradient={colors.gradients.warning}
                />
                <HowItWorksStep
                  step={4}
                  icon={Bell}
                  title="Receive Instant Alerts"
                  description="When your price threshold is hit, get instant Discord notifications with AI-powered market analysis."
                  gradient={colors.gradients.primary}
                  isLast
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="space-y-16"
            >
              {/* Section Title */}
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                  Why Choose Sentinel?
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  See how autonomous monitoring compares to traditional methods
                </p>
              </div>

              <ComparisonTable />
            </motion.div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="space-y-16"
            >
              {/* Section Title */}
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                  Built on Solana-Native Tools
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Leveraging the best of the Solana ecosystem for speed, security, and scalability
                </p>
              </div>

              <TechStackGrid />
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
          <CTABlock />
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t" style={{ borderColor: colors.border.light }}>
          <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
            <p>© 2025 Sentinel. Built on Solana with ❤️</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
