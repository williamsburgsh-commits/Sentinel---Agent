'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { colors, shadows, animations } from '@/lib/design-tokens';

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
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'sentinels',
      label: 'Sentinels',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: colors.background.primary }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col z-50"
        style={{
          background: `${colors.background.secondary}cc`,
          backdropFilter: 'blur(12px)',
          borderRight: `1px solid ${colors.border.light}`,
        }}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-6" style={{ borderBottom: `1px solid ${colors.border.light}` }}>
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: colors.gradients.primary }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white group-hover:opacity-80 transition-opacity">
                Sentinel
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={{
                    background: isActive ? colors.gradients.primary : 'transparent',
                    boxShadow: isActive ? shadows.primaryGlow : 'none',
                  }}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="flex-shrink-0 p-4" style={{ borderTop: `1px solid ${colors.border.light}` }}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: `${colors.neutral[800]}80` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: colors.gradients.success }}>
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">User</p>
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
              <button
                key={item.id}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}
                style={{
                  background: isActive ? `${colors.primary[500]}30` : 'transparent',
                }}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </button>
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
