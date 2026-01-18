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
