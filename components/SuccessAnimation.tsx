'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

export default function SuccessAnimation({
  show,
  message = 'Success!',
  onComplete,
}: SuccessAnimationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const particles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        color: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
      }));
      setConfetti(particles);

      // Auto-hide after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />

          {/* Success checkmark */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className="relative z-10"
          >
            <motion.div
              className="bg-green-500 rounded-full p-6 shadow-2xl"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(16, 185, 129, 0.7)',
                  '0 0 0 20px rgba(16, 185, 129, 0)',
                ],
              }}
              transition={{
                duration: 1,
                repeat: 2,
                ease: 'easeOut',
              }}
            >
              <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white text-2xl font-bold text-center mt-4"
            >
              {message}
            </motion.p>
          </motion.div>

          {/* Confetti */}
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                x: particle.x * 10,
                y: [0, -100, 200],
                opacity: [1, 1, 0],
                scale: [1, 1.2, 0.8],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                ease: 'easeOut',
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: particle.color,
                left: '50%',
                top: '50%',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
