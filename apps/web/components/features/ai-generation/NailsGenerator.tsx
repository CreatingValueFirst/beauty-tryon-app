'use client';

/**
 * AI Nail Design Generator Component
 * Allows users to generate custom nail designs using FLUX LoRA models
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Loader2, Download, Heart, Share2, Wand2, Zap, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { AIModelType, QualityPreset } from '@/lib/ai/replicate-client';

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  modelType: AIModelType;
  quality: QualityPreset;
  createdAt: string;
  cached: boolean;
}

const MODEL_OPTIONS = [
  {
    value: 'NAIL_GENERATOR_1' as AIModelType,
    label: 'FLUX Nails Pro',
    description: 'High-quality nail designs with realistic textures',
    icon: Crown,
  },
  {
    value: 'NAIL_GENERATOR_2' as AIModelType,
    label: 'Nails Woman',
    description: 'Specialized for manicured nail art',
    icon: Sparkles,
  },
  {
    value: 'FLUX_SCHNELL' as AIModelType,
    label: 'FLUX Fast',
    description: 'Quick preview generations (4 steps)',
    icon: Zap,
  },
];

const QUALITY_OPTIONS = [
  {
    value: 'preview' as QualityPreset,
    label: 'Preview',
    description: 'Fast & cheap (4 steps)',
    cost: '$0.001',
  },
  {
    value: 'standard' as QualityPreset,
    label: 'Standard',
    description: 'Balanced quality (8 steps)',
    cost: '$0.008',
  },
  {
    value: 'high' as QualityPreset,
    label: 'High Quality',
    description: 'Best results (28 steps)',
    cost: '$0.025',
  },
];

const EXAMPLE_PROMPTS = [
  'Elegant french manicure with gold accents',
  'Pastel pink ombre nails with glitter tips',
  'Minimalist white nails with tiny floral designs',
  'Bold red nails with geometric patterns',
  'Holographic chrome nails with rainbow reflection',
  'Matte black nails with silver stars',
];

export function NailsGenerator() {
  const [prompt, setPrompt] = useState('');
  const [modelType, setModelType] = useState<AIModelType>('NAIL_GENERATOR_1');
  const [quality, setQuality] = useState<QualityPreset>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentPredictionId, setCurrentPredictionId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Poll for prediction status
  useEffect(() => {
    if (!currentPredictionId || !isGenerating) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/ai/predictions/${currentPredictionId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setIsGenerating(false);
          setProgress(100);
          setCurrentPredictionId(null);

          const newImage: GeneratedImage = {
            id: data.generation.id,
            imageUrl: data.imageUrl,
            prompt: data.generation.prompt,
            modelType: data.generation.model_type,
            quality: data.generation.quality,
            createdAt: data.generation.created_at,
            cached: false,
          };

          setGeneratedImages((prev) => [newImage, ...prev]);
          toast.success('Nail design generated successfully!');
          clearInterval(pollInterval);
        } else if (data.status === 'failed') {
          setIsGenerating(false);
          setCurrentPredictionId(null);
          toast.error(data.error || 'Generation failed. Please try again.');
          clearInterval(pollInterval);
        } else {
          // Update progress for processing status
          setProgress((prev) => Math.min(prev + 5, 90));
        }
      } catch (error) {
        console.error('Polling error:', error);
        toast.error('Failed to check generation status');
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [currentPredictionId, isGenerating]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setProgress(10);

    try {
      const response = await fetch('/api/ai/generate-nails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          modelType,
          quality,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      if (data.cached) {
        // Cached result - instant
        setIsGenerating(false);
        setProgress(100);

        const newImage: GeneratedImage = {
          id: data.generation.id,
          imageUrl: data.imageUrl,
          prompt: data.generation.prompt,
          modelType: data.generation.model_type,
          quality: data.generation.quality,
          createdAt: data.generation.created_at,
          cached: true,
        };

        setGeneratedImages((prev) => [newImage, ...prev]);
        toast.success('Found cached design!', {
          description: 'This design was generated before.',
        });
      } else {
        // New generation - start polling
        setCurrentPredictionId(data.predictionId);
        setProgress(20);
        toast.info('Generating your nail design...', {
          description: 'This may take 10-30 seconds.',
        });
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      setIsGenerating(false);
      setProgress(0);
      toast.error(error.message || 'Failed to generate design');
    }
  };

  const handleUseExample = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nail-design-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleSave = async (image: GeneratedImage) => {
    try {
      const supabase = createClient();

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error('Please log in to save designs');
        return;
      }

      // Save to try_ons table as AI-generated nail design
      const { error: saveError } = await supabase
        .from('try_ons')
        .insert({
          user_id: user.id,
          type: 'nails',
          result_image_url: image.imageUrl,
          settings: {
            ai_generated: true,
            prompt: image.prompt,
            model_type: image.modelType,
            quality: image.quality,
            cached: image.cached,
          },
          is_favorite: false,
        });

      if (saveError) {
        throw saveError;
      }

      toast.success('Saved to your gallery!');
    } catch (error) {
      console.error('Failed to save design:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  const handleShare = async (image: GeneratedImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My AI Nail Design',
          text: image.prompt,
          url: image.imageUrl,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(image.imageUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-500" />
            AI Nail Design Generator
          </CardTitle>
          <CardDescription>
            Generate custom nail designs with AI using text prompts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Design Description</Label>
            <Textarea
              id="prompt"
              placeholder="Describe your dream nail design... (e.g., 'Elegant french manicure with gold accents')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isGenerating}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {EXAMPLE_PROMPTS.slice(0, 3).map((example, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleUseExample(example)}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label>AI Model</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {MODEL_OPTIONS.map((model) => {
                const Icon = model.icon;
                return (
                  <Card
                    key={model.value}
                    className={cn(
                      'cursor-pointer transition-all hover:border-purple-500',
                      modelType === model.value && 'border-purple-500 bg-purple-50'
                    )}
                    onClick={() => !isGenerating && setModelType(model.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <Icon className="h-5 w-5 mt-0.5 text-purple-500" />
                        <div>
                          <p className="font-medium text-sm">{model.label}</p>
                          <p className="text-xs text-muted-foreground">{model.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Quality Selection */}
          <div className="space-y-2">
            <Label>Quality</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {QUALITY_OPTIONS.map((q) => (
                <Card
                  key={q.value}
                  className={cn(
                    'cursor-pointer transition-all hover:border-purple-500',
                    quality === q.value && 'border-purple-500 bg-purple-50'
                  )}
                  onClick={() => !isGenerating && setQuality(q.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{q.label}</p>
                        <p className="text-xs text-muted-foreground">{q.description}</p>
                      </div>
                      <span className="text-xs font-mono text-green-600">{q.cost}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
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
                Generate Nail Design
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {progress < 30
                  ? 'Preparing generation...'
                  : progress < 90
                  ? 'Creating your design...'
                  : 'Almost done...'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Generated Designs</CardTitle>
            <CardDescription>{generatedImages.length} designs created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="relative aspect-square">
                    <img
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                    {image.cached && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Cached
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm line-clamp-2">{image.prompt}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(image.imageUrl, image.prompt)}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSave(image)}
                      >
                        <Heart className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(image)}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
