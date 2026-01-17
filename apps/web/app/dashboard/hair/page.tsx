'use client';

import { useState, useCallback, useEffect } from 'react';
import { ARCamera } from '@/components/ar/ARCamera';
import { StyleCarousel, StyleItem } from '@/components/features/hair-tryon/StyleCarousel';
import { ColorPicker, ColorSettings } from '@/components/features/hair-tryon/ColorPicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { processHair, hexToRgb } from '@/lib/ai/hair-processor';
import { Save, Share2, Download, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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
  const [hairStyles, setHairStyles] = useState<StyleItem[]>(SAMPLE_HAIR_STYLES);
  const [selectedStyle, setSelectedStyle] = useState<StyleItem>(SAMPLE_HAIR_STYLES[0]);
  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    hex: SAMPLE_HAIR_STYLES[0].color_base || '#8B5CF6',
    opacity: 0.6,
    saturation: 1.0,
    brightness: 1.0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastFrameTime, setLastFrameTime] = useState(0);
  const [loading, setLoading] = useState(true);

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
      ).finally(() => {
        setIsProcessing(false);
      });
    },
    [colorSettings, lastFrameTime, isProcessing]
  );

  const handleStyleSelect = (style: StyleItem) => {
    setSelectedStyle(style);
  };

  const handleSave = () => {
    // TODO: Implement save to gallery
    console.log('Saving try-on...');
  };

  const handleShare = () => {
    // TODO: Implement social sharing
    console.log('Sharing...');
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
            <CardContent className="p-0">
              <ARCamera mode="hair" onFrame={handleFrame} className="w-full" />
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
                styles={hairStyles}
                selectedId={selectedStyle.id}
                onSelect={handleStyleSelect}
              />
              {!loading && hairStyles.length > 0 && (
                <p className="text-xs text-center text-gray-500 mt-3">
                  {hairStyles.length} professional styles available
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
                      <Button className="w-full" size="lg">
                        <Download className="w-4 h-4 mr-2" />
                        Save This Look
                      </Button>
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
              <Button variant="outline" className="w-full justify-start" size="sm">
                📸 Take Photo
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                🎨 Create Custom Color
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                ⭐ View Favorites
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                🔄 Compare Styles
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
              <Button key={category} variant="outline" size="sm">
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
