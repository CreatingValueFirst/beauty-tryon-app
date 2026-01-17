# 🚀 Quick Start Guide - BeautyTryOn by Save My Time

Get your app running in 5 minutes!

## ✅ What's Already Done

- ✅ Code pushed to GitHub: https://github.com/CreatingValueFirst/beauty-tryon-app
- ✅ Supabase project created: https://turepfhrembrjjkgsveq.supabase.co
- ✅ Environment variables configured locally
- ✅ All code and documentation complete

## 🎯 3 Steps to Go Live

### Step 1: Apply Database Migrations (2 minutes)

1. Go to Supabase Dashboard: https://turepfhrembrjjkgsveq.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
5. Click **Run** (bottom right)
6. Create another new query
7. Copy and paste the contents of `supabase/seed.sql`
8. Click **Run**

✅ Done! You now have 10 hair styles and 10 nail designs in your database.

### Step 2: Deploy to Vercel (1 minute)

**Option A: Using Vercel Dashboard** (Easiest)

1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import `CreatingValueFirst/beauty-tryon-app`
4. Configure:
   - Root Directory: `apps/web`
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://turepfhrembrjjkgsveq.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cmVwZmhyZW1icmpqa2dzdmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjA2MTQsImV4cCI6MjA4NDIzNjYxNH0.9WdYp69liic6VL2xxwyrFMgLVo-s7iqfic4-4b2LrBc
   SUPABASE_SERVICE_ROLE_KEY=sbp_2380a60d057a8ad4c81e241e4939943b409b325a
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
6. Click **Deploy**
7. Wait 2-3 minutes
8. Get your live URL!

**Option B: Using CLI**

```bash
cd apps/web
npx vercel --prod
```

Follow the prompts and deploy!

### Step 3: Test Your Live App (2 minutes)

1. Visit your Vercel URL
2. Click **Sign Up**
3. Create an account
4. Go to **Hair Try-On** or **Nail Try-On**
5. Allow camera access
6. Try on a style!

🎉 **You're live!**

---

## 🎨 Optional Enhancements

### Add Custom Domain
1. Go to Vercel project → Settings → Domains
2. Add your domain
3. Configure DNS as shown

### Deploy Edge Functions (Optional)
```bash
supabase link --project-ref turepfhrembrjjkgsveq
supabase functions deploy analyze-face
supabase functions deploy generate-hair-style
supabase functions deploy process-image
```

### Set Up n8n Workflows (Optional)
See `n8n/README.md` for detailed instructions.

---

## 📊 What You Have Now

✅ **Live Web App** on Vercel
✅ **Database** with Supabase
✅ **Authentication** working
✅ **10 Hair Styles** ready to try
✅ **10 Nail Designs** ready to try
✅ **AR Camera** with MediaPipe
✅ **Gallery** for saved looks
✅ **Social Sharing** to 4 platforms
✅ **Mobile App** structure ready

---

## 🐛 Troubleshooting

**Camera not working?**
- Check browser permissions
- Must use HTTPS (Vercel does this automatically)
- Try in a different browser

**Styles not showing?**
- Check Supabase migrations were applied
- Go to Supabase → Table Editor → Check `hair_styles` and `nail_styles` tables

**Build failing?**
- Check environment variables are set in Vercel
- Ensure Supabase URL and keys are correct

**Need help?**
- Check DEPLOYMENT.md for detailed guide
- Email: support@savemytime.com

---

## 📞 Support

Built with ❤️ by **Save My Time**

- 🌐 Website: https://savemytime.com
- 📧 Email: hello@savemytime.com
- 💼 Business: business@savemytime.com

---

## 🎯 Production Checklist

- [x] Code on GitHub
- [x] Supabase configured
- [ ] Migrations applied
- [ ] Deployed to Vercel
- [ ] Tested live
- [ ] Custom domain (optional)
- [ ] Analytics setup (optional)
- [ ] Edge Functions (optional)
- [ ] n8n workflows (optional)

**Ready to launch! 🚀**
