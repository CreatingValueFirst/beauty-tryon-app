#!/usr/bin/env node

/**
 * Setup Database using Supabase Management API
 * This uses the service role key to execute SQL
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'https://turepfhrembrjjkgsveq.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cmVwZmhyZW1icmpqa2dzdmVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjYwNDg3NCwiZXhwIjoyMDUyMTgwODc0fQ.Nzg_RVHzs1_jGcVW_7Zv_3hPKCXlxdJcHzHrDGsEyDw';

async function executeSQLFromFile(filepath, description) {
  console.log(`\n📦 ${description}...`);
  
  const sql = fs.readFileSync(filepath, 'utf8');
  
  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`   Found ${statements.length} SQL statements to execute`);
  
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ query: stmt })
      });

      if (response.ok) {
        successCount++;
        process.stdout.write('.');
      } else {
        errorCount++;
        const error = await response.text();
        if (!error.includes('already exists')) {
          console.log(`\n   ⚠️  Statement ${i + 1} issue: ${error.substring(0, 100)}`);
        }
      }
    } catch (error) {
      errorCount++;
      console.log(`\n   ❌ Error on statement ${i + 1}: ${error.message}`);
    }
  }
  
  console.log(`\n   ✅ Completed: ${successCount} successful, ${errorCount} skipped/failed`);
}

async function setupDatabase() {
  console.log('🚀 BeautyTryOn Database Setup\n');
  console.log('Using Supabase REST API with service role key...\n');

  try {
    // Note: Supabase doesn't have a direct SQL execution endpoint via REST API
    // The best approach is still using the SQL Editor in the dashboard
    
    console.log('⚠️  Direct SQL execution via REST API is not available.');
    console.log('\n📋 Please follow these steps:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/turepfhrembrjjkgsveq/sql/new');
    console.log('2. Copy contents from: supabase/migrations/001_initial_schema.sql');
    console.log('3. Paste and click RUN');
    console.log('4. Copy contents from: supabase/seed.sql');
    console.log('5. Paste and click RUN\n');
    console.log('✨ This takes 2 minutes and is 100% reliable!\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
