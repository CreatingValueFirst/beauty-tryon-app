/**
 * AI Prediction Status API Endpoint
 * GET /api/ai/predictions/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPredictionStatus } from '@/lib/ai/replicate-client';
import { imageCache } from '@/lib/ai/utils/cache';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: predictionId } = await context.params;

    if (!predictionId) {
      return NextResponse.json(
        { error: 'Prediction ID is required' },
        { status: 400 }
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get generation record from database
    const { data: generation, error: dbError } = await supabase
      .from('ai_generations')
      .select('*')
      .eq('prediction_id', predictionId)
      .eq('user_id', user.id)
      .single();

    if (dbError || !generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      );
    }

    // If already completed, return cached result
    if (generation.status === 'completed' && generation.output_url) {
      return NextResponse.json({
        success: true,
        status: 'completed',
        generation,
        imageUrl: generation.output_url,
      });
    }

    // If failed, return error
    if (generation.status === 'failed') {
      return NextResponse.json({
        success: false,
        status: 'failed',
        generation,
        error: generation.error_message,
      });
    }

    // Check Replicate API for current status
    console.log(`[Prediction Status] Checking Replicate for ${predictionId}`);

    const prediction = await getPredictionStatus(predictionId);

    // Update database with latest status
    const updateData: any = {
      status: prediction.status,
    };

    if (prediction.status === 'succeeded' && prediction.output) {
      const imageUrl = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;

      updateData.output_url = imageUrl;
      updateData.completed_at = new Date().toISOString();
      updateData.actual_cost = prediction.metrics?.predict_time
        ? calculateCost(prediction.metrics.predict_time)
        : generation.estimated_cost;

      // Cache the successful generation
      await imageCache.set(
        generation.prompt,
        generation.model_type,
        generation.quality,
        imageUrl,
        generation.width,
        generation.height
      );

      console.log(`[Prediction Status] Generation completed: ${imageUrl}`);
    } else if (prediction.status === 'failed') {
      updateData.error_message = prediction.error || 'Generation failed';
      updateData.error_code = 'GENERATION_FAILED';
      updateData.completed_at = new Date().toISOString();

      console.error(`[Prediction Status] Generation failed:`, prediction.error);
    }

    // Update generation record
    const { data: updatedGeneration } = await supabase
      .from('ai_generations')
      .update(updateData)
      .eq('id', generation.id)
      .select()
      .single();

    // Update queue status if completed or failed
    if (prediction.status === 'succeeded' || prediction.status === 'failed') {
      await supabase
        .from('ai_generation_queue')
        .update({
          status: prediction.status === 'succeeded' ? 'completed' : 'failed',
          completed_at: new Date().toISOString(),
        })
        .eq('generation_id', generation.id);
    }

    return NextResponse.json({
      success: true,
      status: prediction.status,
      generation: updatedGeneration || generation,
      imageUrl: updateData.output_url,
      progress: prediction.status === 'processing' ? 50 : undefined,
    });
  } catch (error: any) {
    console.error('[Prediction Status] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to check prediction status',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate actual cost based on prediction time
 */
function calculateCost(predictTime: number): number {
  // Replicate charges per second of compute time
  // Approximate: $0.025 per image for FLUX.1-dev
  // More accurate calculation could be: (predictTime / 60) * costPerMinute
  return 0.025;
}
