'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ARCamera, ARCameraHandle } from '@/components/ar/ARCamera';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { processNails, hexToRgbNail, NAIL_PRESETS, NailSettings } from '@/lib/ai/nail-processor';
import { Save, Share2, Download, Sparkles, Camera, Heart, Palette, Star, Sparkle, Blend } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { uploadBase64Image } from '@/lib/utils/image-upload';
import { useRouter } from 'next/navigation';
import { NailsGenerator } from '@/components/features/ai-generation/NailsGenerator';
import { useModelLoader } from '@/hooks/use-model-loader';

const PATTERNS = [
  { value: 'solid', label: 'Solid', icon: Palette },
  { value: 'french', label: 'French', icon: Star },
  { value: 'glitter', label: 'Glitter', icon: Sparkles },
  { value: 'ombre', label: 'Ombré', icon: Blend },
] as const;

// Professional nail color samples
const SAMPLE_NAIL_COLORS = [
  { id: '1', name: 'Classic Red', color_code: '#DC143C', category: 'solid' },
  { id: '2', name: 'Nude Pink', color_code: '#FFB6C1', category: 'solid' },
  { id: '3', name: 'Midnight Black', color_code: '#000000', category: 'solid' },
  { id: '4', name: 'Coral Crush', color_code: '#FF6B6B', category: 'solid' },
  { id: '5', name: 'Lavender Dreams', color_code: '#E6E6FA', category: 'solid' },
  { id: '6', name: 'Rose Gold', color_code: '#B76E79', category: 'solid' },
  { id: '7', name: 'Navy Blue', color_code: '#000080', category: 'solid' },
  { id: '8', name: 'Burgundy Wine', color_code: '#800020', category: 'solid' },
  { id: '9', name: 'Mint Fresh', color_code: '#98FF98', category: 'solid' },
  { id: '10', name: 'Pearl White', color_code: '#FFFFFF', category: 'solid' },
];

