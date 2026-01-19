/**
 * Virtual Try-On Prediction Status API Endpoint
 * GET /api/virtual-tryon/predictions/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getVirtualTryOnStatus } from '@/lib/ai/virtual-tryon-client';

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

    // Get try-on record from database
    const { data: tryOn, error: dbError } = await supabase
      .from('clothing_try_ons')
      .select('*')
      .eq('prediction_id', predictionId)
      .eq('user_id', user.id)
      .single();

    if (dbError || !tryOn) {
      return NextResponse.json(
        { error: 'Virtual try-on not found' },
        { status: 404 }
      );
    }

    // If already completed, return cached result
    if (tryOn.status === 'completed' && tryOn.result_image_url) {
      return NextResponse.json({
        success: true,
        status: 'completed',
        tryOn,
        imageUrl: tryOn.result_image_url,
      });
    }

    // If failed, return error
    if (tryOn.status === 'failed') {
      return NextResponse.json({
        success: false,
        status: 'failed',
        tryOn,
        error: tryOn.error_message,
      });
    }

    // Check Replicate API for current status
    console.log(`[Virtual TryOn Status] Checking prediction ${predictionId}`);

    const prediction = await getVirtualTryOnStatus(predictionId);

    // Update database with latest status
    const updateData: any = {
      status: prediction.status,
    };

    if (prediction.status === 'succeeded' && prediction.output) {
      // IDM-VTON and OOTDiffusion return image URL in output
      const imageUrl = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;

      updateData.result_image_url = imageUrl;
      updateData.completed_at = new Date().toISOString();

      console.log(`[Virtual TryOn Status] Try-on completed: ${imageUrl}`);
    } else if (prediction.status === 'failed') {
      updateData.error_message = prediction.error || 'Virtual try-on failed';
      updateData.completed_at = new Date().toISOString();

      console.error(`[Virtual TryOn Status] Try-on failed:`, prediction.error);
    }

    // Update try-on record
    const { data: updatedTryOn } = await supabase
      .from('clothing_try_ons')
      .update(updateData)
      .eq('id', tryOn.id)
      .select()
      .single();

    return NextResponse.json({
      success: true,
      status: prediction.status,
      tryOn: updatedTryOn || tryOn,
      imageUrl: updateData.result_image_url,
      progress: prediction.status === 'processing' ? 50 : undefined,
      logs: prediction.logs,
    });
  } catch (error: any) {
    console.error('[Virtual TryOn Status] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to check prediction status',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
