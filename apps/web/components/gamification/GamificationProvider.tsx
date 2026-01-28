'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useGamification } from '@/hooks/use-gamification';
import { LevelUpModal } from './LevelUpModal';

// Create context type
type GamificationContextType = ReturnType<typeof useGamification>;

const GamificationContext = createContext<GamificationContextType | null>(null);

interface GamificationProviderProps {
  children: ReactNode;
}

export function GamificationProvider({ children }: GamificationProviderProps) {
  const gamification = useGamification();

  return (
    <GamificationContext.Provider value={gamification}>
      {children}
      <LevelUpModal
        isOpen={gamification.showLevelUp}
        newLevel={gamification.newLevel}
        onClose={gamification.closeLevelUp}
      />
    </GamificationContext.Provider>
  );
}

export function useGamificationContext() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamificationContext must be used within a GamificationProvider');
  }
  return context;
}