export default function NailTryOnPage() {
  const router = useRouter();
  const arCameraRef = useRef<ARCameraHandle>(null);

  // ML model loading state
  const modelLoader = useModelLoader({ mode: 'nails', autoLoad: true });

  const [nailColors, setNailColors] = useState(SAMPLE_NAIL_COLORS);
  const [selectedColor, setSelectedColor] = useState('#DC143C');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [settings, setSettings] = useState<NailSettings>({
    color: hexToRgbNail('#DC143C'),
    opacity: 0.85,
    glossiness: 0.7,
    pattern: 'solid',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastFrameTime, setLastFrameTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectionStatus, setDetectionStatus] = useState<'detecting' | 'detected' | 'not_detected'>('detecting');
  const lastDetectionRef = useRef<number>(Date.now());

  // Fetch real nail styles from Supabase
  useEffect(() => {
    async function fetchNailStyles() {
      const supabase = createClient();
      const { data } = await supabase
        .from('nail_styles')
        .select('id, name, color_code, category')
        .eq('category', 'solid')
        .limit(20);

      if (data && data.length > 0) {
        setNailColors(data);
      }
      setLoading(false);
    }
    fetchNailStyles();
  }, []);

  // Process video frame with nail overlay
  const handleFrame = useCallback(
    (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
      if (isProcessing) return;

      const now = performance.now();
      // Limit to ~30fps for performance
      if (now - lastFrameTime < 33) return;

      setLastFrameTime(now);
      setIsProcessing(true);

      // Apply nail overlay
      processNails(video, canvas, settings, now)
        .then(() => {
          // Hands were detected and processed
          lastDetectionRef.current = Date.now();
          setDetectionStatus('detected');
        })
        .catch(() => {
          // Detection failed - check if it's been too long
          if (Date.now() - lastDetectionRef.current > 3000) {
            setDetectionStatus('not_detected');
          }
        })
        .finally(() => {
          setIsProcessing(false);
        });
    },
    [settings, lastFrameTime, isProcessing]
  );

  // Update detection status when no hands detected for a while
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastDetectionRef.current > 3000) {
        setDetectionStatus('not_detected');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleColorSelect = (hex: string) => {
    setSelectedColor(hex);
    setSettings((prev) => ({
      ...prev,
      color: hexToRgbNail(hex),
    }));
  };

  const handleOpacityChange = (values: number[]) => {
    setSettings((prev) => ({
      ...prev,
      opacity: values[0] / 100,
    }));
  };

  const handleGlossinessChange = (values: number[]) => {
    setSettings((prev) => ({
      ...prev,
      glossiness: values[0] / 100,
    }));
  };

  const handlePatternChange = (pattern: typeof settings.pattern) => {
    setSettings((prev) => ({
      ...prev,
      pattern,
    }));
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

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please log in to save your try-on');
        router.push('/login');
        return;
      }

      // Upload image to Supabase Storage instead of storing base64
      const uploadResult = await uploadBase64Image(capturedImage, 'nails');
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }

      // Save to try_ons table
      const { error } = await supabase
        .from('try_ons')
        .insert({
          user_id: user.id,
          type: 'nails',
          result_image_url: uploadResult.url,
          settings: {
            color: selectedColor,
            opacity: settings.opacity,
            glossiness: settings.glossiness,
            pattern: settings.pattern,
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

    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Nail Try-On',
          text: `Check out my ${selectedColor} nail design!`,
          url: window.location.href
        });
        toast.success('Shared successfully!');
      } catch (err) {
        // User cancelled or share failed
        if (err instanceof Error && err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleAddToFavorites = async () => {
    if (!capturedImage) {
      toast.error('Please take a photo first');
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please log in to save favorites');
        router.push('/login');
        return;
      }

      // Upload image to Supabase Storage instead of storing base64
      const uploadResult = await uploadBase64Image(capturedImage, 'nails');
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }

      const { error } = await supabase
        .from('try_ons')
        .insert({
          user_id: user.id,
          type: 'nails',
          result_image_url: uploadResult.url,
          settings: {
            color: selectedColor,
            opacity: settings.opacity,
            glossiness: settings.glossiness,
            pattern: settings.pattern,
          },
          is_favorite: true
        });

      if (error) throw error;

      toast.success('Added to favorites!');
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      toast.error('Failed to add to favorites');
    }
  };

  const handleCollectionSelect = (collection: string) => {
    if (selectedCollection === collection) {
      // Deselect if clicking the same collection
      setSelectedCollection(null);
      setNailColors(SAMPLE_NAIL_COLORS);
      toast.info('Showing all colors');
      return;
    }

    setSelectedCollection(collection);

    // Filter nail colors based on collection theme
    const collectionColorMap: Record<string, string[]> = {
      'Romantic': ['#DC143C', '#FFB6C1', '#FF69B4', '#E6E6FA', '#B76E79'],
      'Glam': ['#B76E79', '#FFD700', '#C0C0C0', '#000000', '#800020'],
      'Autumn': ['#800020', '#8B4513', '#D2691E', '#CD853F', '#DEB887'],
      'Winter': ['#000080', '#4169E1', '#87CEEB', '#FFFFFF', '#C0C0C0'],
      'Spring': ['#98FF98', '#FFB6C1', '#E6E6FA', '#FFFACD', '#FF69B4'],
      'Summer': ['#FF6B6B', '#FF69B4', '#00CED1', '#FFD700', '#FF4500'],
      'Halloween': ['#000000', '#FF6600', '#800080', '#8B0000', '#2F4F4F'],
      'Holiday': ['#DC143C', '#228B22', '#FFD700', '#C0C0C0', '#FFFFFF'],
    };

    const collectionColors = collectionColorMap[collection] || [];

    if (collectionColors.length > 0) {
      // Create filtered color set based on collection theme
      const filteredColors = collectionColors.map((hex, index) => ({
        id: `${collection.toLowerCase()}-${index}`,
        name: `${collection} ${index + 1}`,
        color_code: hex,
        category: 'solid' as const,
      }));
      setNailColors(filteredColors);
      toast.success(`${collection} collection - ${filteredColors.length} colors`);
    } else {
      setNailColors(SAMPLE_NAIL_COLORS);
      toast.info(`${collection} collection selected`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Nail Try-On</h1>
          <p className="text-gray-600 mt-1">
            Experiment with nail polish colors and designs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving || !capturedImage}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" onClick={handleShare} disabled={!capturedImage}>
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
                mode="nails"
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
                    No hands detected - Show your hands to the camera
                  </div>
                </div>
              )}

              {detectionStatus === 'detected' && (
                <div className="absolute top-4 right-4 pointer-events-none">
                  <div className="bg-green-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full" />
                    Hands detected
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-4">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="bg-brand-pink/10 rounded-full p-2">
                  <Sparkles className="w-5 h-5 text-brand-pink" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">How to use:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Show your hands to the camera with palms facing forward</li>
                    <li>• Keep your hands steady for best results</li>
                    <li>• Try different colors and patterns</li>
                    <li>• Good lighting improves tracking accuracy</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-4">
          {/* Color Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Choose Color</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Professional Nail Colors */}
              <div className="grid grid-cols-5 gap-2">
                {loading ? (
                  // Loading state
                  Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-gray-200 animate-pulse"
                    />
                  ))
                ) : (
                  // Real nail colors
                  nailColors.map((nail) => (
                    <button
                      key={nail.id}
                      onClick={() => handleColorSelect(nail.color_code)}
                      className={cn(
                        'aspect-square rounded-lg transition-all hover:scale-110 relative shadow-md border-2',
                        selectedColor === nail.color_code
                          ? 'ring-4 ring-brand-pink ring-offset-2 scale-110 border-white'
                          : 'border-gray-200'
                      )}
                      style={{ backgroundColor: nail.color_code }}
                      title={nail.name}
                    >
                      {selectedColor === nail.color_code && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white drop-shadow-lg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>

              {!loading && nailColors.length > 0 && (
                <p className="text-xs text-center text-gray-500">
                  {nailColors.length} professional colors available
                </p>
              )}

              {/* Custom Color */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Custom Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="h-10 w-20 rounded-md border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-md border border-gray-300 font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pattern Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {PATTERNS.map((pattern) => {
                  const Icon = pattern.icon;
                  return (
                    <Button
                      key={pattern.value}
                      variant={settings.pattern === pattern.value ? 'default' : 'outline'}
                      onClick={() => handlePatternChange(pattern.value)}
                      className="h-auto py-3 flex-col gap-1"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{pattern.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Adjustments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Opacity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Opacity</label>
                  <span className="text-sm text-gray-500">{Math.round(settings.opacity * 100)}%</span>
                </div>
                <Slider
                  value={[settings.opacity * 100]}
                  onValueChange={handleOpacityChange}
                  max={100}
                  step={1}
                />
              </div>

              {/* Glossiness */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Shine/Gloss</label>
                  <span className="text-sm text-gray-500">{Math.round(settings.glossiness * 100)}%</span>
                </div>
                <Slider
                  value={[settings.glossiness * 100]}
                  onValueChange={handleGlossinessChange}
                  max={100}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={saving || !capturedImage}
              >
                <Download className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save This Look'}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleTakePhoto}>
                <Camera className="w-4 h-4 mr-2" />
                Capture Photo
              </Button>
              <Button variant="outline" className="w-full" onClick={handleAddToFavorites} disabled={!capturedImage}>
                <Heart className="w-4 h-4 mr-2" />
                Add to Favorites
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Popular Collections */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {['Romantic', 'Glam', 'Autumn', 'Winter', 'Spring', 'Summer', 'Halloween', 'Holiday'].map((collection) => (
              <Button
                key={collection}
                variant={selectedCollection === collection ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCollectionSelect(collection)}
              >
                {collection}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Nail Design Generator */}
      <div className="mt-8">
        <NailsGenerator />
      </div>
    </div>
  );
}
