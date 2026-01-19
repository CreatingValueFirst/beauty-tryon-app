# Database Migrations - Application Guide

This guide explains how to apply all database migrations to your Supabase project.

## Prerequisites

- Supabase project access
- Service role key (already configured in .env.local)
- Access to Supabase SQL Editor

## Migrations to Apply

The following migrations must be applied in order:

### 1. ✅ Core Schema (Already Applied)
- `001_complete_schema.sql` - Base tables (users, stores, try_ons, etc.)
- `002_sample_data.sql` - Sample data for testing

### 2. 🆕 AI Features (NEW)
**File**: `004_ai_features.sql`

This migration adds:
- `ai_generations` - Tracks AI nail design generations
- `ai_generation_queue` - Queue management for AI requests
- `image_cache` - Caching to reduce AI costs
- `user_generation_quotas` - Per-user rate limiting
- Helper functions for quota management

### 3. 🆕 Virtual Try-On for Clothing (NEW)
**File**: `005_virtual_tryon_clothing.sql`

This migration adds:
- `clothing_categories` - Clothing types (tops, dresses, etc.)
- `clothing_items` - Clothing products for virtual try-on
- `clothing_try_ons` - User virtual try-on results
- `clothing_uploads` - User-uploaded clothing images
- Helper functions and triggers
- Sample clothing items

## How to Apply Migrations

### Option 1: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project: `turepfhrembrjjkgsveq`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Apply AI Features Migration**
   ```sql
   -- Copy and paste the entire contents of:
   -- supabase/migrations/004_ai_features.sql

   -- Then click "Run" or press Cmd/Ctrl + Enter
   ```

4. **Apply Virtual Try-On Migration**
   ```sql
   -- Copy and paste the entire contents of:
   -- supabase/migrations/005_virtual_tryon_clothing.sql

   -- Then click "Run" or press Cmd/Ctrl + Enter
   ```

5. **Verify Migration Success**
   ```sql
   -- Check if tables were created successfully
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN (
     'ai_generations',
     'ai_generation_queue',
     'image_cache',
     'user_generation_quotas',
     'clothing_categories',
     'clothing_items',
     'clothing_try_ons',
     'clothing_uploads'
   );
   ```

   You should see all 8 tables listed.

### Option 2: Via Supabase CLI (Advanced)

```bash
# Make sure Supabase CLI is installed
brew install supabase/tap/supabase

# Link to your project
supabase link --project-ref turepfhrembrjjkgsveq

# Apply migrations
supabase db push

# Verify
supabase db diff
```

## Storage Buckets

After applying migrations, create the following storage buckets:

### 1. Create `virtual-tryon` Bucket

1. Go to **Storage** → **Create a new bucket**
2. **Name**: `virtual-tryon`
3. **Public bucket**: Yes (enable)
4. **File size limit**: 10 MB
5. **Allowed MIME types**: `image/jpeg, image/png, image/webp`

### 2. Configure CORS and Policies

```sql
-- Allow public access to uploaded images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'virtual-tryon' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'virtual-tryon'
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'virtual-tryon'
  AND owner = auth.uid()
);
```

## Post-Migration Verification

### 1. Test AI Generation Quota

```sql
-- Test quota function
SELECT check_and_increment_quota('your-user-uuid-here');
```

### 2. Check Sample Data

```sql
-- Verify clothing categories
SELECT * FROM clothing_categories ORDER BY sort_order;

-- Verify sample clothing items
SELECT * FROM clothing_items LIMIT 5;
```

### 3. Verify Indexes

```sql
-- Check indexes on new tables
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
    AND tablename IN ('clothing_items', 'clothing_try_ons', 'ai_generations');
```

## Troubleshooting

### Error: "relation already exists"
This means the migration has already been applied. You can safely ignore this error.

### Error: "permission denied"
Make sure you're using the Service Role Key in the SQL Editor, not the Anon key.

### Error: "function does not exist"
Apply migrations in order. Some migrations depend on previous ones.

## Next Steps

After migrations are applied:

1. ✅ Verify all tables exist
2. ✅ Create storage buckets
3. ✅ Test API endpoints
4. ✅ Test virtual try-on functionality
5. ✅ Monitor quota usage

## Support

If you encounter issues:
- Check Supabase logs: Dashboard → Logs
- Verify environment variables are set correctly
- Ensure API keys are valid
- Check RLS policies are enabled

## Migration Files Location

All migration files are located in:
```
/Users/carpediem/beauty-tryon-app/apps/web/supabase/migrations/
```

- `004_ai_features.sql` - AI nail generation features
- `005_virtual_tryon_clothing.sql` - Virtual clothing try-on

---

**Status**: Ready to apply
**Estimated time**: 2-5 minutes
**Impact**: Adds AI generation and virtual try-on features
