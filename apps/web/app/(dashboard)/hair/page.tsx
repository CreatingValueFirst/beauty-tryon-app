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

// Mock hair styles data (will be fetched from Supabase later)
const MOCK_HAIR_STYLES: StyleItem[] = [
  { id: '1', name: 'Classic Bob', category: 'bob', color_base: '#2C1B18', is_premium: false },
  { id: '2', name: 'Long Waves', category: 'long', color_base: '#4A3428', is_premium: false },
  { id: '3', name: 'Pixie Cut', category: 'pixie', color_base: '#1A1A1A', is_premium: false },
  { id: '4', name: 'Beach Waves', category: 'medium', color_base: '#8B6F47', is_premium: false },
  { id: '5', name: 'Sleek Straight', category: 'long', color_base: '#3B2F2F', is_premium: false },
  { id: '6', name: 'Platinum Blonde', category: 'bob', color_base: '#F5F5DC', is_premium: true },
  { id: '7', name: 'Mermaid Blue', category: 'long', color_base: '#00CED1', is_premium: true },
  { id: '8', name: 'Rose Gold', category: 'curly', color_base: '#E0BFB8', is_premium: true },
  { id: '9', name: 'Purple Dream', category: 'long', color_base: '#8B5CF6', is_premium: true },
  { id: '10', name: 'Fire Red', category: 'medium', color_base: '#DC143C', is_premium: true },
];

export default function HairTryOnPage() {
  const [selectedStyle, setSelectedStyle] = useState<StyleItem>(MOCK_HAIR_STYLES[0]);
  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    hex: MOCK_HAIR_STYLES[0].color_base || '#8B5CF6',
    opacity: 0.6,
    saturation: 1.0,
    brightness: 1.0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastFrameTime, setLastFrameTime] = useState(0);

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
                styles={MOCK_HAIR_STYLES}
                selectedId={selectedStyle.id}
                onSelect={handleStyleSelect}
              />
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
