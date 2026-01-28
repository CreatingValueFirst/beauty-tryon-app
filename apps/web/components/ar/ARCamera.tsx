'use client';

import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ARCameraProps {
  mode: 'hair' | 'nails';
  onFrame?: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  onError?: (error: Error) => void;
  onReady?: () => void;
  className?: string;
  modelLoadingStatus?: {
    status: 'idle' | 'loading' | 'ready' | 'error';
    progress: number;
    currentModel: string;
    error: string | null;
  };
}

export interface ARCameraHandle {
  capturePhoto: () => Promise<Blob | null>;
  getCanvas: () => HTMLCanvasElement | null;
  isReady: () => boolean;
}

export const ARCamera = forwardRef<ARCameraHandle, ARCameraProps>(
  ({ mode, onFrame, onError, onReady, className, modelLoadingStatus }, ref) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const animationFrameId = useRef<number>();
  const [permissionGranted, setPermissionGranted] = useState(false);

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

  // Check browser support
  useEffect(() => {
    const checkBrowserSupport = () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const err = new Error('Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
        setError(err.message);
        onError?.(err);
        setIsLoading(false);
        return false;
      }
      return true;
    };

    if (!checkBrowserSupport()) {
      return;
    }

    // Check camera permissions
    const checkPermissions = async () => {
      try {
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (permission.state === 'denied') {
            const err = new Error('Camera permission denied. Please allow camera access in your browser settings.');
            setError(err.message);
            onError?.(err);
            setIsLoading(false);
          } else if (permission.state === 'granted') {
            setPermissionGranted(true);
          }
        }
      } catch (err) {
        // Permissions API not supported, will check on getUserMedia
        console.log('Permissions API not supported, will check on getUserMedia');
      }
    };

    checkPermissions();
  }, [onError]);

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.innerWidth > window.innerHeight) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    capturePhoto: async () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 0.95);
      });
    },
    getCanvas: () => canvasRef.current,
    isReady: () => isActive && !error,
  }), [isActive, error]);

  const handleUserMedia = () => {
    setIsActive(true);
    setIsLoading(false);
    setPermissionGranted(true);
    setError(null);
    onReady?.();
  };

  const handleUserMediaError = (error: string | DOMException) => {
    let errorMessage = 'Failed to access camera. ';

    if (typeof error === 'string') {
      errorMessage += error;
    } else if (error.name === 'NotAllowedError') {
      errorMessage += 'Camera permission denied. Please allow camera access and reload the page.';
    } else if (error.name === 'NotFoundError') {
      errorMessage += 'No camera found. Please connect a camera and try again.';
    } else if (error.name === 'NotReadableError') {
      errorMessage += 'Camera is already in use by another application.';
    } else {
      errorMessage += error.message || 'Unknown error occurred.';
    }

    setError(errorMessage);
    setIsLoading(false);
    onError?.(new Error(errorMessage));
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = async () => {
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

  // Show error state
  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive" className="rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {error}
            {error.includes('permission') && (
              <div className="mt-2 text-sm">
                <strong>How to fix:</strong>
                <ol className="list-decimal ml-4 mt-1">
                  <li>Click the camera icon in your browser's address bar</li>
                  <li>Select "Allow" for camera access</li>
                  <li>Reload this page</li>
                </ol>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className="relative ar-camera-container rounded-lg overflow-hidden bg-black touch-manipulation"
        style={{
          minHeight: '400px',
          aspectRatio: orientation === 'landscape' ? '16/9' : '9/16',
          maxHeight: '80vh'
        }}
      >
        {/* Loading overlay */}
        {(isLoading || modelLoadingStatus?.status === 'loading') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center text-white px-6 max-w-xs">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              {modelLoadingStatus?.status === 'loading' ? (
                <>
                  <p className="text-sm font-medium mb-2">Loading AI Models...</p>
                  <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${modelLoadingStatus.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-300">
                    {modelLoadingStatus.currentModel}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {modelLoadingStatus.progress}% complete
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">Initializing camera...</p>
                  <p className="text-xs text-gray-400 mt-1">Please allow camera access when prompted</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Model loading error */}
        {modelLoadingStatus?.status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center text-white px-6 max-w-xs">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <p className="text-sm font-medium mb-2">Failed to Load AI Models</p>
              <p className="text-xs text-gray-400 mb-4">
                {modelLoadingStatus.error || 'Please refresh the page and try again.'}
              </p>
            </div>
          </div>
        )}

        {/* Webcam - hidden, used only as video source */}
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode,
          }}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          className="absolute top-0 left-0 opacity-0 pointer-events-none"
          mirrored={false}
        />

        {/* Canvas - main visible element with AR effects */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          style={{
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            display: 'block',
          }}
        />

        {/* Controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleCamera}
            disabled={!isActive}
            className="bg-white/90 backdrop-blur-sm hover:bg-white min-w-[44px] min-h-[44px]"
            aria-label="Switch camera"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            onClick={capturePhoto}
            disabled={!isActive}
            className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 min-w-[64px] min-h-[64px]"
            aria-label="Capture photo"
          >
            <Camera className="w-6 h-6 text-brand-purple" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={capturePhoto}
            disabled={!isActive}
            className="bg-white/90 backdrop-blur-sm hover:bg-white min-w-[44px] min-h-[44px]"
            aria-label="Download photo"
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

        {/* Orientation hint for mobile */}
        {orientation === 'landscape' && window.innerWidth < 768 && (
          <div className="absolute inset-x-0 bottom-24 flex justify-center px-4">
            <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-xs text-center max-w-xs">
              💡 Tip: Rotate your device to portrait mode for better experience
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ARCamera.displayName = 'ARCamera';
