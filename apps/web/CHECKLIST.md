# ✅ DEPLOYMENT CHECKLIST - DO THESE NOW

## Current Status: Script is running and waiting for you!

---

### ☐ STEP 1: Find the Supabase Browser Tab
- Look for a tab with URL: `app.supabase.com`
- It should show a SQL editor

---

### ☐ STEP 2: Paste and Run Schema
- In the SQL editor, press **Cmd+V**
- Click **"Run"** button (bottom right)
- Wait for: "Success. No rows returned"

---

### ☐ STEP 3: Tell Script to Continue
- Go back to your terminal
- Press **Enter**

---

### ☐ STEP 4: Paste and Run Sample Data
- Script will copy new SQL to clipboard
- In Supabase, click **"New query"**
- Press **Cmd+V**
- Click **"Run"**
- Wait for: "Success. 53 rows inserted"
- Go to terminal, press **Enter**

---

### ☐ STEP 5: Create Storage Buckets
- Browser will open to Storage page
- Click **"New bucket"**
  - Name: `avatars`, Public: YES ✅, Save
- Click **"New bucket"**
  - Name: `store-images`, Public: YES ✅, Save
- Click **"New bucket"**
  - Name: `try-on-results`, Public: NO ❌, Save
- Go to terminal, press **Enter**

---

### ☐ STEP 6: Vercel Deployment (Automated)
- Script runs `npx vercel` automatically
- Answer prompts:
  - "Set up and deploy?" → **yes**
  - "Project name?" → **beauty-tryon-app** (or press Enter)
  - Wait 2-3 minutes for deployment

---

### ☐ STEP 7: Configure Auth
- Browser opens to Supabase Auth Configuration
- Paste your Vercel URL in "Site URL" field
- Add to "Redirect URLs":
  - Your Vercel URL + `/**`
  - `http://localhost:3000/**`
- Click **"Save"**
- Go to terminal, press **Enter**

---

## 🎉 DONE!

Your app will be live at your Vercel URL!

---

## Time Required: 10-12 minutes total

**Start NOW:** Find the Supabase browser tab and press Cmd+V
