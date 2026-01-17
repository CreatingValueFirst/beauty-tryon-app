#!/usr/bin/env node

/**
 * Migration Runner Script
 * Applies database migrations to Supabase using postgres connection
 */

import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase connection details
const connectionString = process.env.DATABASE_URL ||
  'postgresql://postgres.turepfhrembrjjkgsveq:sbp_2380a60d057a8ad4c81e241e4939943b409b325a@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read migration file
    const migrationPath = join(__dirname, 'supabase/migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📦 Executing migration: 001_initial_schema.sql');
    console.log('⏳ This may take a moment...\n');

    // Execute the entire migration
    await client.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Created tables:');
    console.log('  ✓ profiles');
    console.log('  ✓ hair_styles');
    console.log('  ✓ nail_styles');
    console.log('  ✓ try_ons');
    console.log('  ✓ galleries');
    console.log('  ✓ gallery_items');
    console.log('  ✓ analytics_events');
    console.log('\n🔐 Row Level Security policies applied');
    console.log('📦 Storage buckets created');
    console.log('\n🎉 Database is ready to use!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
