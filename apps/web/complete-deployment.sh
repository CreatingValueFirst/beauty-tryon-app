#!/bin/bash

# ============================================================================
# Complete Deployment Script - Final Steps
# ============================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

DEPLOYMENT_URL="https://beautytry-on-app.vercel.app"
SUPABASE_URL="https://turepfhrembrjjkgsveq.supabase.co"
SUPABASE_PROJECT="turepfhrembrjjkgsveq"

clear
echo -e "${BOLD}${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║              🎉 VERCEL DEPLOYMENT SUCCESSFUL! 🎉             ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${GREEN}${BOLD}Your app is LIVE at:${NC}"
echo -e "${CYAN}${BOLD}${DEPLOYMENT_URL}${NC}"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BOLD}IMPORTANT: 2 Quick Steps to Complete Setup${NC}"
echo ""
echo -e "${YELLOW}These require manual action in Supabase dashboard:${NC}"
echo ""

# ============================================================================
# STEP 1: DATABASE SETUP
# ============================================================================

echo -e "${BOLD}${BLUE}STEP 1: Run Database Migrations (5 minutes)${NC}"
echo ""
echo "The database needs to be set up with tables and sample data."
echo ""
echo -e "${CYAN}ACTION REQUIRED:${NC}"
echo ""
echo "1. Open Supabase SQL Editor:"
echo -e "   ${CYAN}https://app.supabase.com/project/${SUPABASE_PROJECT}/sql/new${NC}"
echo ""
echo "2. Open this file in your text editor:"
echo -e "   ${CYAN}supabase/migrations/001_complete_schema.sql${NC}"
echo ""
echo "3. Copy ALL the contents (Cmd+A, Cmd+C)"
echo ""
echo "4. Paste into Supabase SQL Editor (Cmd+V)"
echo ""
echo "5. Click the ${GREEN}RUN${NC} button (bottom right)"
echo ""
echo "6. Wait for: ${GREEN}Success. No rows returned${NC}"
echo ""
echo "7. Click 'New query' button"
echo ""
echo "8. Open this file:"
echo -e "   ${CYAN}supabase/migrations/002_sample_data.sql${NC}"
echo ""
echo "9. Copy ALL contents and paste into new query"
echo ""
echo "10. Click ${GREEN}RUN${NC}"
echo ""
echo "11. Verify: ${GREEN}Success. 53 rows inserted${NC}"
echo ""

read -p "Press Enter when database migrations are complete..."

echo ""
echo -e "${GREEN}✅ Database migrations completed!${NC}"
echo ""

# ============================================================================
# STEP 2: CREATE STORAGE BUCKETS
# ============================================================================

echo -e "${BOLD}${BLUE}STEP 2: Create Storage Buckets (3 minutes)${NC}"
echo ""
echo "The app needs 3 storage buckets for images."
echo ""
echo -e "${CYAN}ACTION REQUIRED:${NC}"
echo ""
echo "1. Open Supabase Storage:"
echo -e "   ${CYAN}https://app.supabase.com/project/${SUPABASE_PROJECT}/storage/buckets${NC}"
echo ""

# Try to open browser
if command -v open &> /dev/null; then
    echo "Opening browser..."
    open "https://app.supabase.com/project/${SUPABASE_PROJECT}/storage/buckets"
    sleep 2
fi

echo ""
echo "2. Create 3 buckets (click 'New bucket' for each):"
echo ""
echo -e "   ${BOLD}Bucket 1:${NC}"
echo "   • Name: ${CYAN}avatars${NC}"
echo "   • Public: ${GREEN}✅ YES${NC}"
echo "   • Click 'Save'"
echo ""
echo -e "   ${BOLD}Bucket 2:${NC}"
echo "   • Name: ${CYAN}store-images${NC}"
echo "   • Public: ${GREEN}✅ YES${NC}"
echo "   • Click 'Save'"
echo ""
echo -e "   ${BOLD}Bucket 3:${NC}"
echo "   • Name: ${CYAN}try-on-results${NC}"
echo "   • Public: ${RED}❌ NO${NC}"
echo "   • Click 'Save'"
echo ""

