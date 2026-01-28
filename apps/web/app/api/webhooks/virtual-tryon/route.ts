/**
 * Virtual Try-On Webhook Handler
 * POST /api/webhooks/virtual-tryon
 * Handles async notifications when virtual try-on predictions complete
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * Verify Replicate webhook signature
 * https://replicate.com/docs/webhooks#verifying-webhooks
 */
function verifyWebhookSignature(
  body: string,
  webhookId: string | null,
  webhookTimestamp: string | null,
  webhookSignature: string | null
): boolean {
  const webhookSecret = process.env.REPLICATE_WEBHOOK_SECRET;

  // If no secret configured, skip verification (development mode)
  if (!webhookSecret) {
    console.warn('[Webhook] No REPLICATE_WEBHOOK_SECRET configured - skipping signature verification');
    return true;
  }

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    console.error('[Webhook] Missing signature headers');
    return false;
  }

  // Check timestamp is within 5 minutes
  const timestamp = parseInt(webhookTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    console.error('[Webhook] Timestamp too old');
    return false;
  }

  // Compute expected signature
  const signedPayload = `${webhookId}.${webhookTimestamp}.${body}`;
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(signedPayload)
    .digest('base64');

  // Compare signatures
  const signatures = webhookSignature.split(',');
  return signatures.some((sig) => {
    const [version, signature] = sig.split('=');
    return version === 'v1' && signature === expectedSignature;
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const bodyText = await request.text();

    // Verify webhook signature
    const webhookId = request.headers.get('webhook-id');
    const webhookTimestamp = request.headers.get('webhook-timestamp');
    const webhookSignature = request.headers.get('webhook-signature');

    if (!verifyWebhookSignature(bodyText, webhookId, webhookTimestamp, webhookSignature)) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

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

    const body = JSON.parse(bodyText);

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

    // Update try-on record (single atomic update - no race condition)
    const { error: updateError } = await supabase
      .from('clothing_try_ons')
      .update(updateData)
      .eq('id', tryOn.id)
      .eq('status', tryOn.status); // Optimistic locking - only update if status hasn't changed

    if (updateError) {
      // Check if it was a race condition (status already updated)
      const { data: currentTryOn } = await supabase
        .from('clothing_try_ons')
        .select('status')
        .eq('id', tryOn.id)
        .single();

      if (currentTryOn?.status === 'succeeded' || currentTryOn?.status === 'failed') {
        // Already processed by another webhook call - this is fine
        console.log('[Virtual TryOn Webhook] Already processed, skipping duplicate');
        return NextResponse.json({
          success: true,
          status: currentTryOn.status,
          tryon_id: tryOn.id,
          duplicate: true,
        });
      }

      throw updateError;
    }

    // Supabase Realtime will automatically notify connected clients
    // when the clothing_try_ons table is updated (if Realtime is enabled)

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
