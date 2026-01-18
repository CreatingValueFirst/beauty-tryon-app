#!/bin/bash

# ============================================================================
# Database Verification Script
# ============================================================================
# Run this after completing the SQL migrations to verify everything worked
# ============================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Database Verification Script                     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install with: brew install supabase/tap/supabase"
    exit 1
fi

echo -e "${YELLOW}This script will verify your database setup...${NC}"
echo ""

# Verify connection
echo "Checking connection to Supabase..."
if supabase db diff --linked > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connected to Supabase project${NC}"
else
    echo -e "${YELLOW}⚠️  Not connected. Run: supabase link${NC}"
fi

echo ""
echo -e "${BLUE}═══ Verification Steps ═══${NC}"
echo ""

echo "To verify your database manually, run these SQL queries in Supabase:"
echo ""

echo -e "${YELLOW}1. Check tables created (should return 13):${NC}"
echo "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
echo ""

echo -e "${YELLOW}2. Check hair styles (should return 25):${NC}"
echo "SELECT COUNT(*) FROM public.hair_styles;"
echo ""

echo -e "${YELLOW}3. Check nail styles (should return 28):${NC}"
echo "SELECT COUNT(*) FROM public.nail_styles;"
echo ""

echo -e "${YELLOW}4. Check stores (should return 6):${NC}"
echo "SELECT COUNT(*) FROM public.stores;"
echo ""

echo -e "${YELLOW}5. Check RLS policies (should return 25+):${NC}"
echo "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';"
echo ""

echo -e "${YELLOW}6. Check triggers (should return 7+):${NC}"
echo "SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public';"
echo ""

echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo "Run these queries in: https://app.supabase.com/project/turepfhrembrjjkgsveq/sql"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