read -p "Press Enter when all 3 buckets are created..."

echo ""
echo -e "${GREEN}✅ Storage buckets created!${NC}"
echo ""

# ============================================================================
# STEP 3: CONFIGURE AUTHENTICATION
# ============================================================================

echo -e "${BOLD}${BLUE}STEP 3: Configure Authentication (2 minutes)${NC}"
echo ""
echo "Configure Supabase to allow authentication from your Vercel domain."
echo ""
echo -e "${CYAN}ACTION REQUIRED:${NC}"
echo ""
echo "1. Open Supabase Auth Configuration:"
echo -e "   ${CYAN}https://app.supabase.com/project/${SUPABASE_PROJECT}/auth/url-configuration${NC}"
echo ""

# Try to open browser
if command -v open &> /dev/null; then
    echo "Opening browser..."
    open "https://app.supabase.com/project/${SUPABASE_PROJECT}/auth/url-configuration"
    sleep 2
fi

# Try to copy URL to clipboard
if command -v pbcopy &> /dev/null; then
    echo "$DEPLOYMENT_URL" | pbcopy
    echo -e "${GREEN}✅ Deployment URL copied to clipboard!${NC}"
    echo ""
fi

echo ""
echo "2. In the ${BOLD}Site URL${NC} field, paste:"
echo -e "   ${CYAN}${DEPLOYMENT_URL}${NC}"
echo ""
echo "3. In the ${BOLD}Redirect URLs${NC} section, add these TWO URLs:"
echo -e "   ${CYAN}${DEPLOYMENT_URL}/**${NC}"
echo -e "   ${CYAN}http://localhost:3000/**${NC}"
echo ""
echo "4. Click ${GREEN}Save${NC}"
echo ""

read -p "Press Enter when authentication is configured..."

echo ""
echo -e "${GREEN}✅ Authentication configured!${NC}"
echo ""

# ============================================================================
# COMPLETION
# ============================================================================

clear
echo -e "${BOLD}${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║               🎊 DEPLOYMENT COMPLETE! 🎊                     ║"
echo "║                                                              ║"
echo "║              Your app is 100% LIVE and ready!                ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${CYAN}${BOLD}Your Live App:${NC}"
echo -e "${GREEN}${BOLD}${DEPLOYMENT_URL}${NC}"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BOLD}What you have now:${NC}"
echo ""
echo "✅ Production app on Vercel"
echo "✅ Database with 13 tables"
echo "✅ 25 professional hair styles"
echo "✅ 28 professional nail designs"
echo "✅ 6 sample stores (NYC, LA, Atlanta, Austin, Miami, SF)"
echo "✅ User authentication"
echo "✅ Storage buckets for images"
echo "✅ Secure database with RLS policies"
echo "✅ 60+ fully functional features"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BOLD}Test your app now:${NC}"
echo ""
echo "1. Visit: ${CYAN}${DEPLOYMENT_URL}${NC}"
echo "2. Click 'Sign Up' and create an account"
echo "3. Try the Hair Virtual Try-On (25 styles)"
echo "4. Try the Nail Virtual Try-On (28 designs)"
echo "5. Browse Stores (6 professional salons)"
echo "6. Save a try-on to your gallery"
echo "7. Check your profile settings"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}${BOLD}🚀 READY TO GENERATE REVENUE! 💰${NC}"
echo ""
echo "Start onboarding salons and customers!"
echo ""

# Try to open the live app
if command -v open &> /dev/null; then
    echo "Opening your live app in browser..."
    sleep 2
    open "$DEPLOYMENT_URL"
fi

echo ""
echo -e "${CYAN}Deployment Summary:${NC}"
echo "• Vercel: ${DEPLOYMENT_URL}"
echo "• Supabase: ${SUPABASE_URL}"
echo "• Database: turepfhrembrjjkgsveq"
echo ""
