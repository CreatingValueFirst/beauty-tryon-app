import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Makeup API base URL (environment variable or default to localhost)
const MAKEUP_API_URL = process.env.MAKEUP_API_URL || 'http://localhost:8000';

// Image magic numbers (file signatures)
const IMAGE_SIGNATURES: { bytes: number[]; mask?: number[]; offset?: number; type: string }[] = [
  // JPEG: FF D8 FF
  { bytes: [0xFF, 0xD8, 0xFF], type: 'image/jpeg' },
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], type: 'image/png' },
  // GIF87a: 47 49 46 38 37 61
  { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], type: 'image/gif' },
  // GIF89a: 47 49 46 38 39 61
  { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], type: 'image/gif' },
  // WebP: RIFF....WEBP (bytes at offset 0 and 8)
  { bytes: [0x52, 0x49, 0x46, 0x46], type: 'image/webp' }, // RIFF header
  // BMP: 42 4D
  { bytes: [0x42, 0x4D], type: 'image/bmp' },
];

/**
 * Validates file content matches an allowed image type by checking magic numbers
 * @returns The detected MIME type if valid, null if invalid
 */
async function validateImageMagicNumber(file: File): Promise<string | null> {
  try {
    // Read first 12 bytes (enough for all signatures)
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check for WebP specifically (RIFF + WEBP)
    if (bytes.length >= 12) {
      const isRiff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
      const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
      if (isRiff && isWebp) {
        return 'image/webp';
      }
    }

    // Check other signatures
    for (const sig of IMAGE_SIGNATURES) {
      if (sig.type === 'image/webp') continue; // Already handled above

      const offset = sig.offset || 0;
      if (bytes.length < offset + sig.bytes.length) continue;

      let match = true;
      for (let i = 0; i < sig.bytes.length; i++) {
        const byte = bytes[offset + i];
        const expected = sig.bytes[i];
        const mask = sig.mask?.[i] ?? 0xFF;

        if ((byte & mask) !== expected) {
          match = false;
          break;
        }
      }

      if (match) {
        return sig.type;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout for makeup processing

/**
 * POST /api/makeup
 * Proxy endpoint for makeup try-on service
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get form data from request
    const formData = await request.formData();

    // Validate image file if present
    const imageFile = formData.get('image');
    if (imageFile instanceof File) {
      // Check file size (max 10MB)
      if (imageFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File too large', details: 'Image must be less than 10MB.' },
          { status: 400 }
        );
      }

      // Validate magic numbers - ensure file content matches claimed type
      const detectedType = await validateImageMagicNumber(imageFile);
      if (!detectedType) {
        return NextResponse.json(
          { error: 'Invalid file type', details: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP).' },
          { status: 400 }
        );
      }
    }

    // Forward the request to the makeup API
    const response = await fetch(`${MAKEUP_API_URL}/api/makeup/apply`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type - let fetch set it with the boundary
      },
    });

    if (!response.ok) {
      // Log full error for debugging (server-side only)
      const errorText = await response.text();
      console.error('Makeup API error:', errorText);

      // Return sanitized error (don't expose internal details)
      return NextResponse.json(
        { error: 'Failed to process image', details: 'The makeup service could not process your image. Please try a different photo.' },
        { status: response.status }
      );
    }

    // Get the result
    const result = await response.json();

    // Return the processed image
    return NextResponse.json(result);
  } catch (error) {
    // Log full error for debugging (server-side only)
    console.error('Error in makeup API proxy:', error);

    // Return sanitized error messages (don't expose internal details)
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        return NextResponse.json(
          {
            error: 'Makeup service unavailable',
            details: 'The makeup processing service is temporarily unavailable. Please try again later.',
          },
          { status: 503 }
        );
      }

      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        return NextResponse.json(
          {
            error: 'Processing timeout',
            details: 'Image processing took too long. Try with a smaller image.',
          },
          { status: 504 }
        );
      }
    }

    // Generic error - don't expose internal details
    return NextResponse.json(
      { error: 'Failed to process image', details: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/makeup/colors
 * Get available makeup colors and presets
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    // Check if requesting colors
    if (url.pathname.endsWith('/colors')) {
      const response = await fetch(`${MAKEUP_API_URL}/api/makeup/colors`);

      if (!response.ok) {
        throw new Error('Failed to fetch colors');
      }

      const colors = await response.json();
      return NextResponse.json(colors);
    }

    // Health check
    const response = await fetch(`${MAKEUP_API_URL}/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json({ status: 'unhealthy', error: 'Makeup service not responding' }, { status: 503 });
    }

    const health = await response.json();
    return NextResponse.json({
      status: 'healthy',
      service: 'makeup-api-proxy',
      upstream: health,
    });
  } catch (error) {
    // Log full error for debugging (server-side only)
    console.error('Error checking makeup API health:', error);

    // Return sanitized error (don't expose internal details)
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Makeup service is temporarily unavailable',
      },
      { status: 503 }
    );
  }
}
