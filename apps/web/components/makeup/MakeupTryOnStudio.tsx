'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Upload, Camera, AlertCircle, RefreshCw, X } from 'lucide-react';
import { makeupClient, MakeupConfig, DEFAULT_MAKEUP_CONFIG, fileToBase64 } from '@/lib/api/makeup-client';
import { MakeupControls } from './MakeupControls';
import { MakeupPreview } from './MakeupPreview';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface MakeupTryOnStudioProps {
  onSave?: (imageData: string, config: MakeupConfig) => Promise<void>;
  className?: string;
}

export function MakeupTryOnStudio({ onSave, className }: MakeupTryOnStudioProps) {
  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<Partial<MakeupConfig>>(DEFAULT_MAKEUP_CONFIG);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Cleanup camera stream on unmount or mode change
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Stop camera when switching to upload mode
  useEffect(() => {
    if (mode === 'upload' && streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  }, [mode]);

  const startCamera = useCallback(async () => {
    setIsInitializingCamera(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';

      if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission')) {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (errorMessage.includes('NotFoundError')) {
        setCameraError('No camera found. Please connect a camera and try again.');
      } else {
        setCameraError('Failed to start camera. Please try again.');
      }
    } finally {
      setIsInitializingCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror the image for selfie-style capture
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setOriginalImage(imageData);
    setProcessedImage(null);
    setProcessingTime(undefined);
    setError(null);

    // Stop camera after capture
    stopCamera();

    toast({
      title: 'Photo captured!',
      description: 'Now adjust makeup settings and click Apply.',
    });
  }, [isCameraActive, stopCamera, toast]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError(null);

    try {
      // Convert to base64 for preview
      const base64 = await fileToBase64(file);
      setOriginalImage(base64);
      setProcessedImage(null);
      setProcessingTime(undefined);
    } catch (err) {
      setError('Failed to load image');
      console.error(err);
    }
  };

  const handleCameraCapture = () => {
    if (isCameraActive) {
      capturePhoto();
    } else {
      startCamera();
    }
  };

  const handleApplyMakeup = async () => {
    if (!originalImage) {
      setError('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Convert base64 to File object
      const response = await fetch(originalImage);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });

      // Apply makeup
      const result = await makeupClient.applyMakeup(file, config);

      if (result.success && result.image) {
        setProcessedImage(result.image);
        setProcessingTime(result.processing_time_ms);
        toast({
          title: 'Success!',
          description: result.status,
        });
      } else {
        setError(result.status || 'Failed to process image');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply makeup';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setProcessedImage(null);
    setProcessingTime(undefined);
    setConfig(DEFAULT_MAKEUP_CONFIG);
    setError(null);
  };

  const handleSave = async () => {
    if (!processedImage || !onSave) return;

    try {
      await onSave(processedImage, config as MakeupConfig);
      toast({
        title: 'Saved!',
        description: 'Makeup result saved to your gallery',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save to gallery',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (!processedImage) return;

    try {
      // Convert base64 to blob, preserving original format
      const response = await fetch(processedImage);
      const blob = await response.blob();
      // Use the blob's actual type, default to JPEG for camera captures
      const mimeType = blob.type || 'image/jpeg';
      const extension = mimeType.includes('png') ? 'png' : 'jpg';
      const file = new File([blob], `makeup-result.${extension}`, { type: mimeType });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Makeup Try-On',
          text: 'Check out my virtual makeup!',
          files: [file],
        });
      } else {
        // Fallback: copy link or download
        toast({
          title: 'Share',
          description: 'Sharing not supported on this device. Use the download button instead.',
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Image Upload/Camera */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'upload' | 'camera')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="upload" className="touch-target">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </TabsTrigger>
                <TabsTrigger value="camera" className="touch-target">
                  <Camera className="w-4 h-4 mr-2" />
                  Use Camera
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-gray-50/50 transition-all touch-manipulation"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="camera" className="space-y-4">
                {isCameraActive ? (
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full aspect-[4/3] object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <Button
                        onClick={capturePhoto}
                        size="lg"
                        className="gradient-brand rounded-full w-16 h-16"
                      >
                        <Camera className="w-6 h-6" />
                      </Button>
                      <Button
                        onClick={stopCamera}
                        variant="secondary"
                        size="lg"
                        className="rounded-full w-16 h-16"
                      >
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                    <p className="absolute top-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-2">
                      Position your face in the frame
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    {cameraError ? (
                      <>
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                        <p className="text-sm font-medium text-red-600 mb-4">
                          {cameraError}
                        </p>
                        <Button onClick={startCamera} variant="outline">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                      </>
                    ) : (
                      <>
                        <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700 mb-4">
                          Take a photo to try on makeup
                        </p>
                        <Button
                          onClick={startCamera}
                          className="gradient-brand"
                          disabled={isInitializingCamera}
                        >
                          {isInitializingCamera ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Starting Camera...
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 mr-2" />
                              Open Camera
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-gray-500 mt-4">
                          Your camera will be used to capture a photo for makeup try-on
                        </p>
                      </>
                    )}
                  </div>
                )}

                {cameraError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{cameraError}</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          {/* Preview */}
          <MakeupPreview
            originalImage={originalImage}
            processedImage={processedImage}
            isProcessing={isProcessing}
            processingTime={processingTime}
            onSave={onSave ? handleSave : undefined}
            onShare={handleShare}
          />
        </div>

        {/* Right: Controls */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-1">Makeup Settings</h2>
              <p className="text-sm text-muted-foreground">
                Customize your look by adjusting the settings below
              </p>
            </div>

            <MakeupControls
              config={config}
              onChange={setConfig}
              onApply={handleApplyMakeup}
              onReset={handleReset}
              isProcessing={isProcessing}
            />
          </Card>

          {/* Tips */}
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
              💡 Tips for Best Results
            </h3>
            <ul className="text-xs space-y-1.5 text-gray-700">
              <li>• Use a well-lit, frontal face photo</li>
              <li>• Ensure your face is clearly visible</li>
              <li>• Avoid heavily filtered or edited images</li>
              <li>• Try different color combinations</li>
              <li>• Adjust intensity for natural or dramatic looks</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
