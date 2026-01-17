-- Sample Hair Styles Data
-- BeautyTryOn Sample Styles

-- Hair Styles
INSERT INTO hair_styles (name, description, category, color_base, tags, is_premium) VALUES
-- Short Hair Styles
('Pixie Cut', 'Chic and edgy short cut perfect for a bold look', 'short', '#2C1810', ARRAY['short', 'edgy', 'modern', 'professional'], FALSE),
('Bob Cut', 'Classic chin-length bob with sleek finish', 'short', '#4A3728', ARRAY['short', 'classic', 'professional', 'versatile'], FALSE),
('Textured Crop', 'Modern textured short style with movement', 'short', '#6B4423', ARRAY['short', 'modern', 'casual', 'trendy'], FALSE),
('Asymmetric Bob', 'Trendy angled bob with one side longer', 'short', '#8B5A3C', ARRAY['short', 'trendy', 'edgy', 'modern'], TRUE),
('Shaggy Pixie', 'Layered pixie with tousled texture', 'short', '#A67C52', ARRAY['short', 'casual', 'textured', 'fun'], FALSE),

-- Medium Hair Styles
('Long Bob (Lob)', 'Shoulder-length bob, versatile and stylish', 'medium', '#3D2817', ARRAY['medium', 'versatile', 'professional', 'trendy'], FALSE),
('Layered Medium', 'Layered cut with volume and movement', 'medium', '#5C3D2E', ARRAY['medium', 'layered', 'volume', 'casual'], FALSE),
('Beach Waves', 'Effortless wavy texture for a relaxed vibe', 'medium', '#8B6F47', ARRAY['medium', 'wavy', 'casual', 'beachy'], FALSE),
('Blunt Cut', 'Sleek straight cut at shoulder length', 'medium', '#2B1810', ARRAY['medium', 'straight', 'sleek', 'modern'], TRUE),
('Shaggy Lob', 'Textured shoulder-length with layers', 'medium', '#4E3620', ARRAY['medium', 'textured', 'casual', 'trendy'], FALSE),

-- Long Hair Styles
('Long Layers', 'Flowing long hair with layered dimension', 'long', '#3A2618', ARRAY['long', 'layered', 'flowing', 'versatile'], FALSE),
('Mermaid Waves', 'Romantic loose waves cascading down', 'long', '#D4AF37', ARRAY['long', 'wavy', 'romantic', 'glamorous'], TRUE),
('Straight & Sleek', 'Ultra-smooth long straight hair', 'long', '#1C1410', ARRAY['long', 'straight', 'sleek', 'elegant'], FALSE),
('Bohemian Curls', 'Natural-looking voluminous curls', 'long', '#6F4E37', ARRAY['long', 'curly', 'bohemian', 'volume'], FALSE),
('Waterfall Braid', 'Long hair with elegant waterfall braid detail', 'long', '#8B7355', ARRAY['long', 'braided', 'elegant', 'romantic'], TRUE),

-- Curly Hair Styles
('Tight Curls', 'Defined spiral curls with bounce', 'curly', '#2C1810', ARRAY['curly', 'defined', 'volume', 'bold'], FALSE),
('Loose Curls', 'Soft flowing curls with natural movement', 'curly', '#5D4037', ARRAY['curly', 'soft', 'romantic', 'casual'], FALSE),
('Afro', 'Full voluminous natural afro', 'curly', '#3E2723', ARRAY['curly', 'natural', 'volume', 'bold'], FALSE),
('Curly Shag', 'Layered curly style with texture', 'curly', '#4E342E', ARRAY['curly', 'layered', 'textured', 'modern'], TRUE),
('Defined Coils', 'Tightly coiled curls with definition', 'curly', '#6D4C41', ARRAY['curly', 'defined', 'natural', 'textured'], FALSE),

-- Trending Colors
('Platinum Blonde', 'Ultra-light icy blonde shade', 'long', '#F5F5DC', ARRAY['long', 'blonde', 'platinum', 'bold'], TRUE),
('Rose Gold', 'Trendy pink-tinted blonde', 'medium', '#ECC5C0', ARRAY['medium', 'pink', 'trendy', 'pastel'], TRUE),
('Balayage Brunette', 'Natural sun-kissed brunette highlights', 'long', '#6B4423', ARRAY['long', 'brunette', 'balayage', 'natural'], TRUE),
('Burgundy Red', 'Deep rich burgundy shade', 'medium', '#800020', ARRAY['medium', 'red', 'bold', 'rich'], TRUE),
('Ash Brown', 'Cool-toned ash brown color', 'medium', '#A0826D', ARRAY['medium', 'brown', 'cool', 'natural'], FALSE),
('Honey Blonde', 'Warm golden blonde tone', 'long', '#F0E68C', ARRAY['long', 'blonde', 'warm', 'golden'], FALSE),
('Chocolate Brown', 'Rich chocolate brown shade', 'long', '#3D2817', ARRAY['long', 'brown', 'rich', 'natural'], FALSE),
('Caramel Highlights', 'Warm caramel-toned highlights', 'medium', '#C68642', ARRAY['medium', 'brown', 'highlights', 'warm'], TRUE),
('Silver Gray', 'Modern silver-gray tone', 'short', '#C0C0C0', ARRAY['short', 'gray', 'modern', 'trendy'], TRUE),
('Auburn', 'Reddish-brown auburn shade', 'medium', '#A52A2A', ARRAY['medium', 'red', 'brown', 'warm'], FALSE),

