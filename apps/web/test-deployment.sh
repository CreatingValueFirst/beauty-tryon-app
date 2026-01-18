#!/bin/bash

# ============================================================================
# Post-Deployment Test Script
# ============================================================================
# Run this after deploying to verify your live app is working
# Usage: ./test-deployment.sh https://your-app.vercel.app
# ============================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DEPLOYMENT_URL=$1

if [ -z "$DEPLOYMENT_URL" ]; then
    echo -e "${RED}❌ Please provide your deployment URL${NC}"
    echo "Usage: ./test-deployment.sh https://your-app.vercel.app"
    exit 1
fi

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Testing Deployment: $DEPLOYMENT_URL"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: Homepage loads
echo -n "Testing homepage... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Homepage loads (HTTP 200)${NC}"
else
    echo -e "${RED}❌ Homepage failed (HTTP $STATUS)${NC}"
fi

# Test 2: Login page loads
echo -n "Testing login page... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/login")
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Login page loads${NC}"
else
    echo -e "${RED}❌ Login page failed (HTTP $STATUS)${NC}"
fi

# Test 3: API health check (if exists)
echo -n "Testing API connection... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/api/health" 2>/dev/null || echo "404")
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ API responds${NC}"
elif [ "$STATUS" = "404" ]; then
    echo -e "${YELLOW}⚠️  No health endpoint (this is OK)${NC}"
else
    echo -e "${RED}❌ API failed (HTTP $STATUS)${NC}"
fi

# Test 4: Static assets
echo -n "Testing static assets... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/favicon.ico" 2>/dev/null)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Static files serving${NC}"
else
    echo -e "${YELLOW}⚠️  Some static files may be missing${NC}"
fi

echo ""
echo -e "${BLUE}═══ Manual Testing Checklist ═══${NC}"
echo ""
echo "Open your app and test these features:"
echo ""
echo "  [ ] Homepage loads without errors"
echo "  [ ] Sign up works"
echo "  [ ] Login works"
echo "  [ ] Hair Try-On page loads"
echo "  [ ] Nail Try-On page loads"
echo "  [ ] Browse Stores shows 6 stores"
echo "  [ ] Camera access works (if allowed)"
echo "  [ ] Can save a try-on"
echo "  [ ] Gallery shows saved items"
echo "  [ ] Language switcher changes language"
echo "  [ ] Profile page loads"
echo "  [ ] Can logout"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo "Your app: $DEPLOYMENT_URL"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
