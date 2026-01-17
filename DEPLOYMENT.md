# Deployment Guide - BeautyTryOn by Save My Time

Complete deployment instructions for production.

## 📋 Pre-Deployment Checklist

- [x] Code committed to git
- [x] Environment variables configured
- [ ] Supabase project created and configured
- [ ] GitHub repository created
- [ ] Vercel project configured
- [ ] Domain configured (optional)

---

## 1️⃣ GitHub Repository Setup

### Create GitHub Repository

```bash
# Go to GitHub.com and create a new repository:
# Name: beauty-tryon-app
# Description: Virtual beauty try-on platform with AR - Built by Save My Time
# Public/Private: Your choice
# DO NOT initialize with README (we already have one)
```

### Push to GitHub

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/beauty-tryon-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Configure Repository Settings

1. Go to **Settings → General**
   - Set description: "Virtual beauty try-on platform with AR - Built by Save My Time"
   - Set website: Your deployment URL
   - Add topics: `beauty-tech`, `ar`, `virtual-tryon`, `nextjs`, `supabase`, `mediapipe`

2. Go to **Settings → Secrets and variables → Actions**
   - Add secrets for CI/CD:
     - `NEXT_PUBLIC_SUPABASE_URL`: https://turepfhrembrjjkgsveq.supabase.co
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon key
     - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

3. Enable GitHub Actions (should auto-enable)

---

## 2️⃣ Supabase Configuration

### Database Setup

1. **Go to Supabase Dashboard**: https://turepfhrembrjjkgsveq.supabase.co

2. **Run Migrations**:
   - Go to SQL Editor
   - Create new query
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Execute
   - Verify tables created

3. **Seed Initial Data**:
   - Create new query
   - Copy contents of `supabase/seed.sql`
   - Execute
   - Verify 10 hair styles and 10 nail styles created

4. **Configure Storage**:
   - Go to Storage
   - Create bucket: `try-ons`
   - Set to public
   - Add RLS policies (already in migration)

5. **Enable Authentication**:
   - Go to Authentication → Providers
   - Enable Email provider
   - (Optional) Enable Google, Apple, etc.

### Deploy Edge Functions

```bash
# Install Supabase CLI if not already installed
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref turepfhrembrjjkgsveq

# Deploy all Edge Functions
supabase functions deploy analyze-face
supabase functions deploy generate-hair-style
supabase functions deploy process-image

# Set secrets (optional, for AI features)
supabase secrets set REPLICATE_API_TOKEN=your-token
supabase secrets set OPENAI_API_KEY=your-key
```

---

## 3️⃣ Vercel Deployment

### Method 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Method 2: Vercel Dashboard

1. **Go to Vercel**: https://vercel.com
2. **Import Project**:
   - Click "Add New" → "Project"
   - Import from GitHub
   - Select `beauty-tryon-app` repository

3. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

4. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://turepfhrembrjjkgsveq.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Get deployment URL

### Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Wait for SSL certificate provisioning

---

## 4️⃣ n8n Workflow Setup (Optional)

### Install n8n

```bash
# Option 1: Docker
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n

# Option 2: npm
npm install -g n8n
n8n start
```

### Import Workflows

1. Access n8n: http://localhost:5678
2. Go to Workflows
3. Import each workflow from `n8n/workflows/`:
   - `social-media-automation.json`
   - `analytics-sync.json`
   - `image-processing.json`
   - `user-onboarding.json`

### Configure Credentials

1. Go to Credentials
2. Add credentials for:
   - Supabase (PostgreSQL connection)
   - Twitter/X API
   - Instagram API
   - Pinterest API
   - PostHog API
   - SMTP (email sending)

3. Update credential IDs in workflows

### Activate Workflows

1. Open each workflow
2. Click "Active" toggle
3. Test with sample data

### Update Environment Variables

Add webhook URLs to Vercel:
```
NEXT_PUBLIC_N8N_SOCIAL_SHARE_WEBHOOK=https://your-n8n.com/webhook/social-share
N8N_PROCESS_IMAGE_WEBHOOK=https://your-n8n.com/webhook/process-tryon-image
N8N_USER_SIGNUP_WEBHOOK=https://your-n8n.com/webhook/user-signup
```

---

## 5️⃣ Post-Deployment Verification

### Test Web Application

1. **Visit deployment URL**
2. **Test landing page** - Should load with gradient hero
3. **Test authentication**:
   - Sign up with test email
   - Verify email confirmation
   - Log in
4. **Test hair try-on**:
   - Grant camera permission
   - Select a style
   - Verify AR overlay works
5. **Test nail try-on**:
   - Show hands to camera
   - Select nail color
   - Verify hand tracking
6. **Test gallery**:
   - Save a try-on
   - Verify it appears in gallery
7. **Test social sharing**:
   - Open share dialog
   - Verify platforms listed

### Monitor Performance

1. **Check Vercel Analytics**:
   - Response times
   - Error rates
   - Traffic patterns

2. **Check Supabase Logs**:
   - Database queries
   - Edge function executions
   - Authentication events

3. **Monitor Core Web Vitals**:
   - First Contentful Paint < 1.8s
   - Largest Contentful Paint < 2.5s
   - Cumulative Layout Shift < 0.1

---

## 6️⃣ Mobile App Deployment (Future)

### iOS App Store

```bash
cd apps/mobile
flutter build ipa
```

1. Open Xcode
2. Configure signing
3. Archive and upload
4. Submit for review in App Store Connect

### Google Play Store

```bash
cd apps/mobile
flutter build appbundle --release
```

1. Create release in Play Console
2. Upload AAB file
3. Complete store listing
4. Submit for review

---

## 🔒 Security Checklist

- [x] Environment variables not in git
- [x] Row Level Security enabled in Supabase
- [x] HTTPS enforced in production
- [x] Security headers configured (see vercel.json)
- [x] API rate limiting configured
- [x] Input validation on all forms
- [ ] Enable Vercel Authentication (if needed)
- [ ] Set up monitoring alerts

---

## 📊 Analytics Setup (Optional)

### PostHog

1. Create PostHog account
2. Get project API key
3. Add to Vercel environment:
   ```
   NEXT_PUBLIC_POSTHOG_KEY=your-key
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

### Sentry

1. Create Sentry project
2. Get DSN
3. Add to Vercel environment:
   ```
   SENTRY_DSN=your-dsn
   ```

---

## 🚀 Production URLs

After deployment, update these everywhere:

- **Web App**: https://your-domain.vercel.app
- **Supabase**: https://turepfhrembrjjkgsveq.supabase.co
- **GitHub**: https://github.com/YOUR_USERNAME/beauty-tryon-app
- **n8n** (if deployed): https://your-n8n-instance.com

---

## 📞 Support

If you encounter issues:

1. Check logs in Vercel dashboard
2. Check Supabase logs
3. Review error messages
4. Contact: support@savemytime.com

---

## 🎉 Launch Checklist

Before announcing:

- [ ] All tests passing
- [ ] Performance optimized
- [ ] SEO metadata configured
- [ ] Social media cards working
- [ ] Analytics configured
- [ ] Error monitoring active
- [ ] Documentation complete
- [ ] Team trained
- [ ] Backup strategy in place
- [ ] Launch announcement ready

---

**Deployment completed by Save My Time** ✅

Need help? Contact us at hello@savemytime.com

🌐 [savemytime.com](https://savemytime.com)
