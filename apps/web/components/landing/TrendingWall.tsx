'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Play, TrendingUp, Flame, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface TrendingLook {
  id: string;
  image: string;
  title: string;
  category: 'hair' | 'nails' | 'makeup';
  likes: number;
  creator: string;
  isVideo?: boolean;
  isTrending?: boolean;
}

const TRENDING_LOOKS: TrendingLook[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop',
    title: 'Rose Gold Balayage',
    category: 'hair',
    likes: 2847,
    creator: 'StyleByEmma',
    isTrending: true,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop',
    title: 'Aurora Chrome Nails',
    category: 'nails',
    likes: 1923,
    creator: 'NailArtQueen',
    isVideo: true,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=600&fit=crop',
    title: 'Glowy Dewy Makeup',
    category: 'makeup',
    likes: 3201,
    creator: 'GlamGuru',
    isTrending: true,
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop',
    title: 'Mermaid Waves',
    category: 'hair',
    likes: 1654,
    creator: 'HairMagic',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=500&fit=crop',
    title: 'French Tip Remix',
    category: 'nails',
    likes: 2108,
    creator: 'NailVibes',
    isTrending: true,
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400&h=450&fit=crop',
    title: 'Bold Red Lip',
    category: 'makeup',
    likes: 1876,
    creator: 'MakeupMaven',
    isVideo: true,
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=500&fit=crop',
    title: 'Platinum Pixie',
    category: 'hair',
    likes: 2534,
    creator: 'PixieCuts',
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400&h=400&fit=crop',
    title: 'Holographic Nails',
    category: 'nails',
    likes: 3456,
    creator: 'NailTech',
    isTrending: true,
  },
];

export function TrendingWall() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredLooks = selectedCategory === 'all'
    ? TRENDING_LOOKS
    : TRENDING_LOOKS.filter((look) => look.category === selectedCategory);

  const formatLikes = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getCategoryHref = (category: string) => {
    switch (category) {
      case 'hair':
        return '/dashboard/hair';
      case 'nails':
        return '/dashboard/nails';
      case 'makeup':
        return '/dashboard/makeup';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold mb-4"
          >
            <Flame className="w-4 h-4" />
            Trending Now
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">What&apos;s Hot</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover the most-loved looks from our community
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-2 mb-10">
          {['all', 'hair', 'nails', 'makeup'].map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 max-w-7xl mx-auto">
          {filteredLooks.map((look, index) => (
            <motion.div
              key={look.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="break-inside-avoid mb-4"
            >
              <Link href={getCategoryHref(look.category)}>
                <div className="group relative rounded-2xl overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-shadow">
                  {/* Image */}
                  <img
                    src={look.image}
                    alt={look.title}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-lg mb-1">{look.title}</h3>
                      <p className="text-white/70 text-sm mb-2">by {look.creator}</p>
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <Heart className="w-4 h-4 text-pink-400 fill-current" />
                        {formatLikes(look.likes)}
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {look.isTrending && (
                      <span className="px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Hot
                      </span>
                    )}
                    {look.isVideo && (
                      <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-900 fill-current" />
                      </span>
                    )}
                  </div>

                  {/* Like count (always visible) */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs flex items-center gap-1">
                    <Heart className="w-3 h-3 text-pink-400" />
                    {formatLikes(look.likes)}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Try These Looks
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
