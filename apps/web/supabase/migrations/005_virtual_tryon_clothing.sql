-- =====================================================
-- Virtual Try-On: Clothing System
-- Migration for enterprise-grade clothing virtual try-on
-- =====================================================

-- =====================================================
-- TABLE: clothing_categories
-- Manage clothing types and categories
-- =====================================================
CREATE TABLE IF NOT EXISTS clothing_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: clothing_items
-- Store clothing products for virtual try-on
-- =====================================================
CREATE TABLE IF NOT EXISTS clothing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES clothing_categories(id) ON DELETE SET NULL,

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  sku TEXT UNIQUE,

  -- Images
  garment_image_url TEXT NOT NULL, -- Clean product image for try-on
  display_image_url TEXT, -- Marketing/display image
  thumbnail_url TEXT,

  -- Attributes
  color TEXT,
  size TEXT,
  material TEXT,
  tags TEXT[], -- Array of tags: ['casual', 'summer', 'cotton']

  -- Pricing
  price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',

  -- Metadata
  gender TEXT CHECK (gender IN ('male', 'female', 'unisex')),
  season TEXT[], -- ['spring', 'summer']
  style TEXT[], -- ['casual', 'formal', 'sporty']

  -- Store association
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,

  -- Stats
  try_on_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  stock_quantity INTEGER DEFAULT 0,

  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  slug TEXT UNIQUE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLE: clothing_try_ons
-- Store user virtual try-on results
-- =====================================================
CREATE TABLE IF NOT EXISTS clothing_try_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clothing_item_id UUID REFERENCES clothing_items(id) ON DELETE SET NULL,

  -- Input images
  person_image_url TEXT NOT NULL,
  garment_image_url TEXT NOT NULL,

  -- Result
  result_image_url TEXT,
  prediction_id TEXT, -- Replicate/fal.ai prediction ID

  -- Generation settings
  model_type TEXT NOT NULL, -- 'idm-vton', 'kolors', 'catvton'
  seed INTEGER,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- User actions
  is_favorite BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  shared_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLE: clothing_uploads
-- User-uploaded clothing for try-on
-- =====================================================
CREATE TABLE IF NOT EXISTS clothing_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Image details
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  original_filename TEXT,
  file_size INTEGER, -- bytes

  -- Detected attributes (ML/AI processing)
  detected_category TEXT,
  detected_color TEXT,
  detected_style TEXT[],

  -- User metadata
  user_notes TEXT,
  tags TEXT[],

  -- Status
  is_processed BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_clothing_items_category ON clothing_items(category_id);
