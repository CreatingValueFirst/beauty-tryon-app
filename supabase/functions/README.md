# Supabase Edge Functions

This directory contains Deno-based Edge Functions for the BeautyTryOn application.

## 📋 Functions Overview

### 1. `analyze-face`
Analyzes facial features and provides style recommendations.

**Endpoint:** `https://your-project.supabase.co/functions/v1/analyze-face`

**Request:**
```json
{
  "image_url": "https://example.com/face.jpg",
  "user_id": "optional-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "features": {
    "face_shape": "oval",
    "skin_tone": "medium",
    "eye_color": "brown",
    "confidence": 0.85
  },
  "recommendations": {
    "hair_styles": ["style-id-1", "style-id-2"],
    "nail_colors": ["color-id-1", "color-id-2"],
    "reasoning": "Oval face shapes can pull off most hairstyles!"
  }
}
```

**Use Cases:**
- Onboarding flow to suggest initial styles
- "Find Your Perfect Look" feature
- Personalized style recommendations

### 2. `generate-hair-style`
Generates custom hair styles using AI (Premium feature).

**Endpoint:** `https://your-project.supabase.co/functions/v1/generate-hair-style`

**Request:**
```json
{
  "user_id": "user-uuid",
  "prompt": "vibrant purple bob with pink highlights",
  "base_image_url": "optional-base-image",
  "style_type": "hair",
  "settings": {
    "color": "purple",
    "length": "short",
    "texture": "straight"
  }
}
```

**Response:**
```json
{
  "success": true,
  "style_id": "generated-style-uuid",
  "generated_url": "https://storage.supabase.co/...",
  "prompt_used": "Professional vibrant purple bob...",
  "generation_time": 3500,
  "message": "Style generated successfully"
}
```

**Premium Check:**
- Automatically checks user subscription tier
- Returns 403 if user is not premium
- Includes upgrade URL in error response

### 3. `process-image`
Server-side image processing for try-on results.

**Endpoint:** `https://your-project.supabase.co/functions/v1/process-image`

**Request:**
```json
{
  "user_id": "user-uuid",
  "image_data": "base64-encoded-image-data",
  "operation": "resize",
  "settings": {
    "width": 1920,
    "height": 1080,
    "quality": 85,
    "watermark_text": "BeautyTryOn",
    "overlay_url": "optional-overlay-url"
  }
}
```

**Operations:**
- `resize`: Resize image to specified dimensions
- `watermark`: Add text watermark
- `optimize`: Compress and optimize quality
- `composite`: Overlay another image

**Response:**
```json
{
  "success": true,
  "result": {
    "url": "https://storage.supabase.co/...",
    "size": 245678,
    "width": 1920,
    "height": 1080,
    "format": "jpeg"
  },
  "processing_time": 1200
}
```

## 🚀 Setup & Deployment

### Prerequisites

1. Install Supabase CLI:
```bash
brew install supabase/tap/supabase
# or
npm install -g supabase
```

2. Install Deno (required for local development):
```bash
curl -fsSL https://deno.land/x/install/install.sh | sh
```

### Local Development

1. Start Supabase locally:
```bash
cd /Users/carpediem/beauty-tryon-app
supabase start
```

2. Serve functions locally:
```bash
supabase functions serve
```

3. Test a function:
```bash
curl -X POST http://localhost:54321/functions/v1/analyze-face \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"image_url": "https://example.com/test.jpg"}'
```

### Deploy to Production

1. Link to your Supabase project:
```bash
supabase link --project-ref your-project-ref
```

2. Deploy all functions:
```bash
supabase functions deploy
```

3. Deploy a specific function:
```bash
supabase functions deploy analyze-face
supabase functions deploy generate-hair-style
supabase functions deploy process-image
```

### Set Environment Variables

```bash
# Set secrets for functions
supabase secrets set REPLICATE_API_TOKEN=your_replicate_token
supabase secrets set OPENAI_API_KEY=your_openai_key

# Verify secrets
supabase secrets list
```

## 🔧 Configuration

### deno.json
Each function uses a shared Deno configuration. See `/supabase/functions/deno.json`.

### Environment Variables

Functions have access to these environment variables:

- `SUPABASE_URL` - Auto-injected
- `SUPABASE_ANON_KEY` - Auto-injected
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-injected
- Custom secrets (set via `supabase secrets set`)

### CORS

All functions include CORS headers for browser access:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

## 🧪 Testing

### Unit Testing

Create test files in each function directory:

```typescript
// supabase/functions/analyze-face/test.ts
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

Deno.test('analyzeFaceShape returns valid shape', () => {
  const shape = analyzeFaceShape(mockLandmarks);
  assertEquals(['oval', 'round', 'square', 'heart', 'long', 'diamond'].includes(shape), true);
});
```

