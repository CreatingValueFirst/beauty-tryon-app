-- =============================================
-- B2B MARKETPLACE SCHEMA
-- Enables salons/stores to sell their styles
-- =============================================

-- Business/Store accounts
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,

  -- Contact information
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,

  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'US',
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Business details
  business_type TEXT DEFAULT 'salon', -- salon, barbershop, spa, freelance
  specialties TEXT[] DEFAULT '{}', -- hair, nails, makeup, etc.

  -- Subscription & Status
  subscription_tier TEXT DEFAULT 'free', -- free, basic, premium, enterprise
  subscription_status TEXT DEFAULT 'active', -- active, past_due, canceled, trialing
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,

  -- Stats
  total_styles INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,

  -- Settings
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  accepts_bookings BOOLEAN DEFAULT TRUE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Pricing
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',

  -- Limits
  max_styles INTEGER, -- null = unlimited
  max_photos_per_style INTEGER DEFAULT 5,
  max_team_members INTEGER DEFAULT 1,

  -- Features
  features JSONB DEFAULT '[]'::jsonb,
  allows_booking BOOLEAN DEFAULT TRUE,
  allows_analytics BOOLEAN DEFAULT TRUE,
  priority_support BOOLEAN DEFAULT FALSE,
  featured_listing BOOLEAN DEFAULT FALSE,

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store subscriptions (payment history)
CREATE TABLE IF NOT EXISTS store_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id),

  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,

  -- Subscription details
  status TEXT DEFAULT 'active', -- active, past_due, canceled, unpaid
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,

  -- Billing
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  interval TEXT DEFAULT 'month', -- month, year

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store team members
CREATE TABLE IF NOT EXISTS store_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  role TEXT DEFAULT 'stylist', -- owner, manager, stylist, admin
  permissions JSONB DEFAULT '[]'::jsonb,

  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  specialties TEXT[] DEFAULT '{}',

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(store_id, user_id)
);

-- Store-owned hair styles
CREATE TABLE IF NOT EXISTS store_hair_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES store_team_members(id),

  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,

  -- Styling details
  color_base TEXT,
  thumbnail_url TEXT,
  texture_url TEXT,
  model_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',

  -- Pricing (optional)
  price DECIMAL(10, 2),
  duration_minutes INTEGER,
  currency TEXT DEFAULT 'USD',

  tags TEXT[] DEFAULT '{}',
  difficulty_level TEXT, -- easy, medium, hard

  -- Stats
  view_count INTEGER DEFAULT 0,
  try_on_count INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,

  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store-owned nail styles
CREATE TABLE IF NOT EXISTS store_nail_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES store_team_members(id),

  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,

  -- Design details
  color_code TEXT,
  pattern_url TEXT,
  thumbnail_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',

  -- Pricing (optional)
  price DECIMAL(10, 2),
  duration_minutes INTEGER,
  currency TEXT DEFAULT 'USD',

  tags TEXT[] DEFAULT '{}',
  difficulty_level TEXT,

  -- Stats
  view_count INTEGER DEFAULT 0,
  try_on_count INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,

  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings/Appointments
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  stylist_id UUID REFERENCES store_team_members(id),

  -- What's being booked
  service_type TEXT NOT NULL, -- hair, nails, makeup
  style_id UUID, -- references store_hair_styles or store_nail_styles
  style_name TEXT,

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,

  -- Status
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, canceled, no_show

  -- Pricing
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded

  -- Contact
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,

  -- Notes
  notes TEXT,
  cancellation_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews and Ratings
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,

  -- What was reviewed
  service_type TEXT, -- hair, nails, overall
  style_id UUID,

  -- Photos
  photo_urls TEXT[] DEFAULT '{}',

  -- Store response
  store_response TEXT,
  responded_at TIMESTAMPTZ,

  is_verified BOOLEAN DEFAULT FALSE, -- verified booking
  is_featured BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,

  helpful_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, booking_id)
);

-- Store analytics events
CREATE TABLE IF NOT EXISTS store_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,

  event_type TEXT NOT NULL, -- view, try_on, booking, click, share

  -- Context
  style_id UUID,
  style_type TEXT, -- hair, nail
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  type TEXT NOT NULL, -- subscription, booking, refund

  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,

  -- Amount
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  status TEXT DEFAULT 'pending', -- pending, succeeded, failed, refunded

  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_slug ON stores(slug);
CREATE INDEX idx_stores_city_state ON stores(city, state) WHERE is_active = TRUE;
CREATE INDEX idx_stores_subscription_tier ON stores(subscription_tier) WHERE is_active = TRUE;
CREATE INDEX idx_stores_rating ON stores(rating DESC) WHERE is_active = TRUE;

CREATE INDEX idx_store_hair_styles_store_id ON store_hair_styles(store_id) WHERE is_active = TRUE;
CREATE INDEX idx_store_hair_styles_category ON store_hair_styles(category) WHERE is_active = TRUE;
CREATE INDEX idx_store_hair_styles_tags ON store_hair_styles USING GIN(tags);

