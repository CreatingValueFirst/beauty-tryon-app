import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Makeup API base URL (environment variable or default to localhost)
const MAKEUP_API_URL = process.env.MAKEUP_API_URL || 'http://localhost:8000';

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
