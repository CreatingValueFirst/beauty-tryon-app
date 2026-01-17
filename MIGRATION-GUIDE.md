# Database Migration Guide

## Option 1: Manual Migration (Recommended - Easiest)

This is the quickest and safest method:

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/turepfhrembrjjkgsveq/sql/new

2. **Copy Migration SQL:**
   - Open the file: `supabase/migrations/001_initial_schema.sql`
   - Copy all the SQL content

3. **Execute Migration:**
   - Paste the SQL into the Supabase SQL Editor
   - Click the "Run" button
   - Wait for confirmation (should take 5-10 seconds)

4. **Verify:**
   - Go to Table Editor: https://supabase.com/dashboard/project/turepfhrembrjjkgsveq/editor
   - You should see these tables:
     - profiles
     - hair_styles
     - nail_styles
     - try_ons
     - galleries
     - gallery_items
     - analytics_events

---

## Option 2: Automated Script (Requires Database Password)

If you want to run the migration programmatically:

1. **Get your database password:**
   - Go to: https://supabase.com/dashboard/project/turepfhrembrjjkgsveq/settings/database
   - Under "Connection string", click "Reset database password" if you don't know it
   - Copy the new password

2. **Run the migration script:**
   ```bash
   DATABASE_URL="postgresql://postgres.turepfhrembrjjkgsveq:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres" node run-migration.mjs
   ```

   Replace `[YOUR-PASSWORD]` with your actual database password.

---

## Option 3: Using Supabase CLI

If you have the database password:

```bash
supabase db push --password [YOUR-DATABASE-PASSWORD]
```

---

## What the Migration Does

The migration creates:

### Tables:
- **profiles** - User profile information (extends auth.users)
- **hair_styles** - Library of hair styles
- **nail_styles** - Library of nail designs
- **try_ons** - User's try-on history
- **galleries** - User photo galleries
- **gallery_items** - Items within galleries
- **analytics_events** - Usage analytics

### Security:
- Row Level Security (RLS) policies for all tables
- Users can only access their own data
- Public read access for style libraries

### Storage:
- `user-images` bucket (private) - for user uploads
- `style-assets` bucket (public) - for hair/nail style assets

### Triggers:
- Auto-create profile on user signup
- Auto-update timestamps

---

## Verification

After running the migration, verify it worked:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

---

## Troubleshooting

**Error: "relation already exists"**
- The migration has already been run. You're good to go!

**Error: "permission denied"**
- Make sure you're using the correct database password
- Or run manually via the Supabase dashboard

**Error: "function gen_random_uuid() does not exist"**
- This shouldn't happen on Supabase, but if it does, run:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
  ```

---

**Built by Save My Time**
