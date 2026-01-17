#!/bin/bash

# BeautyTryOn - Database Migration Runner
# This script helps you run the production database setup

echo "🚀 BeautyTryOn Database Migration"
echo "=================================="
echo ""

echo "Your Supabase Project: turepfhrembrjjkgsveq"
echo "SQL File: supabase/PRODUCTION_SETUP.sql"
echo ""

echo "⚠️  IMPORTANT: This requires manual execution in Supabase Dashboard"
echo ""
echo "📋 Step-by-Step Instructions:"
echo ""
echo "1. Open your browser and go to:"
echo "   https://supabase.com/dashboard/project/turepfhrembrjjkgsveq/sql/new"
echo ""
echo "2. Open the SQL file on your computer:"
echo "   $(pwd)/supabase/PRODUCTION_SETUP.sql"
echo ""
echo "3. Copy the ENTIRE contents of that file"
echo ""
echo "4. Paste into the Supabase SQL Editor"
echo ""
echo "5. Click the 'RUN' button (or press Ctrl/Cmd + Enter)"
echo ""
echo "6. Wait 15-20 seconds for completion"
echo ""
echo "7. You should see a success message with:"
echo "   ✅ BeautyTryOn Production Database Setup Complete!"
echo ""
echo "=================================="
echo ""

# Ask if user wants to open the SQL Editor
read -p "Would you like to open the Supabase SQL Editor now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Opening Supabase SQL Editor in your browser..."
    open "https://supabase.com/dashboard/project/turepfhrembrjjkgsveq/sql/new" 2>/dev/null || \
    xdg-open "https://supabase.com/dashboard/project/turepfhrembrjjkgsveq/sql/new" 2>/dev/null || \
    echo "Please manually open: https://supabase.com/dashboard/project/turepfhrembrjjkgsveq/sql/new"
fi

# Ask if user wants to view the SQL file
read -p "Would you like to view the SQL file to copy? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Opening SQL file..."
    open "supabase/PRODUCTION_SETUP.sql" 2>/dev/null || \
    xdg-open "supabase/PRODUCTION_SETUP.sql" 2>/dev/null || \
    cat "supabase/PRODUCTION_SETUP.sql"
fi

echo ""
echo "✅ Once you've run the migration, your app is 100% live and ready!"
echo ""
echo "Test it at: https://beautytry-on-app.vercel.app"
echo ""
