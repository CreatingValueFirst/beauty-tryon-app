'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Sparkles, TrendingUp, Star } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-brand rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to BeautyTryOn!</h1>
            <p className="text-white/90 text-lg">
              Discover your perfect look with AI-powered virtual try-on
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <Sparkles className="w-16 h-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Try-On Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Hair Try-On Card */}
        <Card className="border-2 hover:border-brand-purple transition-colors cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <Link href="/dashboard/hair">
                <Button className="gap-2">
                  <Camera className="w-4 h-4" />
                  Try Now
                </Button>
              </Link>
            </div>
            <CardTitle className="text-2xl">Hair Styles</CardTitle>
            <CardDescription className="text-base">
              Try on thousands of hairstyles, colors, and textures instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 text-brand-purple" />
                <span>500+ Professional Styles</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="w-4 h-4 text-brand-purple" />
                <span>Real-time Color Adjustment</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-brand-purple" />
                <span>AI-Powered Matching</span>
              </div>
            </div>

            {/* Popular Styles Preview */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Popular Now:</p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nail Try-On Card */}
        <Card className="border-2 hover:border-brand-pink transition-colors cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <Link href="/dashboard/nails">
                <Button className="gap-2">
                  <Camera className="w-4 h-4" />
                  Try Now
                </Button>
              </Link>
            </div>
            <CardTitle className="text-2xl">Nail Designs</CardTitle>
            <CardDescription className="text-base">
              Experiment with nail polishes, patterns, and art designs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 text-brand-pink" />
                <span>300+ Nail Designs</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="w-4 h-4 text-brand-pink" />
                <span>Custom Color Picker</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-brand-pink" />
                <span>AR Hand Tracking</span>
              </div>
            </div>

            {/* Popular Colors Preview */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Trending Colors:</p>
              <div className="flex gap-2">
                {['#DC143C', '#FFB6C1', '#E8D4C1', '#000000', '#FFD700', '#E0BFB8', '#C0C0C0', '#FF6B6B'].map((color) => (
                  <div
                    key={color}
                    className="w-8 h-8 rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-purple">800+</p>
              <p className="text-sm text-gray-600 mt-1">Total Styles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-pink">0</p>
              <p className="text-sm text-gray-600 mt-1">Try-Ons</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-purple">0</p>
              <p className="text-sm text-gray-600 mt-1">Favorites</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-pink">Free</p>
              <p className="text-sm text-gray-600 mt-1">Plan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Get started in 3 simple steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-brand text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-1">Choose a Style</h3>
              <p className="text-sm text-gray-600">
                Browse our extensive library of hair and nail styles
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-brand text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-1">Try It On</h3>
              <p className="text-sm text-gray-600">
                Use your camera to see the style on yourself in real-time
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-brand text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-1">Save & Share</h3>
              <p className="text-sm text-gray-600">
                Save your favorites and share with friends or your stylist
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
