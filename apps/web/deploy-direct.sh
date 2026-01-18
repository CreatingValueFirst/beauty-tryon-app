#!/bin/bash

# ============================================================================
# Direct SQL Execution via Supabase REST API
# ============================================================================

set -e

SUPABASE_URL="https://turepfhrembrjjkgsveq.supabase.co"
SUPABASE_KEY="sb_publishable_qg4_ZEUnr9JBaGuOcLdhwQ_GvfT7UT4"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      Direct API Deployment Attempt                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Try to create storage buckets via REST API
echo -e "${YELLOW}Creating storage buckets...${NC}"

# Bucket 1: avatars (public)
echo -n "Creating 'avatars' bucket... "
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "avatars",
    "name": "avatars",
    "public": true,
    "file_size_limit": 52428800
  }')

if echo "$RESPONSE" | grep -q "error\|Error"; then
  if echo "$RESPONSE" | grep -q "already exists"; then
    echo -e "${GREEN}Already exists (OK)${NC}"
  else
    echo -e "${RED}Failed${NC}"
    echo "$RESPONSE"
  fi
else
  echo -e "${GREEN}Created${NC}"
fi

# Bucket 2: store-images (public)
echo -n "Creating 'store-images' bucket... "
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "store-images",
    "name": "store-images",
    "public": true,
    "file_size_limit": 52428800
  }')

if echo "$RESPONSE" | grep -q "error\|Error"; then
  if echo "$RESPONSE" | grep -q "already exists"; then
    echo -e "${GREEN}Already exists (OK)${NC}"
  else
    echo -e "${RED}Failed${NC}"
    echo "$RESPONSE"
  fi
else
  echo -e "${GREEN}Created${NC}"
fi

# Bucket 3: try-on-results (private)
echo -n "Creating 'try-on-results' bucket... "
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "try-on-results",
    "name": "try-on-results",
    "public": false,
    "file_size_limit": 52428800
  }')

if echo "$RESPONSE" | grep -q "error\|Error"; then
  if echo "$RESPONSE" | grep -q "already exists"; then
    echo -e "${GREEN}Already exists (OK)${NC}"
  else
    echo -e "${RED}Failed${NC}"
    echo "$RESPONSE"
  fi
else
  echo -e "${GREEN}Created${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check if buckets exist
echo -e "${YELLOW}Verifying buckets...${NC}"
BUCKETS=$(curl -s -X GET \
  "${SUPABASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "apikey: ${SUPABASE_KEY}")

echo "$BUCKETS" | grep -o '"id":"[^"]*"' || echo "Could not list buckets"

echo ""
echo -e "${YELLOW}NOTE: SQL migrations still need to be run manually via dashboard${NC}"
echo "The REST API does not support executing DDL statements."
echo ""
echo "Next steps:"
echo "1. Open: https://app.supabase.com/project/turepfhrembrjjkgsveq/sql/new"
echo "2. Paste contents of: supabase/migrations/001_complete_schema.sql"
echo "3. Click 'Run'"
echo "4. Repeat for: supabase/migrations/002_sample_data.sql"