CREATE INDEX idx_store_nail_styles_store_id ON store_nail_styles(store_id) WHERE is_active = TRUE;
CREATE INDEX idx_store_nail_styles_category ON store_nail_styles(category) WHERE is_active = TRUE;
CREATE INDEX idx_store_nail_styles_tags ON store_nail_styles USING GIN(tags);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_store_id ON bookings(store_id);
CREATE INDEX idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE INDEX idx_reviews_store_id ON reviews(store_id) WHERE is_hidden = FALSE;
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE INDEX idx_store_analytics_store_id ON store_analytics(store_id);
CREATE INDEX idx_store_analytics_created_at ON store_analytics(created_at DESC);
CREATE INDEX idx_store_analytics_event_type ON store_analytics(event_type);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_hair_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_nail_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Stores: Public read active stores, owners can manage their own
CREATE POLICY "Public can view active stores"
  ON stores FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Store owners can manage their stores"
  ON stores FOR ALL
  USING (auth.uid() = owner_id);

-- Store styles: Public read, store team can manage
CREATE POLICY "Public can view active store hair styles"
  ON store_hair_styles FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Store team can manage hair styles"
  ON store_hair_styles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM store_team_members
      WHERE store_team_members.store_id = store_hair_styles.store_id
      AND store_team_members.user_id = auth.uid()
      AND store_team_members.is_active = TRUE
    )
  );

CREATE POLICY "Public can view active store nail styles"
  ON store_nail_styles FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Store team can manage nail styles"
  ON store_nail_styles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM store_team_members
      WHERE store_team_members.store_id = store_nail_styles.store_id
      AND store_team_members.user_id = auth.uid()
      AND store_team_members.is_active = TRUE
    )
  );

-- Bookings: Users see their own, stores see theirs
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Store team can view store bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM store_team_members
      WHERE store_team_members.store_id = bookings.store_id
      AND store_team_members.user_id = auth.uid()
      AND store_team_members.is_active = TRUE
    )
  );

CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Reviews: Public read non-hidden, users manage their own
CREATE POLICY "Public can view reviews"
  ON reviews FOR SELECT
  USING (is_hidden = FALSE);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Store analytics: Only store team can read
CREATE POLICY "Store team can view analytics"
  ON store_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM store_team_members
      WHERE store_team_members.store_id = store_analytics.store_id
      AND store_team_members.user_id = auth.uid()
      AND store_team_members.is_active = TRUE
    )
  );

-- =============================================
-- TRIGGERS & FUNCTIONS
-- =============================================

-- Update store updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_hair_styles_updated_at
  BEFORE UPDATE ON store_hair_styles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_nail_styles_updated_at
  BEFORE UPDATE ON store_nail_styles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update store total_styles count
CREATE OR REPLACE FUNCTION update_store_style_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stores SET total_styles = total_styles + 1 WHERE id = NEW.store_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stores SET total_styles = total_styles - 1 WHERE id = OLD.store_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_store_hair_style_count
  AFTER INSERT OR DELETE ON store_hair_styles
  FOR EACH ROW
  EXECUTE FUNCTION update_store_style_count();

CREATE TRIGGER update_store_nail_style_count
  AFTER INSERT OR DELETE ON store_nail_styles
  FOR EACH ROW
  EXECUTE FUNCTION update_store_style_count();

-- Update store rating when review added/updated
CREATE OR REPLACE FUNCTION update_store_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stores SET
    rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE store_id = NEW.store_id AND is_hidden = FALSE),
    review_count = (SELECT COUNT(*) FROM reviews WHERE store_id = NEW.store_id AND is_hidden = FALSE)
  WHERE id = NEW.store_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_store_rating_on_review
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_store_rating();

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert subscription plans
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, max_styles, features) VALUES
('Free', 'free', 'Perfect for getting started', 0.00, 0.00, 5,
 '["Up to 5 styles", "Basic analytics", "Email support"]'::jsonb),

('Basic', 'basic', 'For growing salons', 29.00, 290.00, 50,
 '["Up to 50 styles", "Advanced analytics", "Booking management", "Priority email support", "Custom branding"]'::jsonb),

('Premium', 'premium', 'For established businesses', 99.00, 990.00, NULL,
 '["Unlimited styles", "Advanced analytics", "Booking management", "Priority support", "Featured listing", "API access", "Team collaboration", "Custom branding"]'::jsonb),

('Enterprise', 'enterprise', 'For salon chains', 299.00, 2990.00, NULL,
 '["Everything in Premium", "Multi-location support", "Dedicated account manager", "Custom integrations", "White-label options", "Advanced reporting"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'B2B Marketplace schema created successfully!';
  RAISE NOTICE '  - 9 new tables for stores, subscriptions, bookings, reviews';
  RAISE NOTICE '  - 4 subscription plans (Free, Basic, Premium, Enterprise)';
  RAISE NOTICE '  - Full RLS policies for multi-tenant security';
  RAISE NOTICE '  - Analytics and payment tracking';
  RAISE NOTICE 'Stores can now upload styles and accept bookings!';
END $$;
