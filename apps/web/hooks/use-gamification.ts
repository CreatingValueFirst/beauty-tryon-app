'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

// XP rewards for different actions
export const XP_REWARDS = {
  DAILY_LOGIN: 10,
  COMPLETE_TRYON: 20,
  SHARE_TO_SOCIAL: 50,
  COMPLETE_CHALLENGE: 100,
  STREAK_BONUS_7: 25,
  STREAK_BONUS_30: 100,
  FIRST_TRYON: 50,
  SAVE_TO_GALLERY: 5,
  INVITE_FRIEND: 200,
} as const;

// Level definitions
export const LEVELS = [
  { level: 1, name: 'Glow Getter', minXP: 0, maxXP: 100, emoji: '✨', color: 'from-gray-400 to-gray-500' },
  { level: 2, name: 'Style Explorer', minXP: 100, maxXP: 300, emoji: '🔍', color: 'from-blue-400 to-blue-500' },
  { level: 3, name: 'Beauty Guru', minXP: 300, maxXP: 600, emoji: '💄', color: 'from-pink-400 to-pink-500' },
  { level: 4, name: 'Trend Setter', minXP: 600, maxXP: 1000, emoji: '🔥', color: 'from-orange-400 to-red-500' },
  { level: 5, name: 'Icon', minXP: 1000, maxXP: Infinity, emoji: '👑', color: 'from-yellow-400 to-amber-500' },
] as const;

// Challenge types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'seasonal';
  xpReward: number;
  requirement: number;
  progress: number;
  completed: boolean;
  expiresAt?: Date;
  icon: string;
}

export interface GamificationState {
  xp: number;
  level: typeof LEVELS[number];
  streak: number;
  lastLoginDate: string | null;
  totalTryOns: number;
  totalShares: number;
  challenges: Challenge[];
  achievements: string[];
}

export interface GamificationActions {
  addXP: (amount: number, reason: keyof typeof XP_REWARDS) => Promise<void>;
  checkStreak: () => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
  refreshChallenges: () => Promise<void>;
}

const DEFAULT_STATE: GamificationState = {
  xp: 0,
  level: LEVELS[0],
  streak: 0,
  lastLoginDate: null,
  totalTryOns: 0,
  totalShares: 0,
  challenges: [],
  achievements: [],
};

// Generate daily challenges
const generateDailyChallenges = (): Challenge[] => [
  {
    id: 'daily-tryon',
    title: 'Try 3 Looks',
    description: 'Complete 3 virtual try-ons today',
    type: 'daily',
    xpReward: 30,
    requirement: 3,
    progress: 0,
    completed: false,
    icon: '💄',
  },
  {
    id: 'daily-share',
    title: 'Share the Love',
    description: 'Share one look to social media',
    type: 'daily',
    xpReward: 25,
    requirement: 1,
    progress: 0,
    completed: false,
    icon: '📱',
  },
];

// Generate weekly challenges
const generateWeeklyChallenges = (): Challenge[] => [
  {
    id: 'weekly-explorer',
    title: 'Style Explorer',
    description: 'Try all 3 categories: Hair, Nails, Makeup',
    type: 'weekly',
    xpReward: 150,
    requirement: 3,
    progress: 0,
    completed: false,
    icon: '🎨',
  },
  {
    id: 'weekly-streak',
    title: 'Consistency Queen',
    description: 'Maintain a 7-day streak',
    type: 'weekly',
    xpReward: 200,
    requirement: 7,
    progress: 0,
    completed: false,
    icon: '🔥',
  },
];

