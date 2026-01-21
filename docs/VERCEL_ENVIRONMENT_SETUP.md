# Vercel Environment Variables Setup Guide

## Current Issue

Preview deployments are failing because environment variables are only configured for the **Production** environment. They need to be added for **Preview** and **Development** environments as well.

## Required Environment Variables

The following environment variables need to be added to Preview and Development environments:

1. **NEXT_PUBLIC_SUPABASE_URL**
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
3. **SUPABASE_SERVICE_ROLE_KEY**
4. **NEXT_PUBLIC_APP_URL**

## Option 1: Via Vercel Dashboard (Recommended)

### Steps:

1. Go to [Vercel Dashboard - beautytry-on-app](https://vercel.com/infoheaveninteractive-2456s-projects/beautytry-on-app/settings/environment-variables)

2. For each environment variable:
   - Click "Add Another" or the existing variable to edit
   - Select **Preview** and **Development** environments (in addition to Production)
   - Save changes

3. Alternatively, you can copy existing Production variables:
   - Click on each variable
   - Check the boxes for "Preview" and "Development"
   - Save

4. Redeploy a preview branch to test

## Option 2: Via Vercel CLI

If you have access to the actual environment variable values, you can add them via CLI:

```bash
# Set Vercel token
export VERCEL_TOKEN=hRXBeIS70juttdqx1L3v8Yv7

# Add each variable for Preview environment
npx vercel env add NEXT_PUBLIC_SUPABASE_URL preview
# When prompted, enter the value: your-project-url.supabase.co

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
# When prompted, enter the value

npx vercel env add SUPABASE_SERVICE_ROLE_KEY preview
# When prompted, enter the value

npx vercel env add NEXT_PUBLIC_APP_URL preview
# When prompted, enter the value (e.g., https://beautytry-on-app-git-preview-team.vercel.app)

# Repeat for Development environment
npx vercel env add NEXT_PUBLIC_SUPABASE_URL development
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
npx vercel env add SUPABASE_SERVICE_ROLE_KEY development
npx vercel env add NEXT_PUBLIC_APP_URL development
```

## Option 3: Automated Script

Save this script as `scripts/setup-preview-env.sh`:

```bash
#!/bin/bash

# Vercel Environment Variables Setup Script
# This script adds environment variables for Preview and Development environments

set -e

echo "🔧 Setting up Vercel environment variables for Preview and Development..."

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: VERCEL_TOKEN is not set"
    echo "Please set it with: export VERCEL_TOKEN=your_token"
    exit 1
fi

# Function to add environment variable
add_env() {
    local name=$1
    local value=$2
    local environment=$3

    echo "📝 Adding $name to $environment environment..."
    echo "$value" | npx vercel env add "$name" "$environment" --yes
}

# Read values from production .env.local or prompt user
echo "Enter environment variable values:"

read -p "NEXT_PUBLIC_SUPABASE_URL: " SUPABASE_URL
read -p "NEXT_PUBLIC_SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
read -sp "SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_KEY
echo
read -p "NEXT_PUBLIC_APP_URL (Preview): " APP_URL_PREVIEW
read -p "NEXT_PUBLIC_APP_URL (Development): " APP_URL_DEV

# Add to Preview environment
echo ""
echo "🚀 Adding variables to Preview environment..."
add_env "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL" "preview"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "preview"
add_env "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_KEY" "preview"
add_env "NEXT_PUBLIC_APP_URL" "$APP_URL_PREVIEW" "preview"

# Add to Development environment
echo ""
echo "💻 Adding variables to Development environment..."
add_env "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL" "development"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "development"
add_env "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_KEY" "development"
add_env "NEXT_PUBLIC_APP_URL" "$APP_URL_DEV" "development"

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "Next steps:"
echo "1. Trigger a new preview deployment"
echo "2. Verify the deployment succeeds"
echo "3. Test the application functionality"
```

Make it executable and run:

```bash
chmod +x scripts/setup-preview-env.sh
export VERCEL_TOKEN=hRXBeIS70juttdqx1L3v8Yv7
./scripts/setup-preview-env.sh
```

## Verification

After adding the environment variables:

1. **Check variables are set:**
   ```bash
   npx vercel env ls
   ```
   You should see each variable listed with "Preview" and "Development" in the environments column.

2. **Trigger a preview deployment:**
   ```bash
   git checkout -b test-preview-env
   git commit --allow-empty -m "test: trigger preview deployment"
   git push origin test-preview-env
   ```

3. **Check deployment logs:**
   - Go to the Vercel dashboard
   - Find the preview deployment
   - Check the build logs
   - Verify no "supabaseUrl is required" errors

4. **Test the application:**
   - Visit the preview URL
   - Test camera functionality
   - Test hair/nail try-on features
   - Verify no runtime errors

## Common Issues

### Issue: "Environment variable not found during build"

**Solution:** Make sure to add variables to **both Preview and Development** environments, not just Preview.

### Issue: "supabaseUrl is required" error during build

**Cause:** The Supabase client is being instantiated at build time in API routes.

**Solution:** Refactor the Supabase initialization to be runtime-only:

```typescript
// ❌ Don't do this (builds immediately)
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, ...);

// ✅ Do this (lazy initialization)
let supabase: any = null;
function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, ...);
  }
  return supabase;
}
```

### Issue: "Different values needed for Preview vs Production"

**Solution:** Use different Supabase projects or feature flags:

- **Production:** Use production Supabase project
- **Preview:** Use staging Supabase project
- **Development:** Use local Supabase or development project

## Security Best Practices

1. **Never commit actual values to git**
   - Use `.env.local` for local development
   - Keep sensitive keys encrypted

2. **Use different keys for each environment**
   - Don't reuse production keys in preview/dev
   - Create separate Supabase projects if possible

3. **Rotate keys regularly**
   - Especially if they've been exposed
   - Update in Vercel dashboard

4. **Restrict service role key access**
   - Only use in server-side code
   - Never expose in client bundles

## Additional Environment Variables for Makeup Feature

When adding the makeup try-on feature, you'll need to add:

```bash
# Makeup API Service (to be added later)
MAKEUP_API_URL=https://makeup-api.yourdomain.com
MAKEUP_API_KEY=your-secret-api-key

# Optional: Hugging Face API (for fallback)
HUGGINGFACE_API_TOKEN=your-hf-token

# Performance Monitoring
SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Analytics
POSTHOG_API_KEY=your-posthog-key
POSTHOG_HOST=https://app.posthog.com
```

Add these to all three environments (Production, Preview, Development) following the same process.

## Status

- ✅ Project linked to Vercel
- ⏳ **ACTION REQUIRED:** Add environment variables for Preview/Development
- ⏳ Test preview deployment after setup

## Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/projects/environment-variables)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Project Settings](https://vercel.com/infoheaveninteractive-2456s-projects/beautytry-on-app/settings/environment-variables)
