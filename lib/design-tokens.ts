/**
 * Design System Tokens for Sentinel Dashboard
 * 
 * A comprehensive design system providing consistent colors, typography,
 * spacing, animations, and visual styles across the application.
 * 
 * Usage:
 * import { colors, typography, spacing, animations } from '@/lib/design-tokens';
 */

import { Variants } from 'framer-motion';

// ============================================================================
// COLOR PALETTE
// ============================================================================

/**
 * Professional dark theme color palette
 * Vibrant yet professional colors suitable for a production SaaS dashboard
 */
export const colors = {
  // Primary - Purple-Blue Gradient
  primary: {
    50: '#f0f4ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // Main primary
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },

  // Secondary - Deep Purple
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Main secondary
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },

  // Success - Vibrant Green (for CASH)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Warning - Amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Danger - Red
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main danger
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Info - Blue
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main info
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Neutral - Grays
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Background colors for dark theme
  background: {
    primary: '#0f172a',    // Main background
    secondary: '#1e293b',  // Card background
    tertiary: '#334155',   // Elevated elements
    overlay: 'rgba(0, 0, 0, 0.8)',
  },

  // Border colors
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    heavy: 'rgba(255, 255, 255, 0.3)',
  },

  // Gradient definitions
  gradients: {
    primary: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    primaryHover: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
    success: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    dark: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    card: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
  },
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * Typography scale with font sizes and weights
 */
export const typography = {
  // Font families
  fontFamily: {
    sans: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'var(--font-geist-mono), "Courier New", monospace',
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
  },

  // Font weights
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ============================================================================
// SPACING SYSTEM
// ============================================================================

/**
 * Consistent spacing scale (based on 4px grid)
 */
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  28: '7rem',        // 112px
  32: '8rem',        // 128px
  36: '9rem',        // 144px
  40: '10rem',       // 160px
  44: '11rem',       // 176px
  48: '12rem',       // 192px
  52: '13rem',       // 208px
  56: '14rem',       // 224px
  60: '15rem',       // 240px
  64: '16rem',       // 256px
  72: '18rem',       // 288px
  80: '20rem',       // 320px
  96: '24rem',       // 384px
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

/**
 * Border radius tokens for consistent rounded corners
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  base: '0.25rem',   // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
};

// ============================================================================
// SHADOWS
// ============================================================================

/**
 * Shadow definitions for depth and elevation
 */
export const shadows = {
  // Standard shadows
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  
  // Colored shadows for emphasis
  primaryGlow: '0 0 20px rgba(99, 102, 241, 0.3)',
  successGlow: '0 0 20px rgba(34, 197, 94, 0.3)',
  warningGlow: '0 0 20px rgba(245, 158, 11, 0.3)',
  dangerGlow: '0 0 20px rgba(239, 68, 68, 0.3)',
  
  // Card shadows
  card: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  cardElevated: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
};

// ============================================================================
// FRAMER MOTION ANIMATION VARIANTS
// ============================================================================

/**
 * Reusable animation variants for consistent motion design
 */
export const animations = {
  // Fade in animation
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  } as Variants,

  // Fade in with delay
  fadeInDelayed: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, delay: 0.2, ease: 'easeInOut' },
  } as Variants,

  // Slide up animation
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: 'easeOut' },
  } as Variants,

  // Slide down animation
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4, ease: 'easeOut' },
  } as Variants,

  // Slide in from left
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.4, ease: 'easeOut' },
  } as Variants,

  // Slide in from right
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.4, ease: 'easeOut' },
  } as Variants,

  // Scale animation
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: 'easeOut' },
  } as Variants,

  // Scale up (for emphasis)
  scaleUp: {
    initial: { scale: 1 },
    animate: { scale: 1.05 },
    transition: { duration: 0.2, ease: 'easeInOut' },
  } as Variants,

  // Bounce animation
  bounce: {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.1, 0.95, 1.05, 1],
      transition: { duration: 0.6, ease: 'easeInOut' },
    },
  } as Variants,

  // Stagger container (for lists)
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  } as Variants,

  // Stagger item (child of stagger container)
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  } as Variants,

  // Pulse animation (for notifications)
  pulse: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  } as Variants,

  // Shimmer animation (for loading states)
  shimmer: {
    initial: { backgroundPosition: '-200% 0' },
    animate: {
      backgroundPosition: '200% 0',
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  } as Variants,

  // Rotate animation
  rotate: {
    initial: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  } as Variants,

  // Card hover animation
  cardHover: {
    initial: { y: 0, boxShadow: shadows.card },
    whileHover: { 
      y: -4, 
      boxShadow: shadows.cardHover,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
  } as Variants,

  // Button press animation
  buttonPress: {
    whileTap: { scale: 0.95 },
    transition: { duration: 0.1 },
  } as Variants,
};

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

/**
 * Common transition configurations
 */
export const transitions = {
  fast: { duration: 0.15, ease: 'easeInOut' },
  normal: { duration: 0.3, ease: 'easeInOut' },
  slow: { duration: 0.5, ease: 'easeInOut' },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 20 },
};

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

/**
 * Z-index layering system
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

/**
 * Responsive breakpoints
 */
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color with opacity
 */
export const withOpacity = (color: string, opacity: number): string => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // Handle rgb/rgba colors
  if (color.startsWith('rgb')) {
    return color.replace(/rgba?\(([^)]+)\)/, (_, values) => {
      const [r, g, b] = values.split(',').map((v: string) => v.trim());
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    });
  }
  return color;
};

/**
 * Create gradient string
 */
export const createGradient = (
  direction: string,
  colorStops: Array<{ color: string; position: string }>
): string => {
  const stops = colorStops.map(({ color, position }) => `${color} ${position}`).join(', ');
  return `linear-gradient(${direction}, ${stops})`;
};

/**
 * Get responsive value based on breakpoint
 */
export const responsive = <T>(values: {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}): T => {
  // This is a placeholder - actual implementation would use media queries
  return values.base;
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  transitions,
  zIndex,
  breakpoints,
  withOpacity,
  createGradient,
  responsive,
};

export default designTokens;
