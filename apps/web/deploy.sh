#!/bin/bash

##############################################
# BeautyTryOn - Complete Deployment Script
##############################################

set -e  # Exit on error

echo "🚀 BeautyTryOn - Live Deployment Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Verify environment variables
echo -e "${BLUE}📋 Step 1: Verifying environment variables...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local file not found!${NC}"
    exit 1
fi

# Check required variables
source .env.local
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$REPLICATE_API_TOKEN" ]; then
    echo -e "${RED}❌ Missing required environment variables${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo "   Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "   Replicate: ${REPLICATE_API_TOKEN:0:10}..."
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}📦 Step 2: Installing dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Build application
echo -e "${BLUE}🔨 Step 3: Building production bundle...${NC}"
npm run build 2>&1 | tail -20
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 4: Database migrations (manual step)
echo -e "${YELLOW}⚠️  Step 4: Database Migrations (MANUAL REQUIRED)${NC}"
echo ""
echo "Please apply these migrations in Supabase Dashboard:"
echo "👉 https://supabase.com/dashboard → SQL Editor"
echo ""
echo "1️⃣  Migration 004 - AI Features:"
echo "   File: supabase/migrations/004_ai_features.sql"
echo "   Tables: ai_generations, ai_generation_queue, image_cache, user_generation_quotas"
echo ""
echo "2️⃣  Migration 005 - Virtual Try-On:"
echo "   File: supabase/migrations/005_virtual_tryon_clothing.sql"
echo "   Tables: clothing_categories, clothing_items, clothing_try_ons, clothing_uploads"
echo ""
read -p "Press ENTER after applying migrations to continue..."
echo ""

# Step 5: Create storage bucket (instructions)
echo -e "${YELLOW}⚠️  Step 5: Storage Bucket (MANUAL REQUIRED)${NC}"
echo ""
echo "Create storage bucket in Supabase:"
echo "👉 https://supabase.com/dashboard → Storage → New bucket"
echo ""
echo "Bucket name: virtual-tryon"
echo "Public: YES"
echo "File size limit: 10 MB"
echo "Allowed MIME types: image/jpeg, image/png, image/webp"
echo ""
read -p "Press ENTER after creating bucket to continue..."
echo ""

# Step 6: Deploy to Vercel
echo -e "${BLUE}🚀 Step 6: Deploying to Vercel...${NC}"
echo ""

# Check if project is linked
if [ ! -d ".vercel" ]; then
    echo "First-time deployment detected."
    echo "Please follow Vercel CLI prompts to link/create project."
    echo ""
fi

# Deploy with environment variables
echo "Deploying to production..."
npx vercel --prod \
    -e NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
    -e NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    -e SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
    -e REPLICATE_API_TOKEN="$REPLICATE_API_TOKEN" \
    -e NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
echo ""

# Step 7: Post-deployment verification
echo -e "${BLUE}🔍 Step 7: Post-Deployment Checklist${NC}"
echo ""
echo "✅ Verify deployment at your Vercel URL"
echo "✅ Test multi-language support (switch languages)"
echo "✅ Test AI nail generation (/dashboard/nails)"
echo "✅ Test virtual try-on (/dashboard/clothing-tryon)"
echo "✅ Test on mobile device"
echo ""

echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}=======================================${NC}"
echo ""
echo "📚 Documentation:"
echo "   - Deployment Guide: DEPLOYMENT_GUIDE.md"
echo "   - Implementation Summary: IMPLEMENTATION_SUMMARY.md"
echo "   - Migration Guide: supabase/apply-migrations.md"
echo ""
echo "🌐 Your app is now LIVE on Vercel!"
echo ""
