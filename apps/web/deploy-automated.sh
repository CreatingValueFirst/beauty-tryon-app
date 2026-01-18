#!/bin/bash

# ============================================================================
# BeautyTryOn - Automated Deployment Script
# ============================================================================
# This script automates the deployment process as much as possible
# ============================================================================

set -e  # Exit on error

echo "🚀 BeautyTryOn Automated Deployment"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# ============================================================================
# STEP 1: Verify Prerequisites
# ============================================================================
echo -e "${BLUE}Step 1: Verifying prerequisites...${NC}"

# Check if build is successful
if [ ! -d ".next" ]; then
    echo "Running production build..."
    npm run build
fi

echo -e "${GREEN}✅ Build verified${NC}"
echo ""

# ============================================================================
# STEP 2: Deploy to Vercel
# ============================================================================
echo -e "${BLUE}Step 2: Deploying to Vercel...${NC}"
echo ""
echo -e "${YELLOW}This will open a browser for authentication.${NC}"
echo "Please follow these steps:"
echo "1. Sign in with GitHub when prompted"
echo "2. When asked for project settings, use these values:"
echo "   - Root Directory: apps/web"
echo "   - Framework: Next.js"
echo ""
echo "3. When asked for environment variables, add:"
echo "   NEXT_PUBLIC_SUPABASE_URL=https://turepfhrembrjjkgsveq.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cmVwZmhyZW1icmpqa2dzdmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjA2MTQsImV4cCI6MjA4NDIzNjYxNH0.9WdYp69liic6VL2xxwyrFMgLVo-s7iqfic4-4b2LrBc"
echo ""
read -p "Press Enter to start Vercel deployment..."

# Use npx to run vercel without global install
npx vercel --prod

echo ""
echo -e "${GREEN}✅ App deployed to Vercel!${NC}"
echo ""

# ============================================================================
# STEP 3: Manual Steps Required
# ============================================================================
echo -e "${YELLOW}⚠️  IMPORTANT: Manual steps required${NC}"
echo ""
echo "Your app is deployed, but you need to complete these steps:"
echo ""
echo "1. Run Database Migrations:"
echo "   - Open: https://app.supabase.com/project/turepfhrembrjjkgsveq/sql"
echo "   - Click 'New query'"
echo "   - Copy all contents of: supabase/migrations/001_complete_schema.sql"
echo "   - Paste and click 'Run'"
echo "   - Repeat for: supabase/migrations/002_sample_data.sql"
echo ""
echo "2. Create Storage Buckets:"
echo "   - Open: https://app.supabase.com/project/turepfhrembrjjkgsveq/storage"
echo "   - Create buckets: avatars (public), store-images (public), try-on-results (private)"
echo ""
echo "3. Configure Auth Redirects:"
echo "   - Open: https://app.supabase.com/project/turepfhrembrjjkgsveq/auth/url-configuration"
echo "   - Add your Vercel URL to Site URL and Redirect URLs"
echo ""
echo -e "${GREEN}See DEPLOY_NOW.md for detailed instructions${NC}"
echo ""
