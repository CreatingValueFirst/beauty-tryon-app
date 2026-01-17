#!/usr/bin/env node

/**
 * Test Database Connection and Verify Migration Success
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://turepfhrembrjjkgsveq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cmVwZmhyZW1icmpqa2dzdmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjA2MTQsImV4cCI6MjA4NDIzNjYxNH0.9WdYp69liic6VL2xxwyrFMgLVo-s7iqfic4-4b2LrBc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabase() {
  console.log('🧪 BeautyTryOn - Database Migration Test\n');
  console.log('==========================================\n');

  try {
    // Test 1: Check stores
    console.log('1️⃣  Testing Stores Table...');
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, business_name, city, state, rating, review_count, total_styles')
      .eq('is_active', true);

    if (storesError) {
      console.log('   ❌ Error:', storesError.message);
      return;
    }

    console.log(`   ✅ Found ${stores.length} stores:`);
    stores.forEach(store => {
      console.log(`      • ${store.business_name} (${store.city}, ${store.state})`);
      console.log(`        Rating: ${store.rating}⭐ | Reviews: ${store.review_count} | Styles: ${store.total_styles}`);
    });
    console.log('');

    // Test 2: Check hair styles
    console.log('2️⃣  Testing Store Hair Styles...');
    const { data: hairStyles, error: hairError } = await supabase
      .from('store_hair_styles')
      .select('id, name, price, category, store_id')
      .eq('is_active', true);

    if (hairError) {
      console.log('   ❌ Error:', hairError.message);
      return;
    }

    console.log(`   ✅ Found ${hairStyles.length} hair styles:`);
    const hairByStore = hairStyles.reduce((acc, style) => {
      acc[style.store_id] = (acc[style.store_id] || 0) + 1;
      return acc;
    }, {});

    Object.entries(hairByStore).forEach(([storeId, count]) => {
      const store = stores.find(s => s.id === storeId);
      console.log(`      • ${store?.business_name || 'Unknown'}: ${count} styles`);
    });

    const avgPrice = hairStyles.reduce((sum, s) => sum + (s.price || 0), 0) / hairStyles.length;
    console.log(`      Average price: $${avgPrice.toFixed(2)}`);
    console.log('');

    // Test 3: Check nail styles
    console.log('3️⃣  Testing Store Nail Styles...');
    const { data: nailStyles, error: nailError } = await supabase
      .from('store_nail_styles')
      .select('id, name, price, category, store_id')
      .eq('is_active', true);

    if (nailError) {
      console.log('   ❌ Error:', nailError.message);
      return;
    }

    console.log(`   ✅ Found ${nailStyles.length} nail styles:`);
    const nailByStore = nailStyles.reduce((acc, style) => {
      acc[style.store_id] = (acc[style.store_id] || 0) + 1;
      return acc;
    }, {});

    Object.entries(nailByStore).forEach(([storeId, count]) => {
      const store = stores.find(s => s.id === storeId);
      console.log(`      • ${store?.business_name || 'Unknown'}: ${count} styles`);
    });

    const avgNailPrice = nailStyles.reduce((sum, s) => sum + (s.price || 0), 0) / nailStyles.length;
    console.log(`      Average price: $${avgNailPrice.toFixed(2)}`);
    console.log('');

    // Test 4: Check reviews
    console.log('4️⃣  Testing Reviews...');
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, rating, title, store_id')
      .eq('is_hidden', false);

    if (reviewsError) {
      console.log('   ❌ Error:', reviewsError.message);
      return;
    }

    console.log(`   ✅ Found ${reviews.length} reviews:`);
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    console.log(`      Average rating: ${avgRating.toFixed(1)}⭐`);

    const reviewsByStore = reviews.reduce((acc, review) => {
      acc[review.store_id] = (acc[review.store_id] || 0) + 1;
      return acc;
    }, {});

    Object.entries(reviewsByStore).forEach(([storeId, count]) => {
      const store = stores.find(s => s.id === storeId);
      console.log(`      • ${store?.business_name || 'Unknown'}: ${count} reviews`);
    });
    console.log('');

    // Test 5: Check subscription plans
    console.log('5️⃣  Testing Subscription Plans...');
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('name, price_monthly, max_styles')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (plansError) {
      console.log('   ❌ Error:', plansError.message);
      return;
    }

    console.log(`   ✅ Found ${plans.length} subscription plans:`);
    plans.forEach(plan => {
      const styles = plan.max_styles === null ? 'Unlimited' : plan.max_styles;
      console.log(`      • ${plan.name}: $${plan.price_monthly}/mo (${styles} styles)`);
    });
    console.log('');

    // Summary
    console.log('==========================================');
    console.log('🎉 DATABASE MIGRATION SUCCESSFUL!\n');
    console.log('📊 Summary:');
    console.log(`   • ${stores.length} active stores`);
    console.log(`   • ${hairStyles.length} hair styles`);
    console.log(`   • ${nailStyles.length} nail designs`);
    console.log(`   • ${reviews.length} customer reviews`);
    console.log(`   • ${plans.length} subscription plans`);
    console.log(`   • Total styles: ${hairStyles.length + nailStyles.length}`);
    console.log('');
    console.log('✅ Your marketplace is LIVE and ready to use!');
    console.log('🌐 Visit: https://beautytry-on-app.vercel.app/stores');
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDatabase();
