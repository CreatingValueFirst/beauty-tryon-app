'use client';

import { motion } from 'framer-motion';
import { Target, Clock, Trophy, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { useGamification, Challenge } from '@/hooks/use-gamification';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ChallengeCenterProps {
  variant?: 'full' | 'compact' | 'widget';
  className?: string;
  maxChallenges?: number;
}

function ChallengeCard({ challenge, onComplete }: { challenge: Challenge; onComplete?: () => void }) {
  const progress = Math.min((challenge.progress / challenge.requirement) * 100, 100);
  const isComplete = challenge.completed;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        'p-4 rounded-xl border transition-all',
        isComplete
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-200 hover:border-purple-300'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
          isComplete
            ? 'bg-green-100'
            : challenge.type === 'daily'
            ? 'bg-purple-100'
            : challenge.type === 'weekly'
            ? 'bg-blue-100'
            : 'bg-orange-100'
        )}>
          {challenge.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn(
              'font-semibold text-sm truncate',
              isComplete ? 'text-green-700' : 'text-gray-900'
            )}>
              {challenge.title}
            </h4>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              challenge.type === 'daily' ? 'bg-purple-100 text-purple-700' :
              challenge.type === 'weekly' ? 'bg-blue-100 text-blue-700' :
              'bg-orange-100 text-orange-700'
            )}>
              {challenge.type}
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-2">{challenge.description}</p>

          {/* Progress bar */}
          {!isComplete && (
            <div className="space-y-1">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">
                  {challenge.progress}/{challenge.requirement}
                </span>
                <span className="font-medium text-purple-600">
                  +{challenge.xpReward} XP
                </span>
              </div>
            </div>
          )}

          {/* Completed state */}
          {isComplete && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <Trophy className="w-4 h-4" />
              Completed! +{challenge.xpReward} XP
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ChallengeCenter({ variant = 'full', className, maxChallenges }: ChallengeCenterProps) {
  const { challenges, isLoading, actions } = useGamification();

  if (isLoading) {
    return (
      <div className={cn('animate-pulse space-y-3', className)}>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }

  const dailyChallenges = challenges.filter(c => c.type === 'daily');
  const weeklyChallenges = challenges.filter(c => c.type === 'weekly');
  const activeChallenges = challenges.filter(c => !c.completed);
  const completedCount = challenges.filter(c => c.completed).length;

  const displayChallenges = maxChallenges ? challenges.slice(0, maxChallenges) : challenges;

  if (variant === 'widget') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'p-4 rounded-xl bg-white border border-gray-200 shadow-sm',
          className
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span className="font-semibold text-gray-900">Challenges</span>
          </div>
          <span className="text-sm text-gray-600">
            {completedCount}/{challenges.length} done
          </span>
        </div>

        <div className="space-y-2">
          {activeChallenges.slice(0, 2).map(challenge => (
            <div
              key={challenge.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
            >
              <span className="text-lg">{challenge.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{challenge.title}</div>
                <div className="text-xs text-gray-500">+{challenge.xpReward} XP</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>

        {activeChallenges.length > 2 && (
          <Link href="/dashboard/challenges">
            <Button variant="ghost" size="sm" className="w-full mt-2">
              View All Challenges
            </Button>
          </Link>
        )}
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('space-y-3', className)}
      >
        {displayChallenges.map((challenge, i) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <ChallengeCard challenge={challenge} />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-6', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-7 h-7 text-purple-500" />
            Challenges
          </h2>
          <p className="text-gray-600 mt-1">
            Complete challenges to earn bonus XP
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100">
          <Trophy className="w-5 h-5 text-purple-600" />
          <span className="font-bold text-purple-600">{completedCount}</span>
          <span className="text-purple-500">/ {challenges.length}</span>
        </div>
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">Daily</span>
          </div>
          <div className="text-2xl font-bold">
            {dailyChallenges.filter(c => c.completed).length}/{dailyChallenges.length}
          </div>
          <div className="text-sm text-white/80">Resets at midnight</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Weekly</span>
          </div>
          <div className="text-2xl font-bold">
            {weeklyChallenges.filter(c => c.completed).length}/{weeklyChallenges.length}
          </div>
          <div className="text-sm text-white/80">Resets Monday</div>
        </div>
      </div>

      {/* Daily Challenges */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Daily Challenges
        </h3>
        <div className="space-y-3">
          {dailyChallenges.map((challenge, i) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <ChallengeCard challenge={challenge} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weekly Challenges */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Weekly Challenges
        </h3>
        <div className="space-y-3">
          {weeklyChallenges.map((challenge, i) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
            >
              <ChallengeCard challenge={challenge} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
