'use client';

/**
 * Clothing Virtual Try-On Page
 * Mobile-optimized page for virtual clothing try-on
 */

import { VirtualTryOnStudio } from '@/components/features/virtual-tryon/VirtualTryOnStudio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, Users, Zap } from 'lucide-react';

export default function ClothingTryOnPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Virtual Clothing Try-On
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
          See how clothes look on you instantly with AI-powered virtual try-on
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-xl md:text-2xl font-bold">AI-Powered</p>
            <p className="text-xs text-muted-foreground">Advanced Technology</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-xl md:text-2xl font-bold">30s</p>
            <p className="text-xs text-muted-foreground">Average Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-xl md:text-2xl font-bold">1M+</p>
            <p className="text-xs text-muted-foreground">Try-Ons Created</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-xl md:text-2xl font-bold">98%</p>
            <p className="text-xs text-muted-foreground">Satisfaction Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Try-On Studio */}
      <VirtualTryOnStudio />

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>Why Use Virtual Try-On?</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Shop with Confidence
            </h3>
            <p className="text-sm text-muted-foreground">
              See exactly how clothes will look on you before making a purchase. No more returns!
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Save Time & Money
            </h3>
            <p className="text-sm text-muted-foreground">
              Try on hundreds of outfits in minutes without visiting a store. Fast and convenient.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Share with Friends
            </h3>
            <p className="text-sm text-muted-foreground">
              Get opinions from friends and family before buying. Share your try-ons instantly.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Discover Your Style
            </h3>
            <p className="text-sm text-muted-foreground">
              Experiment with different styles and find what works best for you.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto font-bold text-xl">
                1
              </div>
              <h3 className="font-semibold">Upload Your Photo</h3>
              <p className="text-sm text-muted-foreground">
                Take a photo or upload a full-body image with good lighting
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto font-bold text-xl">
                2
              </div>
              <h3 className="font-semibold">Choose Clothing</h3>
              <p className="text-sm text-muted-foreground">
                Select or upload the clothing item you want to try on
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto font-bold text-xl">
                3
              </div>
              <h3 className="font-semibold">See the Magic</h3>
              <p className="text-sm text-muted-foreground">
                AI instantly generates a realistic image of you wearing the outfit
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
