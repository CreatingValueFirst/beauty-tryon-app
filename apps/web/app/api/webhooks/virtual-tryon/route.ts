/**
 * Virtual Try-On Webhook Handler
 * POST /api/webhooks/virtual-tryon
 * Handles async notifications when virtual try-on predictions complete
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client inside handler (not at module level)
    // This prevents build-time errors when env vars aren't available
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const body = await request.json();

    console.log('[Virtual TryOn Webhook] Received:', {
      id: body.id,
      status: body.status,
    });

    const { id: predictionId, status, output, error } = body;

    if (!predictionId) {
      return NextResponse.json(
        { error: 'Missing prediction ID' },
        { status: 400 }
      );
    }

    // Find try-on record
    const { data: tryOn, error: dbError } = await supabase
      .from('clothing_try_ons')
      .select('*')
      .eq('prediction_id', predictionId)
      .single();

    if (dbError || !tryOn) {
      console.error('[Virtual TryOn Webhook] Try-on not found:', predictionId);
      return NextResponse.json(
        { error: 'Try-on not found' },
        { status: 404 }
      );
    }

    // Update try-on based on status
    const updateData: any = {
      status,
    };

    if (status === 'succeeded' && output) {
      const imageUrl = Array.isArray(output) ? output[0] : output;

      updateData.result_image_url = imageUrl;
      updateData.completed_at = new Date().toISOString();

      console.log('[Virtual TryOn Webhook] Try-on succeeded:', imageUrl);

      // TODO: Send push notification to user
      // TODO: Update user's gallery
    } else if (status === 'failed') {
      updateData.error_message = error || 'Virtual try-on failed';
      updateData.completed_at = new Date().toISOString();

      console.error('[Virtual TryOn Webhook] Try-on failed:', error);
    } else if (status === 'processing' || status === 'starting') {
      updateData.status = 'processing';
    }

    // Update try-on record
    await supabase
      .from('clothing_try_ons')
      .update(updateData)
      .eq('id', tryOn.id);

    // Send real-time notification via Supabase Realtime (optional)
    // This would push updates to connected clients
    if (status === 'succeeded' || status === 'failed') {
      await supabase.from('clothing_try_ons').update({
        ...updateData,
        // This triggers Supabase Realtime
      }).eq('id', tryOn.id);
    }

    return NextResponse.json({
      success: true,
      status,
      tryon_id: tryOn.id,
    });
  } catch (error: any) {
    console.error('[Virtual TryOn Webhook] Error:', error);

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
