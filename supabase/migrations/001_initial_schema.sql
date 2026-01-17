-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hair_styles table
CREATE TABLE IF NOT EXISTS hair_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  color_base TEXT,
  thumbnail_url TEXT,
  texture_url TEXT,
  model_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create nail_styles table
CREATE TABLE IF NOT EXISTS nail_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  color_code TEXT,
  pattern_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create try_ons table
CREATE TABLE IF NOT EXISTS try_ons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('hair', 'nails')),
  style_id UUID,
  original_image_url TEXT,
  result_image_url TEXT,
  settings JSONB DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create galleries table
CREATE TABLE IF NOT EXISTS galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gallery_items table
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  try_on_id UUID REFERENCES try_ons(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gallery_id, try_on_id)
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_hair_styles_category ON hair_styles(category);
CREATE INDEX IF NOT EXISTS idx_hair_styles_tags ON hair_styles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_nail_styles_category ON nail_styles(category);
CREATE INDEX IF NOT EXISTS idx_nail_styles_tags ON nail_styles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_try_ons_user_id ON try_ons(user_id);
CREATE INDEX IF NOT EXISTS idx_try_ons_type ON try_ons(type);
CREATE INDEX IF NOT EXISTS idx_try_ons_created_at ON try_ons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_try_ons_is_favorite ON try_ons(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_galleries_user_id ON galleries(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_gallery_id ON gallery_items(gallery_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE try_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Try-ons policies
CREATE POLICY "Users can view own try-ons"
  ON try_ons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own try-ons"
  ON try_ons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own try-ons"
  ON try_ons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own try-ons"
  ON try_ons FOR DELETE
  USING (auth.uid() = user_id);

-- Galleries policies
CREATE POLICY "Users can view own galleries"
  ON galleries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public galleries"
  ON galleries FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Users can insert own galleries"
  ON galleries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own galleries"
  ON galleries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own galleries"
  ON galleries FOR DELETE
  USING (auth.uid() = user_id);

-- Gallery items policies
CREATE POLICY "Users can view own gallery items"
  ON gallery_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM galleries
      WHERE galleries.id = gallery_items.gallery_id
      AND galleries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own gallery items"
  ON gallery_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM galleries
      WHERE galleries.id = gallery_items.gallery_id
      AND galleries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own gallery items"
  ON gallery_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM galleries
      WHERE galleries.id = gallery_items.gallery_id
      AND galleries.user_id = auth.uid()
    )
  );

-- Hair styles and nail styles are public read
CREATE POLICY "Anyone can view hair styles"
  ON hair_styles FOR SELECT
  TO public
  USING (TRUE);

CREATE POLICY "Anyone can view nail styles"
  ON nail_styles FOR SELECT
  TO public
  USING (TRUE);

-- Analytics policies
CREATE POLICY "Users can insert own analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create storage bucket for user images
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-images', 'user-images', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('style-assets', 'style-assets', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view style assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'style-assets');
