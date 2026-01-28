'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Star, PartyPopper } from 'lucide-react';
import { LEVELS } from '@/hooks/use-gamification';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: typeof LEVELS[number] | null;
  onClose: () => void;
}

// Confetti burst function
const fireConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#8B5CF6', '#EC4899', '#F59E0B'],
  });

  fire(0.2, {
    spread: 60,
    colors: ['#8B5CF6', '#EC4899', '#F59E0B'],
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#8B5CF6', '#EC4899', '#F59E0B'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#8B5CF6', '#EC4899', '#F59E0B'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#8B5CF6', '#EC4899', '#F59E0B'],
  });
};

export function LevelUpModal({ isOpen, newLevel, onClose }: LevelUpModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen && newLevel) {
      // Delay content for dramatic effect
      const timer = setTimeout(() => {
        setShowContent(true);
        fireConfetti();
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen, newLevel]);

  if (!newLevel) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 100 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Card */}
              <motion.div
                className={cn(
                  'relative overflow-hidden rounded-3xl p-8 text-center',
                  'bg-gradient-to-br',
                  newLevel.color,
                  'shadow-2xl'
                )}
              >
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white/30 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [-20, 20],
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>

                {/* Content */}
                <AnimatePresence>
                  {showContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative z-10"
                    >
                      {/* Trophy animation */}
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', delay: 0.3 }}
                        className="mb-6"
                      >
                        <div className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-6xl">{newLevel.emoji}</span>
                        </div>
                      </motion.div>

                      {/* Celebration text */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <PartyPopper className="w-6 h-6 text-white" />
                          <span className="text-lg font-medium text-white/90">LEVEL UP!</span>
                          <PartyPopper className="w-6 h-6 text-white transform scale-x-[-1]" />
                        </div>

                        <h2 className="text-4xl font-bold text-white mb-2">
                          Level {newLevel.level}
                        </h2>

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold mb-6">
                          <Star className="w-5 h-5 fill-current" />
                          {newLevel.name}
                          <Star className="w-5 h-5 fill-current" />
                        </div>

                        <p className="text-white/80 mb-6">
                          Congratulations! You've reached a new level.
                          Keep up the amazing work!
                        </p>

                        {/* Rewards */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                            <Sparkles className="w-6 h-6 text-white mx-auto mb-1" />
                            <div className="text-sm text-white/90">New Badge</div>
                          </div>
                          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                            <Star className="w-6 h-6 text-white mx-auto mb-1" />
                            <div className="text-sm text-white/90">+50 Bonus XP</div>
                          </div>
                        </div>

                        <Button
                          onClick={onClose}
                          className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold"
                          size="lg"
                        >
                          Awesome! 🎉
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
