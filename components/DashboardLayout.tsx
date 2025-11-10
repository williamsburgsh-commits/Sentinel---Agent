'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { colors, animations } from '@/lib/design-tokens';

interface DashboardLayoutProps {
  children: ReactNode;
  currentSection?: 'dashboard' | 'sentinels' | 'activity' | 'settings';
  greeting?: string;
  notificationCount?: number;
}

export default function DashboardLayout({
  children,
  currentSection = 'dashboard',
  greeting = 'Good Morning',
  notificationCount = 0,
}: DashboardLayoutProps) {

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'sentinels',
      label: 'Sentinels',
      href: '/sentinels',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
    },
    {
      id: 'activity',
      label: 'Activity',
      href: '/activity',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" style={{ animationDuration: '8s' }} />
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col z-50">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl border-r border-white/10" />
        <div className="relative flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center h-20 flex-shrink-0 px-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/50">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  Sentinel
                </span>
                <p className="text-xs text-gray-400">Agent Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <Link key={item.id} href={item.href}>
                  <motion.div
                    whileHover={{ x: 6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all cursor-pointer overflow-hidden ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {/* Active background */}
                    {isActive && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl" />
                        <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r" />
                      </>
                    )}
                    
                    {/* Hover background */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                    )}
                    
                    <div className="relative z-10 flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-gray-800/50 text-gray-400 group-hover:bg-gray-700/50 group-hover:text-white'
                      }`}>
                        {item.icon}
                      </div>
                      <span className="font-semibold">{item.label}</span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="flex-shrink-0 p-4 border-t border-white/10">
            <div className="relative group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-800/30 hover:from-gray-700/50 hover:to-gray-700/30 transition-all cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-colors" />
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 blur-lg opacity-50" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
              </div>
              <div className="relative flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">User</p>
                <p className="text-gray-400 text-xs truncate">Sentinel Agent</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50" style={{ background: `${colors.background.secondary}f0`, backdropFilter: 'blur(12px)', borderTop: `1px solid ${colors.border.light}` }}>
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <Link key={item.id} href={item.href}>
                <div
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all cursor-pointer ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`}
                  style={{
                    background: isActive ? `${colors.primary[500]}30` : 'transparent',
                  }}
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top Header */}
        <header
          className="sticky top-0 z-40 flex h-16 flex-shrink-0 items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8"
          style={{
            background: `${colors.background.secondary}cc`,
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${colors.border.light}`,
          }}
        >
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Greeting */}
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-semibold text-white">
                {greeting}
                <span className="ml-2">👋</span>
              </h1>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                style={{ background: `${colors.neutral[800]}60` }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: colors.gradients.danger }}
                  >
                    {notificationCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Profile (Mobile) */}
              <button className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white transition-colors" style={{ background: `${colors.neutral[800]}60` }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-20 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={animations.fadeIn}
              className="px-4 sm:px-6 lg:px-8 py-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
