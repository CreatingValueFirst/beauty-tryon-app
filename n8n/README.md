# BeautyTryOn n8n Workflows

This directory contains automated workflows for the BeautyTryOn application using n8n.

## 📋 Workflows Overview

### 1. Social Media Automation (`social-media-automation.json`)
**Priority: HIGHEST**

Automates social media sharing for user try-on results.

**Features:**
- Multi-platform support (Twitter/X, Instagram, Pinterest)
- Automatic image download and processing
- User preference integration
- Custom watermarking
- Analytics event logging

**Webhook Endpoint:** `/webhook/social-share`

**Request Format:**
```json
{
  "user_id": "uuid",
  "platform": "twitter|instagram|pinterest",
  "image_url": "https://...",
  "style_type": "hair|nails",
  "style_name": "Style Name"
}
```

**Response:**
```json
{
  "success": true,
  "platform": "twitter",
  "post_id": "...",
  "share_url": "https://..."
}
```

### 2. Analytics & Data Sync (`analytics-sync.json`)

Syncs analytics events to external platforms and generates summaries.

**Features:**
- Runs every 15 minutes
- Fetches unsynced events from database
- Sends to PostHog for analytics
- Generates internal summaries
- High traffic alerts via email
- Marks processed events

**Metrics Tracked:**
- Total events per period
- Event type breakdown
- Unique user counts
- High traffic detection

### 3. Image Processing Pipeline (`image-processing.json`)

Comprehensive image processing for try-on results.

**Features:**
- Creates multiple image variants (HD, social, thumbnail, preview)
- Automatic resizing and optimization
- Watermark application for free tier
- Upload to Supabase Storage
- Database record creation
- Optional face analysis
- Processing time analytics

**Webhook Endpoint:** `/webhook/process-tryon-image`

**Request Format:**
```json
{
  "user_id": "uuid",
  "image_url": "https://...",
  "try_on_type": "hair|nails",
  "style_id": "uuid",
  "settings": { /* try-on settings */ }
}
```

**Image Variants Generated:**
- **HD**: 1920x1080, 95% quality, no watermark (premium only)
- **Social**: 1080x1080, 85% quality, watermarked
- **Thumbnail**: 400x400, 80% quality, no watermark
- **Preview**: 800x600, 75% quality, watermarked (free tier)

### 4. User Onboarding (`user-onboarding.json`)

Automated user onboarding and engagement emails.

**Features:**
- Welcome email immediately after signup
- Default gallery creation
- 2-day engagement check
- Re-engagement email for inactive users
- 7-day upgrade offer (50% off)
- Analytics event tracking

**Webhook Endpoint:** `/webhook/user-signup`

**Request Format:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "full_name": "User Name",
  "username": "username",
  "avatar_url": "https://..."
}
```

**Email Sequence:**
1. **Day 0**: Welcome email with getting started guide
2. **Day 2**: Engagement check → Help email if inactive
3. **Day 7**: Premium upgrade offer (50% discount)

## 🚀 Setup Instructions

### 1. Install n8n

```bash
# Using npm
npm install -g n8n

# Using Docker
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

### 2. Configure Credentials

1. Copy `credentials.example.json` to `credentials.json`
2. Fill in all credential values:
   - Redis connection details
   - Social media API keys (Twitter, Instagram, Pinterest)
   - Supabase database credentials
   - PostHog API key
   - SMTP email settings
   - Supabase storage and functions auth

3. Import credentials into n8n:
   - Go to n8n UI → Credentials
   - Import from `credentials.json`

### 3. Import Workflows

