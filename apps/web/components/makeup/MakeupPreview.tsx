'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { downloadBase64Image } from '@/lib/api/makeup-client';

interface MakeupPreviewProps {
  originalImage: string | null;
  processedImage: string | null;
  isProcessing?: boolean;
  processingTime?: number;
  className?: string;
  onSave?: () => void;
  onShare?: () => void;
}

export function MakeupPreview({
  originalImage,
  processedImage,
  isProcessing = false,
  processingTime,
  className,
  onSave,
  onShare,
}: MakeupPreviewProps) {
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [zoom, setZoom] = useState(1);

  const handleDownload = () => {
    if (processedImage) {
      downloadBase64Image(processedImage, `makeup-result-${Date.now()}.png`);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const displayImage = processedImage || originalImage;

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Preview Container */}
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
          {!displayImage && !isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
              <div className="text-center space-y-2 p-6">
                <div className="text-6xl mb-4">💄</div>
                <h3 className="text-lg font-medium">No Image Yet</h3>
                <p className="text-sm text-white/40">
                  Upload an image or capture from camera to get started
                </p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="text-center text-white space-y-3">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                <p className="text-sm font-medium">Applying makeup...</p>
                <p className="text-xs text-white/60">This usually takes 2-5 seconds</p>
              </div>
            </div>
          )}

          {displayImage && !showComparison && (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <div
                className="relative max-w-full max-h-[600px] transition-transform duration-300"
                style={{ transform: `scale(${zoom})` }}
              >
                <img
                  src={displayImage}
                  alt="Makeup preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          {displayImage && showComparison && originalImage && processedImage && (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <div className="relative max-w-full max-h-[600px] overflow-hidden rounded-lg">
                {/* Before/After Slider */}
                <div className="relative">
                  <img
                    src={processedImage}
                    alt="After makeup"
                    className="w-full h-full object-contain"
                  />
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img
                      src={originalImage}
                      alt="Before makeup"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Slider Control */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute top-1/2 left-0 w-full -translate-y-1/2 z-10 opacity-0 cursor-col-resize"
                  />

                  {/* Slider Line */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none z-20"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-gray-400 rounded-full" />
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Before
                  </div>
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
                    After
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Zoom Controls */}
          {displayImage && !isProcessing && (
            <div className="absolute top-4 left-4 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="bg-white/90 backdrop-blur-sm hover:bg-white touch-target"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleResetZoom}
                disabled={zoom === 1}
                className="bg-white/90 backdrop-blur-sm hover:bg-white touch-target"
                aria-label="Reset zoom"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="bg-white/90 backdrop-blur-sm hover:bg-white touch-target"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Comparison Toggle */}
          {originalImage && processedImage && !isProcessing && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Button
                onClick={() => setShowComparison(!showComparison)}
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm hover:bg-white touch-target"
              >
                {showComparison ? '👁️ View Result' : '↔️ Compare'}
              </Button>
            </div>
          )}
        </div>

        {/* Action Bar */}
        {processedImage && !isProcessing && (
          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1 h-11 active-scale"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            {onShare && (
              <Button onClick={onShare} variant="outline" className="flex-1 h-11 active-scale">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
            {onSave && (
              <Button onClick={onSave} className="flex-1 h-11 gradient-brand active-scale">
                💾 Save to Gallery
              </Button>
            )}
          </div>
        )}

        {/* Processing Info */}
        {processingTime && processedImage && (
          <div className="text-xs text-center text-muted-foreground bg-muted/50 rounded-lg p-2">
            ⚡ Processed in {(processingTime / 1000).toFixed(2)}s
          </div>
        )}
      </div>
    </div>
  );
}
