-- Migration: Add 'makeup' and 'clothing' types to try_ons table
-- This migration updates the CHECK constraint on the try_ons.type column
-- to support all try-on features: hair, nails, makeup, and clothing

-- Step 1: Drop the existing constraint
ALTER TABLE try_ons DROP CONSTRAINT IF EXISTS try_ons_type_check;

-- Step 2: Add the new constraint with all valid types
ALTER TABLE try_ons ADD CONSTRAINT try_ons_type_check
  CHECK (type IN ('hair', 'nails', 'makeup', 'clothing'));

-- Add index on type column for better query performance
CREATE INDEX IF NOT EXISTS idx_try_ons_type ON try_ons(type);

-- Add index on user_id + type for filtered gallery queries
CREATE INDEX IF NOT EXISTS idx_try_ons_user_type ON try_ons(user_id, type);

COMMENT ON COLUMN try_ons.type IS 'Type of try-on: hair, nails, makeup, or clothing';
