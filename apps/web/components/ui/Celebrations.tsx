'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Confetti presets
export const celebrations = {
  // Basic confetti burst
  confetti: () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'],
    });
  },

  // Side cannons for celebrations
  sideCannons: () => {
    const end = Date.now() + 500;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  },

  // Fireworks effect
  fireworks: () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  },

  // Stars burst
  stars: () => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['star'],
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#8B5CF6'],
    };

    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star'],
    });

    confetti({
      ...defaults,
      particleCount: 20,
      scalar: 0.75,
      shapes: ['circle'],
    });
  },

  // Achievement unlock
  achievement: () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ['#8B5CF6', '#EC4899', '#F59E0B'],
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  },
};

// Sparkle component for inline effects
interface SparkleProps {
  children: React.ReactNode;
  active?: boolean;
  count?: number;
}

export function Sparkle({ children, active = false, count = 3 }: SparkleProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setSparkles(prev => [
        ...prev.slice(-10),
        {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
        },
      ]);
    }, 200);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <span className="relative inline-block">
      {children}
      <AnimatePresence>
        {sparkles.map(sparkle => (
          <motion.span
            key={sparkle.id}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 1, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute pointer-events-none text-yellow-400"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
            }}
          >
            ✨
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

// Floating hearts animation
interface FloatingHeartsProps {
  active: boolean;
  count?: number;
}

export function FloatingHearts({ active, count = 5 }: FloatingHeartsProps) {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number }>>([]);

  useEffect(() => {
    if (!active) {
      setHearts([]);
      return;
    }

    const newHearts = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
    }));
    setHearts(newHearts);
  }, [active, count]);

  return (
    <AnimatePresence>
      {hearts.map((heart, i) => (
        <motion.div
          key={heart.id}
          initial={{ opacity: 1, y: 0, x: heart.x + '%', scale: 0 }}
          animate={{
            opacity: [1, 1, 0],
            y: -100,
            scale: [0, 1, 0.5],
            rotate: [0, 15, -15, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.5,
            delay: i * 0.1,
            ease: 'easeOut',
          }}
          className="fixed bottom-20 pointer-events-none text-2xl z-50"
          style={{ left: heart.x + '%' }}
        >
          💖
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

// Success pulse animation wrapper
interface SuccessPulseProps {
  children: React.ReactNode;
  active: boolean;
}

export function SuccessPulse({ children, active }: SuccessPulseProps) {
  return (
    <motion.div
      animate={active ? {
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 0 rgba(34, 197, 94, 0)',
          '0 0 0 10px rgba(34, 197, 94, 0.3)',
          '0 0 0 0 rgba(34, 197, 94, 0)',
        ],
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

// XP gained toast animation
interface XPGainedProps {
  amount: number;
  onComplete?: () => void;
}

export function XPGained({ amount, onComplete }: XPGainedProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 0.3, repeat: 2 }}
        className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-xl flex items-center gap-2"
      >
        <span className="text-yellow-300">⭐</span>
        <span>+{amount} XP</span>
      </motion.div>
    </motion.div>
  );
}

// Hook for triggering celebrations
export function useCelebration() {
  const [showXP, setShowXP] = useState<number | null>(null);

  const celebrate = useCallback((type: keyof typeof celebrations) => {
    celebrations[type]();
  }, []);

  const showXPGain = useCallback((amount: number) => {
    setShowXP(amount);
    celebrations.stars();
  }, []);

  const hideXP = useCallback(() => {
    setShowXP(null);
  }, []);

  return {
    celebrate,
    showXPGain,
    XPToast: showXP ? <XPGained amount={showXP} onComplete={hideXP} /> : null,
  };
}
