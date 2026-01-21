import { NextResponse } from 'next/server';

const MAKEUP_API_URL = process.env.MAKEUP_API_URL || 'http://localhost:8000';

export const runtime = 'nodejs';

/**
 * GET /api/makeup/colors
 * Get available makeup colors and presets
 */
export async function GET() {
  try {
    const response = await fetch(`${MAKEUP_API_URL}/api/makeup/colors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch colors from makeup API');
    }

    const colors = await response.json();
    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error fetching makeup colors:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch colors',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
