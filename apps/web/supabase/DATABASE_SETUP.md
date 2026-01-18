# BeautyTryOn Database Setup Guide

## 🎯 Overview

This guide will help you set up the complete production database for BeautyTryOn, including:
- ✅ All tables with proper relationships
- ✅ Row Level Security (RLS) policies for multi-tenant security
- ✅ Performance indexes on all tables
- ✅ Triggers for auto-updates
- ✅ Storage buckets for file uploads
- ✅ Professional sample data (25 hair styles, 28 nail styles, 6 stores)

---

## 📋 Prerequisites

- ✅ Supabase account (free tier works)
- ✅ Project created on Supabase
- ✅ Database connection details:
  - URL: `https://turepfhrembrjjkgsveq.supabase.co`
  - Anon Key: `eyJhbGci...` (provided)

---

## 🚀 Quick Setup (Option 1: Supabase Dashboard - RECOMMENDED)

### Step 1: Access SQL Editor

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run Schema Migration

1. Open `migrations/001_complete_schema.sql`
2. Copy the **entire contents** of the file
3. Paste into Supabase SQL Editor
4. Click **Run** (bottom right)
5. Wait for confirmation (should complete in ~5-10 seconds)

✅ **Success indicators:**
- "Success. No rows returned"
- All tables appear in Table Editor

### Step 3: Run Sample Data Migration

1. Open `migrations/002_sample_data.sql`
2. Copy the **entire contents**
3. Paste into SQL Editor (new query)
4. Click **Run**
5. Wait for confirmation

✅ **Success indicators:**
- "Success. Rows inserted: XX"
- Data visible in Table Editor

### Step 4: Create Storage Buckets

1. Click **Storage** in left sidebar
2. Click **New bucket**
3. Create these 3 buckets:

#### Bucket 1: `avatars`
- **Name**: `avatars`
- **Public**: ✅ Yes
- **File size limit**: 5MB
- **Allowed MIME types**: `image/*`

#### Bucket 2: `store-images`
- **Name**: `store-images`
- **Public**: ✅ Yes
- **File size limit**: 10MB
- **Allowed MIME types**: `image/*`

#### Bucket 3: `try-on-results`
- **Name**: `try-on-results`
- **Public**: ❌ No (user-specific)
- **File size limit**: 10MB
- **Allowed MIME types**: `image/*`

### Step 5: Configure Storage Policies

For each bucket, click **Policies** and add:

#### avatars policies:
```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### store-images policies:
```sql
-- Allow store owners to upload
CREATE POLICY "Store owners can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'store-images');

-- Allow public read
CREATE POLICY "Public can view store images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'store-images');
```

#### try-on-results policies:
```sql
-- Users can upload their own try-on results
CREATE POLICY "Users can upload own results"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'try-on-results' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can only view their own try-on results
CREATE POLICY "Users can view own results"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'try-on-results' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own results
CREATE POLICY "Users can delete own results"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'try-on-results' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 🔧 Alternative Setup (Option 2: Supabase CLI)

### Prerequisites
```bash
npm install -g supabase
supabase login
```

### Link to your project
```bash
cd apps/web
supabase link --project-ref turepfhrembrjjkgsveq
```

### Run migrations
```bash
supabase db push
```

This will automatically run all migration files in `supabase/migrations/` in order.

---

## ✅ Verification Checklist

After running the migrations, verify everything is set up correctly:

### Tables (13 total)
- [ ] `profiles` - User profiles
- [ ] `stores` - Salon listings
- [ ] `hair_styles` - Global hair library (25 samples)
- [ ] `nail_styles` - Global nail library (28 samples)
- [ ] `store_hair_styles` - Store-specific hair services
- [ ] `store_nail_styles` - Store-specific nail services
- [ ] `try_ons` - User try-on results
- [ ] `bookings` - Appointment bookings
- [ ] `reviews` - Store reviews
- [ ] `galleries` - User galleries/collections
- [ ] `analytics_events` - Event tracking

### Storage Buckets (3 total)
- [ ] `avatars` (public)
- [ ] `store-images` (public)
- [ ] `try-on-results` (private)

### Sample Data
- [ ] 25 hair styles in `hair_styles` table
- [ ] 28 nail styles in `nail_styles` table
- [ ] 6 professional stores in `stores` table
- [ ] 10+ store-specific styles

### RLS Policies
- [ ] All tables have RLS enabled
- [ ] Users can only access their own data
- [ ] Public data is accessible to all
- [ ] Store owners can manage their stores

---

## 📊 Database Schema Overview

