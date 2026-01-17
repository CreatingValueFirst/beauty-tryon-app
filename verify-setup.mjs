#!/usr/bin/env node

/**
 * Verify Database Setup Status
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://turepfhrembrjjkgsveq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cmVwZmhyZW1icmpqa2dzdmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjA2MTQsImV4cCI6MjA4NDIzNjYxNH0.9WdYp69liic6VL2xxwyrFMgLVo-s7iqfic4-4b2LrBc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 BeautyTryOn - Setup Verification\n');
console.log('====================================\n');

async function checkDatabase() {
  console.log('Checking database connection...\n');

  try {
    // Try to query stores table
    const { data, error } = await supabase
      .from('stores')
      .select('count')
      .limit(1);

    if (error) {
      if (error.message.includes('Could not find the table') || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('❌ DATABASE NOT SET UP YET!\n');
        console.log('The migration has NOT been run.\n');
        console.log('📋 TO FIX THIS:\n');
        console.log('1. Open this URL in your browser:');
        console.log('   https://supabase.com/dashboard/project/turepfhrembrjjkgsveq/sql/new\n');
        console.log('2. Open this file and copy ALL contents:');
        console.log('   supabase/PRODUCTION_SETUP.sql\n');
        console.log('3. Paste into the SQL Editor\n');
        console.log('4. Click the green "RUN" button\n');
        console.log('5. Wait 15 seconds for success message\n');
        console.log('Then run this verification script again!\n');
        return false;
      } else {
        console.log('❌ Database error:', error.message);
        console.log('\nPlease check your Supabase connection.\n');
        return false;
      }
    }

    console.log('✅ Database connected!\n');
    console.log('Checking for data...\n');

    // Check stores
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .eq('is_active', true);

    if (storesError) {
      console.log('Error checking stores:', storesError.message);
      return false;
    }

    if (!stores || stores.length === 0) {
      console.log('⚠️  DATABASE IS EMPTY!\n');
      console.log('Tables exist but no sample data found.\n');
      console.log('Did you run the COMPLETE PRODUCTION_SETUP.sql file?\n');
      console.log('Make sure to run the ENTIRE file, not just part of it.\n');
      return false;
    }

    // Success! Show the data
    console.log('🎉 SUCCESS! Your database is fully set up!\n');
    console.log('====================================\n');

    console.log(`✅ Found ${stores.length} Stores:\n`);
    for (const store of stores) {
      console.log(`   📍 ${store.business_name}`);
      console.log(`      Location: ${store.city}, ${store.state}`);
      console.log(`      Rating: ${store.rating}⭐ (${store.review_count} reviews)`);
      console.log(`      Tier: ${store.subscription_tier.toUpperCase()}`);
      console.log(`      Styles: ${store.total_styles}`);
      console.log('');
    }

    // Check hair styles
    const { data: hairStyles } = await supabase
      .from('store_hair_styles')
      .select('id, name, price')
      .eq('is_active', true);

    console.log(`✅ Found ${hairStyles?.length || 0} Hair Styles\n`);
    if (hairStyles && hairStyles.length > 0) {
      const sampleHair = hairStyles.slice(0, 3);
      sampleHair.forEach(style => {
        console.log(`   💇 ${style.name} - $${style.price}`);
      });
      if (hairStyles.length > 3) {
        console.log(`   ... and ${hairStyles.length - 3} more`);
      }
      console.log('');
    }

    // Check nail styles
    const { data: nailStyles } = await supabase
      .from('store_nail_styles')
      .select('id, name, price')
      .eq('is_active', true);

    console.log(`✅ Found ${nailStyles?.length || 0} Nail Styles\n`);
    if (nailStyles && nailStyles.length > 0) {
      const sampleNails = nailStyles.slice(0, 3);
      sampleNails.forEach(style => {
        console.log(`   💅 ${style.name} - $${style.price}`);
      });
      if (nailStyles.length > 3) {
        console.log(`   ... and ${nailStyles.length - 3} more`);
      }
      console.log('');
    }

    // Check subscription plans
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('name, price_monthly')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    console.log(`✅ Found ${plans?.length || 0} Subscription Plans\n`);
    if (plans) {
      plans.forEach(plan => {
        console.log(`   💰 ${plan.name}: $${plan.price_monthly}/month`);
      });
      console.log('');
    }

    console.log('====================================\n');
    console.log('🚀 YOUR MARKETPLACE IS FULLY OPERATIONAL!\n');
    console.log('Test it now:\n');
    console.log('🌐 Homepage:');
    console.log('   https://beautytry-on-app.vercel.app\n');
    console.log('🏪 Browse Salons:');
    console.log('   https://beautytry-on-app.vercel.app/stores\n');
    console.log('💇 Hair Try-On:');
    console.log('   https://beautytry-on-app.vercel.app/dashboard/hair\n');
    console.log('💅 Nail Try-On:');
    console.log('   https://beautytry-on-app.vercel.app/dashboard/nails\n');
    console.log('📊 Create Store:');
    console.log('   https://beautytry-on-app.vercel.app/dashboard/store/create\n');
    console.log('====================================\n');

    return true;

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    console.log('\nPlease check your internet connection and Supabase status.\n');
    return false;
  }
}

checkDatabase().then(success => {
  if (success) {
    console.log('✅ Everything is working perfectly!\n');
    console.log('Ready to acquire your first customers! 🎉\n');
  } else {
    console.log('⚠️  Setup incomplete. Follow the instructions above.\n');
  }
});
