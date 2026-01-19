/**
 * Replicate API Client
 * Enterprise-grade client for AI model inference
 */

import Replicate from 'replicate';

if (!process.env.REPLICATE_API_TOKEN) {
  console.warn('REPLICATE_API_TOKEN is not set. AI features will not work.');
}

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

/**
 * Model configurations for different AI tasks
 */
export const AI_MODELS = {
  NAIL_GENERATOR_1: {
    name: 'FLUX.1-dev LoRA Nails Generator',
    model: 'black-forest-labs/flux-dev-lora',
    loraWeights: 'https://huggingface.co/akhmat-s/FLUX.1-dev-LoRA-Nails-Generator/resolve/main/lora.safetensors',
    triggerWord: '',
    defaultSteps: 28,
    defaultGuidance: 3.5,
  },
  NAIL_GENERATOR_2: {
    name: 'Nails Woman LoRA',
    model: 'black-forest-labs/flux-dev-lora',
    loraWeights: 'https://huggingface.co/sheko007/nailswoman/resolve/main/lora.safetensors',
    triggerWord: 'lnailswoman',
    defaultSteps: 28,
    defaultGuidance: 3.5,
  },
  FLUX_SCHNELL: {
    name: 'FLUX Schnell (Fast)',
    model: 'black-forest-labs/flux-schnell',
    loraWeights: null,
    triggerWord: '',
    defaultSteps: 4,
    defaultGuidance: 0,
  },
} as const;

export type AIModelType = keyof typeof AI_MODELS;

/**
 * Generation quality presets
 */
export const QUALITY_PRESETS = {
  preview: {
    steps: 4,
    guidance: 1.0,
    description: 'Fast preview (cheapest)',
  },
  standard: {
    steps: 8,
    guidance: 2.5,
    description: 'Standard quality',
  },
  high: {
    steps: 28,
    guidance: 3.5,
    description: 'High quality (most expensive)',
  },
} as const;

export type QualityPreset = keyof typeof QUALITY_PRESETS;

/**
 * Generate an image using Replicate
 */
export interface GenerateImageOptions {
  prompt: string;
  modelType: AIModelType;
  quality?: QualityPreset;
  webhookUrl?: string;
  width?: number;
  height?: number;
  seed?: number;
}

export async function generateImage(options: GenerateImageOptions) {
  const {
    prompt,
    modelType,
    quality = 'standard',
    webhookUrl,
    width = 1024,
    height = 1024,
    seed,
  } = options;

  const modelConfig = AI_MODELS[modelType];
  const qualityConfig = QUALITY_PRESETS[quality];

  // Build the prompt with trigger word if needed
  const finalPrompt = modelConfig.triggerWord
    ? `${modelConfig.triggerWord} ${prompt}`
    : prompt;

  // Prepare input parameters
  const input: any = {
    prompt: finalPrompt,
    num_inference_steps: qualityConfig.steps,
    width,
    height,
  };

  // Add guidance scale if not zero (FLUX-schnell doesn't use it)
  if (qualityConfig.guidance > 0) {
    input.guidance_scale = qualityConfig.guidance;
  }

  // Add LoRA weights if specified
  if (modelConfig.loraWeights) {
    input.lora_weights = modelConfig.loraWeights;
  }

  // Add seed for reproducibility if provided
  if (seed !== undefined) {
    input.seed = seed;
  }

  // Create prediction
  const prediction = await replicate.predictions.create({
    version: modelConfig.model,
    input,
    webhook: webhookUrl,
    webhook_events_filter: webhookUrl ? ['completed'] : undefined,
  });

  return prediction;
}

/**
 * Get prediction status
 */
export async function getPredictionStatus(predictionId: string) {
  return await replicate.predictions.get(predictionId);
}

/**
 * Cancel a running prediction
 */
export async function cancelPrediction(predictionId: string) {
  return await replicate.predictions.cancel(predictionId);
}

/**
 * Estimate cost for a generation
 * Based on Replicate pricing (approximate)
 */
export function estimateCost(modelType: AIModelType, quality: QualityPreset): number {
  const baseCosts = {
    'NAIL_GENERATOR_1': 0.025,
    'NAIL_GENERATOR_2': 0.025,
    'FLUX_SCHNELL': 0.003,
  };

  const qualityMultipliers = {
    preview: 0.15, // 4 steps vs 28
    standard: 0.3, // 8 steps vs 28
    high: 1.0, // 28 steps
  };

  const baseCost = baseCosts[modelType];
  const multiplier = qualityMultipliers[quality];

  return baseCost * multiplier;
}
