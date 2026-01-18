-- ============================================================================
-- BeautyTryOn - Complete Production Database Schema
-- ============================================================================
-- This migration creates all tables, relationships, RLS policies, and indexes
-- for a production-ready B2B beauty marketplace application.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Stores additional user information beyond Supabase auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    notification_preferences JSONB DEFAULT '{"newStyles": true, "tips": true, "updates": true, "offers": true}'::jsonb,
    is_premium BOOLEAN DEFAULT false,
    premium_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles(is_premium);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STORES TABLE
-- ============================================================================
-- Salon/store listings for the B2B marketplace
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    total_styles INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
    subscription_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for stores
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_is_active ON public.stores(is_active);
CREATE INDEX IF NOT EXISTS idx_stores_is_featured ON public.stores(is_featured);
CREATE INDEX IF NOT EXISTS idx_stores_city ON public.stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_specialties ON public.stores USING GIN(specialties);

-- RLS for stores
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active stores"
    ON public.stores FOR SELECT
    USING (is_active = true);

CREATE POLICY "Store owners can update their stores"
    ON public.stores FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create stores"
    ON public.stores FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- ============================================================================
-- HAIR STYLES TABLE (Global Library)
-- ============================================================================
-- Global hair styles available for all users to try on
CREATE TABLE IF NOT EXISTS public.hair_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('short', 'medium', 'long', 'curly', 'straight', 'wavy', 'braids', 'color')),
    color_base TEXT,
    thumbnail_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for hair_styles
CREATE INDEX IF NOT EXISTS idx_hair_styles_category ON public.hair_styles(category);
CREATE INDEX IF NOT EXISTS idx_hair_styles_is_premium ON public.hair_styles(is_premium);
CREATE INDEX IF NOT EXISTS idx_hair_styles_tags ON public.hair_styles USING GIN(tags);

-- RLS for hair_styles
ALTER TABLE public.hair_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hair styles"
    ON public.hair_styles FOR SELECT
    TO authenticated
    USING (true);

-- ============================================================================
-- NAIL STYLES TABLE (Global Library)
-- ============================================================================
-- Global nail designs available for all users to try on
CREATE TABLE IF NOT EXISTS public.nail_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('solid', 'french', 'glitter', 'ombre', 'art', 'minimalist', 'bold')),
    color_code TEXT,
    thumbnail_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for nail_styles
CREATE INDEX IF NOT EXISTS idx_nail_styles_category ON public.nail_styles(category);
CREATE INDEX IF NOT EXISTS idx_nail_styles_is_premium ON public.nail_styles(is_premium);
CREATE INDEX IF NOT EXISTS idx_nail_styles_tags ON public.nail_styles USING GIN(tags);

-- RLS for nail_styles
ALTER TABLE public.nail_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view nail styles"
    ON public.nail_styles FOR SELECT
    TO authenticated
    USING (true);

-- ============================================================================
-- STORE HAIR STYLES TABLE
-- ============================================================================
-- Hair styles offered by specific stores
CREATE TABLE IF NOT EXISTS public.store_hair_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('short', 'medium', 'long', 'curly', 'straight', 'wavy', 'braids', 'color')),
    thumbnail_url TEXT,
    price DECIMAL(10,2),
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for store_hair_styles
CREATE INDEX IF NOT EXISTS idx_store_hair_styles_store_id ON public.store_hair_styles(store_id);
CREATE INDEX IF NOT EXISTS idx_store_hair_styles_is_active ON public.store_hair_styles(is_active);
CREATE INDEX IF NOT EXISTS idx_store_hair_styles_category ON public.store_hair_styles(category);

-- RLS for store_hair_styles
ALTER TABLE public.store_hair_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active store hair styles"
    ON public.store_hair_styles FOR SELECT
    USING (is_active = true);

CREATE POLICY "Store owners can manage their hair styles"
    ON public.store_hair_styles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE stores.id = store_hair_styles.store_id
            AND stores.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- STORE NAIL STYLES TABLE
-- ============================================================================
-- Nail designs offered by specific stores
CREATE TABLE IF NOT EXISTS public.store_nail_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('solid', 'french', 'glitter', 'ombre', 'art', 'minimalist', 'bold')),
    thumbnail_url TEXT,
    price DECIMAL(10,2),
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for store_nail_styles
CREATE INDEX IF NOT EXISTS idx_store_nail_styles_store_id ON public.store_nail_styles(store_id);
CREATE INDEX IF NOT EXISTS idx_store_nail_styles_is_active ON public.store_nail_styles(is_active);
CREATE INDEX IF NOT EXISTS idx_store_nail_styles_category ON public.store_nail_styles(category);