export function useGamification() {
  const [state, setState] = useState<GamificationState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<typeof LEVELS[number] | null>(null);

  // Calculate level from XP
  const calculateLevel = useCallback((xp: number) => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].minXP) {
        return LEVELS[i];
      }
    }
    return LEVELS[0];
  }, []);

  // Load gamification data
  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Use local storage for non-authenticated users
        const stored = localStorage.getItem('gamification');
        if (stored) {
          const parsed = JSON.parse(stored);
          const level = calculateLevel(parsed.xp || 0);
          setState({ ...DEFAULT_STATE, ...parsed, level });
        }
        setIsLoading(false);
        return;
      }

      // Fetch from database for authenticated users
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, streak, last_login_date, total_tryons, total_shares, achievements')
        .eq('id', user.id)
        .single();

      if (profile) {
        const xp = profile.xp || 0;
        const level = calculateLevel(xp);
        setState({
          xp,
          level,
          streak: profile.streak || 0,
          lastLoginDate: profile.last_login_date,
          totalTryOns: profile.total_tryons || 0,
          totalShares: profile.total_shares || 0,
          challenges: [...generateDailyChallenges(), ...generateWeeklyChallenges()],
          achievements: profile.achievements || [],
        });
      } else {
        // Initialize challenges for new users
        setState(prev => ({
          ...prev,
          challenges: [...generateDailyChallenges(), ...generateWeeklyChallenges()],
        }));
      }
    } catch (error) {
      console.error('Failed to load gamification data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateLevel]);

  // Initialize on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save to local storage when state changes (for non-auth users)
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('gamification', JSON.stringify({
        xp: state.xp,
        streak: state.streak,
        lastLoginDate: state.lastLoginDate,
        totalTryOns: state.totalTryOns,
        totalShares: state.totalShares,
      }));
    }
  }, [state, isLoading]);

  // Add XP
  const addXP = useCallback(async (amount: number, reason: keyof typeof XP_REWARDS) => {
    const oldLevel = state.level;
    const newXP = state.xp + amount;
    const newLevelData = calculateLevel(newXP);

    // Check for level up
    if (newLevelData.level > oldLevel.level) {
      setNewLevel(newLevelData);
      setShowLevelUp(true);
    }

    setState(prev => ({
      ...prev,
      xp: newXP,
      level: newLevelData,
      totalTryOns: reason === 'COMPLETE_TRYON' ? prev.totalTryOns + 1 : prev.totalTryOns,
      totalShares: reason === 'SHARE_TO_SOCIAL' ? prev.totalShares + 1 : prev.totalShares,
    }));

    // Update database for authenticated users
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from('profiles')
          .update({
            xp: newXP,
            total_tryons: reason === 'COMPLETE_TRYON' ? state.totalTryOns + 1 : state.totalTryOns,
            total_shares: reason === 'SHARE_TO_SOCIAL' ? state.totalShares + 1 : state.totalShares,
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Failed to update XP:', error);
    }
  }, [state.xp, state.level, state.totalTryOns, state.totalShares, calculateLevel]);

  // Check and update streak
  const checkStreak = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = state.lastLoginDate;

    if (lastLogin === today) {
      return; // Already logged in today
    }

    let newStreak = 1;
    if (lastLogin) {
      const lastDate = new Date(lastLogin);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = state.streak + 1;
      }
    }

    // Award streak bonuses
    let bonusXP = XP_REWARDS.DAILY_LOGIN;
    if (newStreak === 7) bonusXP += XP_REWARDS.STREAK_BONUS_7;
    if (newStreak === 30) bonusXP += XP_REWARDS.STREAK_BONUS_30;

    setState(prev => ({
      ...prev,
      streak: newStreak,
      lastLoginDate: today,
    }));

    await addXP(bonusXP, 'DAILY_LOGIN');

    // Update database
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from('profiles')
          .update({
            streak: newStreak,
            last_login_date: today,
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  }, [state.lastLoginDate, state.streak, addXP]);

  // Complete a challenge
  const completeChallenge = useCallback(async (challengeId: string) => {
    const challenge = state.challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;

    setState(prev => ({
      ...prev,
      challenges: prev.challenges.map(c =>
        c.id === challengeId ? { ...c, completed: true } : c
      ),
    }));

    await addXP(challenge.xpReward, 'COMPLETE_CHALLENGE');
  }, [state.challenges, addXP]);

  // Refresh challenges
  const refreshChallenges = useCallback(async () => {
    setState(prev => ({
      ...prev,
      challenges: [...generateDailyChallenges(), ...generateWeeklyChallenges()],
    }));
  }, []);

  // Close level up modal
  const closeLevelUp = useCallback(() => {
    setShowLevelUp(false);
    setNewLevel(null);
  }, []);

  // Calculate progress to next level
  const progressToNextLevel = state.level.level < 5
    ? ((state.xp - state.level.minXP) / (state.level.maxXP - state.level.minXP)) * 100
    : 100;

  return {
    ...state,
    isLoading,
    showLevelUp,
    newLevel,
    progressToNextLevel,
    closeLevelUp,
    actions: {
      addXP,
      checkStreak,
      completeChallenge,
      refreshChallenges,
    },
  };
}
