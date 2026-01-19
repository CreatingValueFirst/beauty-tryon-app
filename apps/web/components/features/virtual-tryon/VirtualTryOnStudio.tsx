'use client';

/**
 * Virtual Try-On Studio Component
 * Mobile-optimized clothing virtual try-on interface
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Camera,
  Upload,
  Loader2,
  Download,
  Heart,
  Share2,
  Sparkles,
  Image as ImageIcon,
  ShoppingBag,
  User,
  Shirt,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

interface ClothingItem {
  id: string;
  name: string;
  garment_image_url: string;
  brand?: string;
  price?: number;
}

interface TryOnResult {
  id: string;
  result_image_url: string;
  person_image_url: string;
  garment_image_url: string;
  status: string;
}

export function VirtualTryOnStudio() {
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [selectedClothing, setSelectedClothing] = useState<ClothingItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPredictionId, setCurrentPredictionId] = useState<string | null>(null);
  const [result, setResult] = useState<TryOnResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const personFileInputRef = useRef<HTMLInputElement>(null);
  const garmentFileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize camera
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Failed to access camera. Please grant camera permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setShowCamera(false);
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setPersonImage(imageData);
    stopCamera();
    toast.success('Photo captured!');
  };

  // Handle file upload
  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'person' | 'garment'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      if (type === 'person') {
        setPersonImage(imageData);
      } else {
        setGarmentImage(imageData);
        // Clear selected clothing if manual upload
        setSelectedClothing(null);
      }
      toast.success('Image uploaded!');
    };
    reader.readAsDataURL(file);
  };

  // Poll for prediction status
  useEffect(() => {
    if (!currentPredictionId || !isGenerating) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/virtual-tryon/predictions/${currentPredictionId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setIsGenerating(false);
          setProgress(100);
          setCurrentPredictionId(null);
          setResult(data.tryOn);
          toast.success('Virtual try-on completed!');
          clearInterval(pollInterval);
        } else if (data.status === 'failed') {
          setIsGenerating(false);
          setCurrentPredictionId(null);
          toast.error(data.error || 'Virtual try-on failed. Please try again.');
          clearInterval(pollInterval);
        } else {
          setProgress((prev) => Math.min(prev + 3, 90));
        }
      } catch (error) {
        console.error('Polling error:', error);
        toast.error('Failed to check status');
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [currentPredictionId, isGenerating]);

  // Generate virtual try-on
  const handleGenerate = async () => {
    if (!personImage || !garmentImage) {
      toast.error('Please upload both person and garment images');
      return;
    }

    setIsGenerating(true);
    setProgress(10);
    setResult(null);

    try {
      // Upload images to Supabase Storage first
      const personUrl = await uploadImageToStorage(personImage, 'person');
      const garmentUrl = await uploadImageToStorage(garmentImage, 'garment');

      const response = await fetch('/api/virtual-tryon/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personImageUrl: personUrl,
          garmentImageUrl: garmentUrl,
          clothingItemId: selectedClothing?.id,
          modelType: 'IDM_VTON',
          category: 'upperbody',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start virtual try-on');
      }

      setCurrentPredictionId(data.predictionId);
      setProgress(20);
      toast.info('Generating your try-on...', {
        description: `Estimated time: ${data.estimatedTime} seconds`,
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      setIsGenerating(false);
      setProgress(0);
      toast.error(error.message || 'Failed to generate try-on');
    }
  };

  // Upload image to Supabase Storage
  const uploadImageToStorage = async (
    imageData: string,
    type: 'person' | 'garment'
  ): Promise<string> => {
    // Convert base64 to blob
    const blob = await fetch(imageData).then(r => r.blob());

    const formData = new FormData();
    formData.append('file', blob, `${type}-${Date.now()}.jpg`);
    formData.append('type', type);

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const { url } = await response.json();
    return url;
  };

  // Download result
  const handleDownload = async () => {
    if (!result?.result_image_url) return;

    try {
      const response = await fetch(result.result_image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `virtual-tryon-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  // Share result
  const handleShare = async () => {
    if (!result?.result_image_url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Virtual Try-On',
          text: 'Check out my virtual try-on result!',
          url: result.result_image_url,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(result.result_image_url);
      toast.success('Link copied to clipboard!');
    }
  };

  // Reset
  const handleReset = () => {
    setPersonImage(null);
    setGarmentImage(null);
    setSelectedClothing(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <Button
                size="lg"
                onClick={capturePhoto}
                className="rounded-full w-16 h-16"
              >
                <Camera className="h-6 w-6" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={stopCamera}
                className="rounded-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Shirt className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
            Virtual Try-On Studio
          </CardTitle>
          <CardDescription>
            See how clothing looks on you before buying
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          {/* Image Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Person Image */}
            <Card className="border-2 border-dashed">
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Your Photo
                  </h3>
                  {personImage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPersonImage(null)}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {personImage ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={personImage}
                      alt="Person"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-gray-50 flex flex-col items-center justify-center gap-3 p-4">
                    <User className="h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600 text-center">
                      Upload a full-body photo
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => initCamera()}
                    className="w-full"
                    disabled={isGenerating}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Take Photo</span>
                    <span className="sm:hidden">Camera</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => personFileInputRef.current?.click()}
                    className="w-full"
                    disabled={isGenerating}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Upload</span>
                    <span className="sm:hidden">Upload</span>
                  </Button>
                </div>
                <input
                  ref={personFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'person')}
                />
              </CardContent>
            </Card>

            {/* Garment Image */}
            <Card className="border-2 border-dashed">
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Clothing Item
                  </h3>
                  {garmentImage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setGarmentImage(null)}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {garmentImage ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
                    <Image
                      src={garmentImage}
                      alt="Garment"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-gray-50 flex flex-col items-center justify-center gap-3 p-4">
                    <Shirt className="h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600 text-center">
                      Upload clothing image
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => garmentFileInputRef.current?.click()}
                  className="w-full"
                  disabled={isGenerating}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Clothing
                </Button>
                <input
                  ref={garmentFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'garment')}
                />
              </CardContent>
            </Card>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !personImage || !garmentImage}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Virtual Try-On
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {progress < 30
                  ? 'Preparing images...'
                  : progress < 90
                  ? 'Applying clothing to your photo...'
                  : 'Almost done...'}
              </p>
            </div>
          )}

          {/* Result */}
          {result && result.result_image_url && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-lg">Your Virtual Try-On Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
                  <Image
                    src={result.result_image_url}
                    alt="Try-on result"
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Download</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Share</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">New</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Use a full-body photo with good lighting</li>
            <li>• Stand straight and face the camera</li>
            <li>• Wear simple, fitted clothing for better results</li>
            <li>• Use high-quality clothing product images</li>
            <li>• Ensure clothing image has clean white background</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
