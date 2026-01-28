'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Gift } from 'lucide-react';
import { useGamification } from '@/hooks/use-gamification';
import { cn } from '@/lib/utils/cn';

interface StreakTrackerProps {
  variant?: 'full' | 'compact' | 'badge';
  className?: string;
}

// Streak milestones with rewards
const STREAK_MILESTONES = [
  { days: 3, reward: '🎁 Bonus XP', emoji: '🔥' },
  { days: 7, reward: '⚡ 25 XP Bonus', emoji: '🔥🔥' },
  { days: 14, reward: '💎 Premium Style', emoji: '🔥🔥🔥' },
  { days: 30, reward: '👑 100 XP + Badge', emoji: '💫' },
];

export function StreakTracker({ variant = 'full', className }: StreakTrackerProps) {
  const { streak, lastLoginDate, isLoading, actions } = useGamification();

  // Check streak on mount
  useEffect(() => {
    actions.checkStreak();
  }, [actions]);

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-20 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  // Get current and next milestone
  const currentMilestone = [...STREAK_MILESTONES].reverse().find(m => streak >= m.days);
  const nextMilestone = STREAK_MILESTONES.find(m => streak < m.days);

  // Calculate days until next milestone
  const daysToNext = nextMilestone ? nextMilestone.days - streak : 0;

  // Generate last 7 days for calendar view
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const isToday = i === 6;
    const isActive = lastLoginDate && new Date(lastLoginDate) >= date;
    return { date: dateStr, day: date.toLocaleDateString('en', { weekday: 'short' })[0], isToday, isActive };
  });

  if (variant === 'badge') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full',
          'bg-gradient-to-r from-orange-500 to-red-500',
          'text-white font-bold shadow-lg',
          className
        )}
      >
        <Flame className="w-5 h-5" />
        <span>{streak}</span>
        <span className="text-sm opacity-90">day streak</span>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex items-center gap-4 p-4 rounded-xl',
          'bg-gradient-to-r from-orange-50 to-red-50',
          'border border-orange-200',
          className
        )}
      >
        {/* Streak fire */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="relative"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
            <Flame className="w-6 h-6 text-white" />
          </div>
          {streak > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-yellow-900 shadow">
              {streak}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <div className="flex-1">
          <div className="font-bold text-gray-900">
            {streak > 0 ? `${streak} Day Streak!` : 'Start Your Streak!'}
          </div>
          {nextMilestone && (
            <div className="text-sm text-gray-600">
              {daysToNext} days to {nextMilestone.reward}
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
        'bg-gradient-to-br from-orange-50 via-white to-red-50',
        'border border-orange-200',
        'shadow-lg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg"
          >
            <Flame className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {streak > 0 ? `${streak} Day Streak` : 'No Streak Yet'}
            </h3>
            <p className="text-sm text-gray-600">
              {streak > 0 ? 'Keep it going!' : 'Try on a look to start!'}
            </p>
          </div>
        </div>

        {currentMilestone && (
          <div className="text-2xl">{currentMilestone.emoji}</div>
        )}
      </div>

      {/* 7-day calendar */}
      <div className="mb-6">
        <div className="flex items-center gap-1 justify-between">
          {last7Days.map((day, i) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center"
            >
              <span className="text-xs text-gray-500 mb-1">{day.day}</span>
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  day.isActive
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md'
                    : day.isToday
                    ? 'bg-gray-200 text-gray-600 ring-2 ring-orange-300'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                {day.isActive ? <Flame className="w-5 h-5" /> : new Date(day.date).getDate()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Gift className="w-4 h-4" />
          Streak Rewards
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {STREAK_MILESTONES.map((milestone) => {
            const isAchieved = streak >= milestone.days;
            const isCurrent = nextMilestone?.days === milestone.days;

            return (
              <motion.div
                key={milestone.days}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  'p-3 rounded-xl text-sm transition-all',
                  isAchieved
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300'
                    : isCurrent
                    ? 'bg-white border-2 border-orange-400 border-dashed'
                    : 'bg-gray-50 border border-gray-200'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'font-medium',
                    isAchieved ? 'text-orange-700' : 'text-gray-600'
                  )}>
                    {milestone.days} Days
                  </span>
                  <span>{isAchieved ? '✓' : milestone.emoji}</span>
                </div>
                <div className={cn(
                  'text-xs mt-1',
                  isAchieved ? 'text-orange-600' : 'text-gray-500'
                )}>
                  {milestone.reward}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
