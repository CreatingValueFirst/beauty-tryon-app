'use client';

import { useState } from 'react';
import { MakeupTryOnStudio } from '@/components/makeup/MakeupTryOnStudio';
import { MakeupConfig } from '@/lib/api/makeup-client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function MakeupDashboard() {
  const { toast } = useToast();

  const handleSave = async (imageData: string, config: MakeupConfig) => {
    // TODO: Integrate with Supabase to save to user's gallery
    // For now, just show a success message
    console.log('Saving makeup result:', { imageData: imageData.substring(0, 50) + '...', config });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    toast({
      title: 'Saved!',
      description: 'Your makeup look has been saved to your gallery',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-pink-50/50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="gradient-brand bg-clip-text text-transparent">Makeup Try-On</span>
              </h1>
              <p className="text-muted-foreground">
                Try on different makeup looks virtually using AI-powered technology
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <MakeupTryOnStudio onSave={handleSave} />

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border">
            <div className="text-3xl mb-3">💄</div>
            <h3 className="font-semibold mb-2">Realistic Results</h3>
            <p className="text-sm text-muted-foreground">
              Advanced AI technology provides natural-looking makeup application
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2">Fast Processing</h3>
            <p className="text-sm text-muted-foreground">
              Get your results in just 2-5 seconds with our optimized processing
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-semibold mb-2">Customizable</h3>
            <p className="text-sm text-muted-foreground">
              Choose from multiple colors and adjust intensity for your perfect look
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-12 bg-white rounded-lg p-8 border">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold text-xl flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h3 className="font-medium mb-2">Upload Photo</h3>
              <p className="text-sm text-muted-foreground">
                Choose a clear, well-lit photo of your face
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold text-xl flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h3 className="font-medium mb-2">Customize</h3>
              <p className="text-sm text-muted-foreground">
                Select your preferred colors and intensity
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold text-xl flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h3 className="font-medium mb-2">Apply Makeup</h3>
              <p className="text-sm text-muted-foreground">
                Our AI applies makeup in 2-5 seconds
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold text-xl flex items-center justify-center mx-auto mb-3">
                4
              </div>
              <h3 className="font-medium mb-2">Save & Share</h3>
              <p className="text-sm text-muted-foreground">
                Download your look or share with friends
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8 border border-purple-200">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What type of photos work best?</h3>
              <p className="text-sm text-muted-foreground">
                Use clear, well-lit photos with your face visible from the front. Avoid heavily filtered
                or edited images for best results.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How long does processing take?</h3>
              <p className="text-sm text-muted-foreground">
                Most images are processed in 2-5 seconds, depending on image size and server load.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I try multiple looks?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! Adjust the settings and apply makeup as many times as you want to find your perfect
                look.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Is my photo saved?</h3>
              <p className="text-sm text-muted-foreground">
                Your photos are only saved if you explicitly choose to save them to your gallery. We
                respect your privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
