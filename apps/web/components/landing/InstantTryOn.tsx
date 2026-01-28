'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Sparkles, ArrowRight, X, Zap } from 'lucide-react';
import Link from 'next/link';

const QUICK_STYLES = [
  { id: 'hair-1', name: 'Rose Gold', category: 'hair', color: '#B76E79' },
  { id: 'hair-2', name: 'Platinum', category: 'hair', color: '#E5E4E2' },
  { id: 'hair-3', name: 'Burgundy', category: 'hair', color: '#800020' },
  { id: 'nails-1', name: 'Hot Pink', category: 'nails', color: '#FF69B4' },
  { id: 'nails-2', name: 'Classic Red', category: 'nails', color: '#DC143C' },
  { id: 'nails-3', name: 'Midnight', category: 'nails', color: '#191970' },
];

export function InstantTryOn() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'hair' | 'nails'>('hair');

  return (
    <>
      {/* Compact CTA Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="glass-card rounded-2xl p-6 border border-white/20 relative">
          {/* Animated background gradient */}
          <div className="absolute inset-0 opacity-10">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
              animate={{
                x: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>

          <div className="relative flex flex-col md:flex-row items-center gap-6">
            {/* Icon */}
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
              >
                <span className="text-xs font-bold text-white">!</span>
              </motion.div>
            </div>

            {/* Text */}
            <div className="text-center md:text-left flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Try It Right Now!
              </h3>
              <p className="text-gray-600 text-sm">
                No signup needed. Just tap and see yourself in a new look.
              </p>
            </div>

            {/* Quick Try Buttons */}
            <div className="flex gap-2">
              <Link href="/dashboard/hair">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Try Hair
                </motion.button>
              </Link>
              <Link href="/dashboard/nails">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-full bg-white border-2 border-purple-500 text-purple-600 font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  Try Nails
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Quick style preview */}
          <div className="mt-6 pt-6 border-t border-gray-200/50">
            <p className="text-xs text-gray-500 mb-3 text-center">Popular colors to try:</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {QUICK_STYLES.map((style) => (
                <Link
                  key={style.id}
                  href={`/dashboard/${style.category}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 rounded-full shadow-md ring-2 ring-white"
                      style={{ backgroundColor: style.color }}
                    />
                    <span className="text-xs text-gray-600 font-medium">{style.name}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