-- Special Styles
('Braided Crown', 'Elegant crown braid around the head', 'medium', '#5C4033', ARRAY['medium', 'braided', 'elegant', 'romantic'], TRUE),
('Half-Up Half-Down', 'Half tied up with flowing bottom half', 'long', '#4A3728', ARRAY['long', 'versatile', 'casual', 'romantic'], FALSE),
('Top Knot', 'Sleek high bun style', 'short', '#2C1810', ARRAY['short', 'updo', 'sleek', 'modern'], FALSE),
('Messy Bun', 'Casual messy bun with texture', 'medium', '#6B4423', ARRAY['medium', 'updo', 'casual', 'textured'], FALSE),
('Slicked Back', 'Sleek pulled-back style', 'short', '#1C1410', ARRAY['short', 'sleek', 'modern', 'edgy'], TRUE);

-- Nail Styles
INSERT INTO nail_styles (name, description, category, color_code, tags, is_premium) VALUES
-- Classic Solid Colors
('Classic Red', 'Timeless bold red polish', 'solid', '#DC143C', ARRAY['solid', 'classic', 'bold', 'red'], FALSE),
('Nude Pink', 'Elegant natural nude shade', 'solid', '#FFB6C1', ARRAY['solid', 'nude', 'natural', 'professional'], FALSE),
('Pearl White', 'Clean crisp white polish', 'solid', '#FFFFFF', ARRAY['solid', 'white', 'clean', 'elegant'], FALSE),
('Midnight Black', 'Deep sophisticated black', 'solid', '#000000', ARRAY['solid', 'black', 'bold', 'edgy'], FALSE),
('Coral Crush', 'Vibrant coral shade perfect for summer', 'solid', '#FF6B6B', ARRAY['solid', 'coral', 'bright', 'summer'], FALSE),
('Lavender Dreams', 'Soft pastel lavender', 'solid', '#E6E6FA', ARRAY['solid', 'purple', 'pastel', 'soft'], FALSE),
('Mint Fresh', 'Cool mint green', 'solid', '#98FF98', ARRAY['solid', 'green', 'pastel', 'fresh'], TRUE),
('Rose Gold', 'Metallic rose gold shimmer', 'solid', '#B76E79', ARRAY['solid', 'pink', 'metallic', 'trendy'], TRUE),
('Navy Blue', 'Deep navy blue shade', 'solid', '#000080', ARRAY['solid', 'blue', 'deep', 'elegant'], FALSE),
('Burgundy Wine', 'Rich wine burgundy', 'solid', '#800020', ARRAY['solid', 'red', 'rich', 'elegant'], FALSE),

-- French Manicure Styles
('Classic French', 'Traditional white tip french manicure', 'french', '#FFFFFF', ARRAY['french', 'classic', 'elegant', 'professional'], FALSE),
('Pink French', 'Soft pink tip variation', 'french', '#FFB6C1', ARRAY['french', 'pink', 'soft', 'elegant'], FALSE),
('Black French', 'Modern black tip french', 'french', '#000000', ARRAY['french', 'black', 'modern', 'edgy'], TRUE),
('Gold French', 'Glamorous gold tip french', 'french', '#FFD700', ARRAY['french', 'gold', 'glamorous', 'metallic'], TRUE),
('Rainbow French', 'Multi-colored tip french', 'french', '#FF69B4', ARRAY['french', 'rainbow', 'colorful', 'fun'], TRUE),

-- Glitter & Shimmer
('Silver Glitter', 'Sparkling silver glitter finish', 'glitter', '#C0C0C0', ARRAY['glitter', 'silver', 'sparkle', 'party'], FALSE),
('Gold Sparkle', 'Luxurious gold glitter', 'glitter', '#FFD700', ARRAY['glitter', 'gold', 'sparkle', 'glamorous'], TRUE),
('Rose Glitter', 'Pink rose glitter blend', 'glitter', '#FF69B4', ARRAY['glitter', 'pink', 'sparkle', 'romantic'], FALSE),
('Holographic', 'Rainbow holographic finish', 'glitter', '#E0BBE4', ARRAY['glitter', 'holographic', 'rainbow', 'trendy'], TRUE),
('Champagne Shimmer', 'Subtle champagne shimmer', 'glitter', '#F7E7CE', ARRAY['glitter', 'champagne', 'subtle', 'elegant'], FALSE),

