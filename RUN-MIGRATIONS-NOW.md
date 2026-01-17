# 🚀 Run Database Migrations - Quick Guide

## Method 1: Supabase Dashboard (Recommended - 5 minutes)

This is the easiest and most reliable method!

### Step 1: Run the Migration (2 minutes)

1. **Open Supabase SQL Editor:**
   
   Click here: https://supabase.com/dashboard/project/turepfhrembrjjkgsveq/sql/new

2. **Copy the migration SQL:**
   
   Open file: `supabase/migrations/001_initial_schema.sql`
   
   Or copy from here:

3. **Paste and Run:**
   
   - Paste the SQL into the editor
   - Click the **"RUN"** button (or press Ctrl+Enter)
   - Wait 5-10 seconds
   
4. **Success!** You should see:
   ```
   Success. No rows returned
   ```

### Step 2: Load Sample Data (1 minute)

1. **In the same SQL Editor:**
   
   Keep the same tab open

2. **Copy the seed data:**
   
   Open file: `supabase/seed.sql`

3. **Paste and Run:**
   
   - Clear the editor
   - Paste the seed SQL
   - Click **"RUN"** button
   - Wait 5-10 seconds
   
4. **Success!** You should see:
   ```
   NOTICE: Successfully seeded database with:
   NOTICE:   - 35 hair styles with professional Unsplash images
   NOTICE:   - 45 nail styles with color swatches and photos
   NOTICE: Total: 80 styles with real thumbnails ready to display!
   ```

### Step 3: Verify (30 seconds)

1. **Go to Table Editor:**
   
   https://supabase.com/dashboard/project/turepfhrembrjjkgsveq/editor

2. **Check tables exist:**
   
   You should see these tables:
   - ✅ profiles
   - ✅ hair_styles (35 rows)
   - ✅ nail_styles (45 rows)
   - ✅ try_ons
   - ✅ galleries
   - ✅ gallery_items
   - ✅ analytics_events

3. **Click on hair_styles:**
   
   You should see 35 hair styles with:
   - Names (Pixie Cut, Bob Cut, etc.)
   - Thumbnail URLs (Unsplash links)
   - Categories (short, medium, long, curly)
   - Color codes

4. **Click on nail_styles:**
   
   You should see 45 nail designs with:
   - Names (Classic Red, French Manicure, etc.)
   - Thumbnail URLs
   - Categories (solid, french, glitter, art)
   - Color codes

---

## Method 2: Using Supabase CLI (If you have database password)

If you know your database password:

```bash
# Get your database password from:
# https://supabase.com/dashboard/project/turepfhrembrjjkgsveq/settings/database

# Then run:
supabase db push --password YOUR_DATABASE_PASSWORD
```

---

## Method 3: Using psql (Advanced)

If you have PostgreSQL client installed:

```bash
# Get connection string from Supabase settings
psql "postgresql://postgres.turepfhrembrjjkgsveq:[PASSWORD]@db.turepfhrembrjjkgsveq.supabase.co:5432/postgres" \
  -f supabase/migrations/001_initial_schema.sql

psql "postgresql://postgres.turepfhrembrjjkgsveq:[PASSWORD]@db.turepfhrembrjjkgsveq.supabase.co:5432/postgres" \
  -f supabase/seed.sql
```

---

## ✅ What Happens After Running

Once you complete the migrations and seed data:

### Your Database Will Have:

**Tables Created:**
- `profiles` - User accounts
- `hair_styles` - 35 hair styles
- `nail_styles` - 45 nail designs
- `try_ons` - User try-on history
- `galleries` - User galleries
- `gallery_items` - Gallery contents
- `analytics_events` - Usage tracking

**Security Configured:**
- Row Level Security enabled
- User data protected
- Public read for styles
- Private user uploads

**Storage Buckets:**
- `user-images` (private)
- `style-assets` (public)

### Your App Will Show:

**Dashboard:**
- "Popular Now" displays 4 real hair styles
- "Trending Colors" shows 8 real nail colors
- Total count shows "80+ styles"

**Style Browser:**
- 35 hair styles to try on
- 45 nail designs to choose
- Filter by category
- Search by tags

**Gallery:**
- Save favorite looks
- Share to social media
- Download images

---

## 🎯 Test It's Working

After running migrations and seed:

1. **Visit your app:**
   https://beautytry-on-app.vercel.app

2. **Go to Dashboard:**
   Click "Try It Free"

3. **You should see:**
   - 4 hair style photos in "Popular Now"
   - 8 nail color swatches in "Trending Colors"
   - "80+" in Total Styles counter

4. **If you see these, it worked!** 🎉

---

## ❓ Troubleshooting

**"Relation already exists" error:**
- This means tables are already created
- Just run the seed.sql file
- Skip the migration

**"Duplicate key value" error:**
- This means data is already loaded
- You're all set!
- No action needed

**"Permission denied" error:**
- Make sure you're running SQL in Supabase dashboard
- You must be logged in as project owner

**Can't find the SQL files:**
- They're in your project folder:
  - `supabase/migrations/001_initial_schema.sql`
  - `supabase/seed.sql`
- You can also view them on GitHub

---

## 📱 Quick Copy-Paste Instructions

**For the impatient:**

1. Go here: https://supabase.com/dashboard/project/turepfhrembrjjkgsveq/sql/new
2. Copy all content from: `supabase/migrations/001_initial_schema.sql`
3. Paste, click RUN
4. Wait for success
5. Clear editor
6. Copy all content from: `supabase/seed.sql`
7. Paste, click RUN
8. Done! 🎉

**Total time: 3 minutes**

---

**Built by Save My Time** 🚀

*Your database will be production-ready in minutes!*