Run tests:
```bash
deno test supabase/functions/analyze-face/test.ts
```

### Integration Testing

Test deployed functions:

```bash
# Test analyze-face
curl -X POST https://your-project.supabase.co/functions/v1/analyze-face \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/test.jpg"}'

# Test generate-hair-style (requires premium user)
curl -X POST https://your-project.supabase.co/functions/v1/generate-hair-style \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "prompt": "purple bob haircut",
    "style_type": "hair"
  }'

# Test process-image
curl -X POST https://your-project.supabase.co/functions/v1/process-image \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "image_data": "base64-encoded-data",
    "operation": "resize",
    "settings": {"width": 800, "height": 600}
  }'
```

## 📊 Monitoring

### View Logs

```bash
# View real-time logs
supabase functions logs

# View logs for specific function
supabase functions logs analyze-face

# Filter by time
supabase functions logs --since 1h
```

### Error Tracking

All functions log errors to:
1. Supabase function logs (viewable in dashboard)
2. Console output (accessible via CLI)

Recommended: Integrate with Sentry or similar service for production monitoring.

## 🔐 Security

### Authentication

Functions can access user authentication:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_ANON_KEY'),
  {
    global: {
      headers: { Authorization: req.headers.get('Authorization')! }
    }
  }
);

// Get authenticated user
const { data: { user } } = await supabase.auth.getUser();
```

### Rate Limiting

Implement rate limiting for expensive operations:

```typescript
// Example: Limit AI generation to 10 per hour per user
const { count } = await supabase
  .from('analytics_events')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user_id)
  .eq('event_type', 'ai_generation')
  .gte('created_at', new Date(Date.now() - 3600000).toISOString());

if (count >= 10) {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded' }),
    { status: 429 }
  );
}
```

### Input Validation

Always validate input:

```typescript
// Validate UUID format
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(user_id)) {
  throw new Error('Invalid user_id format');
}

// Validate image URLs
if (image_url && !image_url.startsWith('https://')) {
  throw new Error('Invalid image URL');
}

// Sanitize text input
const sanitizedPrompt = prompt.trim().substring(0, 500);
```

## 🎯 Best Practices

### Performance

1. **Use streaming for large responses:**
```typescript
return new Response(
  new ReadableStream({
    async start(controller) {
      // Stream data in chunks
      controller.enqueue(encoder.encode(chunk));
      controller.close();
    }
  })
);
```

2. **Implement caching:**
```typescript
// Cache style recommendations
const cacheKey = `recommendations:${user_id}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

3. **Optimize database queries:**
```typescript
// Use select() to limit fields
.select('id, name, category')
// Use limit() to restrict results
.limit(10)
// Use indexes for better performance
.eq('indexed_column', value)
```

### Error Handling

```typescript
try {
  // Function logic
} catch (error) {
  console.error('Error in function:', error);

  // Don't expose internal errors to client
  const userMessage = error.message.includes('API')
    ? 'External service error'
    : 'Internal server error';

  return new Response(
    JSON.stringify({ success: false, error: userMessage }),
    { status: 500, headers: corsHeaders }
  );
}
```

### Logging

```typescript
// Structured logging
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  function: 'analyze-face',
  user_id,
  action: 'face_analyzed',
  duration: processingTime
}));
```

## 🔄 Integrating with AI Services

### Replicate (Recommended)

```typescript
// In generate-hair-style function
const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    version: 'stability-ai/sdxl:...',
    input: {
      prompt: enhancedPrompt,
      negative_prompt: 'blurry, low quality',
      num_outputs: 1,
    },
  }),
});

const prediction = await response.json();
```

### Stability AI

```typescript
const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('STABILITY_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text_prompts: [{ text: prompt }],
    cfg_scale: 7,
    height: 1024,
    width: 1024,
    steps: 30,
  }),
});
```

## 📝 Notes

- Edge Functions run on Deno, not Node.js
- Use ES modules (import/export, not require)
- Most npm packages work via esm.sh CDN
- Functions have a 60-second timeout by default
- Maximum payload size is 2MB for requests/responses
- For larger payloads, use signed URLs to Supabase Storage

## 🆘 Troubleshooting

**Function not responding:**
- Check if function is deployed: `supabase functions list`
- View logs: `supabase functions logs function-name`
- Verify CORS headers are set

**Permission denied:**
- Check RLS policies on tables being accessed
- Verify service role key is used for admin operations
- Ensure proper Authorization header is passed

**Timeout errors:**
- Optimize database queries
- Use async processing for long-running tasks
- Consider moving to background job queue

**Import errors:**
- Use esm.sh for npm packages: `import X from 'https://esm.sh/package'`
- Check Deno compatibility of packages
- Some packages may need Deno-specific alternatives