CREATE INDEX IF NOT EXISTS idx_clothing_items_store ON clothing_items(store_id);
CREATE INDEX IF NOT EXISTS idx_clothing_items_active ON clothing_items(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_clothing_items_featured ON clothing_items(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_clothing_items_tags ON clothing_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_clothing_items_slug ON clothing_items(slug);
CREATE INDEX IF NOT EXISTS idx_clothing_items_created ON clothing_items(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clothing_tryons_user ON clothing_try_ons(user_id);
CREATE INDEX IF NOT EXISTS idx_clothing_tryons_item ON clothing_try_ons(clothing_item_id);
CREATE INDEX IF NOT EXISTS idx_clothing_tryons_status ON clothing_try_ons(status);
CREATE INDEX IF NOT EXISTS idx_clothing_tryons_created ON clothing_try_ons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clothing_tryons_favorite ON clothing_try_ons(is_favorite) WHERE is_favorite = TRUE;

CREATE INDEX IF NOT EXISTS idx_clothing_uploads_user ON clothing_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_clothing_uploads_created ON clothing_uploads(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE clothing_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_try_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_uploads ENABLE ROW LEVEL SECURITY;

-- Policies for clothing_categories (public read)
CREATE POLICY "Categories are publicly readable"
  ON clothing_categories FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Policies for clothing_items (public read)
CREATE POLICY "Active clothing items are publicly readable"
  ON clothing_items FOR SELECT
  TO authenticated
  USING (is_active = TRUE AND deleted_at IS NULL);

CREATE POLICY "Store owners can manage their clothing items"
  ON clothing_items FOR ALL
  USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- Policies for clothing_try_ons (user-specific)
CREATE POLICY "Users can view their own try-ons"
  ON clothing_try_ons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create try-ons"
  ON clothing_try_ons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own try-ons"
  ON clothing_try_ons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own try-ons"
  ON clothing_try_ons FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for clothing_uploads (user-specific)
CREATE POLICY "Users can view their own uploads"
  ON clothing_uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload clothing"
  ON clothing_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their uploads"
  ON clothing_uploads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their uploads"
  ON clothing_uploads FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS for clothing management
-- =====================================================

-- Update try-on count when new try-on is created
CREATE OR REPLACE FUNCTION increment_clothing_tryon_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clothing_item_id IS NOT NULL THEN
    UPDATE clothing_items
    SET try_on_count = try_on_count + 1
    WHERE id = NEW.clothing_item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_tryon_count
  AFTER INSERT ON clothing_try_ons
  FOR EACH ROW
  EXECUTE FUNCTION increment_clothing_tryon_count();

-- Update favorite count
CREATE OR REPLACE FUNCTION update_clothing_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_favorite != OLD.is_favorite AND NEW.clothing_item_id IS NOT NULL THEN
    UPDATE clothing_items
    SET favorite_count = favorite_count + CASE WHEN NEW.is_favorite THEN 1 ELSE -1 END
    WHERE id = NEW.clothing_item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_favorite_count
  AFTER UPDATE ON clothing_try_ons
  FOR EACH ROW
  WHEN (OLD.is_favorite IS DISTINCT FROM NEW.is_favorite)
  EXECUTE FUNCTION update_clothing_favorite_count();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clothing_items_updated_at
  BEFORE UPDATE ON clothing_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clothing_categories_updated_at
  BEFORE UPDATE ON clothing_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA: Clothing Categories
-- =====================================================
INSERT INTO clothing_categories (name, display_name, description, icon_name, sort_order) VALUES
  ('tops', 'Tops & T-Shirts', 'Shirts, blouses, and tops', 'shirt', 1),
  ('dresses', 'Dresses', 'Casual and formal dresses', 'dress', 2),
  ('outerwear', 'Jackets & Coats', 'Outerwear and jackets', 'jacket', 3),
  ('pants', 'Pants & Jeans', 'Trousers and denim', 'pants', 4),
  ('skirts', 'Skirts', 'Mini, midi, and maxi skirts', 'skirt', 5),
  ('suits', 'Suits & Blazers', 'Formal wear and blazers', 'briefcase', 6),
  ('activewear', 'Activewear', 'Sportswear and gym clothes', 'activity', 7),
  ('swimwear', 'Swimwear', 'Bikinis and swimsuits', 'waves', 8)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SAMPLE DATA: Clothing Items
-- =====================================================
INSERT INTO clothing_items (
  category_id,
  name,
  description,
  brand,
  garment_image_url,
  color,
  size,
  price,
  gender,
  tags,
  is_active,
  is_featured,
  stock_quantity
)
SELECT
  (SELECT id FROM clothing_categories WHERE name = 'tops'),
  'Classic White T-Shirt',
  'Essential cotton crew neck tee for everyday wear',
  'BeautyTryOn Essentials',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
  'White',
  'M',
  29.99,
  'unisex',
  ARRAY['casual', 'basic', 'cotton'],
  TRUE,
  TRUE,
  100
WHERE NOT EXISTS (
  SELECT 1 FROM clothing_items WHERE name = 'Classic White T-Shirt'
);

INSERT INTO clothing_items (
  category_id,
  name,
  description,
  brand,
  garment_image_url,
  color,
  size,
  price,
  gender,
  tags,
  is_active,
  is_featured,
  stock_quantity
)
SELECT
  (SELECT id FROM clothing_categories WHERE name = 'dresses'),
  'Summer Floral Dress',
  'Lightweight floral print dress perfect for summer',
  'BeautyTryOn Collection',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
  'Floral',
  'M',
  79.99,
  'female',
  ARRAY['summer', 'casual', 'floral'],
  TRUE,
  TRUE,
  50
WHERE NOT EXISTS (
  SELECT 1 FROM clothing_items WHERE name = 'Summer Floral Dress'
);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE clothing_categories IS 'Clothing product categories (tops, dresses, etc.)';
COMMENT ON TABLE clothing_items IS 'Clothing products available for virtual try-on';
COMMENT ON TABLE clothing_try_ons IS 'User virtual try-on sessions and results';
COMMENT ON TABLE clothing_uploads IS 'User-uploaded clothing images for try-on';

COMMENT ON FUNCTION increment_clothing_tryon_count IS 'Increments try-on count when user tries on clothing';
COMMENT ON FUNCTION update_clothing_favorite_count IS 'Updates favorite count when user favorites/unfavorites';
