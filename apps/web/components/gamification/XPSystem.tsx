'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Star } from 'lucide-react';
import { useGamification, LEVELS } from '@/hooks/use-gamification';
import { cn } from '@/lib/utils/cn';

interface XPSystemProps {
  variant?: 'full' | 'compact' | 'minimal';
  className?: string;
  showProgress?: boolean;
}

export function XPSystem({ variant = 'full', className, showProgress = true }: XPSystemProps) {
  const { xp, level, progressToNextLevel, isLoading } = useGamification();

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-12 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  const nextLevel = LEVELS.find(l => l.level === level.level + 1);
  const xpToNext = nextLevel ? nextLevel.minXP - xp : 0;

  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
          'bg-gradient-to-r',
          level.color,
          'text-white text-sm font-medium shadow-lg',
          className
        )}
      >
        <span>{level.emoji}</span>
        <span>{xp} XP</span>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl',
          'bg-white/80 backdrop-blur-sm border border-gray-200',
          'shadow-sm',
          className
        )}
      >
        {/* Level badge */}
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          'bg-gradient-to-br',
          level.color,
          'text-xl shadow-md'
        )}>
          {level.emoji}
        </div>

        {/* XP info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {level.name}
            </span>
            <span className="text-xs font-medium text-gray-600">
              {xp} XP
            </span>
          </div>
          {showProgress && nextLevel && (
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextLevel}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn('h-full rounded-full bg-gradient-to-r', level.color)}
              />
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-6 rounded-2xl',
        'bg-white border border-gray-200',
        'shadow-lg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Your Progress
        </h3>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium"
        >
          <TrendingUp className="w-4 h-4" />
          Level {level.level}
        </motion.div>
      </div>

      {/* Level display */}
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center',
            'bg-gradient-to-br shadow-lg',
            level.color,
            'text-3xl'
          )}
        >
          {level.emoji}
        </motion.div>
        <div>
          <h4 className="text-xl font-bold text-gray-900">{level.name}</h4>
          <p className="text-gray-600">
            <span className="font-semibold text-purple-600">{xp}</span> XP total
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && nextLevel && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress to {nextLevel.name}</span>
            <span className="font-medium text-gray-900">{xpToNext} XP to go</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextLevel}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full bg-gradient-to-r relative',
                level.color
              )}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{level.minXP} XP</span>
            <span>{nextLevel.minXP} XP</span>
          </div>
        </div>
      )}

      {/* Max level state */}
      {!nextLevel && (
        <div className="flex items-center justify-center gap-2 py-4 text-amber-600">
          <Star className="w-5 h-5 fill-current" />
          <span className="font-semibold">Maximum Level Achieved!</span>
          <Star className="w-5 h-5 fill-current" />
        </div>
      )}
    </motion.div>
  );
}