1. Open n8n UI (default: http://localhost:5678)
2. Go to Workflows
3. Click "Import from File"
4. Import each workflow JSON file:
   - `social-media-automation.json`
   - `analytics-sync.json`
   - `image-processing.json`
   - `user-onboarding.json`

### 4. Activate Workflows

1. For each workflow, click the toggle to activate
2. Verify webhook URLs are accessible
3. Test each workflow with sample data

### 5. Configure Webhooks in Application

Add these webhook URLs to your application:

```typescript
// apps/web/lib/config.ts
export const N8N_WEBHOOKS = {
  socialShare: process.env.N8N_SOCIAL_SHARE_WEBHOOK,
  processImage: process.env.N8N_PROCESS_IMAGE_WEBHOOK,
  userSignup: process.env.N8N_USER_SIGNUP_WEBHOOK,
};
```

Add to `.env.local`:
```bash
N8N_SOCIAL_SHARE_WEBHOOK=https://your-n8n-instance.com/webhook/social-share
N8N_PROCESS_IMAGE_WEBHOOK=https://your-n8n-instance.com/webhook/process-tryon-image
N8N_USER_SIGNUP_WEBHOOK=https://your-n8n-instance.com/webhook/user-signup
```

## 🔧 Configuration

### Environment Variables

Set these in your n8n instance:

```bash
POSTHOG_API_KEY=your-posthog-api-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Schema Requirements

Ensure these tables exist in Supabase:

- `profiles` - User profiles
- `try_ons` - Try-on records
- `galleries` - User galleries
- `gallery_items` - Gallery items
- `analytics_events` - Analytics events
- `analytics_summary` - Analytics summaries (create this table)

**Create analytics_summary table:**
```sql
CREATE TABLE analytics_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_events INTEGER NOT NULL,
  event_breakdown JSONB,
  unique_users INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_summary_period ON analytics_summary(period_start, period_end);
```

**Add synced flag to analytics_events:**
```sql
ALTER TABLE analytics_events
ADD COLUMN synced_to_analytics BOOLEAN DEFAULT false;

CREATE INDEX idx_analytics_events_synced ON analytics_events(synced_to_analytics, created_at);
```

## 📊 Monitoring

### Check Workflow Execution

1. Go to n8n UI → Executions
2. Filter by workflow
3. Check success/failure rates
4. Review execution logs

### Common Issues

**Webhook not triggering:**
- Verify webhook URL is accessible
- Check firewall/proxy settings
- Ensure webhook is activated in workflow

**Database connection failed:**
- Verify Supabase credentials
- Check database is accessible from n8n instance
- Ensure connection pooling is configured

**Email not sending:**
- Verify SMTP credentials
- Check email templates render correctly
- Ensure from email is authorized

**Social media posting failed:**
- Verify API keys are valid
- Check rate limits
- Ensure proper OAuth permissions

## 🧪 Testing

### Test Social Media Workflow

```bash
curl -X POST https://your-n8n-instance.com/webhook/social-share \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "platform": "twitter",
    "image_url": "https://example.com/test-image.jpg",
    "style_type": "hair",
    "style_name": "Purple Dream"
  }'
```

### Test Image Processing

```bash
curl -X POST https://your-n8n-instance.com/webhook/process-tryon-image \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "image_url": "https://example.com/test.jpg",
    "try_on_type": "hair",
    "style_id": "test-style-id",
    "settings": {}
  }'
```

### Test User Onboarding

```bash
curl -X POST https://your-n8n-instance.com/webhook/user-signup \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "email": "test@example.com",
    "full_name": "Test User",
    "username": "testuser"
  }'
```

## 📈 Performance Optimization

### For High Traffic

1. **Scale n8n horizontally:**
   - Run multiple n8n instances
   - Use load balancer
   - Enable queue mode

2. **Optimize database queries:**
   - Add appropriate indexes
   - Use connection pooling
   - Batch operations where possible

3. **Cache frequently accessed data:**
   - Use Redis for user preferences
   - Cache style library data
   - Implement CDN for images

### Cost Optimization

1. **Rate limiting:**
   - Limit webhook calls per user
   - Throttle email sends
   - Batch analytics sync

2. **Resource allocation:**
   - Schedule heavy workflows during off-peak
   - Use smaller image variants when possible
   - Compress images before processing

## 🔒 Security

### Best Practices

1. **Never commit credentials:**
   - Add `credentials.json` to `.gitignore`
   - Use environment variables
   - Rotate keys regularly

2. **Webhook security:**
   - Use HTTPS only
   - Implement webhook signatures
   - Validate all input data

3. **Database access:**
   - Use service role key only in n8n
   - Implement Row Level Security
   - Audit database access logs

## 🆘 Support

For workflow issues:
1. Check n8n execution logs
2. Review error messages
3. Test with minimal data
4. Contact n8n community: https://community.n8n.io

For BeautyTryOn specific issues:
1. Check application logs
2. Verify webhook URLs
3. Test Supabase connection
4. Review credentials configuration

## 📝 Notes

- All workflows use webhook triggers for real-time processing
- Analytics sync runs on schedule (every 15 minutes)
- Email workflows use wait nodes for delayed sending
- All database operations use parameterized queries for security
- Image processing creates multiple variants for different use cases
- Social media integration supports multiple platforms simultaneously
