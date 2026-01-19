/**
 * Simple Database Migration Script
 * Uses Supabase REST API to execute SQL
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🚀 Applying Database Migrations\n');

// Check if tables exist
async function checkTables() {
  console.log('🔍 Checking existing tables...\n');

  const tables = [
    'ai_generations',
    'ai_generation_queue',
    'image_cache',
    'user_generation_quotas',
    'clothing_categories',
    'clothing_items',
    'clothing_try_ons',
    'clothing_uploads',
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('id').limit(1);

      if (error && error.message.includes('does not exist')) {
        console.log(`❌ ${table} - does not exist`);
      } else if (error) {
        console.log(`⚠️  ${table} - ${error.message.substring(0, 50)}`);
      } else {
        console.log(`✅ ${table} - exists`);
      }
    } catch (e) {
      console.log(`❌ ${table} - error checking`);
    }
  }

  console.log('\n');
}

await checkTables();

console.log('✅ Migration check complete!');
console.log('\n📝 Next steps:');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Select your project: turepfhrembrjjkgsveq');
console.log('3. Open SQL Editor → New Query');
console.log('4. Copy/paste: supabase/migrations/004_ai_features.sql');
console.log('5. Run the query');
console.log('6. Copy/paste: supabase/migrations/005_virtual_tryon_clothing.sql');
console.log('7. Run the query');
console.log('\nAlternatively, run: node scripts/manual-migration.mjs\n');
