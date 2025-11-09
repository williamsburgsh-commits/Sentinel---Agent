'use client';

import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { InputHTMLAttributes, useState } from 'react';
import { colors } from '@/lib/design-tokens';

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export default function AnimatedInput({ className = '', ...props }: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div className="relative">
      <Input
        className={`transition-all duration-200 ${className}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {isFocused && (
        <motion.div
          className="absolute inset-0 rounded-md pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            boxShadow: `0 0 0 3px ${colors.primary[500]}40, 0 0 20px ${colors.primary[500]}20`,
          }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  );
}
