#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://turepfhrembrjjkgsveq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cmVwZmhyZW1icmpqa2dzdmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjA2MTQsImV4cCI6MjA4NDIzNjYxNH0.9WdYp69liic6VL2xxwyrFMgLVo-s7iqfic4-4b2LrBc'
);

(async () => {
  console.log('\n🔍 Checking database status...\n');

  try {
    // Try to query stores table
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('count');

    if (!storesError) {
      console.log('✅ Database is set up!');
      console.log('✅ Tables exist and are accessible\n');

      // Get counts
      const { count: storeCount } = await supabase
        .from('stores')
        .select('*', { count: 'exact', head: true });

      const { count: hairCount } = await supabase
        .from('hair_styles')
        .select('*', { count: 'exact', head: true });

      const { count: nailCount } = await supabase
        .from('nail_styles')
        .select('*', { count: 'exact', head: true });

      console.log('📊 Data loaded:');
      console.log(`   Stores: ${storeCount || 0}`);
      console.log(`   Hair Styles: ${hairCount || 0}`);
      console.log(`   Nail Styles: ${nailCount || 0}`);
      console.log('\n✅ Your app is ready to use!\n');
    } else {
      console.log('⏳ Database not set up yet');
      console.log('⏳ Waiting for you to run the SQL in Supabase\n');
      console.log(`Error: ${storesError.message}\n`);
      console.log('Action required:');
      console.log('1. Open the Supabase SQL Editor tab');
      console.log('2. Press Cmd+V to paste the SQL');
      console.log('3. Click RUN\n');
    }
  } catch (error) {
    console.log('❌ Error checking database:', error.message);
  }
})();
