#!/bin/bash

echo "🔍 Testing Live Deployment: beautytry-on-app.vercel.app"
echo "=========================================================="
echo ""

# Test main URLs
urls=(
  "https://beautytry-on-app.vercel.app/"
  "https://beautytry-on-app.vercel.app/en/dashboard"
  "https://beautytry-on-app.vercel.app/en/dashboard/nails"
  "https://beautytry-on-app.vercel.app/en/dashboard/clothing-tryon"
  "https://beautytry-on-app.vercel.app/bg/dashboard"
  "https://beautytry-on-app.vercel.app/ru/dashboard"
  "https://beautytry-on-app.vercel.app/es/dashboard"
  "https://beautytry-on-app.vercel.app/tr/dashboard"
)

for url in "${urls[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")
  if [ "$status" = "200" ]; then
    echo "✅ $url → Status $status (OK)"
  else
    echo "⚠️  $url → Status $status"
  fi
done

echo ""
echo "🎉 Live Site Test Complete!"
