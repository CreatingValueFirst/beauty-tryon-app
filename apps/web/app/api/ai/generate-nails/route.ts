/**
 * AI Nail Design Generation API Endpoint
 * POST /api/ai/generate-nails
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateImage } from '@/lib/ai/replicate-client';
import { imageCache } from '@/lib/ai/utils/cache';
import {
  validatePrompt,
  AIGenerationError,
  ERROR_CODES,
} from '@/lib/ai/utils/error-handler';
import type { AIModelType, QualityPreset } from '@/lib/ai/replicate-client';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

interface GenerateRequest {
  prompt: string;
  modelType: AIModelType;
  quality?: QualityPreset;
  width?: number;
  height?: number;
  seed?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateRequest = await request.json();
    const {
      prompt,
      modelType,
      quality = 'standard',
      width = 1024,
      height = 1024,
      seed,
    } = body;

    // Validate required fields
    if (!prompt || !modelType) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and modelType' },
        { status: 400 }
      );
    }

    // Validate prompt content
    const promptValidation = validatePrompt(prompt);
    if (!promptValidation.valid) {
      return NextResponse.json(
        {
          error: promptValidation.error?.message,
          code: promptValidation.error?.code,
        },
        { status: promptValidation.error?.statusCode || 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: ERROR_CODES.UNAUTHORIZED.message,
          code: ERROR_CODES.UNAUTHORIZED.code,
        },
        { status: 401 }
      );
    }

    // Check user quota
    const { data: quotaCheck } = await supabase.rpc(
      'check_and_increment_quota',
      {
        p_user_id: user.id,
      }
    );

    if (!quotaCheck) {
      return NextResponse.json(
        {
          error: ERROR_CODES.RATE_LIMIT_EXCEEDED.message,
          code: ERROR_CODES.RATE_LIMIT_EXCEEDED.code,
        },
        { status: 429 }
      );
    }

    // Check cache for existing generation
    const cachedImageUrl = await imageCache.get(
      prompt,
      modelType,
      quality,
      width,
      height
    );

    if (cachedImageUrl) {
      console.log('[AI Generate] Cache HIT - returning cached image');

      // Create generation record with cached result
      const { data: generation } = await supabase
        .from('ai_generations')
        .insert({
          user_id: user.id,
          prompt,
          model_type: modelType,
          quality,
          width,
          height,
          status: 'completed',
          output_url: cachedImageUrl,
          estimated_cost: 0, // Cached = free
          actual_cost: 0,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          metadata: { cache_hit: true },
        })
        .select()
        .single();

      return NextResponse.json({
        success: true,
        cached: true,
        generation,
        imageUrl: cachedImageUrl,
      });
    }

    // Generate webhook URL for async completion
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`;

    // Call Replicate API to start generation
    console.log('[AI Generate] Starting new generation via Replicate');

    const prediction = await generateImage({
      prompt,
      modelType,
      quality,
      width,
      height,
      seed,
      webhookUrl,
    });

    // Create generation record
    const { data: generation, error: dbError } = await supabase
      .from('ai_generations')
      .insert({
        user_id: user.id,
        prediction_id: prediction.id,
        prompt,
        model_type: modelType,
        quality,
        width,
        height,
        seed,
        status: 'pending',
        started_at: new Date().toISOString(),
        metadata: {
          replicate_version: prediction.version,
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error('[AI Generate] Database error:', dbError);
      throw new AIGenerationError(
        'Failed to create generation record',
        'DATABASE_ERROR',
        false,
        500
      );
    }

    // Add to generation queue
    await supabase.from('ai_generation_queue').insert({
      user_id: user.id,
      generation_id: generation.id,
      priority: 0,
      status: 'processing',
      started_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      cached: false,
      generation,
      predictionId: prediction.id,
      status: prediction.status,
    });
  } catch (error: any) {
    console.error('[AI Generate] Error:', error);

    if (error instanceof AIGenerationError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        code: ERROR_CODES.UNKNOWN_ERROR.code,
      },
      { status: 500 }
    );
  }
}
