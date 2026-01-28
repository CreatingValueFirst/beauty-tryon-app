'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ARCamera, ARCameraHandle } from '@/components/ar/ARCamera';
import { StyleCarousel, StyleItem } from '@/components/features/hair-tryon/StyleCarousel';
import { ColorPicker, ColorSettings } from '@/components/features/hair-tryon/ColorPicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { processHair, hexToRgb } from '@/lib/ai/hair-processor';
import { Save, Share2, Download, Sparkles, Camera, Palette, Heart, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { uploadBase64Image } from '@/lib/utils/image-upload';
import { useRouter } from 'next/navigation';
import { useModelLoader } from '@/hooks/use-model-loader';

// Professional sample hair styles with real images
const SAMPLE_HAIR_STYLES: StyleItem[] = [
  {
    id: '1',
    name: 'Pixie Cut',
    category: 'short',
    color_base: '#2C1810',
    thumbnail_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=200&h=200&fit=crop',
    is_premium: false
  },
  {
    id: '2',
    name: 'Classic Bob',
    category: 'short',
    color_base: '#4A3728',
    thumbnail_url: 'https://images.unsplash.com/photo-1595475884562-073c30d45670?w=200&h=200&fit=crop',
    is_premium: false
  },
  {
    id: '3',
    name: 'Beach Waves',
    category: 'medium',
    color_base: '#8B6F47',
    thumbnail_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    is_premium: false
  },
  {
    id: '4',
    name: 'Long Layers',
    category: 'long',
    color_base: '#3A2618',
    thumbnail_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop',
    is_premium: false
  },
  {
    id: '5',
    name: 'Mermaid Waves',
    category: 'long',
    color_base: '#D4AF37',
    thumbnail_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop',
    is_premium: true
  },
  {
    id: '6',
    name: 'Platinum Blonde',
    category: 'long',
    color_base: '#F5F5DC',
    thumbnail_url: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=200&h=200&fit=crop',
    is_premium: true
  },
  {
    id: '7',
    name: 'Rose Gold',
    category: 'medium',
    color_base: '#ECC5C0',
    thumbnail_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    is_premium: true
  },
  {
    id: '8',
    name: 'Burgundy Red',
    category: 'medium',
    color_base: '#800020',
    thumbnail_url: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=200&h=200&fit=crop',
    is_premium: true
  },
  {
    id: '9',
    name: 'Tight Curls',
    category: 'curly',
    color_base: '#2C1810',
    thumbnail_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=200&h=200&fit=crop',
    is_premium: false
  },
  {
    id: '10',
    name: 'Afro',
    category: 'curly',
    color_base: '#3E2723',
    thumbnail_url: 'https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?w=200&h=200&fit=crop',
    is_premium: false
  },
];

export default function HairTryOnPage() {
  const router = useRouter();
  const arCameraRef = useRef<ARCameraHandle>(null);

  // ML model loading state
  const modelLoader = useModelLoader({ mode: 'hair', autoLoad: true });

  const [hairStyles, setHairStyles] = useState<StyleItem[]>(SAMPLE_HAIR_STYLES);
  const [filteredStyles, setFilteredStyles] = useState<StyleItem[]>(SAMPLE_HAIR_STYLES);
  const [selectedStyle, setSelectedStyle] = useState<StyleItem>(SAMPLE_HAIR_STYLES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    hex: SAMPLE_HAIR_STYLES[0].color_base || '#8B5CF6',
    opacity: 0.6,
    saturation: 1.0,
    brightness: 1.0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastFrameTime, setLastFrameTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectionStatus, setDetectionStatus] = useState<'detecting' | 'detected' | 'not_detected'>('detecting');
  const lastDetectionRef = useRef<number>(Date.now());

  // Fetch real styles from Supabase
  useEffect(() => {
    async function fetchHairStyles() {
      const supabase = createClient();
      const { data } = await supabase
        .from('hair_styles')
        .select('id, name, category, color_base, thumbnail_url, is_premium')
        .limit(20);

      if (data && data.length > 0) {
        setHairStyles(data);
        setFilteredStyles(data);
        setSelectedStyle(data[0]);
        setColorSettings(prev => ({
          ...prev,
          hex: data[0].color_base || '#8B5CF6'
        }));
      }
      setLoading(false);
    }
    fetchHairStyles();
  }, []);

  // Update color when style changes
  useEffect(() => {
    if (selectedStyle.color_base) {
      setColorSettings((prev) => ({
        ...prev,
        hex: selectedStyle.color_base!,
      }));
    }
  }, [selectedStyle]);

  // Process video frame with hair overlay
  const handleFrame = useCallback(
    (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
      if (isProcessing) return;

      const now = performance.now();
      // Limit to ~30fps for performance
      if (now - lastFrameTime < 33) return;

      setLastFrameTime(now);
      setIsProcessing(true);

      // Apply hair color overlay
      const rgb = hexToRgb(colorSettings.hex);
      processHair(
        video,
        canvas,
        {
          color: rgb,
          opacity: colorSettings.opacity,
          saturation: colorSettings.saturation,
          brightness: colorSettings.brightness,
          blendMode: 'multiply',
        },
        now
      ).then(() => {
        // Face was successfully processed
        lastDetectionRef.current = Date.now();
        setDetectionStatus('detected');
      }).catch(() => {
        // Detection failed - check if it's been too long
        if (Date.now() - lastDetectionRef.current > 3000) {
          setDetectionStatus('not_detected');
        }
      }).finally(() => {
        setIsProcessing(false);
      });
    },
    [colorSettings, lastFrameTime, isProcessing]
  );

  // Update detection status when no face detected for a while
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastDetectionRef.current > 3000) {
        setDetectionStatus('not_detected');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStyleSelect = (style: StyleItem) => {
    setSelectedStyle(style);
  };

  const handleTakePhoto = async () => {
    if (!arCameraRef.current?.isReady()) {
      toast.error('Camera not ready. Please wait.');
      return;
    }

    try {
      const blob = await arCameraRef.current.capturePhoto();
      if (!blob) {
        toast.error('Failed to capture photo. Please try again.');
        return;
      }

      // Convert blob to data URL for preview and saving
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setCapturedImage(imageUrl);
        toast.success('Photo captured successfully!');
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Failed to capture photo:', error);
      toast.error('Failed to capture photo. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!capturedImage) {
      toast.error('Please take a photo first');
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please log in to save your try-on');
        router.push('/login');
        return;
      }

      // Upload image to Supabase Storage instead of storing base64
      const uploadResult = await uploadBase64Image(capturedImage, 'hair');
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }

      const { error } = await supabase.from('try_ons').insert({
        user_id: user.id,
        type: 'hair',
        style_id: selectedStyle?.id,
        result_image_url: uploadResult.url,
        settings: {
          color: colorSettings.hex,
          opacity: colorSettings.opacity,
          saturation: colorSettings.saturation,
          brightness: colorSettings.brightness
        },
        is_favorite: false
      });

      if (error) throw error;
      toast.success('Saved to your gallery!');
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!capturedImage) {
      toast.error('Please take a photo first');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Hair Try-On',
          text: 'Check out my new hairstyle!',
          url: window.location.href
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Link copied to clipboard!');
        }
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleCustomColor = () => {
    toast.info('Use the color picker in the Customize tab');
  };

  const handleViewFavorites = () => {
    router.push('/dashboard/gallery?filter=favorites');
  };

  const handleCompare = () => {
    toast.info('Compare mode coming soon!');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const filtered = hairStyles.filter(s =>
      category === 'All' || s.category?.toLowerCase() === category.toLowerCase()
    );
    setFilteredStyles(filtered);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Hair Try-On</h1>
          <p className="text-gray-600 mt-1">
            Try on different hairstyles and colors in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* AR Camera - Main */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0 relative">
              <ARCamera
                ref={arCameraRef}
                mode="hair"
                onFrame={handleFrame}
                className="w-full"
                modelLoadingStatus={{
                  status: modelLoader.status,
                  progress: modelLoader.progress,
                  currentModel: modelLoader.currentModel,
                  error: modelLoader.error,
                }}
              />

              {/* Detection Status Overlay */}
              {detectionStatus === 'not_detected' && (
                <div className="absolute inset-x-0 top-4 flex justify-center pointer-events-none">
                  <div className="bg-yellow-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    No face detected - Please face the camera
                  </div>
                </div>
              )}

              {detectionStatus === 'detected' && (
                <div className="absolute top-4 right-4 pointer-events-none">
                  <div className="bg-green-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full" />
                    Face detected
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Style Selection Carousel */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-purple" />
                Choose a Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StyleCarousel
                styles={filteredStyles}
                selectedId={selectedStyle.id}
                onSelect={handleStyleSelect}
              />
              {!loading && filteredStyles.length > 0 && (
                <p className="text-xs text-center text-gray-500 mt-3">
                  {filteredStyles.length} {selectedCategory !== 'All' && selectedCategory.toLowerCase()} styles available
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Customize</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="color" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="color">Color</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>

                <TabsContent value="color" className="mt-4">
                  <ColorPicker value={colorSettings} onChange={setColorSettings} />
                </TabsContent>

                <TabsContent value="info" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {selectedStyle.name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        Category: {selectedStyle.category}
                      </p>
                      {selectedStyle.is_premium && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                          <Sparkles className="w-3 h-3" />
                          Premium Style
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Tips:</h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Ensure good lighting for best results</li>
                        <li>• Face the camera directly</li>
                        <li>• Adjust opacity for natural look</li>
                        <li>• Try different colors to find your perfect match</li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleSave}
                        disabled={saving || !capturedImage}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save This Look'}
                      </Button>
                      {!capturedImage && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Take a photo first to save
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={handleTakePhoto}
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={handleCustomColor}
              >
                <Palette className="w-4 h-4 mr-2" />
                Custom Color
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={handleViewFavorites}
              >
                <Heart className="w-4 h-4 mr-2" />
                View Favorites
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={handleCompare}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Compare Styles
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filter by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Browse by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['All', 'Short', 'Medium', 'Long', 'Curly', 'Straight', 'Wavy', 'Premium'].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
