/**
 * Replicate Webhook Handler
 * POST /api/webhooks/replicate
 * Handles async notifications when predictions complete
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { imageCache } from '@/lib/ai/utils/cache';

export const runtime = 'nodejs';

// Use service role client for webhook (bypasses RLS)
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

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (optional but recommended)
    // const signature = request.headers.get('webhook-signature');
    // if (!verifySignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const body = await request.json();

    console.log('[Replicate Webhook] Received:', {
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

    // Find generation record
    const { data: generation, error: dbError } = await supabase
      .from('ai_generations')
      .select('*')
      .eq('prediction_id', predictionId)
      .single();

    if (dbError || !generation) {
      console.error('[Replicate Webhook] Generation not found:', predictionId);
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      );
    }

    // Update generation based on status
    const updateData: any = {
      status,
    };

    if (status === 'succeeded' && output) {
      const imageUrl = Array.isArray(output) ? output[0] : output;

      updateData.output_url = imageUrl;
      updateData.completed_at = new Date().toISOString();
      updateData.actual_cost = body.metrics?.predict_time
        ? calculateCost(body.metrics.predict_time)
        : generation.estimated_cost;

      // Cache the result
      await imageCache.set(
        generation.prompt,
        generation.model_type,
        generation.quality,
        imageUrl,
        generation.width || 1024,
        generation.height || 1024
      );

      console.log('[Replicate Webhook] Generation succeeded:', imageUrl);

      // Update queue status
      await supabase
        .from('ai_generation_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('generation_id', generation.id);
    } else if (status === 'failed') {
      updateData.error_message = error || 'Generation failed';
      updateData.error_code = 'GENERATION_FAILED';
      updateData.completed_at = new Date().toISOString();

      console.error('[Replicate Webhook] Generation failed:', error);

      // Update queue status
      await supabase
        .from('ai_generation_queue')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
        })
        .eq('generation_id', generation.id);

      // Check if we should retry
      const { data: queueItem } = await supabase
        .from('ai_generation_queue')
        .select('retry_count, max_retries')
        .eq('generation_id', generation.id)
        .single();

      if (
        queueItem &&
        queueItem.retry_count < (queueItem.max_retries || 3)
      ) {
        console.log(
          `[Replicate Webhook] Scheduling retry ${queueItem.retry_count + 1}`
        );

        await supabase
          .from('ai_generation_queue')
          .update({
            retry_count: queueItem.retry_count + 1,
            status: 'pending',
          })
          .eq('generation_id', generation.id);

        // TODO: Trigger retry via queue processor
      }
    } else if (status === 'processing' || status === 'starting') {
      updateData.status = 'processing';

      if (!generation.started_at) {
        updateData.started_at = new Date().toISOString();
      }
    }

    // Update generation record
    await supabase
      .from('ai_generations')
      .update(updateData)
      .eq('id', generation.id);

    // TODO: Send real-time notification to user via Supabase Realtime
    // if (status === 'succeeded' || status === 'failed') {
    //   await supabase
    //     .from('notifications')
    //     .insert({
    //       user_id: generation.user_id,
    //       type: status === 'succeeded' ? 'generation_complete' : 'generation_failed',
    //       data: { generation_id: generation.id, image_url: updateData.output_url }
    //     });
    // }

    return NextResponse.json({
      success: true,
      status,
      generation_id: generation.id,
    });
  } catch (error: any) {
    console.error('[Replicate Webhook] Error:', error);

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

function calculateCost(predictTime: number): number {
  // Replicate charges per second
  // FLUX.1-dev: approximately $0.025 per generation
  return 0.025;
}
