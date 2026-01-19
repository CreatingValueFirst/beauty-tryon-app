/**
 * Virtual Try-On Generation API Endpoint
 * POST /api/virtual-tryon/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  generateVirtualTryOn,
  validateTryOnImages,
  estimateTryOnCost,
  type TryOnModelType,
  type GarmentCategory,
} from '@/lib/ai/virtual-tryon-client';
import { AIGenerationError, ERROR_CODES } from '@/lib/ai/utils/error-handler';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

interface GenerateRequest {
  personImageUrl: string;
  garmentImageUrl: string;
  clothingItemId?: string;
  modelType?: TryOnModelType;
  category?: GarmentCategory;
  seed?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateRequest = await request.json();
    const {
      personImageUrl,
      garmentImageUrl,
      clothingItemId,
      modelType = 'IDM_VTON',
      category = 'upperbody',
      seed,
    } = body;

    // Validate required fields
    if (!personImageUrl || !garmentImageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: personImageUrl and garmentImageUrl' },
        { status: 400 }
      );
    }

    // Validate image URLs
    const validation = validateTryOnImages(personImageUrl, garmentImageUrl);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
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
        {
          error: ERROR_CODES.UNAUTHORIZED.message,
          code: ERROR_CODES.UNAUTHORIZED.code,
        },
        { status: 401 }
      );
    }

    // Check user quota for virtual try-on
    const { data: quotaCheck } = await supabase.rpc(
      'check_and_increment_quota',
      {
        p_user_id: user.id,
      }
    );

    if (!quotaCheck) {
      return NextResponse.json(
        {
          error: 'Virtual try-on quota exceeded. Please upgrade your plan.',
          code: ERROR_CODES.RATE_LIMIT_EXCEEDED.code,
        },
        { status: 429 }
      );
    }

    // Generate webhook URL for async completion
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/virtual-tryon`;

    // Call Replicate API to start virtual try-on
    console.log('[Virtual TryOn] Starting generation with', modelType);

    const prediction = await generateVirtualTryOn({
      personImageUrl,
      garmentImageUrl,
      modelType,
      category,
      seed,
      webhookUrl,
    });

    // Create try-on record in database
    const { data: tryOn, error: dbError } = await supabase
      .from('clothing_try_ons')
      .insert({
        user_id: user.id,
        clothing_item_id: clothingItemId || null,
        person_image_url: personImageUrl,
        garment_image_url: garmentImageUrl,
        prediction_id: prediction.id,
        model_type: modelType,
        seed,
        status: 'pending',
        metadata: {
          category,
          estimated_time: prediction.estimatedTime,
          model_name: prediction.modelName,
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Virtual TryOn] Database error:', dbError);
      throw new AIGenerationError(
        'Failed to create try-on record',
        'DATABASE_ERROR',
        false,
        500
      );
    }

    // Increment clothing item try-on count if applicable
    if (clothingItemId) {
      await supabase.rpc('increment_clothing_tryon_count', {
        clothing_id: clothingItemId,
      });
    }

    return NextResponse.json({
      success: true,
      tryOn,
      predictionId: prediction.id,
      status: prediction.status,
      estimatedCost: estimateTryOnCost(modelType),
      estimatedTime: prediction.estimatedTime,
    });
  } catch (error: any) {
    console.error('[Virtual TryOn] Error:', error);

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
        details: error.message,
      },
      { status: 500 }
    );
  }
}
