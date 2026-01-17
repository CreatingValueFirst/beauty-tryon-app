'use client';

import { useState, useCallback } from 'react';
import { ARCamera } from '@/components/ar/ARCamera';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { processNails, hexToRgbNail, NAIL_PRESETS, NailSettings } from '@/lib/ai/nail-processor';
import { Save, Share2, Download, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const PATTERNS = [
  { value: 'solid', label: 'Solid', icon: '🎨' },
  { value: 'french', label: 'French', icon: '💅' },
  { value: 'glitter', label: 'Glitter', icon: '✨' },
  { value: 'ombre', label: 'Ombré', icon: '🌈' },
] as const;

export default function NailTryOnPage() {
  const [selectedColor, setSelectedColor] = useState('#EC4899');
  const [settings, setSettings] = useState<NailSettings>({
    color: hexToRgbNail('#EC4899'),
    opacity: 0.85,
    glossiness: 0.7,
    pattern: 'solid',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastFrameTime, setLastFrameTime] = useState(0);

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
      processNails(video, canvas, settings, now).finally(() => {
        setIsProcessing(false);
      });
    },
    [settings, lastFrameTime, isProcessing]
  );

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
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline">
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
              <ARCamera mode="nails" onFrame={handleFrame} className="w-full" />
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
              {/* Preset Colors */}
              <div className="grid grid-cols-5 gap-2">
                {NAIL_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    onClick={() => handleColorSelect(preset.hex)}
                    className={cn(
                      'aspect-square rounded-lg transition-all hover:scale-110 relative shadow-md',
                      selectedColor === preset.hex && 'ring-4 ring-brand-pink ring-offset-2 scale-110'
                    )}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                  >
                    {selectedColor === preset.hex && (
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
                ))}
              </div>

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
                {PATTERNS.map((pattern) => (
                  <Button
                    key={pattern.value}
                    variant={settings.pattern === pattern.value ? 'default' : 'outline'}
                    onClick={() => handlePatternChange(pattern.value)}
                    className="h-auto py-3 flex-col gap-1"
                  >
                    <span className="text-2xl">{pattern.icon}</span>
                    <span className="text-xs">{pattern.label}</span>
                  </Button>
                ))}
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
              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Save This Look
              </Button>
              <Button variant="outline" className="w-full">
                📸 Capture Photo
              </Button>
              <Button variant="outline" className="w-full">
                ⭐ Add to Favorites
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
            <Button variant="outline" size="sm">💖 Romantic</Button>
            <Button variant="outline" size="sm">🌟 Glam</Button>
            <Button variant="outline" size="sm">🍂 Autumn</Button>
            <Button variant="outline" size="sm">❄️ Winter</Button>
            <Button variant="outline" size="sm">🌸 Spring</Button>
            <Button variant="outline" size="sm">☀️ Summer</Button>
            <Button variant="outline" size="sm">🎃 Halloween</Button>
            <Button variant="outline" size="sm">🎄 Holiday</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
