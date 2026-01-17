-- =============================================
-- B2B MARKETPLACE SEED DATA
-- Sample stores, styles, and reviews
-- =============================================

-- Note: This assumes you have at least one auth user
-- Create dummy stores with realistic data

-- Insert sample stores (using system user for demo)
INSERT INTO stores (
  id,
  owner_id,
  business_name,
  slug,
  description,
  logo_url,
  cover_image_url,
  email,
  phone,
  address,
  city,
  state,
  country,
  business_type,
  specialties,
  subscription_tier,
  rating,
  review_count,
  is_verified,
  is_featured
) VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Glamour Studio NYC',
  'glamour-studio-nyc',
  'Manhattan''s premier destination for cutting-edge hair styling and color. We specialize in balayage, ombré, and modern cuts.',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&h=400&fit=crop',
  'hello@glamourstudio.nyc',
  '+1 (212) 555-0100',
  '123 Fifth Avenue',
  'New York',
  'NY',
  'US',
  'salon',
  ARRAY['hair', 'color', 'styling'],
  'premium',
  4.8,
  127,
  TRUE,
  TRUE
),
(
  'a2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Nail Artistry LA',
  'nail-artistry-la',
  'Los Angeles'' most creative nail salon. From classic French to bold nail art, we bring your vision to life.',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&h=400&fit=crop',
  'info@nailartistry.la',
  '+1 (310) 555-0200',
  '456 Sunset Boulevard',
  'Los Angeles',
  'CA',
  'US',
  'salon',
  ARRAY['nails', 'art', 'manicure'],
  'premium',
  4.9,
  203,
  TRUE,
  TRUE
),
(
  'a3333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000'::uuid,
  'The Hair Lounge',
  'the-hair-lounge',
  'Chicago''s cozy neighborhood salon specializing in natural hair care and protective styles.',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1633681926035-ec1ac984418a?w=1200&h=400&fit=crop',
  'contact@hairlounge.com',
  '+1 (312) 555-0300',
  '789 Michigan Avenue',
  'Chicago',
  'IL',
  'US',
  'salon',
  ARRAY['hair', 'natural', 'braids'],
  'basic',
  4.7,
  89,
  TRUE,
  FALSE
),
(
  'a4444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Polished Perfection',
  'polished-perfection',
  'Miami''s go-to spot for luxurious manicures and pedicures. We use only premium, non-toxic products.',
  'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=1200&h=400&fit=crop',
  'hello@polishedperfection.com',
  '+1 (305) 555-0400',
  '321 Ocean Drive',
  'Miami',
  'FL',
  'US',
  'salon',
  ARRAY['nails', 'spa', 'pedicure'],
  'basic',
  4.6,
  156,
  TRUE,
  FALSE
)
ON CONFLICT (id) DO NOTHING;

-- Insert hair styles for Glamour Studio NYC
INSERT INTO store_hair_styles (
  store_id,
  name,
  description,
  category,
  color_base,
  thumbnail_url,
  price,
  duration_minutes,
  tags
) VALUES
('a1111111-1111-1111-1111-111111111111', 'Platinum Blonde Transformation', 'Full head platinum blonde with toner for ice-cold finish', 'long', '#F5F5DC',
 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400&h=400&fit=crop', 350.00, 240,
 ARRAY['blonde', 'color', 'premium', 'long']),

('a1111111-1111-1111-1111-111111111111', 'Balayage Caramel', 'Hand-painted balayage with warm caramel tones', 'medium', '#D2691E',
 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&h=400&fit=crop', 280.00, 180,
 ARRAY['balayage', 'brunette', 'highlights', 'medium']),

('a1111111-1111-1111-1111-111111111111', 'Rose Gold Bob', 'Chic bob cut with rose gold color melt', 'short', '#ECC5C0',
 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop', 220.00, 150,
 ARRAY['bob', 'rose-gold', 'short', 'trendy']),

('a1111111-1111-1111-1111-111111111111', 'Beach Waves Brunette', 'Effortless beach waves with rich brunette color', 'medium', '#3A2618',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', 200.00, 120,
 ARRAY['waves', 'brunette', 'natural', 'medium']),

('a1111111-1111-1111-1111-111111111111', 'Ombré Sunset', 'Dramatic ombré from dark roots to vibrant sunset tones', 'long', '#FF6B6B',
 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=400&h=400&fit=crop', 320.00, 210,
 ARRAY['ombre', 'creative', 'long', 'colorful']);

-- Insert hair styles for The Hair Lounge
INSERT INTO store_hair_styles (
  store_id,
  name,
  description,
  category,
  color_base,
  thumbnail_url,
  price,
  duration_minutes,
  tags
) VALUES
('a3333333-3333-3333-3333-333333333333', 'Box Braids', 'Classic box braids with extensions, waist length', 'long', '#2C1810',
 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop', 180.00, 300,
 ARRAY['braids', 'protective', 'long', 'natural']),

