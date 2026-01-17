'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export interface StyleItem {
  id: string;
  name: string;
  thumbnail_url?: string;
  color_base?: string;
  is_premium: boolean;
  category: string;
}

interface StyleCarouselProps {
  styles: StyleItem[];
  selectedId?: string;
  onSelect: (style: StyleItem) => void;
  className?: string;
}

export function StyleCarousel({
  styles,
  selectedId,
  onSelect,
  className,
}: StyleCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Scroll Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Styles Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-12 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {styles.map((style) => (
          <div
            key={style.id}
            onClick={() => onSelect(style)}
            className={cn(
              'flex-shrink-0 w-32 cursor-pointer transition-all hover:scale-105',
              selectedId === style.id && 'scale-105'
            )}
          >
            <div
              className={cn(
                'relative aspect-square rounded-2xl overflow-hidden border-4 transition-colors',
                selectedId === style.id
                  ? 'border-brand-purple shadow-xl'
                  : 'border-gray-200 hover:border-brand-purple/50'
              )}
            >
              {/* Thumbnail */}
              {style.thumbnail_url ? (
                <img
                  src={style.thumbnail_url}
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: style.color_base
                      ? `linear-gradient(135deg, ${style.color_base}, ${adjustColor(style.color_base, 20)})`
                      : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  }}
                />
              )}

              {/* Premium Badge */}
              {style.is_premium && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  PRO
                </div>
              )}

              {/* Selected Indicator */}
              {selectedId === style.id && (
                <div className="absolute inset-0 bg-brand-purple/20 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-brand-purple"
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
                </div>
              )}
            </div>

            {/* Name */}
            <p className="mt-2 text-sm font-medium text-center truncate">
              {style.name}
            </p>
            <p className="text-xs text-gray-500 text-center capitalize">
              {style.category}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to lighten/darken a color
function adjustColor(color: string, amount: number): string {
  const clamp = (val: number) => Math.min(Math.max(val, 0), 255);
  const num = parseInt(color.replace('#', ''), 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00ff) + amount);
  const b = clamp((num & 0x0000ff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
