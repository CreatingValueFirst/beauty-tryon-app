-- Seed initial hair styles
INSERT INTO hair_styles (name, description, category, color_base, tags, is_premium) VALUES
  ('Classic Bob', 'Timeless chin-length bob with blunt edges', 'bob', '#2C1B18', ARRAY['short', 'straight', 'classic'], FALSE),
  ('Long Waves', 'Flowing wavy hair past shoulders', 'long', '#4A3428', ARRAY['long', 'wavy', 'glamorous'], FALSE),
  ('Pixie Cut', 'Short and chic pixie style', 'pixie', '#1A1A1A', ARRAY['short', 'edgy', 'modern'], FALSE),
  ('Beach Waves', 'Casual sun-kissed waves', 'medium', '#8B6F47', ARRAY['medium', 'wavy', 'casual'], FALSE),
  ('Sleek Straight', 'Smooth straight long hair', 'long', '#3B2F2F', ARRAY['long', 'straight', 'sleek'], FALSE),

  -- Premium styles
  ('Platinum Blonde Bob', 'Icy platinum blonde bob with highlights', 'bob', '#F5F5DC', ARRAY['short', 'blonde', 'premium'], TRUE),
  ('Mermaid Ombre', 'Blue to teal ombre long waves', 'long', '#00CED1', ARRAY['long', 'colorful', 'premium'], TRUE),
  ('Rose Gold Curls', 'Pink rose gold curly style', 'curly', '#E0BFB8', ARRAY['medium', 'curly', 'premium'], TRUE),
  ('Purple Highlights', 'Dark hair with purple highlights', 'long', '#4B0082', ARRAY['long', 'colorful', 'premium'], TRUE),
  ('Balayage Waves', 'Natural balayage with waves', 'long', '#D2B48C', ARRAY['long', 'wavy', 'premium'], TRUE);

-- Seed initial nail styles
INSERT INTO nail_styles (name, description, category, color_code, tags, is_premium) VALUES
  ('Classic Red', 'Timeless red nail polish', 'solid', '#DC143C', ARRAY['red', 'classic', 'elegant'], FALSE),
  ('Soft Pink', 'Delicate light pink', 'solid', '#FFB6C1', ARRAY['pink', 'subtle', 'feminine'], FALSE),
  ('Nude Beige', 'Natural nude tone', 'solid', '#E8D4C1', ARRAY['nude', 'natural', 'professional'], FALSE),
  ('French Manicure', 'Classic white tips', 'french', '#FFFFFF', ARRAY['french', 'classic', 'elegant'], FALSE),
  ('Black Matte', 'Bold matte black', 'solid', '#000000', ARRAY['black', 'bold', 'modern'], FALSE),

  -- Premium styles
  ('Rose Gold Glitter', 'Sparkling rose gold with glitter', 'glitter', '#E0BFB8', ARRAY['glitter', 'sparkle', 'premium'], TRUE),
  ('Holographic Chrome', 'Rainbow holographic finish', 'glitter', '#C0C0C0', ARRAY['chrome', 'holographic', 'premium'], TRUE),
  ('Marble Design', 'White marble with gold veins', 'marble', '#FFFFFF', ARRAY['marble', 'artistic', 'premium'], TRUE),
  ('Ombre Sunset', 'Orange to pink gradient', 'ombre', '#FF6B6B', ARRAY['ombre', 'gradient', 'premium'], TRUE),
  ('Geometric Gold', 'Gold geometric patterns', 'geometric', '#FFD700', ARRAY['geometric', 'gold', 'premium'], TRUE);
