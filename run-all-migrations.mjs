#!/usr/bin/env node

/**
 * Complete Database Setup
 * Runs migrations and seeds sample data
 */

import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase connection - using direct database connection
const DB_PASSWORD = 'sbp_2380a60d057a8ad4c81e241e4939943b409b325a';
const connectionString = `postgresql://postgres.turepfhrembrjjkgsveq:${DB_PASSWORD}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`;

async function runSetup() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Step 1: Run migration
    console.log('📦 Step 1: Running database migration...');
    const migrationPath = join(__dirname, 'supabase/migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('⏳ Creating tables, policies, and storage buckets...\n');
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Created:');
    console.log('  ✓ profiles table');
    console.log('  ✓ hair_styles table');
    console.log('  ✓ nail_styles table');
    console.log('  ✓ try_ons table');
    console.log('  ✓ galleries table');
    console.log('  ✓ gallery_items table');
    console.log('  ✓ analytics_events table');
    console.log('  ✓ Row Level Security policies');
    console.log('  ✓ Storage buckets\n');

    // Step 2: Load seed data
    console.log('📦 Step 2: Loading sample data...');
    const seedPath = join(__dirname, 'supabase/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    console.log('⏳ Inserting 80 professional styles...\n');
    await client.query(seedSQL);
    
    console.log('✅ Seed data loaded successfully!\n');
    console.log('📊 Added to database:');
    console.log('  💇 35 Hair Styles:');
    console.log('     - 5 Short styles');
    console.log('     - 5 Medium styles');
    console.log('     - 5 Long styles');
    console.log('     - 5 Curly styles');
    console.log('     - 10 Trending colors');
    console.log('     - 5 Special updo styles');
    console.log('  💅 45 Nail Designs:');
    console.log('     - 10 Classic solid colors');
    console.log('     - 5 French manicure styles');
    console.log('     - 5 Glitter & shimmer');
    console.log('     - 10 Nail art designs');
    console.log('     - 5 Seasonal designs');
    console.log('     - 4 Matte finishes');
    console.log('     - 6 Metallic & chrome\n');

    // Verify the data
    console.log('🔍 Verifying installation...');
    const { rows: hairCount } = await client.query('SELECT COUNT(*) FROM hair_styles');
    const { rows: nailCount } = await client.query('SELECT COUNT(*) FROM nail_styles');
    
    console.log(`✅ Verified: ${hairCount[0].count} hair styles in database`);
    console.log(`✅ Verified: ${nailCount[0].count} nail styles in database\n`);

    console.log('🎉 Database setup complete!');
    console.log('🚀 Your BeautyTryOn app is now fully functional!');
    console.log('\n📱 Next steps:');
    console.log('   1. Visit: https://beautytry-on-app.vercel.app');
    console.log('   2. Browse 80 professional styles');
    console.log('   3. Try the virtual try-on features');
    console.log('   4. Share your favorite looks!\n');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Database tables already exist!');
      console.log('✅ Your database is already set up.');
      console.log('\nTrying to load seed data only...\n');
      
      try {
        const seedPath = join(__dirname, 'supabase/seed.sql');
        const seedSQL = fs.readFileSync(seedPath, 'utf8');
        await client.query(seedSQL);
        console.log('✅ Seed data loaded successfully!');
      } catch (seedError) {
        if (seedError.message.includes('duplicate') || seedError.code === '23505') {
          console.log('✅ Seed data already exists in database!');
          console.log('🎉 Your database is fully populated and ready!');
        } else {
          console.error('❌ Error loading seed data:', seedError.message);
        }
      }
    } else {
      console.error('\n❌ Setup failed:', error.message);
      console.error('\nError details:', error);
      process.exit(1);
    }
  } finally {
    await client.end();
    console.log('\n👋 Connection closed.');
  }
}

runSetup();
