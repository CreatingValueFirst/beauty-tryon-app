'use client';

import { useCallback } from 'react';

interface HapticOptions {
  light?: number;
  medium?: number;
  heavy?: number;
}

const defaultOptions: HapticOptions = {
  light: 10,
  medium: 20,
  heavy: 30,
};

export function useHaptic(options: HapticOptions = defaultOptions) {
  const vibrate = useCallback((intensity: 'light' | 'medium' | 'heavy' | number = 'medium') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const duration = typeof intensity === 'number'
        ? intensity
        : options[intensity] || defaultOptions[intensity] || 20;

      navigator.vibrate(duration);
    }
  }, [options]);

  const pattern = useCallback((pattern: number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const success = useCallback(() => {
    pattern([10, 50, 10]);
  }, [pattern]);

  const error = useCallback(() => {
    pattern([50, 100, 50]);
  }, [pattern]);

  const notification = useCallback(() => {
    pattern([10, 30, 10, 30, 10]);
  }, [pattern]);

  return {
    vibrate,
    pattern,
    success,
    error,
    notification,
    light: () => vibrate('light'),
    medium: () => vibrate('medium'),
    heavy: () => vibrate('heavy'),
  };
}