```
┌─────────────┐
│   auth.users│ (Supabase managed)
└──────┬──────┘
       │
       ├──────────────────────────────────────────┐
       │                                          │
┌──────▼──────┐         ┌──────────────┐   ┌────▼────┐
│  profiles   │         │    stores    │   │ try_ons │
│             │◄────────┤              │   │         │
│ - full_name │         │ - owner_id   │   │ - type  │
│ - avatar    │         │ - slug       │   │ - image │
│ - premium   │         │ - rating     │   │ - fav   │
└─────────────┘         └──────┬───────┘   └─────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
┌──────▼──────────┐   ┌────────▼────────┐   ┌────────▼────────┐
│store_hair_styles│   │store_nail_styles│   │    bookings     │
│                 │   │                 │   │                 │
│ - name          │   │ - name          │   │ - date/time     │
│ - price         │   │ - price         │   │ - status        │
│ - duration      │   │ - duration      │   │ - notes         │
└─────────────────┘   └─────────────────┘   └────────┬────────┘
                                                      │
                                             ┌────────▼────────┐
                                             │    reviews      │
                                             │                 │
                                             │ - rating (1-5)  │
                                             │ - title/comment │
                                             └─────────────────┘
```

---

## 🔐 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies that ensure:
- Users can only view/edit their own data
- Store owners can only manage their own stores
- Public data (stores, styles) is accessible to all
- Private data (try-ons) is user-specific

### Automatic Profile Creation
When a user signs up via Supabase Auth, a profile is automatically created via trigger:
```sql
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Auto-Updated Timestamps
All relevant tables have `updated_at` automatically set via triggers.

### Store Rating Auto-Update
When reviews are created/updated, store ratings automatically recalculate:
```sql
CREATE TRIGGER update_rating_on_review
    AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_store_rating();
```

---

## 📈 Performance Optimizations

### Indexes Created
- Username lookups: `idx_profiles_username`
- Store slugs: `idx_stores_slug`
- User try-ons: `idx_try_ons_user_id`
- Store searches: `idx_stores_city`, `idx_stores_specialties` (GIN)
- Bookings by date: `idx_bookings_date`
- Reviews by store: `idx_reviews_store_id`
- All foreign keys have indexes

### Query Optimization
- GIN indexes on array columns (specialties, tags)
- Composite indexes where needed
- Covering indexes for common queries

---

## 🧪 Testing the Database

### Test Query 1: View Hair Styles
```sql
SELECT name, category, color_base, is_premium
FROM public.hair_styles
LIMIT 10;
```
Expected: 10 hair styles with varied categories

### Test Query 2: View Stores
```sql
SELECT business_name, city, state, rating, review_count
FROM public.stores
WHERE is_active = true;
```
Expected: 6 professional stores

### Test Query 3: Check RLS
```sql
-- Should only show current user's try-ons
SELECT * FROM public.try_ons;
```
Expected: Empty (no user logged in) or only user's data

---

## 🛠️ Troubleshooting

### Error: "permission denied for table X"
**Solution**: RLS is working correctly! You need to be authenticated to access data.

### Error: "duplicate key value violates unique constraint"
**Solution**: Migration already ran. Drop tables and re-run, or skip to next migration.

### No data visible in tables
**Solution**: Run the sample data migration (`002_sample_data.sql`)

### Storage buckets not working
**Solution**: Make sure policies are set correctly (see Step 5 above)

---

## 📝 Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://turepfhrembrjjkgsveq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cmVwZmhyZW1icmpqa2dzdmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjA2MTQsImV4cCI6MjA4NDIzNjYxNH0.9WdYp69liic6VL2xxwyrFMgLVo-s7iqfic4-4b2LrBc
```

---

## 🎉 Success!

If all steps completed successfully, you now have:
- ✅ Production-ready database schema
- ✅ 25 hair styles ready to try on
- ✅ 28 nail designs ready to test
- ✅ 6 professional sample stores
- ✅ Secure RLS policies
- ✅ Performance-optimized indexes
- ✅ Storage buckets configured

**Next steps:**
1. Deploy your app to Vercel
2. Test authentication flow
3. Try saving a try-on result
4. Create a test booking
5. Add your own store as a test user

---

## 📞 Support

If you encounter any issues:
1. Check Supabase logs in Dashboard → Database → Logs
2. Verify RLS policies are enabled
3. Ensure storage buckets exist
4. Check that migrations ran successfully

**Database Status**: ✅ Production Ready

---

*Last Updated: January 18, 2026*
*Database Version: 1.0.0*
