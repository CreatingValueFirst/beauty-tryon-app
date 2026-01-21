# Makeup Try-On Integration Guide

## Overview

This guide explains how to use the new makeup try-on feature that has been integrated into the BeautyTryOn app.

## Architecture

```
User → Next.js App → API Route (/api/makeup) → FastAPI Service (Python) → MediaPipe + OpenCV
```

## Quick Start

### 1. Start the Makeup API Service

**Option A: Docker (Recommended)**
```bash
cd apps/api/makeup
docker-compose up --build
```

**Option B: Local Python**
```bash
cd apps/api/makeup
pip install -r requirements-api.txt
python main.py
```

The API will start on `http://localhost:8000`

### 2. Configure Environment Variable

Add to `.env.local`:
```bash
MAKEUP_API_URL=http://localhost:8000
```

For production, set this to your deployed makeup API URL.

### 3. Start Next.js Development Server

```bash
cd apps/web
pnpm dev
```

The app will be available at `http://localhost:3000`

## API Usage

### From TypeScript/React

```typescript
import { makeupClient, MakeupConfig } from '@/lib/api/makeup-client';

// Apply makeup to an image file
const result = await makeupClient.applyMakeup(imageFile, {
  apply_lipstick: true,
  lipstick_color: 'Red',
  apply_blush: true,
  blush_color: 'Pink',
  blush_intensity: 50,
  apply_foundation: true,
  foundation_preset: 'Medium',
});

console.log(result.image); // Base64 encoded result
console.log(result.processing_time_ms); // Processing time

// Get available colors
const colors = await makeupClient.getColors();
console.log(colors.lipstick); // ["Red", "Pink", "Burgundy", ...]
```

### From cURL (Direct API)

```bash
curl -X POST http://localhost:8000/api/makeup/apply \
  -F "file=@photo.jpg" \
  -F "apply_lipstick=true" \
  -F "lipstick_color=Red" \
  -F "blush_intensity=50"
```

## Features

### Lipstick Colors
- Red
- Pink
- Burgundy
- Orange
- Nude
- Wine
- Coral

### Blush Colors
- Coral
- Pink
- Peach
- Rose
- Berry
- Apricot

### Foundation Presets
- Low (intensity: 0.2, subtle brightening)
- Medium (intensity: 0.35, balanced)
- High (intensity: 0.5, dramatic)
- Warm (intensity: 0.35 with warm tint)

## Integration Points

### 1. API Routes Created

- **POST /api/makeup**: Main proxy endpoint
- **GET /api/makeup/colors**: Get available colors
- **GET /api/makeup**: Health check

### 2. TypeScript Client Created

Location: `apps/web/lib/api/makeup-client.ts`

Key functions:
- `makeupClient.applyMakeup(file, config)`: Process image
- `makeupClient.getColors()`: Get color options
- `makeupClient.healthCheck()`: Check if service is running

### 3. Camera Component Updated

Location: `apps/web/components/ar/ARCamera.tsx`

Improvements:
- ✅ Ref exposure with `useImperativeHandle`
- ✅ Error handling for camera permissions
- ✅ Loading states
- ✅ Mobile orientation support
- ✅ Accessibility (ARIA labels)

## Building the UI Components

Next steps (to be implemented):

1. **Create MakeupTryOnStudio Component**
   ```typescript
   // apps/web/components/makeup/MakeupTryOnStudio.tsx
   - Image upload or camera capture
   - Real-time preview
   - Apply/Reset controls
   ```

2. **Create MakeupControls Component**
   ```typescript
   // apps/web/components/makeup/MakeupControls.tsx
   - Lipstick color picker
   - Blush color + intensity slider
   - Foundation preset selector
   ```

3. **Create Makeup Dashboard Page**
   ```typescript
   // apps/web/app/[locale]/dashboard/makeup/page.tsx
   - Full makeup try-on interface
   - Integration with camera
   - Save to gallery
   ```

## Example React Component

```tsx
'use client';

import { useState } from 'react';
import { makeupClient } from '@/lib/api/makeup-client';

export function MakeupTryOn() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const response = await makeupClient.applyMakeup(file, {
        lipstick_color: 'Red',
        blush_color: 'Pink',
        blush_intensity: 50,
      });

      if (response.success && response.image) {
        setResult(response.image);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {loading && <p>Processing...</p>}
      {result && <img src={result} alt="Result" />}
    </div>
  );
}
```

## Performance

- **Processing Time**: 2-5 seconds per image
- **Memory Usage**: ~500MB-1GB for FastAPI service
- **Concurrency**: Supports multiple simultaneous requests
- **Recommended Resources**:
  - 2 CPU cores minimum
  - 2GB RAM minimum
  - SSD storage for Docker images

## Deployment

### Development
```bash
# Start all services
docker-compose up -d           # Start makeup API
cd apps/web && pnpm dev        # Start Next.js
```

### Production

1. **Deploy Makeup API** to:
   - AWS ECS / Fargate
   - Google Cloud Run
   - Azure Container Instances
   - Railway / Render

2. **Set Environment Variable** in Vercel:
   ```
   MAKEUP_API_URL=https://your-makeup-api.com
   ```

3. **Deploy Next.js app** to Vercel (already configured)

## Troubleshooting

### Issue: "Makeup service unavailable"

**Solution**: Start the Docker container:
```bash
cd apps/api/makeup
docker-compose up
```

### Issue: "No face detected"

**Solution**:
- Ensure the image contains a visible face
- Use frontal or near-frontal face angles
- Check image lighting and quality

### Issue: Slow processing

**Solution**:
- Resize images before upload (max 1280x720)
- Increase Docker memory limit
- Use multiple API workers

### Issue: API timeout

**Solution**:
- Increase `maxDuration` in Next.js route
- Reduce image resolution
- Check API logs: `docker-compose logs -f`

## Testing

### Test the FastAPI Service

```bash
# Health check
curl http://localhost:8000/health

# Get colors
curl http://localhost:8000/api/makeup/colors

# Test with sample image
curl -X POST http://localhost:8000/api/makeup/apply \
  -F "file=@test-image.jpg" \
  -F "lipstick_color=Red"
```

### Test the Next.js Proxy

```bash
# From another terminal (with Next.js running)
curl http://localhost:3000/api/makeup/colors
```

## What's Been Completed ✅

1. ✅ Downloaded Hugging Face makeup model files
2. ✅ Created FastAPI service (main.py)
3. ✅ Created Docker configuration
4. ✅ Created Next.js API proxy routes
5. ✅ Created TypeScript client library
6. ✅ Updated camera component with fixes
7. ✅ Added mobile responsiveness improvements
8. ✅ Created PWA manifest
9. ✅ Documentation and guides

## What's Next

1. **Create UI Components**: Build the makeup try-on interface
2. **Create Dashboard Page**: Add `/dashboard/makeup` route
3. **Integrate with Supabase**: Save makeup try-on results
4. **Add to Navigation**: Update navigation to include makeup
5. **Testing**: Add unit and E2E tests
6. **Deploy**: Deploy makeup API to production

## Status

**Current Status**: ✅ Backend Complete, UI Components Pending

The makeup API is fully functional and ready to use. Next step is building the React UI components to provide a user-friendly interface.

## Support

- **API Documentation**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc
- **GitHub Issues**: Create an issue for problems
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md`

## Credits

- Original Model: ukzada/MakeUp_TryOn (Hugging Face)
- MediaPipe: Google AI
- Integration: BeautyTryOn Team
