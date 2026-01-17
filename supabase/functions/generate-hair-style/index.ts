// Supabase Edge Function: Generate Hair Style
// Generates custom hair styles using AI (premium feature)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface GenerateStyleRequest {
  user_id: string;
  prompt: string;
  base_image_url?: string;
  style_type: 'hair' | 'nails';
  settings?: {
    color?: string;
    length?: 'short' | 'medium' | 'long';
    texture?: 'straight' | 'wavy' | 'curly';
  };
}

interface GenerationResult {
  generated_url: string;
  prompt_used: string;
  model: string;
  generation_time: number;
}

/**
 * Check if user has premium access
 */
async function checkPremiumAccess(userId: string, supabase: any): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  return profile?.subscription_tier === 'premium';
}

/**
 * Generate hair style using AI
 * This is a placeholder - integrate with actual AI service (Replicate, Stability AI, etc.)
 */
async function generateHairStyle(
  prompt: string,
  baseImageUrl: string | undefined,
  settings: any
): Promise<GenerationResult> {
  const startTime = Date.now();

  // In production, call actual AI service
  // Example services:
  // - Replicate API (Stable Diffusion, ControlNet)
  // - Stability AI
  // - Hugging Face Inference API
  // - Custom trained model

  // Placeholder implementation
  // In real implementation, you would:
  /*
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'model-version-id',
      input: {
        prompt: enhancedPrompt,
        image: baseImageUrl,
        ...settings,
      },
    }),
  });
  */

  // For now, return mock data
  const mockResult: GenerationResult = {
    generated_url: baseImageUrl || 'https://placeholder.com/generated-style.jpg',
    prompt_used: `Professional ${prompt} hairstyle, realistic, high quality, detailed`,
    model: 'stable-diffusion-xl',
    generation_time: Date.now() - startTime,
  };

  return mockResult;
}

/**
 * Generate nail design using AI
 */
async function generateNailDesign(
  prompt: string,
  settings: any
): Promise<GenerationResult> {
  const startTime = Date.now();

  // Similar to hair generation, but optimized for nail art
  // Would use specialized prompts and models for nail designs

  const mockResult: GenerationResult = {
    generated_url: 'https://placeholder.com/generated-nails.jpg',
    prompt_used: `${prompt} nail art, manicure, detailed, professional photography`,
    model: 'stable-diffusion-xl',
    generation_time: Date.now() - startTime,
  };

  return mockResult;
}

/**
 * Enhance user prompt with better keywords
 */
function enhancePrompt(prompt: string, styleType: 'hair' | 'nails', settings: any): string {
  let enhanced = prompt;

  if (styleType === 'hair') {
    enhanced += ', professional hairstyle, salon quality, realistic hair texture';

    if (settings?.length) {
      enhanced += `, ${settings.length} hair`;
    }
    if (settings?.texture) {
      enhanced += `, ${settings.texture} hair`;
    }
    if (settings?.color) {
      enhanced += `, ${settings.color} color`;
    }
  } else {
    enhanced += ', nail art, manicure, professional nail polish, detailed';

    if (settings?.color) {
      enhanced += `, ${settings.color} nail polish`;
    }
  }

  // Add quality enhancers
  enhanced += ', high resolution, 4k, professional photography, well-lit';

  return enhanced;
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
      prompt,
      base_image_url,
      style_type,
      settings = {},
    }: GenerateStyleRequest = await req.json();

    // Validate input
    if (!user_id || !prompt || !style_type) {
      return new Response(
        JSON.stringify({ error: 'user_id, prompt, and style_type are required' }),
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

    // Check premium access
    const hasPremium = await checkPremiumAccess(user_id, supabase);
    if (!hasPremium) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Premium subscription required for AI generation',
          upgrade_url: '/upgrade',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Enhance prompt
    const enhancedPrompt = enhancePrompt(prompt, style_type, settings);

    // Generate style
    let result: GenerationResult;
    if (style_type === 'hair') {
      result = await generateHairStyle(enhancedPrompt, base_image_url, settings);
    } else {
      result = await generateNailDesign(enhancedPrompt, settings);
    }

    // Save to database
    const { data: savedStyle, error: saveError } = await supabase
      .from(style_type === 'hair' ? 'hair_styles' : 'nail_styles')
      .insert({
        name: prompt,
        description: `AI Generated: ${prompt}`,
        category: 'ai-generated',
        color_base: settings.color,
        texture_url: result.generated_url,
        is_premium: true,
        tags: ['ai-generated', 'custom'],
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving generated style:', saveError);
    }

    // Log analytics
    await supabase.from('analytics_events').insert({
      user_id,
      event_type: 'ai_generation',
      event_data: JSON.stringify({
        style_type,
        prompt,
        enhanced_prompt: enhancedPrompt,
        generation_time: result.generation_time,
        model: result.model,
      }),
      created_at: new Date().toISOString(),
    });

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        style_id: savedStyle?.id,
        generated_url: result.generated_url,
        prompt_used: result.prompt_used,
        generation_time: result.generation_time,
        message: 'Style generated successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating style:', error);

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