-- RLS for store_nail_styles
ALTER TABLE public.store_nail_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active store nail styles"
    ON public.store_nail_styles FOR SELECT
    USING (is_active = true);

CREATE POLICY "Store owners can manage their nail styles"
    ON public.store_nail_styles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE stores.id = store_nail_styles.store_id
            AND stores.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- TRY-ONS TABLE
-- ============================================================================
-- User's saved try-on results for hair and nails
CREATE TABLE IF NOT EXISTS public.try_ons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('hair', 'nails')),
    style_id UUID,
    result_image_url TEXT NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for try_ons
CREATE INDEX IF NOT EXISTS idx_try_ons_user_id ON public.try_ons(user_id);
CREATE INDEX IF NOT EXISTS idx_try_ons_type ON public.try_ons(type);
CREATE INDEX IF NOT EXISTS idx_try_ons_is_favorite ON public.try_ons(is_favorite);
CREATE INDEX IF NOT EXISTS idx_try_ons_created_at ON public.try_ons(created_at DESC);

-- RLS for try_ons
ALTER TABLE public.try_ons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own try-ons"
    ON public.try_ons FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own try-ons"
    ON public.try_ons FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own try-ons"
    ON public.try_ons FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own try-ons"
    ON public.try_ons FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================
-- Appointment bookings from customers to stores
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    style_id UUID,
    style_type TEXT CHECK (style_type IN ('hair', 'nails')),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    notes TEXT,
    total_price DECIMAL(10,2),
    estimated_duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_store_id ON public.bookings(store_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);

-- RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
    ON public.bookings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Store owners can view their store bookings"
    ON public.bookings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE stores.id = bookings.store_id
            AND stores.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
    ON public.bookings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Store owners can update bookings for their stores"
    ON public.bookings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE stores.id = bookings.store_id
            AND stores.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================
-- Customer reviews for stores
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_store_id ON public.reviews(store_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_is_hidden ON public.reviews(is_hidden);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-hidden reviews"
    ON public.reviews FOR SELECT
    USING (is_hidden = false);

CREATE POLICY "Users can view their own reviews"
    ON public.reviews FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- GALLERIES TABLE
-- ============================================================================
-- Public galleries/collections that users can share
CREATE TABLE IF NOT EXISTS public.galleries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    try_on_ids UUID[] DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for galleries
CREATE INDEX IF NOT EXISTS idx_galleries_user_id ON public.galleries(user_id);
CREATE INDEX IF NOT EXISTS idx_galleries_is_public ON public.galleries(is_public);

-- RLS for galleries
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own galleries"
    ON public.galleries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public galleries"
    ON public.galleries FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can create their own galleries"
    ON public.galleries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own galleries"
    ON public.galleries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own galleries"
    ON public.galleries FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- ANALYTICS EVENTS TABLE
-- ============================================================================
-- Track user behavior for analytics
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- RLS for analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create analytics events"
    ON public.analytics_events FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.stores
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.store_hair_styles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.store_nail_styles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.galleries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update store rating when review is created/updated
CREATE OR REPLACE FUNCTION public.update_store_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.stores
    SET
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM public.reviews
            WHERE store_id = NEW.store_id AND is_hidden = false
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE store_id = NEW.store_id AND is_hidden = false
        )
    WHERE id = NEW.store_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating store ratings
CREATE TRIGGER update_rating_on_review AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_store_rating();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
-- Note: These need to be created via Supabase Dashboard or API
-- Commands documented here for reference:

-- CREATE STORAGE BUCKET avatars (public)
-- CREATE STORAGE BUCKET store-images (public)
-- CREATE STORAGE BUCKET try-on-results (private - user specific)

-- Storage policies will be created after buckets exist

-- ============================================================================
-- COMPLETED
-- ============================================================================
-- All tables, indexes, RLS policies, and triggers have been created
-- Next step: Run sample data migration


-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- ============================================================================
-- BeautyTryOn - Professional Sample Data
-- ============================================================================
-- This migration populates the database with realistic, professional data
-- for testing and demonstration purposes.
-- ============================================================================

