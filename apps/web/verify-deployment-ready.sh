#!/bin/bash

# ============================================================================
# BeautyTryOn - Deployment Verification Script
# ============================================================================
# This script verifies your app is ready to deploy to production
# ============================================================================

echo "🚀 BeautyTryOn Deployment Verification"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to check and report
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌ $1${NC}"
        ((CHECKS_FAILED++))
    fi
}

# Check 1: Environment file exists
echo "Checking environment configuration..."
if [ -f ".env.local" ]; then
    check "Environment file exists"

    # Verify it has required variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        check "Supabase credentials configured"
    else
        echo -e "${RED}❌ Missing Supabase credentials in .env.local${NC}"
        ((CHECKS_FAILED++))
    fi
else
    echo -e "${RED}❌ .env.local file missing${NC}"
    ((CHECKS_FAILED++))
fi

echo ""

# Check 2: Node modules installed
echo "Checking dependencies..."
if [ -d "node_modules" ]; then
    check "Dependencies installed"
else
    echo -e "${YELLOW}⚠️  Running npm install...${NC}"
    npm install
    check "Dependencies installed"
fi

echo ""

# Check 3: Build succeeds
echo "Testing production build..."
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    check "Production build successful"
else
    echo -e "${RED}❌ Build failed - check /tmp/build.log for details${NC}"
    ((CHECKS_FAILED++))
fi

echo ""

# Check 4: Migration files exist
echo "Checking database migrations..."
if [ -f "supabase/migrations/001_complete_schema.sql" ]; then
    check "Schema migration file exists"
else
    echo -e "${RED}❌ Schema migration missing${NC}"
    ((CHECKS_FAILED++))
fi

if [ -f "supabase/migrations/002_sample_data.sql" ]; then
    check "Sample data migration exists"
else
    echo -e "${RED}❌ Sample data migration missing${NC}"
    ((CHECKS_FAILED++))
fi

echo ""

# Check 5: Documentation files
echo "Checking documentation..."
if [ -f "DEPLOY_NOW.md" ]; then
    check "Deployment guide exists"
else
    echo -e "${RED}❌ Deployment guide missing${NC}"
    ((CHECKS_FAILED++))
fi

if [ -f "DATABASE_SETUP.md" ] || [ -f "supabase/DATABASE_SETUP.md" ]; then
    check "Database setup guide exists"
else
    echo -e "${RED}❌ Database setup guide missing${NC}"
    ((CHECKS_FAILED++))
fi

echo ""

# Check 6: Git status
echo "Checking version control..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    check "Git repository initialized"

    # Check if there are uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        check "No uncommitted changes"
    else
        echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    fi

    # Check if remote exists
    if git remote | grep -q "origin"; then
        check "Git remote configured"
        echo -e "   Remote: $(git remote get-url origin)"
    else
        echo -e "${YELLOW}⚠️  No git remote configured${NC}"
    fi
else
    echo -e "${RED}❌ Not a git repository${NC}"
    ((CHECKS_FAILED++))
fi

echo ""
echo "======================================"
echo "Summary"
echo "======================================"
echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}Failed: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED!${NC}"
    echo ""
    echo "Your app is ready to deploy!"
    echo ""
    echo "Next steps:"
    echo "1. Follow DEPLOY_NOW.md for deployment instructions"
    echo "2. Run database migrations in Supabase dashboard"
    echo "3. Deploy to Vercel"
    echo "4. Configure authentication redirect URLs"
    echo ""
    echo "Estimated deployment time: 15 minutes"
else
    echo -e "${RED}⚠️  Some checks failed. Please fix the issues above before deploying.${NC}"
    exit 1
fi
