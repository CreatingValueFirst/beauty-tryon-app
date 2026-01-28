'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Footer } from '@/components/layout/Footer';
import { HeroVideoLoop } from '@/components/landing/HeroVideoLoop';
import { LiveActivityTicker } from '@/components/landing/LiveActivityTicker';
import { TrendingWall } from '@/components/landing/TrendingWall';
import { InstantTryOn } from '@/components/landing/InstantTryOn';
import { Sparkles, Store, Calendar, TrendingUp, Star, Zap, Heart, Shield, Camera, Play, ArrowRight, Flame } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* NEW VIRAL HERO - Full screen with video background */}
      <section className="relative min-h-screen flex flex-col">
        {/* Video/Animated Background */}
        <HeroVideoLoop className="absolute inset-0" />

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Top Bar - Activity Ticker */}
          <div className="py-4 px-4">
            <div className="container mx-auto flex justify-center">
              <LiveActivityTicker />
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="text-center max-w-4xl mx-auto">
              {/* Trending Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6"
              >
                <Flame className="w-4 h-4 text-orange-400" />
                <span>#1 Virtual Try-On App</span>
                <span className="ml-2 px-2 py-0.5 bg-green-400 text-black text-xs rounded-full font-bold">NEW</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
              >
                Try Before You
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
                  Transform
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto"
              >
                See yourself in stunning hair colors, nail designs & makeup looks using AI-powered AR
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              >
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-8 py-4 rounded-full bg-white text-gray-900 font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Start Trying Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <Link href="/stores">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm text-white font-bold text-lg border border-white/30 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </motion.button>
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-6 text-white/70 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span>50k+ Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>100% Free</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1, y: { duration: 1.5, repeat: Infinity } }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-white/60 rounded-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Instant Try-On Section */}
      <section className="py-12 bg-gradient-to-b from-purple-900/20 to-white">
        <div className="container mx-auto px-4">
          <InstantTryOn />
        </div>
      </section>

      {/* Trending Wall - UGC */}
      <TrendingWall />

      {/* Features Section - Modernized */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="text-gradient">Why Everyone&apos;s Obsessed</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The most viral beauty tech that&apos;s taking over your FYP
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group"
            >
              <div className="liquid-glass p-8 rounded-3xl h-full hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Real-Time AR</h3>
                <p className="text-gray-600 leading-relaxed">
                  See changes instantly on your camera. No waiting, no uploads. Just pure magic.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group"
            >
              <div className="liquid-glass p-8 rounded-3xl h-full hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Viral Looks</h3>
                <p className="text-gray-600 leading-relaxed">
                  Trending styles updated daily. Be the first to try the looks going viral on TikTok.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group"
            >
              <div className="liquid-glass p-8 rounded-3xl h-full hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">One-Tap Share</h3>
                <p className="text-gray-600 leading-relaxed">
                  Share your looks to Instagram, TikTok, or save to your camera roll instantly.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                'radial-gradient(circle at 0% 0%, white 0%, transparent 50%)',
                'radial-gradient(circle at 100% 100%, white 0%, transparent 50%)',
                'radial-gradient(circle at 0% 0%, white 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { value: '500+', label: 'Partner Salons', icon: Store },
              { value: '50k+', label: 'Happy Users', icon: Heart },
              { value: '1M+', label: 'Try-Ons Done', icon: Camera },
              { value: '4.9', label: 'App Rating', icon: Star },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Modern */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Super Simple</span>
            </h2>
            <p className="text-xl text-gray-600">Three taps to your new look</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Open Camera', desc: 'Tap to activate AR camera', icon: Camera },
                { step: '2', title: 'Pick a Style', desc: 'Swipe through trending looks', icon: Sparkles },
                { step: '3', title: 'Share It', desc: 'Post to your socials', icon: Heart },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative"
                >
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {item.step}
                      </div>
                      {i < 2 && (
                        <div className="hidden md:block absolute top-1/2 -right-16 w-12 h-0.5 bg-gradient-to-r from-purple-300 to-pink-300" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Ready to Glow Up?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join 50k+ users who found their signature look. Your transformation starts now.
            </p>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 rounded-full bg-white text-gray-900 font-bold text-xl shadow-2xl hover:shadow-3xl transition-all inline-flex items-center gap-3"
              >
                <Sparkles className="w-6 h-6" />
                Start Your Glow Up
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
