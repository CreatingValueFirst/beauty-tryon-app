#!/usr/bin/env node

/**
 * Migration Runner Script
 * Applies database migrations to Supabase
 */

const fs = require('fs');
const https = require('https');

const SUPABASE_URL = 'https://turepfhrembrjjkgsveq.supabase.co';
const SERVICE_ROLE_KEY = 'sbp_2380a60d057a8ad4c81e241e4939943b409b325a';

// Read the migration file
const migrationSQL = fs.readFileSync('./supabase/migrations/001_initial_schema.sql', 'utf8');

// Split into individual statements (basic split on semicolon)
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`📦 Found ${statements.length} SQL statements to execute`);
console.log('🚀 Starting migration...\n');

// Execute via Supabase SQL endpoint using the Management API
async function executeMigration() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;

    // Note: Supabase doesn't expose a direct SQL execution endpoint via REST API
    // We need to use the postgres connection which requires psql
    // Instead, let's use the supabase-js library

    console.log('⚠️  Direct SQL execution via REST API is not available.');
    console.log('📋 Please run the migration manually:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/turepfhrembrjjkgsveq/sql/new');
    console.log('2. Copy and paste the contents of: supabase/migrations/001_initial_schema.sql');
    console.log('3. Click "Run" to execute the migration\n');
    console.log('Or install PostgreSQL client and run:');
    console.log('psql "postgresql://postgres.[PROJECT-REF]:[YOUR-DB-PASSWORD]@db.turepfhrembrjjkgsveq.supabase.co:5432/postgres" -f supabase/migrations/001_initial_schema.sql\n');

    process.exit(1);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

executeMigration();
