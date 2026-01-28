'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Sparkles, TrendingUp, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { XPSystem, StreakTracker, ChallengeCenter } from '@/components/gamification';

interface HairStyle {
  id: string;
  name: string;
  thumbnail_url: string | null;
  color_base: string;
}

interface NailStyle {
  id: string;
  name: string;
  color_code: string;
  thumbnail_url: string | null;
}

export default function DashboardPage() {
  const [popularHairStyles, setPopularHairStyles] = useState<HairStyle[]>([]);
  const [popularNailColors, setPopularNailColors] = useState<NailStyle[]>([]);
  const [totalStyles, setTotalStyles] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopularStyles() {
      const supabase = createClient();

      try {
        // Fetch 4 popular hair styles
        const { data: hairData } = await supabase
          .from('hair_styles')
          .select('id, name, thumbnail_url, color_base')
          .limit(4);

        // Fetch 8 popular nail colors
        const { data: nailData } = await supabase
          .from('nail_styles')
          .select('id, name, color_code, thumbnail_url')
          .eq('category', 'solid')
          .limit(8);

        // Get total count
        const { count: hairCount } = await supabase
          .from('hair_styles')
          .select('*', { count: 'exact', head: true });

        const { count: nailCount } = await supabase
          .from('nail_styles')
          .select('*', { count: 'exact', head: true });

        if (hairData) setPopularHairStyles(hairData);
        if (nailData) setPopularNailColors(nailData);
        setTotalStyles((hairCount || 0) + (nailCount || 0));
      } catch (error) {
        console.error('Error fetching popular styles:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPopularStyles();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-mesh rounded-3xl p-10 text-white shadow-extra">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

        <div className="relative flex items-center justify-between">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-3 animate-slide-up">
              Welcome to BeautyTryOn!
            </h1>
            <p className="text-white/90 text-xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Discover your perfect look with AI-powered virtual try-on
            </p>
          </div>
          <div className="hidden md:block animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card border-white/30 rounded-2xl p-6 shadow-glass hover-lift">
              <Sparkles className="w-20 h-20 animate-float" />
            </div>
          </div>
        </div>
      </div>

      {/* Gamification Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <XPSystem variant="compact" className="animate-slide-up" />
        <StreakTracker variant="compact" className="animate-slide-up" />
        <ChallengeCenter variant="widget" className="animate-slide-up" />
      </div>

      {/* Main Try-On Options */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Hair Try-On Card */}
        <Card variant="interactive" className="animate-slide-up bg-pattern-dots" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-brand">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <Link href="/dashboard/hair">
                <Button variant="gradient" size="lg" className="gap-2">
                  <Camera className="w-5 h-5" />
                  Try Now
                </Button>
              </Link>
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hair Styles
            </CardTitle>
            <CardDescription className="text-lg">
              Try on thousands of hairstyles, colors, and textures instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-base text-gray-700 hover-lift inline-flex">
                <div className="p-2 rounded-xl bg-purple-100">
                  <TrendingUp className="w-5 h-5 text-brand-purple" />
                </div>
                <span className="font-medium">500+ Professional Styles</span>
              </div>
              <div className="flex items-center gap-3 text-base text-gray-700 hover-lift inline-flex">
                <div className="p-2 rounded-xl bg-pink-100">
                  <Star className="w-5 h-5 text-brand-pink" />
                </div>
                <span className="font-medium">Real-time Color Adjustment</span>
              </div>
              <div className="flex items-center gap-3 text-base text-gray-700 hover-lift inline-flex">
                <div className="p-2 rounded-xl bg-purple-100">
                  <Sparkles className="w-5 h-5 text-brand-purple" />
                </div>
                <span className="font-medium">AI-Powered Matching</span>
              </div>
            </div>

            {/* Popular Styles Preview */}
            <div className="mt-8">
              <p className="text-base font-semibold text-gray-800 mb-4">Popular Now:</p>
              <div className="grid grid-cols-4 gap-3">
                {loading ? (
                  [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 animate-pulse"
                    />
                  ))
                ) : (
                  popularHairStyles.map((style) => (
                    <div
                      key={style.id}
                      className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 hover-lift cursor-pointer shadow-medium hover:shadow-brand"
                      title={style.name}
                    >
                      {style.thumbnail_url ? (
                        <Image
                          src={style.thumbnail_url}
                          alt={style.name}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{
                            background: `linear-gradient(135deg, ${style.color_base}dd 0%, ${style.color_base}88 100%)`
                          }}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nail Try-On Card */}
        <Card variant="interactive" className="animate-slide-up bg-pattern-dots" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-brand">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <Link href="/dashboard/nails">
                <Button variant="gradient" size="lg" className="gap-2">
                  <Camera className="w-5 h-5" />
                  Try Now
                </Button>
              </Link>
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Nail Designs
            </CardTitle>
            <CardDescription className="text-lg">
              Experiment with nail polishes, patterns, and art designs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-base text-gray-700 hover-lift inline-flex">
                <div className="p-2 rounded-xl bg-pink-100">
                  <TrendingUp className="w-5 h-5 text-brand-pink" />
                </div>
                <span className="font-medium">300+ Nail Designs</span>
              </div>
              <div className="flex items-center gap-3 text-base text-gray-700 hover-lift inline-flex">
                <div className="p-2 rounded-xl bg-purple-100">
                  <Star className="w-5 h-5 text-brand-purple" />
                </div>
                <span className="font-medium">Custom Color Picker</span>
              </div>
              <div className="flex items-center gap-3 text-base text-gray-700 hover-lift inline-flex">
                <div className="p-2 rounded-xl bg-pink-100">
                  <Sparkles className="w-5 h-5 text-brand-pink" />
                </div>
                <span className="font-medium">AR Hand Tracking</span>
              </div>
            </div>

            {/* Popular Colors Preview */}
            <div className="mt-8">
              <p className="text-base font-semibold text-gray-800 mb-4">Trending Colors:</p>
              <div className="flex gap-3">
                {loading ? (
                  [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shadow-medium"
                    />
                  ))
                ) : (
                  popularNailColors.map((style) => (
                    <div
                      key={style.id}
                      className="w-10 h-10 rounded-full shadow-medium hover-lift cursor-pointer border-2 border-white ring-2 ring-gray-100"
                      style={{ backgroundColor: style.color_code }}
                      title={style.name}
                    />
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card variant="glass" className="animate-slide-up hover-lift" style={{ animationDelay: '0.5s' }}>
          <CardContent className="pt-8">
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {loading ? '...' : `${totalStyles}+`}
              </p>
              <p className="text-sm font-medium text-gray-600 mt-2">Total Styles</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="animate-slide-up hover-lift" style={{ animationDelay: '0.6s' }}>
          <CardContent className="pt-8">
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">0</p>
              <p className="text-sm font-medium text-gray-600 mt-2">Try-Ons</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="animate-slide-up hover-lift" style={{ animationDelay: '0.7s' }}>
          <CardContent className="pt-8">
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">0</p>
              <p className="text-sm font-medium text-gray-600 mt-2">Favorites</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="gradient" className="animate-slide-up hover-lift" style={{ animationDelay: '0.8s' }}>
          <CardContent className="pt-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-white drop-shadow-lg">Free</p>
              <p className="text-sm font-medium text-white/90 mt-2">Plan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card variant="elevated" className="animate-slide-up relative overflow-hidden" style={{ animationDelay: '0.9s' }}>
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-pattern-grid opacity-5" />

        <CardHeader className="relative">
          <CardTitle className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            How It Works
          </CardTitle>
          <CardDescription className="text-lg">
            Get started in 3 simple steps
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-brand group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Choose a Style</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Browse our extensive library of hair and nail styles
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-brand group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Try It On</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Use your camera to see the style on yourself in real-time
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-brand group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Save & Share</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Save your favorites and share with friends or your stylist
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
