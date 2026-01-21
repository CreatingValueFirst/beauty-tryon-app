'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { makeupClient, MakeupConfig } from '@/lib/api/makeup-client';
import { Loader2 } from 'lucide-react';

interface MakeupControlsProps {
  config: Partial<MakeupConfig>;
  onChange: (config: Partial<MakeupConfig>) => void;
  onApply: () => void;
  onReset: () => void;
  isProcessing?: boolean;
  className?: string;
}

interface ColorOption {
  name: string;
  rgb: string;
  hex: string;
}

// Color mappings (approximate hex values for display)
const LIPSTICK_COLORS: ColorOption[] = [
  { name: 'Red', rgb: '(255, 0, 0)', hex: '#FF0000' },
  { name: 'Pink', rgb: '(255, 192, 203)', hex: '#FFC0CB' },
  { name: 'Burgundy', rgb: '(130, 0, 75)', hex: '#82004B' },
  { name: 'Orange', rgb: '(255, 165, 0)', hex: '#FFA500' },
  { name: 'Nude', rgb: '(200, 140, 180)', hex: '#C88CB4' },
  { name: 'Wine', rgb: '(120, 0, 0)', hex: '#780000' },
  { name: 'Coral', rgb: '(255, 165, 100)', hex: '#FFA564' },
];

const BLUSH_COLORS: ColorOption[] = [
  { name: 'Coral', rgb: '(245, 135, 66)', hex: '#F58742' },
  { name: 'Pink', rgb: '(220, 135, 192)', hex: '#DC87C0' },
  { name: 'Peach', rgb: '(255, 165, 152)', hex: '#FFA598' },
  { name: 'Rose', rgb: '(200, 70, 100)', hex: '#C84664' },
  { name: 'Berry', rgb: '(150, 50, 140)', hex: '#96328C' },
  { name: 'Apricot', rgb: '(230, 140, 140)', hex: '#E68C8C' },
];

const FOUNDATION_PRESETS = [
  { name: 'Low', description: 'Subtle brightening' },
  { name: 'Medium', description: 'Balanced coverage' },
  { name: 'High', description: 'Full coverage' },
  { name: 'Warm', description: 'Warm tint' },
];

export function MakeupControls({
  config,
  onChange,
  onApply,
  onReset,
  isProcessing = false,
  className,
}: MakeupControlsProps) {
  const [availableColors, setAvailableColors] = useState<{
    lipstick: string[];
    blush: string[];
    foundation: string[];
  } | null>(null);

  useEffect(() => {
    // Fetch available colors from API
    makeupClient
      .getColors()
      .then(setAvailableColors)
      .catch((error) => {
        console.error('Failed to fetch colors:', error);
        // Use default colors as fallback
        setAvailableColors({
          lipstick: LIPSTICK_COLORS.map((c) => c.name),
          blush: BLUSH_COLORS.map((c) => c.name),
          foundation: FOUNDATION_PRESETS.map((p) => p.name),
        });
      });
  }, []);

  const handleToggle = (field: keyof MakeupConfig, value: boolean) => {
    onChange({ ...config, [field]: value });
  };

  const handleColorChange = (field: keyof MakeupConfig, value: string) => {
    onChange({ ...config, [field]: value });
  };

  const handleIntensityChange = (value: number[]) => {
    onChange({ ...config, blush_intensity: value[0] });
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Lipstick Controls */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                💄 Lipstick
              </CardTitle>
              <Switch
                checked={config.apply_lipstick ?? true}
                onCheckedChange={(checked) => handleToggle('apply_lipstick', checked)}
                disabled={isProcessing}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="lipstick-color" className="text-sm">
                Color
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {LIPSTICK_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorChange('lipstick_color', color.name)}
                    disabled={!config.apply_lipstick || isProcessing}
                    className={`
                      relative h-12 rounded-lg border-2 transition-all touch-target
                      ${
                        config.lipstick_color === color.name
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-gray-200 hover:border-gray-300'
                      }
                      ${!config.apply_lipstick || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Select ${color.name} lipstick`}
                  >
                    <span className="sr-only">{color.name}</span>
                    {config.lipstick_color === color.name && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 bg-white rounded-full shadow-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="text-xs text-center text-muted-foreground mt-1">
                {config.lipstick_color || 'Red'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blush Controls */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                ✨ Blush
              </CardTitle>
              <Switch
                checked={config.apply_blush ?? true}
                onCheckedChange={(checked) => handleToggle('apply_blush', checked)}
                disabled={isProcessing}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="blush-color" className="text-sm">
                Color
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {BLUSH_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorChange('blush_color', color.name)}
                    disabled={!config.apply_blush || isProcessing}
                    className={`
                      relative h-12 rounded-lg border-2 transition-all touch-target
                      ${
                        config.blush_color === color.name
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-gray-200 hover:border-gray-300'
                      }
                      ${!config.apply_blush || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Select ${color.name} blush`}
                  >
                    <span className="sr-only">{color.name}</span>
                    {config.blush_color === color.name && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 bg-white rounded-full shadow-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="text-xs text-center text-muted-foreground mt-1">
                {config.blush_color || 'Pink'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="blush-intensity" className="text-sm">
                  Intensity
                </Label>
                <span className="text-xs text-muted-foreground">
                  {config.blush_intensity ?? 50}%
                </span>
              </div>
              <Slider
                id="blush-intensity"
                value={[config.blush_intensity ?? 50]}
                onValueChange={handleIntensityChange}
                min={0}
                max={100}
                step={5}
                disabled={!config.apply_blush || isProcessing}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Foundation Controls */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                🌟 Foundation
              </CardTitle>
              <Switch
                checked={config.apply_foundation ?? true}
                onCheckedChange={(checked) => handleToggle('apply_foundation', checked)}
                disabled={isProcessing}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="foundation-preset" className="text-sm">
                Coverage Level
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {FOUNDATION_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleColorChange('foundation_preset', preset.name)}
                    disabled={!config.apply_foundation || isProcessing}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-left touch-target
                      ${
                        config.foundation_preset === preset.name
                          ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                      ${
                        !config.apply_foundation || isProcessing
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      }
                    `}
                    aria-label={`Select ${preset.name} foundation`}
                  >
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={onApply}
            disabled={isProcessing}
            className="flex-1 h-12 text-base font-medium gradient-brand hover:opacity-90 active-scale"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>✨ Apply Makeup</>
            )}
          </Button>
          <Button
            onClick={onReset}
            disabled={isProcessing}
            variant="outline"
            className="h-12 px-6 active-scale"
          >
            Reset
          </Button>
        </div>

        {/* Info */}
        {isProcessing && (
          <div className="text-xs text-center text-muted-foreground bg-muted/50 rounded-lg p-3">
            💡 Processing typically takes 2-5 seconds depending on image size
          </div>
        )}
      </div>
    </div>
  );
}