('a3333333-3333-3333-3333-333333333333', 'Natural Curls Definition', 'DevaCut with curl defining treatment', 'curly', '#3E2723',
 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=400&fit=crop', 120.00, 90,
 ARRAY['curly', 'natural', 'devacut', 'healthy']),

('a3333333-3333-3333-3333-333333333333', 'Goddess Locs', 'Beautiful goddess locs with curly ends', 'medium', '#4A3728',
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop', 200.00, 360,
 ARRAY['locs', 'protective', 'bohemian', 'medium']);

-- Insert nail styles for Nail Artistry LA
INSERT INTO store_nail_styles (
  store_id,
  name,
  description,
  category,
  color_code,
  thumbnail_url,
  price,
  duration_minutes,
  tags
) VALUES
('a2222222-2222-2222-2222-222222222222', 'Sunset Ombré Nails', 'Gradient sunset design with gold accents', 'ombre', '#FF6B6B',
 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop', 85.00, 90,
 ARRAY['ombre', 'artistic', 'colorful', 'premium']),

('a2222222-2222-2222-2222-222222222222', 'French Elegance', 'Classic French manicure with gel polish', 'french', '#FFFFFF',
 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400&h=400&fit=crop', 65.00, 60,
 ARRAY['french', 'classic', 'elegant', 'gel']),

('a2222222-2222-2222-2222-222222222222', 'Crystal Chrome', 'Mirror chrome finish with crystal embellishments', 'glitter', '#C0C0C0',
 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=400&fit=crop', 95.00, 75,
 ARRAY['chrome', 'crystals', 'luxury', 'premium']),

('a2222222-2222-2222-2222-222222222222', 'Floral Art', 'Hand-painted floral nail art on nude base', 'art', '#FFB6C1',
 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=400&h=400&fit=crop', 105.00, 120,
 ARRAY['art', 'floral', 'handpainted', 'detailed']),

('a2222222-2222-2222-2222-222222222222', 'Matte Black Minimalist', 'Sophisticated matte black with geometric accents', 'solid', '#000000',
 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop', 70.00, 60,
 ARRAY['matte', 'minimalist', 'modern', 'black']);

-- Insert nail styles for Polished Perfection
INSERT INTO store_nail_styles (
  store_id,
  name,
  description,
  category,
  color_code,
  thumbnail_url,
  price,
  duration_minutes,
  tags
) VALUES
('a4444444-4444-4444-4444-444444444444', 'Miami Vice', 'Vibrant coral and turquoise tropical design', 'art', '#FF7F50',
 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop', 75.00, 90,
 ARRAY['tropical', 'colorful', 'summer', 'art']),

('a4444444-4444-4444-4444-444444444444', 'Nude Luxe', 'Natural nude with subtle shimmer', 'solid', '#E8BEAC',
 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400&h=400&fit=crop', 55.00, 45,
 ARRAY['nude', 'natural', 'classic', 'office']),

('a4444444-4444-4444-4444-444444444444', 'Glamour Glitter', 'Full glitter gradient in rose gold', 'glitter', '#B76E79',
 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=400&fit=crop', 70.00, 60,
 ARRAY['glitter', 'rose-gold', 'sparkle', 'party']);

-- Insert sample reviews
INSERT INTO reviews (
  store_id,
  user_id,
  rating,
  title,
  comment,
  service_type,
  is_verified
) VALUES
('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000'::uuid, 5,
 'Best balayage in NYC!', 'I''ve been going to Glamour Studio for 2 years and they never disappoint. The color always lasts and looks natural.', 'hair', TRUE),

('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000'::uuid, 5,
 'Platinum perfection', 'They transformed my dark hair to platinum blonde without damage. The stylist really knows their stuff!', 'hair', TRUE),

('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000'::uuid, 5,
 'Amazing nail art', 'The attention to detail is incredible. My nails lasted 3 weeks without chipping!', 'nails', TRUE),

('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000'::uuid, 4,
 'Creative and professional', 'Love the creative designs. Slightly pricey but worth it for the quality.', 'nails', TRUE),

('a3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000'::uuid, 5,
 'Natural hair experts', 'Finally found a salon that understands natural hair! My curls have never looked better.', 'hair', TRUE),

('a4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000'::uuid, 5,
 'Relaxing and beautiful', 'The spa pedicure is heavenly and my nails always look perfect. Great value!', 'nails', TRUE);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'B2B Marketplace seeded successfully!';
  RAISE NOTICE '  - 4 sample stores (NYC, LA, Chicago, Miami)';
  RAISE NOTICE '  - 8 hair styles from premium salons';
  RAISE NOTICE '  - 8 nail designs from top nail artists';
  RAISE NOTICE '  - 6 verified customer reviews';
  RAISE NOTICE 'Marketplace is ready for customers to browse!';
END $$;
