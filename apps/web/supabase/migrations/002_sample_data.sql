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
