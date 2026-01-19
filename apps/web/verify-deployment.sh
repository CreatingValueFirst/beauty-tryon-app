#!/bin/bash

echo "🔍 BeautyTryOn - Live Deployment Verification"
echo "=============================================="
echo ""
echo "🌐 Production URL: https://beautytry-on-app.vercel.app"
echo ""

# Test all major pages
urls=(
  "https://beautytry-on-app.vercel.app/"
  "https://beautytry-on-app.vercel.app/en"
  "https://beautytry-on-app.vercel.app/en/dashboard"
  "https://beautytry-on-app.vercel.app/en/dashboard/hair"
  "https://beautytry-on-app.vercel.app/en/dashboard/nails"
  "https://beautytry-on-app.vercel.app/en/dashboard/clothing-tryon"
  "https://beautytry-on-app.vercel.app/en/dashboard/gallery"
  "https://beautytry-on-app.vercel.app/en/dashboard/profile"
  "https://beautytry-on-app.vercel.app/en/stores"
  "https://beautytry-on-app.vercel.app/en/login"
  "https://beautytry-on-app.vercel.app/en/signup"
  "https://beautytry-on-app.vercel.app/bg/dashboard"
  "https://beautytry-on-app.vercel.app/ru/dashboard"
  "https://beautytry-on-app.vercel.app/es/dashboard"
  "https://beautytry-on-app.vercel.app/tr/dashboard"
)

success_count=0
total_count=${#urls[@]}

for url in "${urls[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")
  if [ "$status" = "200" ] || [ "$status" = "307" ]; then
    echo "✅ $url → Status $status (OK)"
    ((success_count++))
  else
    echo "⚠️  $url → Status $status"
  fi
done

echo ""
echo "📊 Results: $success_count/$total_count pages accessible"
echo ""

if [ $success_count -eq $total_count ]; then
  echo "🎉 All pages are LIVE and working!"
else
  echo "⚠️  Some pages may need attention"
fi