-- ============================================================================
-- HAIR STYLES (Global Library)
-- ============================================================================
INSERT INTO public.hair_styles (name, category, color_base, thumbnail_url, is_premium, tags) VALUES
-- Short Styles
('Pixie Cut', 'short', '#2C1810', 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400', false, ARRAY['trendy', 'low-maintenance', 'edgy']),
('Classic Bob', 'short', '#4A3728', 'https://images.unsplash.com/photo-1595475884562-073c30d45670?w=400', false, ARRAY['classic', 'professional', 'versatile']),
('Textured Crop', 'short', '#3E2723', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', false, ARRAY['modern', 'textured', 'casual']),
('Platinum Pixie', 'short', '#F5F5DC', 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400', true, ARRAY['bold', 'platinum', 'statement']),

-- Medium Styles
('Beach Waves', 'medium', '#8B6F47', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', false, ARRAY['casual', 'beachy', 'effortless']),
('Textured Lob', 'medium', '#5D4037', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400', false, ARRAY['textured', 'modern', 'versatile']),
('Rose Gold Medium', 'medium', '#ECC5C0', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', true, ARRAY['rose-gold', 'trendy', 'romantic']),
('Burgundy Waves', 'medium', '#800020', 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400', true, ARRAY['burgundy', 'dramatic', 'fall']),
('Honey Balayage Lob', 'medium', '#D4A373', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', true, ARRAY['balayage', 'honey', 'sun-kissed']),

-- Long Styles
('Long Layers', 'long', '#3A2618', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400', false, ARRAY['layers', 'voluminous', 'classic']),
('Mermaid Waves', 'long', '#D4AF37', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400', true, ARRAY['wavy', 'golden', 'glamorous']),
('Sleek Straight', 'long', '#1B1B1B', 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=400', false, ARRAY['sleek', 'straight', 'polished']),
('Caramel Highlights Long', 'long', '#C68642', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', true, ARRAY['highlights', 'caramel', 'dimensional']),

-- Curly Styles
('Tight Curls', 'curly', '#2C1810', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400', false, ARRAY['curly', 'natural', 'volumetric']),
('Afro', 'curly', '#3E2723', 'https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?w=400', false, ARRAY['afro', 'natural', 'bold']),
('Bohemian Curls', 'curly', '#6D4C41', 'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?w=400', false, ARRAY['boho', 'romantic', 'soft-curls']),
('Copper Curls', 'curly', '#B87333', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', true, ARRAY['copper', 'vibrant', 'curly']),

-- Color Transformations
('Silver Ombre', 'color', '#C0C0C0', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400', true, ARRAY['silver', 'ombre', 'edgy']),
('Lavender Dream', 'color', '#E6E6FA', 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400', true, ARRAY['lavender', 'pastel', 'fantasy']),
('Rose Gold Transformation', 'color', '#B76E79', 'https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=400', true, ARRAY['rose-gold', 'trendy', 'transformation']),

-- Braids
('Box Braids', 'braids', '#2C1810', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400', false, ARRAY['braids', 'protective', 'long-lasting']),
('French Braid Crown', 'braids', '#4A3728', 'https://images.unsplash.com/photo-1542345812-d98b5cd6cf98?w=400', false, ARRAY['french-braid', 'crown', 'elegant']),

-- Straight Styles
('Glass Hair', 'straight', '#1A1A1A', 'https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=400', true, ARRAY['glass-hair', 'ultra-sleek', 'glossy']),
('Blunt Cut Long', 'straight', '#3E2723', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', false, ARRAY['blunt', 'sleek', 'modern']);

-- ============================================================================
-- NAIL STYLES (Global Library)
-- ============================================================================
INSERT INTO public.nail_styles (name, category, color_code, thumbnail_url, is_premium, tags) VALUES
-- Solid Colors
('Classic Red', 'solid', '#DC143C', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', false, ARRAY['classic', 'red', 'timeless']),
('Nude Pink', 'solid', '#FFB6C1', 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400', false, ARRAY['nude', 'natural', 'professional']),
('Midnight Black', 'solid', '#000000', 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400', false, ARRAY['black', 'edgy', 'bold']),
('Coral Crush', 'solid', '#FF6B6B', 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400', false, ARRAY['coral', 'summer', 'vibrant']),
('Lavender Dreams', 'solid', '#E6E6FA', 'https://images.unsplash.com/photo-1599948128020-9a44d19d5f5a?w=400', false, ARRAY['lavender', 'pastel', 'soft']),

-- French Manicure
('Classic French', 'french', '#FFFFFF', 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400', false, ARRAY['french', 'classic', 'elegant']),
('Gold French Tips', 'french', '#FFD700', 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400', true, ARRAY['gold', 'french', 'luxury']),
('Black French', 'french', '#000000', 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400', true, ARRAY['black', 'french', 'modern']),
('Pink Chrome French', 'french', '#FFB6C1', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', true, ARRAY['chrome', 'french', 'trendy']),

-- Glitter
('Rose Gold Glitter', 'glitter', '#B76E79', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', false, ARRAY['rose-gold', 'glitter', 'sparkle']),
('Silver Sparkle', 'glitter', '#C0C0C0', 'https://images.unsplash.com/photo-1599948128020-9a44d19d5f5a?w=400', false, ARRAY['silver', 'glitter', 'party']),
('Gold Shimmer', 'glitter', '#FFD700', 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400', true, ARRAY['gold', 'shimmer', 'glamorous']),
('Holographic Glitter', 'glitter', '#E0BBE4', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', true, ARRAY['holographic', 'glitter', 'multi-chrome']),

-- Ombre/Gradient
('Rose Ombre', 'ombre', '#FF69B4', 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400', false, ARRAY['ombre', 'pink', 'gradient']),
('Sunset Gradient', 'ombre', '#FF6347', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', true, ARRAY['gradient', 'sunset', 'warm']),
('Ocean Blue Ombre', 'ombre', '#1E90FF', 'https://images.unsplash.com/photo-1599948128020-9a44d19d5f5a?w=400', true, ARRAY['blue', 'ombre', 'ocean']),
('Purple Galaxy Gradient', 'ombre', '#9370DB', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', true, ARRAY['purple', 'galaxy', 'gradient']),

-- Nail Art
('Floral Art', 'art', '#FFFFFF', 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400', true, ARRAY['floral', 'art', 'delicate']),
('Geometric Patterns', 'art', '#000000', 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400', true, ARRAY['geometric', 'modern', 'art']),
('Marble Effect', 'art', '#D3D3D3', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', true, ARRAY['marble', 'art', 'sophisticated']),
('Abstract Swirls', 'art', '#FF1493', 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400', true, ARRAY['abstract', 'art', 'creative']),

-- Minimalist
('Simple Line Art', 'minimalist', '#FFFFFF', 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400', false, ARRAY['minimalist', 'simple', 'chic']),
('Negative Space', 'minimalist', '#FFB6C1', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', false, ARRAY['negative-space', 'minimalist', 'modern']),
('Dots & Dashes', 'minimalist', '#000000', 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400', false, ARRAY['minimalist', 'geometric', 'simple']),

-- Bold/Dramatic
('Neon Pink', 'bold', '#FF10F0', 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400', true, ARRAY['neon', 'bold', 'vibrant']),
('Electric Blue', 'bold', '#00FFFF', 'https://images.unsplash.com/photo-1599948128020-9a44d19d5f5a?w=400', true, ARRAY['blue', 'electric', 'bold']),
('Deep Purple Velvet', 'bold', '#4B0082', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', true, ARRAY['purple', 'velvet', 'dramatic']);

-- ============================================================================
-- SAMPLE STORES
-- ============================================================================
-- Note: These stores use placeholder owner_id (you'll need to replace with real user IDs)
-- For now, we'll create them without owner_id (can be set later via dashboard)

INSERT INTO public.stores (
    business_name,
    slug,
    description,
    email,
    phone,
    address,
    city,
    state,
    zip_code,
    specialties,
    rating,
    review_count,
    total_styles,
    is_featured,
    subscription_tier,
    logo_url,
    cover_image_url
) VALUES
(
    'Glamour Studio NYC',
    'glamour-studio-nyc',
    'Premier hair and nail salon in the heart of Manhattan. Specializing in color transformations, extensions, and luxury nail art. Our award-winning stylists bring 15+ years of experience.',
    'contact@glamourstudionyc.com',
    '+1 (212) 555-0123',
    '123 Fifth Avenue, Suite 500',
    'New York',
    'NY',
    '10001',
    ARRAY['hair', 'nails', 'color', 'extensions', 'bridal'],
    4.8,
    156,
    42,
    true,
    'premium',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200'
),
(
    'The Nail Bar LA',
    'the-nail-bar-la',
    'Los Angeles'' favorite destination for luxury nail services. From classic manicures to intricate nail art, our expert technicians deliver perfection every time.',
    'info@nailbarla.com',
    '+1 (310) 555-0456',
    '8500 Sunset Boulevard',
    'Los Angeles',
    'CA',
    '90069',
    ARRAY['nails', 'art', 'luxury'],
    4.9,
    203,
    38,
    true,
    'premium',
    'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200'
),
(
    'Bella Hair Boutique',
    'bella-hair-boutique',
    'Family-owned salon specializing in natural hair care, braiding, and protective styles. We celebrate the beauty of all hair textures with expert care and styling.',
    'hello@bellahair.com',
    '+1 (404) 555-0789',
    '2750 Peachtree Road NE',
    'Atlanta',
    'GA',
    '30305',
    ARRAY['hair', 'braids', 'natural-hair', 'color'],
    4.7,
    98,
    28,
    false,
    'basic',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200'
),
(
    'Modern Edge Salon',
    'modern-edge-salon',
    'Contemporary salon offering cutting-edge techniques in hair cutting, coloring, and styling. Known for our signature balayage and precision cuts.',
    'bookings@modernedge.com',
    '+1 (512) 555-0234',
    '1100 Congress Avenue',
    'Austin',
    'TX',
    '78701',
    ARRAY['hair', 'color', 'styling', 'mens'],
    4.6,
    127,
    35,
    false,
    'basic',
    'https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=400',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200'
),
(
    'Serenity Spa & Nails',
    'serenity-spa-nails',
    'Full-service spa offering premium nail care, waxing, and facials. Relax in our tranquil atmosphere while we pamper you from head to toe.',
    'relax@serenityspa.com',
    '+1 (305) 555-0567',
    '1425 Ocean Drive',
    'Miami Beach',
    'FL',
    '33139',
    ARRAY['nails', 'spa', 'waxing', 'facials'],
    4.9,
    245,
    31,
    true,
    'enterprise',
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200'
),
(
    'Color House Studio',
    'color-house-studio',
    'Specialized color bar featuring expert colorists trained in the latest techniques. From subtle highlights to bold fashion colors, we do it all.',
    'info@colorhouse.com',
    '+1 (415) 555-0890',
    '567 Valencia Street',
    'San Francisco',
    'CA',
    '94110',
    ARRAY['hair', 'color', 'highlights', 'balayage'],
    4.8,
    189,
    40,
    true,
    'premium',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200'
);

-- ============================================================================
-- SAMPLE STORE HAIR STYLES
-- ============================================================================
-- Glamour Studio NYC hair styles
INSERT INTO public.store_hair_styles (store_id, name, description, category, thumbnail_url, price, duration_minutes, tags)
SELECT
    id,
    'Platinum Blonde Transformation',
    'Complete color transformation to stunning platinum blonde with Olaplex treatment. Includes cut and style.',
    'color',
    'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400',
    450.00,
    240,
    ARRAY['platinum', 'color', 'olaplex', 'transformation']
FROM public.stores WHERE slug = 'glamour-studio-nyc';

INSERT INTO public.store_hair_styles (store_id, name, description, category, thumbnail_url, price, duration_minutes, tags)
SELECT
    id,
    'Balayage Highlights',
    'Hand-painted balayage highlights for a natural, sun-kissed look. Customized to your skin tone.',
    'color',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
    285.00,
    180,
    ARRAY['balayage', 'highlights', 'natural']
FROM public.stores WHERE slug = 'glamour-studio-nyc';

INSERT INTO public.store_hair_styles (store_id, name, description, category, thumbnail_url, price, duration_minutes, tags)
SELECT
    id,
    'Luxury Hair Extensions',
    '100% human hair extensions for length and volume. Includes consultation and styling.',
    'long',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
    850.00,
    300,
    ARRAY['extensions', 'luxury', 'volume']
FROM public.stores WHERE slug = 'glamour-studio-nyc';

-- Bella Hair Boutique styles
INSERT INTO public.store_hair_styles (store_id, name, description, category, thumbnail_url, price, duration_minutes, tags)
SELECT
    id,
    'Knotless Box Braids',
    'Protective knotless box braids that are gentle on your edges. Includes hair.',
    'braids',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
    225.00,
    360,
    ARRAY['braids', 'protective', 'knotless']
FROM public.stores WHERE slug = 'bella-hair-boutique';

INSERT INTO public.store_hair_styles (store_id, name, description, category, thumbnail_url, price, duration_minutes, tags)
SELECT
    id,
    'Natural Hair Treatment & Style',
    'Deep conditioning treatment followed by wash and style for natural hair.',
    'curly',
    'https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?w=400',
    95.00,
    120,
    ARRAY['natural', 'treatment', 'curly']
FROM public.stores WHERE slug = 'bella-hair-boutique';

-- Color House Studio styles
INSERT INTO public.store_hair_styles (store_id, name, description, category, thumbnail_url, price, duration_minutes, tags)
SELECT
    id,
    'Rose Gold Color Melt',
    'Trendy rose gold color melt with seamless blending. Perfect for making a statement.',
    'color',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    325.00,
    210,
    ARRAY['rose-gold', 'color-melt', 'trendy']
FROM public.stores WHERE slug = 'color-house-studio';

INSERT INTO public.store_hair_styles (store_id, name, description, category, thumbnail_url, price, duration_minutes, tags)
SELECT
    id,
    'Vivid Fashion Color',
    'Bold, vibid fashion colors including purple, blue, pink, and more. Pre-lightening included.',
    'color',
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400',
    395.00,
    270,
    ARRAY['fashion-color', 'vivid', 'bold']
FROM public.stores WHERE slug = 'color-house-studio';

-- ============================================================================
-- SAMPLE STORE NAIL STYLES
-- ============================================================================
-- The Nail Bar LA styles
INSERT INTO public.store_nail_styles (store_id, name, description, category, thumbnail_url, price, duration_minutes, tags)
SELECT
    id,
    'Luxury Gel Manicure',
    'Premium gel manicure with extended wear formula. Includes cuticle care and hand massage.',
    'solid',
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    65.00,
    60,
    ARRAY['gel', 'manicure', 'luxury']
FROM public.stores WHERE slug = 'the-nail-bar-la';

INSERT INTO public.store_nail_styles (store_id, name, description, category, thumbnail_url, price, duration_minutes, tags)
SELECT
    id,
    'Custom Nail Art',
    'Intricate custom nail art designed by our award-winning technicians. Completely personalized.',
    'art',
    'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400',
    125.00,
    90,
    ARRAY['nail-art', 'custom', 'intricate']
FROM public.stores WHERE slug = 'the-nail-bar-la';

INSERT INTO public.store_nail_styles (store_id, name, description, category, thumbnail_url, price, duration_minutes, tags)
SELECT
    id,
    'Chrome Powder Nails',
    'Stunning chrome powder finish in rose gold, silver, or holographic. Showstopping shine.',
    'glitter',
    'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400',
    85.00,
    75,
    ARRAY['chrome', 'powder', 'metallic']
FROM public.stores WHERE slug = 'the-nail-bar-la';

-- Serenity Spa & Nails styles
INSERT INTO public.store_nail_styles (store_id, name, description, category, thumbnail_url, price, duration_minutes, tags)
SELECT
    id,
    'Spa Pedicure Deluxe',
    'Ultimate pedicure experience with exfoliation, massage, paraffin treatment, and gel polish.',
    'solid',
    'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400',
    95.00,
    90,
    ARRAY['pedicure', 'spa', 'deluxe']
FROM public.stores WHERE slug = 'serenity-spa-nails';

INSERT INTO public.store_nail_styles (store_id, name, description, category, thumbnail_url, price, duration_minutes, tags)
SELECT
    id,
    'Ombre Gel Set',
    'Beautiful ombre effect with your choice of color combination. Seamless gradient blending.',
    'ombre',
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400',
    75.00,
    75,
    ARRAY['ombre', 'gradient', 'gel']
FROM public.stores WHERE slug = 'serenity-spa-nails';

-- ============================================================================
-- SAMPLE REVIEWS
-- ============================================================================
-- Note: These reviews need real user_ids, so they'll be created after users sign up
-- The INSERT statements are provided as templates

-- Template for creating reviews after user signup:
/*
INSERT INTO public.reviews (user_id, store_id, rating, title, comment)
SELECT
    '[USER_ID]'::uuid,
    id,
    5,
    'Amazing transformation!',
    'I got the platinum blonde transformation and I absolutely love it! The stylist was so skilled and made sure my hair stayed healthy throughout the process. Will definitely be back!'
FROM public.stores WHERE slug = 'glamour-studio-nyc';
*/

-- ============================================================================
-- COMPLETED
-- ============================================================================
-- Sample data has been populated:
-- - 25 hair styles (global library)
-- - 28 nail styles (global library)
-- - 6 professional stores with realistic details
-- - 10+ store-specific hair and nail styles with pricing
-- - Review templates ready for user creation