-- Nail Art Designs
('Polka Dots', 'Playful polka dot pattern', 'art', '#FF1493', ARRAY['art', 'dots', 'playful', 'fun'], FALSE),
('Floral Design', 'Delicate hand-painted flowers', 'art', '#FF69B4', ARRAY['art', 'floral', 'romantic', 'elegant'], TRUE),
('Geometric Pattern', 'Modern geometric shapes', 'art', '#4169E1', ARRAY['art', 'geometric', 'modern', 'bold'], TRUE),
('Marble Effect', 'Elegant marble stone pattern', 'art', '#A9A9A9', ARRAY['art', 'marble', 'elegant', 'sophisticated'], TRUE),
('Animal Print', 'Trendy leopard or zebra print', 'art', '#D2691E', ARRAY['art', 'animal', 'bold', 'trendy'], FALSE),
('Abstract Art', 'Artistic abstract design', 'art', '#9370DB', ARRAY['art', 'abstract', 'artistic', 'unique'], TRUE),
('Ombre Fade', 'Gradient color fade effect', 'art', '#FF69B4', ARRAY['art', 'ombre', 'gradient', 'trendy'], FALSE),
('Striped', 'Classic vertical or horizontal stripes', 'art', '#000000', ARRAY['art', 'stripes', 'classic', 'modern'], FALSE),
('Hearts', 'Romantic heart designs', 'art', '#FF1493', ARRAY['art', 'hearts', 'romantic', 'cute'], FALSE),
('Stars & Moon', 'Celestial star and moon pattern', 'art', '#4B0082', ARRAY['art', 'celestial', 'mystical', 'trendy'], TRUE),

-- Seasonal & Special
('Valentine Red', 'Romantic red with heart accents', 'art', '#DC143C', ARRAY['art', 'valentine', 'romantic', 'seasonal'], FALSE),
('Halloween Orange', 'Spooky orange with black accents', 'art', '#FF8C00', ARRAY['art', 'halloween', 'seasonal', 'fun'], FALSE),
('Christmas Red & Green', 'Festive red and green combo', 'art', '#DC143C', ARRAY['art', 'christmas', 'seasonal', 'festive'], FALSE),
('Winter Wonderland', 'Icy blue with snowflake design', 'art', '#ADD8E6', ARRAY['art', 'winter', 'seasonal', 'elegant'], TRUE),
('Spring Pastels', 'Soft pastel mix perfect for spring', 'art', '#FFB6C1', ARRAY['art', 'spring', 'seasonal', 'pastel'], FALSE),

-- Matte Finishes
('Matte Black', 'Ultra-matte black finish', 'solid', '#000000', ARRAY['solid', 'matte', 'black', 'modern'], TRUE),
('Matte Nude', 'Sophisticated matte nude', 'solid', '#E8D4C1', ARRAY['solid', 'matte', 'nude', 'elegant'], FALSE),
('Matte Burgundy', 'Rich matte burgundy', 'solid', '#800020', ARRAY['solid', 'matte', 'burgundy', 'elegant'], TRUE),
('Matte Navy', 'Deep matte navy blue', 'solid', '#000080', ARRAY['solid', 'matte', 'blue', 'sophisticated'], FALSE),

-- Metallic & Chrome
('Chrome Silver', 'Mirror chrome silver finish', 'solid', '#C0C0C0', ARRAY['solid', 'chrome', 'metallic', 'modern'], TRUE),
('Rose Gold Chrome', 'Metallic rose gold chrome', 'solid', '#B76E79', ARRAY['solid', 'chrome', 'rose-gold', 'trendy'], TRUE),
('Copper Metallic', 'Warm copper metallic', 'solid', '#B87333', ARRAY['solid', 'metallic', 'copper', 'warm'], TRUE);

-- Update statistics
INSERT INTO analytics_events (event_type, event_data) VALUES
('seed_data_loaded', '{"hair_styles_count": 35, "nail_styles_count": 45, "timestamp": "2026-01-17T00:00:00Z"}');

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Successfully seeded database with:';
  RAISE NOTICE '  - 35 hair styles';
  RAISE NOTICE '  - 45 nail styles';
  RAISE NOTICE 'Total: 80 styles ready to try on!';
END $$;
