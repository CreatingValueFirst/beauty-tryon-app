'use client';

import { useState } from 'react';
import { MakeupTryOnStudio } from '@/components/makeup/MakeupTryOnStudio';
import { MakeupConfig } from '@/lib/api/makeup-client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { uploadBase64Image } from '@/lib/utils/image-upload';

export function MakeupDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (imageData: string, config: MakeupConfig) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        toast({
          title: 'Please log in',
          description: 'You need to be logged in to save your makeup look',
          variant: 'destructive',
        });
        router.push('/login');
        return;
      }

      // Upload image to Supabase Storage instead of storing base64
      const uploadResult = await uploadBase64Image(imageData, 'makeup');
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }

      // Save to try_ons table - use only fields from MakeupConfig interface
      const { error: saveError } = await supabase
        .from('try_ons')
        .insert({
          user_id: user.id,
          type: 'makeup',
          result_image_url: uploadResult.url,
          settings: {
            apply_lipstick: config.apply_lipstick,
            lipstick_color: config.lipstick_color,
            apply_blush: config.apply_blush,
            blush_color: config.blush_color,
            blush_intensity: config.blush_intensity,
            apply_foundation: config.apply_foundation,
            foundation_preset: config.foundation_preset,
          },
          is_favorite: false,
        });

      if (saveError) {
        throw saveError;
      }

      toast({
        title: 'Saved!',
        description: 'Your makeup look has been saved to your gallery',
      });
    } catch (error) {
      console.error('Failed to save makeup:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save your makeup look. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh animate-fade-in">
      {/* Decorative gradient orbs */}
      <div className="fixed top-20 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />

      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <Link href="/dashboard">
            <Button variant="glass" className="mb-6 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="glass-card rounded-3xl p-10 shadow-extra border-white/30">
            <div className="flex items-center justify-between">
              <div className="max-w-2xl">
                <h1 className="text-5xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Makeup Try-On
                  </span>
                </h1>
                <p className="text-gray-700 text-xl leading-relaxed">
                  Try on different makeup looks virtually using AI-powered technology
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="text-6xl animate-float">💄</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <MakeupTryOnStudio onSave={handleSave} />
        </div>

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl p-8 shadow-glass hover-lift border-white/30 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-brand text-3xl animate-float">
              💄
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Realistic Results</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Advanced AI technology provides natural-looking makeup application
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 shadow-glass hover-lift border-white/30 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-brand text-3xl animate-float" style={{ animationDelay: '0.5s' }}>
              ⚡
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Fast Processing</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Get your results in just 2-5 seconds with our optimized processing
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 shadow-glass hover-lift border-white/30 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-brand text-3xl animate-float" style={{ animationDelay: '1s' }}>
              🎨
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Customizable</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Choose from multiple colors and adjust intensity for your perfect look
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 relative animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="glass-card rounded-3xl p-12 shadow-extra border-white/30 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-pattern-dots opacity-5" />

            <div className="relative">
              <h2 className="text-4xl font-bold mb-10 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                How It Works
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-brand group-hover:scale-110 transition-transform">
                    1
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-gray-900">Upload Photo</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Choose a clear, well-lit photo of your face
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-brand group-hover:scale-110 transition-transform">
                    2
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-gray-900">Customize</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Select your preferred colors and intensity
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-brand group-hover:scale-110 transition-transform">
                    3
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-gray-900">Apply Makeup</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Our AI applies makeup in 2-5 seconds
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-brand group-hover:scale-110 transition-transform">
                    4
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-gray-900">Save & Share</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Download your look or share with friends
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 mb-12 relative animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="glass-card rounded-3xl p-10 shadow-extra border-purple-200/30 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                <div className="glass-card rounded-xl p-6 shadow-medium hover-lift border-white/40">
                  <h3 className="font-bold text-lg mb-3 text-gray-900">What type of photos work best?</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Use clear, well-lit photos with your face visible from the front. Avoid heavily filtered
                    or edited images for best results.
                  </p>
                </div>

                <div className="glass-card rounded-xl p-6 shadow-medium hover-lift border-white/40">
                  <h3 className="font-bold text-lg mb-3 text-gray-900">How long does processing take?</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Most images are processed in 2-5 seconds, depending on image size and server load.
                  </p>
                </div>

                <div className="glass-card rounded-xl p-6 shadow-medium hover-lift border-white/40">
                  <h3 className="font-bold text-lg mb-3 text-gray-900">Can I try multiple looks?</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Yes! Adjust the settings and apply makeup as many times as you want to find your perfect
                    look.
                  </p>
                </div>

                <div className="glass-card rounded-xl p-6 shadow-medium hover-lift border-white/40">
                  <h3 className="font-bold text-lg mb-3 text-gray-900">Is my photo saved?</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Your photos are only saved if you explicitly choose to save them to your gallery. We
                    respect your privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
