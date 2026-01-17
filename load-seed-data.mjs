#!/usr/bin/env node

/**
 * Seed Data Loader
 * Loads sample hair and nail styles into Supabase
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
  'postgresql://postgres.turepfhrembrjjkgsveq:[YOUR-DB-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

async function loadSeedData() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read seed file
    const seedPath = join(__dirname, 'supabase/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    console.log('📦 Loading sample data...');
    console.log('⏳ Inserting hair styles and nail designs...\n');

    // Execute the seed data
    await client.query(seedSQL);

    console.log('✅ Seed data loaded successfully!\n');
    console.log('📊 Added to database:');
    console.log('  💇 35 Hair Styles:');
    console.log('     - 5 Short styles');
    console.log('     - 5 Medium styles');
    console.log('     - 5 Long styles');
    console.log('     - 5 Curly styles');
    console.log('     - 10 Color variations');
    console.log('     - 5 Special updo styles');
    console.log('  💅 45 Nail Designs:');
    console.log('     - 10 Classic solid colors');
    console.log('     - 5 French manicure styles');
    console.log('     - 5 Glitter & shimmer');
    console.log('     - 10 Nail art designs');
    console.log('     - 5 Seasonal designs');
    console.log('     - 4 Matte finishes');
    console.log('     - 6 Metallic & chrome');
    console.log('\n🎉 Your app now has 80 styles ready to try!');

  } catch (error) {
    if (error.code === '23505') {
      console.log('\n⚠️  Seed data already exists in the database.');
      console.log('✅ Your database is already populated with sample styles!');
    } else {
      console.error('\n❌ Failed to load seed data:', error.message);
      console.error('\nError details:', error);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

loadSeedData();
