'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  withRipple?: boolean;
}

export default function AnimatedButton({
  children,
  variant,
  size,
  className = '',
  withRipple = true,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      className="relative inline-block"
    >
      <Button
        variant={variant}
        size={size}
        className={`relative overflow-hidden ${className}`}
        {...props}
      >
        {children}
        {withRipple && (
          <motion.span
            className="absolute inset-0 bg-white/10 rounded-md"
            initial={{ scale: 0, opacity: 0.5 }}
            whileTap={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </Button>
    </motion.div>
  );
}
