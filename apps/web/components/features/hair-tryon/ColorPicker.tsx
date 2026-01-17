'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Palette, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ColorSettings {
  hex: string;
  opacity: number;
  saturation: number;
  brightness: number;
}

interface ColorPickerProps {
  value: ColorSettings;
  onChange: (settings: ColorSettings) => void;
  className?: string;
}

const PRESET_COLORS = [
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'Dark Brown', hex: '#2C1B18' },
  { name: 'Brown', hex: '#4A3428' },
  { name: 'Light Brown', hex: '#8B6F47' },
  { name: 'Blonde', hex: '#D2B48C' },
  { name: 'Platinum', hex: '#F5F5DC' },
  { name: 'Red', hex: '#8B0000' },
  { name: 'Auburn', hex: '#A0522D' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Blue', hex: '#4169E1' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Green', hex: '#10B981' },
];

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleColorSelect = (hex: string) => {
    onChange({ ...value, hex });
  };

  const handleOpacityChange = (values: number[]) => {
    onChange({ ...value, opacity: values[0] / 100 });
  };

  const handleSaturationChange = (values: number[]) => {
    onChange({ ...value, saturation: values[0] / 100 });
  };

  const handleBrightnessChange = (values: number[]) => {
    onChange({ ...value, brightness: values[0] / 100 });
  };

  const handleReset = () => {
    onChange({
      hex: '#8B5CF6',
      opacity: 0.6,
      saturation: 1.0,
      brightness: 1.0,
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Preset Colors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Choose Color
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => handleColorSelect(color.hex)}
              className={cn(
                'aspect-square rounded-lg transition-all hover:scale-110 relative',
                value.hex === color.hex && 'ring-4 ring-brand-purple ring-offset-2'
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {value.hex === color.hex && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white drop-shadow-lg"
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
      </div>

      {/* Custom Color Input */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Custom Color
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={value.hex}
            onChange={(e) => handleColorSelect(e.target.value)}
            className="h-10 w-20 rounded-md border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={value.hex}
            onChange={(e) => handleColorSelect(e.target.value)}
            className="flex-1 h-10 px-3 rounded-md border border-gray-300 font-mono text-sm"
            placeholder="#8B5CF6"
          />
        </div>
      </div>

      {/* Opacity Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Opacity</label>
          <span className="text-sm text-gray-500">{Math.round(value.opacity * 100)}%</span>
        </div>
        <Slider
          value={[value.opacity * 100]}
          onValueChange={handleOpacityChange}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Advanced Controls Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full"
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Controls
      </Button>

      {/* Advanced Controls */}
      {showAdvanced && (
        <div className="space-y-4 pt-2 border-t">
          {/* Saturation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Saturation</label>
              <span className="text-sm text-gray-500">{Math.round(value.saturation * 100)}%</span>
            </div>
            <Slider
              value={[value.saturation * 100]}
              onValueChange={handleSaturationChange}
              max={200}
              step={1}
              className="w-full"
            />
          </div>

          {/* Brightness */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Brightness</label>
              <span className="text-sm text-gray-500">{Math.round(value.brightness * 100)}%</span>
            </div>
            <Slider
              value={[value.brightness * 100]}
              onValueChange={handleBrightnessChange}
              max={200}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Color Preview */}
      <div className="p-4 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-sm text-gray-600 mb-2">Preview:</p>
        <div
          className="h-20 rounded-lg shadow-lg"
          style={{
            backgroundColor: value.hex,
            opacity: value.opacity,
            filter: `saturate(${value.saturation}) brightness(${value.brightness})`,
          }}
        />
      </div>
    </div>
  );
}
