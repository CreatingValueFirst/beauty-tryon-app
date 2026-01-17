'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, Download } from 'lucide-react';

interface ARCameraProps {
  mode: 'hair' | 'nails';
  onFrame?: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  className?: string;
}

export function ARCamera({ mode, onFrame, className }: ARCameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const animationFrameId = useRef<number>();

  // Process video frames
  const processFrame = useCallback(() => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Call custom frame processor
      if (onFrame) {
        onFrame(video, canvas);
      }
    }

    // Continue animation loop
    if (isActive) {
      animationFrameId.current = requestAnimationFrame(processFrame);
    }
  }, [isActive, onFrame]);

  // Start processing when camera is active
  useEffect(() => {
    if (isActive) {
      animationFrameId.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActive, processFrame]);

  const handleUserMedia = () => {
    setIsActive(true);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create download link
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `beauty-tryon-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className={className}>
      <div className="relative ar-camera-container rounded-lg overflow-hidden bg-black">
        {/* Webcam */}
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode,
          }}
          onUserMedia={handleUserMedia}
          className="w-full h-full object-cover"
          mirrored={facingMode === 'user'}
        />

        {/* Canvas overlay for AR effects */}
        <canvas
          ref={canvasRef}
          className="ar-canvas-overlay"
          style={{
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          }}
        />

        {/* Controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleCamera}
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            onClick={capturePhoto}
            className="w-16 h-16 rounded-full bg-white hover:bg-gray-100"
          >
            <Camera className="w-6 h-6 text-brand-purple" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={capturePhoto}
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Mode indicator */}
        <div className="absolute top-4 left-4">
          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
            {mode === 'hair' ? '💇 Hair Try-On' : '💅 Nail Try-On'}
          </div>
        </div>

        {/* FPS/Status indicator */}
        <div className="absolute top-4 right-4">
          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs">
            {isActive ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Active
              </span>
            ) : (
              'Initializing...'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
