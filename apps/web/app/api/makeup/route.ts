import { NextRequest, NextResponse } from 'next/server';

// Makeup API base URL (environment variable or default to localhost)
const MAKEUP_API_URL = process.env.MAKEUP_API_URL || 'http://localhost:8000';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout for makeup processing

/**
 * POST /api/makeup
 * Proxy endpoint for makeup try-on service
 */
export async function POST(request: NextRequest) {
  try {
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
      const errorText = await response.text();
      console.error('Makeup API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to process image', details: errorText },
        { status: response.status }
      );
    }

    // Get the result
    const result = await response.json();

    // Return the processed image
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in makeup API proxy:', error);

    // Check if the error is a timeout or connection issue
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          {
            error: 'Makeup service unavailable',
            details: 'The makeup processing service is not running. Please start it with: cd apps/api/makeup && docker-compose up',
          },
          { status: 503 }
        );
      }

      if (error.message.includes('timeout')) {
        return NextResponse.json(
          {
            error: 'Processing timeout',
            details: 'Image processing took too long. Try with a smaller image.',
          },
          { status: 504 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
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
    console.error('Error checking makeup API health:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
