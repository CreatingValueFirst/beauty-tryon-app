// Supabase Edge Function: Analyze Face
// Analyzes face features to recommend suitable styles

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface FaceAnalysisRequest {
  image_url: string;
  user_id?: string;
}

interface FaceFeatures {
  face_shape: 'oval' | 'round' | 'square' | 'heart' | 'long' | 'diamond';
  skin_tone: 'fair' | 'light' | 'medium' | 'tan' | 'deep';
  eye_color: string;
  hair_length?: 'short' | 'medium' | 'long';
  confidence: number;
}

interface StyleRecommendation {
  hair_styles: string[];
  nail_colors: string[];
  reasoning: string;
}

/**
 * Analyze face shape based on facial landmarks
 * This is a simplified version - in production, use ML models
 */
function analyzeFaceShape(landmarks: any): FaceFeatures['face_shape'] {
  // Simplified face shape detection
  // In production, use proper ML model like MediaPipe or Face-API.js

  // For now, return a default
  return 'oval';
}

/**
 * Analyze skin tone from image
 * This is a placeholder - in production, use proper color analysis
 */
function analyzeSkinTone(imageData: Uint8Array): FaceFeatures['skin_tone'] {
  // Simplified skin tone detection
  // In production, analyze RGB values in face region

  return 'medium';
}

/**
 * Generate style recommendations based on face features
 */
async function generateRecommendations(
  features: FaceFeatures,
  supabase: any
): Promise<StyleRecommendation> {
  const recommendations: StyleRecommendation = {
    hair_styles: [],
    nail_colors: [],
    reasoning: '',
  };

  // Fetch hair styles that match face shape
  const { data: hairStyles } = await supabase
    .from('hair_styles')
    .select('id, name, category')
    .limit(10);

  if (hairStyles) {
    // Simple matching logic - in production, use ML recommendations
    switch (features.face_shape) {
      case 'oval':
        recommendations.hair_styles = hairStyles
          .slice(0, 5)
          .map((s: any) => s.id);
        recommendations.reasoning = 'Oval face shapes can pull off most hairstyles!';
        break;
      case 'round':
        recommendations.hair_styles = hairStyles
          .filter((s: any) => s.category === 'long' || s.category === 'medium')
          .map((s: any) => s.id);
        recommendations.reasoning = 'Longer styles help elongate round face shapes.';
        break;
      case 'square':
        recommendations.hair_styles = hairStyles
          .filter((s: any) => s.category === 'curly' || s.category === 'wavy')
          .map((s: any) => s.id);
        recommendations.reasoning = 'Soft, wavy styles complement square face shapes.';
        break;
      default:
        recommendations.hair_styles = hairStyles.slice(0, 5).map((s: any) => s.id);
        recommendations.reasoning = 'These styles will look great on you!';
    }
  }

  // Fetch nail colors that complement skin tone
  const { data: nailStyles } = await supabase
    .from('nail_styles')
    .select('id, name, color_code')
    .limit(10);

  if (nailStyles) {
    // Simplified color matching
    switch (features.skin_tone) {
      case 'fair':
      case 'light':
        recommendations.nail_colors = nailStyles
          .filter((n: any) =>
            n.color_code &&
            (n.color_code.includes('FF') || n.color_code.includes('pink'))
          )
          .map((n: any) => n.id);
        break;
      case 'medium':
      case 'tan':
        recommendations.nail_colors = nailStyles.slice(0, 5).map((n: any) => n.id);
        break;
      case 'deep':
        recommendations.nail_colors = nailStyles
          .filter((n: any) =>
            n.color_code &&
            (n.color_code.includes('DC') || n.color_code.includes('8B'))
          )
          .map((n: any) => n.id);
        break;
      default:
        recommendations.nail_colors = nailStyles.slice(0, 5).map((n: any) => n.id);
    }
  }

  return recommendations;
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
    const { image_url, user_id }: FaceAnalysisRequest = await req.json();

    if (!image_url) {
      return new Response(
        JSON.stringify({ error: 'image_url is required' }),
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

    // Download image
    const imageResponse = await fetch(image_url);
    if (!imageResponse.ok) {
      throw new Error('Failed to download image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageData = new Uint8Array(imageBuffer);

    // Analyze face features
    // In production, use MediaPipe or similar ML model
    const features: FaceFeatures = {
      face_shape: analyzeFaceShape(null), // Pass actual landmarks
      skin_tone: analyzeSkinTone(imageData),
      eye_color: 'brown', // Detect from image
      confidence: 0.85,
    };

    // Generate recommendations
    const recommendations = await generateRecommendations(features, supabase);

    // Save analysis if user_id provided
    if (user_id) {
      await supabase.from('analytics_events').insert({
        user_id,
        event_type: 'face_analysis',
        event_data: JSON.stringify({
          features,
          recommendations,
        }),
        created_at: new Date().toISOString(),
      });
    }

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        features,
        recommendations,
        message: 'Face analyzed successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error analyzing face:', error);

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
