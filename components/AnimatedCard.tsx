'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ReactNode, useRef } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  withParallax?: boolean;
  withHoverLift?: boolean;
}

export default function AnimatedCard({
  children,
  className = '',
  withParallax = false,
  withHoverLift = true,
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Mouse position tracking for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring animations for smooth parallax
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!withParallax || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const percentX = (e.clientX - centerX) / (rect.width / 2);
    const percentY = (e.clientY - centerY) / (rect.height / 2);
    
    mouseX.set(percentX);
    mouseY.set(percentY);
  };

  const handleMouseLeave = () => {
    if (!withParallax) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  const hoverVariants = {
    rest: {
      y: 0,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    hover: {
      y: -4,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  };

  return (
    <motion.div
      ref={cardRef}
      initial="rest"
      whileHover={withHoverLift ? "hover" : undefined}
      variants={hoverVariants}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={withParallax ? {
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      } : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      <Card className="h-full">
        {children}
      </Card>
    </motion.div>
  );
}
