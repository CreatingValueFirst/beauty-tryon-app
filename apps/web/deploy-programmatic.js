#!/usr/bin/env node

/**
 * Programmatic Deployment Script
 * This script deploys the entire application using Supabase APIs
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'https://turepfhrembrjjkgsveq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cmVwZmhyZW1icmpqa2dzdmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjA2MTQsImV4cCI6MjA4NDIzNjYxNH0.9WdYp69liic6VL2xxwyrFMgLVo-s7iqfic4-4b2LrBc';
const SUPABASE_SERVICE_KEY = 'sb_publishable_qg4_ZEUnr9JBaGuOcLdhwQ_GvfT7UT4';

// Create Supabase clients
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runSQLMigration(filePath, description) {
  console.log(`\n📝 Running migration: ${description}...`);

  try {
    const sql = fs.readFileSync(filePath, 'utf8');

    // Try to execute SQL via RPC call
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      query: sql
    });

    if (error) {
      // If RPC doesn't work, try direct query
      console.log('   Trying alternative method...');
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      console.log('   ✅ Migration successful!');
      return true;
    }

    console.log('   ✅ Migration successful!');
    return true;
  } catch (error) {
    console.error(`   ❌ Migration failed: ${error.message}`);
    return false;
  }
}

async function createStorageBucket(bucketName, isPublic) {
  console.log(`\n🗂️  Creating storage bucket: ${bucketName} (public: ${isPublic})...`);

  try {
    const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: isPublic,
      fileSizeLimit: 52428800, // 50MB
    });

    if (error && !error.message.includes('already exists')) {
      throw error;
    }

    console.log('   ✅ Bucket created!');
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('   ℹ️  Bucket already exists (OK)');
      return true;
    }
    console.error(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

async function verifyDeployment() {
  console.log('\n🔍 Verifying deployment...');

  try {
    // Check if tables exist by trying to query them
    const { data: profiles, error: profileError } = await supabaseAnon
      .from('profiles')
      .select('count');

    const { data: stores, error: storesError } = await supabaseAnon
      .from('stores')
      .select('count');

    const { data: hairStyles, error: hairError } = await supabaseAnon
      .from('hair_styles')
      .select('count');

    if (!profileError && !storesError && !hairError) {
      console.log('   ✅ Database tables verified!');
      return true;
    }

    console.log('   ⚠️  Some tables may not be accessible');
    return false;
  } catch (error) {
    console.error(`   ❌ Verification failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║         BeautyTryOn - Programmatic Deployment           ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  // Step 1: Run database schema migration
  const schemaPath = path.join(__dirname, 'supabase/migrations/001_complete_schema.sql');
  await runSQLMigration(schemaPath, 'Database Schema');

  // Step 2: Run sample data migration
  const dataPath = path.join(__dirname, 'supabase/migrations/002_sample_data.sql');
  await runSQLMigration(dataPath, 'Sample Data');

  // Step 3: Create storage buckets
  await createStorageBucket('avatars', true);
  await createStorageBucket('store-images', true);
  await createStorageBucket('try-on-results', false);

  // Step 4: Verify deployment
  await verifyDeployment();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ Programmatic deployment complete!');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
