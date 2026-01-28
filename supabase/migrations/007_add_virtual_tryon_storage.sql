-- Migration: Add virtual-tryon storage bucket
-- This bucket stores try-on result images for hair, nails, makeup, and clothing

-- Create storage bucket for virtual try-on images
INSERT INTO storage.buckets (id, name, public)
VALUES ('virtual-tryon', 'virtual-tryon', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for virtual-tryon bucket
-- Users can upload their own images (files in user-id folder)
CREATE POLICY "Users can upload virtual-tryon images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'virtual-tryon' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own images
CREATE POLICY "Users can view own virtual-tryon images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'virtual-tryon' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own images
CREATE POLICY "Users can delete own virtual-tryon images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'virtual-tryon' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read access for sharing (images can be shared via URL)
CREATE POLICY "Public read access for virtual-tryon"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'virtual-tryon');
