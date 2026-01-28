'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles, Heart, Camera } from 'lucide-react';

interface Activity {
  id: string;
  type: 'trying' | 'saved' | 'shared';
  user: string;
  style: string;
  timestamp: Date;
}

const SAMPLE_ACTIVITIES: Activity[] = [
  { id: '1', type: 'trying', user: 'Sarah', style: 'Rose Gold Hair', timestamp: new Date() },
  { id: '2', type: 'saved', user: 'Emma', style: 'French Tips', timestamp: new Date() },
  { id: '3', type: 'shared', user: 'Maria', style: 'Smokey Eye Look', timestamp: new Date() },
  { id: '4', type: 'trying', user: 'Olivia', style: 'Balayage Highlights', timestamp: new Date() },
  { id: '5', type: 'saved', user: 'Sophia', style: 'Glitter Nails', timestamp: new Date() },
  { id: '6', type: 'trying', user: 'Ava', style: 'Bold Red Lip', timestamp: new Date() },
];

const CITIES = ['New York', 'Los Angeles', 'London', 'Paris', 'Tokyo', 'Sydney', 'Miami', 'Toronto'];
const NAMES = ['Sarah', 'Emma', 'Olivia', 'Ava', 'Sophia', 'Mia', 'Luna', 'Lily', 'Zoe', 'Aria'];
const STYLES = [
  'Rose Gold Hair', 'French Tips', 'Beach Waves', 'Glitter Nails', 'Bold Red Lip',
  'Smokey Eye', 'Balayage', 'Ombre Nails', 'Natural Glow', 'Cat Eye Look',
];

export function LiveActivityTicker() {
  const [activeCount, setActiveCount] = useState(234);
  const [currentActivity, setCurrentActivity] = useState<Activity>(SAMPLE_ACTIVITIES[0]);
  const [activityIndex, setActivityIndex] = useState(0);

  // Simulate active user count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCount((prev) => {
        const change = Math.floor(Math.random() * 11) - 5; // -5 to +5
        return Math.max(150, Math.min(350, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Rotate through activities
  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((prev) => {
        const nextIndex = (prev + 1) % SAMPLE_ACTIVITIES.length;
        // Generate a fresh activity with random data
        const types: Array<'trying' | 'saved' | 'shared'> = ['trying', 'saved', 'shared'];
        setCurrentActivity({
          id: String(Date.now()),
          type: types[Math.floor(Math.random() * types.length)],
          user: NAMES[Math.floor(Math.random() * NAMES.length)],
          style: STYLES[Math.floor(Math.random() * STYLES.length)],
          timestamp: new Date(),
        });
        return nextIndex;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trying':
        return <Camera className="w-3 h-3" />;
      case 'saved':
        return <Heart className="w-3 h-3" />;
      case 'shared':
        return <Sparkles className="w-3 h-3" />;
      default:
        return <Sparkles className="w-3 h-3" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'trying':
        return `${activity.user} is trying ${activity.style}`;
      case 'saved':
        return `${activity.user} saved ${activity.style}`;
      case 'shared':
        return `${activity.user} shared ${activity.style}`;
      default:
        return `${activity.user} is exploring`;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 text-white/90">
      {/* Active users count */}
      <motion.div
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative">
          <Users className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
        <motion.span
          key={activeCount}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-bold"
        >
          {activeCount}
        </motion.span>
        <span className="text-sm text-white/70">people trying looks now</span>
      </motion.div>

      {/* Activity feed */}
      <div className="h-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentActivity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm"
          >
            <span className="text-pink-400">{getActivityIcon(currentActivity.type)}</span>
            <span>{getActivityText(currentActivity)}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
