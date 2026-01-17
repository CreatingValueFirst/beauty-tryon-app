#!/bin/bash

# BeautyTryOn Deployment Script
# Built by Save My Time
# https://savemytime.com

set -e

echo "🚀 Starting BeautyTryOn deployment..."
echo "Built by Save My Time"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Apply Supabase Migrations
echo -e "${BLUE}📊 Step 1: Applying Supabase migrations...${NC}"
echo ""

# Link to Supabase project
echo "Linking to Supabase project..."
supabase link --project-ref turepfhrembrjjkgsveq || echo "Already linked or manual linking required"

# Apply migrations
echo "Applying database migrations..."
echo "Please manually run these SQL files in Supabase dashboard:"
echo "1. supabase/migrations/001_initial_schema.sql"
echo "2. supabase/seed.sql"
echo ""
read -p "Press enter when migrations are applied..."

# Step 2: Deploy Edge Functions (optional)
echo -e "${BLUE}⚡ Step 2: Deploying Edge Functions (optional)...${NC}"
read -p "Deploy Edge Functions? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Deploying Edge Functions..."
    supabase functions deploy analyze-face || echo "Skipped analyze-face"
    supabase functions deploy generate-hair-style || echo "Skipped generate-hair-style"
    supabase functions deploy process-image || echo "Skipped process-image"
    echo -e "${GREEN}✅ Edge Functions deployed${NC}"
else
    echo "Skipping Edge Functions deployment"
fi
echo ""

# Step 3: Deploy to Vercel
echo -e "${BLUE}🌐 Step 3: Deploying to Vercel...${NC}"
echo ""

# Check if vercel is available
if ! command -v vercel &> /dev/null; then
    if ! command -v npx &> /dev/null; then
        echo "Error: vercel CLI not found. Installing locally..."
        npm install
    fi
    VERCEL_CMD="npx vercel"
else
    VERCEL_CMD="vercel"
fi

# Deploy to production
echo "Deploying to Vercel production..."
echo ""
echo "⚠️  Make sure you have configured environment variables in Vercel dashboard:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo ""
read -p "Press enter to continue with Vercel deployment..."

cd apps/web
$VERCEL_CMD --prod

echo ""
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo "📱 Your app is now live!"
echo ""
echo "🔗 Repository: https://github.com/CreatingValueFirst/beauty-tryon-app"
echo "🌐 Supabase: https://turepfhrembrjjkgsveq.supabase.co"
echo ""
echo "📝 Next steps:"
echo "1. Test your live application"
echo "2. Configure custom domain (optional)"
echo "3. Set up n8n workflows (optional)"
echo "4. Enable analytics (optional)"
echo ""
echo "Built with ❤️ by Save My Time"
echo "https://savemytime.com"
