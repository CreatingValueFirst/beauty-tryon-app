// Supabase Edge Function: Process Image
// Server-side image processing for try-on results

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ProcessImageRequest {
  user_id: string;
  image_data: string; // Base64 encoded image
  operation: 'resize' | 'watermark' | 'optimize' | 'composite';
  settings?: {
    width?: number;
    height?: number;
    quality?: number;
    watermark_text?: string;
    overlay_url?: string;
  };
}

interface ProcessedImage {
  url: string;
  size: number;
  width: number;
  height: number;
  format: string;
}

/**
 * Resize image
 * In production, use Sharp or ImageMagick
 */
async function resizeImage(
  imageData: Uint8Array,
  width: number,
  height: number
): Promise<Uint8Array> {
  // Placeholder - in production, use Sharp or similar
  // Example with Sharp (if available in Deno):
  /*
  import sharp from 'npm:sharp@0.32.0';

  const resized = await sharp(imageData)
    .resize(width, height, { fit: 'inside' })
    .toBuffer();

  return new Uint8Array(resized);
  */

  // For now, return original
  return imageData;
}

/**
 * Add watermark to image
 */
async function addWatermark(
  imageData: Uint8Array,
  text: string
): Promise<Uint8Array> {
  // Placeholder - in production, use Sharp with composite
  /*
  import sharp from 'npm:sharp@0.32.0';

  const watermark = await sharp({
    text: {
      text: text,
      font: 'Arial',
      rgba: true,
      dpi: 300
    }
  }).toBuffer();

  const watermarked = await sharp(imageData)
    .composite([{
      input: watermark,
      gravity: 'southeast'
    }])
    .toBuffer();

  return new Uint8Array(watermarked);
  */

  return imageData;
}

/**
 * Optimize image (compression, format conversion)
 */
async function optimizeImage(
  imageData: Uint8Array,
  quality: number = 85
): Promise<Uint8Array> {
  // Placeholder - in production, use Sharp
  /*
  import sharp from 'npm:sharp@0.32.0';

  const optimized = await sharp(imageData)
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  return new Uint8Array(optimized);
  */

  return imageData;
}

/**
 * Composite overlay onto base image
 */
async function compositeImages(
  baseImage: Uint8Array,
  overlayUrl: string
): Promise<Uint8Array> {
  // Download overlay
  const overlayResponse = await fetch(overlayUrl);
  const overlayBuffer = await overlayResponse.arrayBuffer();
  const overlayData = new Uint8Array(overlayBuffer);

  // Placeholder - in production, use Sharp
  /*
  import sharp from 'npm:sharp@0.32.0';

  const composited = await sharp(baseImage)
    .composite([{
      input: overlayData,
      blend: 'over'
    }])
    .toBuffer();

  return new Uint8Array(composited);
  */

  return baseImage;
}

/**
 * Upload processed image to Supabase Storage
 */
async function uploadToStorage(
  imageData: Uint8Array,
  userId: string,
  fileName: string,
  supabase: any
): Promise<string> {
  const bucket = 'try-ons';
  const path = `${userId}/${fileName}`;

  // Upload to storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, imageData, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Get image metadata
 */
function getImageMetadata(imageData: Uint8Array) {
  // Placeholder - in production, use Sharp or similar
  /*
  import sharp from 'npm:sharp@0.32.0';

  const metadata = await sharp(imageData).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: imageData.length
  };
  */

  return {
    width: 1920,
    height: 1080,
    format: 'jpeg',
    size: imageData.length,
  };
}

/**
 * Main handler
 */
serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request
    const {
      user_id,
      image_data,
      operation,
      settings = {},
    }: ProcessImageRequest = await req.json();

    // Validate input
    if (!user_id || !image_data || !operation) {
      return new Response(
        JSON.stringify({ error: 'user_id, image_data, and operation are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Decode base64 image
    const imageBuffer = Uint8Array.from(atob(image_data), (c) => c.charCodeAt(0));
    let processedImage = imageBuffer;

    // Process image based on operation
    const startTime = Date.now();

    switch (operation) {
      case 'resize':
        processedImage = await resizeImage(
          imageBuffer,
          settings.width || 1920,
          settings.height || 1080
        );
        break;

      case 'watermark':
        processedImage = await addWatermark(
          imageBuffer,
          settings.watermark_text || 'BeautyTryOn'
        );
        break;

      case 'optimize':
        processedImage = await optimizeImage(
          imageBuffer,
          settings.quality || 85
        );
        break;

      case 'composite':
        if (!settings.overlay_url) {
          throw new Error('overlay_url required for composite operation');
        }
        processedImage = await compositeImages(
          imageBuffer,
          settings.overlay_url
        );
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    const processingTime = Date.now() - startTime;

    // Get metadata
    const metadata = getImageMetadata(processedImage);

    // Upload to storage
    const fileName = `processed_${Date.now()}.jpg`;
    const url = await uploadToStorage(processedImage, user_id, fileName, supabase);

    // Log analytics
    await supabase.from('analytics_events').insert({
      user_id,
      event_type: 'image_processed',
      event_data: JSON.stringify({
        operation,
        processing_time: processingTime,
        original_size: imageBuffer.length,
        processed_size: processedImage.length,
        compression_ratio: (1 - processedImage.length / imageBuffer.length) * 100,
      }),
      created_at: new Date().toISOString(),
    });

    // Return response
    const result: ProcessedImage = {
      url,
      size: metadata.size,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    };

    return new Response(
      JSON.stringify({
        success: true,
        result,
        processing_time: processingTime,
        message: 'Image processed successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing image:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
