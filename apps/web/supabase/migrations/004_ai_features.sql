-- AI Features: Generations, Queue, and Cache
-- Migration for enterprise-grade AI functionality

-- =====================================================
-- TABLE: ai_generations
-- Tracks all AI generation requests and results
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Replicate prediction tracking
  prediction_id TEXT UNIQUE,

  -- Generation parameters
  prompt TEXT NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('NAIL_GENERATOR_1', 'NAIL_GENERATOR_2', 'FLUX_SCHNELL')),
  quality TEXT NOT NULL CHECK (quality IN ('preview', 'standard', 'high')),

  -- Image dimensions
  width INTEGER DEFAULT 1024,
  height INTEGER DEFAULT 1024,
  seed INTEGER,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),

  -- Results
  output_url TEXT,
  error_message TEXT,
  error_code TEXT,

  -- Cost tracking
  estimated_cost DECIMAL(10, 4),
  actual_cost DECIMAL(10, 4),

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLE: ai_generation_queue
-- Priority queue for managing generation requests
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_id UUID REFERENCES ai_generations(id) ON DELETE CASCADE,

  -- Queue parameters
  priority INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLE: image_cache
-- Cache for identical generations to reduce costs
-- =====================================================
CREATE TABLE IF NOT EXISTS image_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cache key (hash of parameters)
  cache_key TEXT UNIQUE NOT NULL,

  -- Generation parameters
  prompt TEXT NOT NULL,
  model_type TEXT NOT NULL,
  quality TEXT NOT NULL,
  width INTEGER DEFAULT 1024,
  height INTEGER DEFAULT 1024,

  -- Cached result
  image_url TEXT NOT NULL,

  -- Usage tracking
  hit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- =====================================================
-- TABLE: user_generation_quotas
-- Track user quotas and usage limits
-- =====================================================
CREATE TABLE IF NOT EXISTS user_generation_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Quota limits
  daily_limit INTEGER DEFAULT 20,
  monthly_limit INTEGER DEFAULT 200,

  -- Current usage
  daily_count INTEGER DEFAULT 0,
  monthly_count INTEGER DEFAULT 0,

  -- Premium features
  is_premium BOOLEAN DEFAULT FALSE,
  premium_daily_limit INTEGER DEFAULT 100,
  premium_monthly_limit INTEGER DEFAULT 1000,

  -- Reset timestamps
  daily_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_DATE + INTERVAL '1 day'),
  monthly_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON ai_generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON ai_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_prediction_id ON ai_generations(prediction_id);
CREATE INDEX IF NOT EXISTS idx_generations_deleted_at ON ai_generations(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_queue_status_priority ON ai_generation_queue(status, priority DESC, created_at);
CREATE INDEX IF NOT EXISTS idx_queue_user_id ON ai_generation_queue(user_id);

CREATE INDEX IF NOT EXISTS idx_cache_key ON image_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON image_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_model_quality ON image_cache(model_type, quality);

CREATE INDEX IF NOT EXISTS idx_quotas_user_id ON user_generation_quotas(user_id);

-- =====================================================
-- FUNCTIONS for quota management
-- =====================================================

-- Initialize user quota when they first generate
CREATE OR REPLACE FUNCTION initialize_user_quota()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_generation_quotas (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-initialization
DROP TRIGGER IF EXISTS trigger_initialize_quota ON ai_generations;
CREATE TRIGGER trigger_initialize_quota
  BEFORE INSERT ON ai_generations
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_quota();

-- Check and increment quota
CREATE OR REPLACE FUNCTION check_and_increment_quota(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_quota RECORD;
  v_current_limit INTEGER;
BEGIN
  -- Get current quota info
  SELECT * INTO v_quota
  FROM user_generation_quotas
  WHERE user_id = p_user_id;

  -- Initialize if doesn't exist
  IF NOT FOUND THEN
    INSERT INTO user_generation_quotas (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_quota;
  END IF;

  -- Reset daily counter if needed
  IF v_quota.daily_reset_at < NOW() THEN
    UPDATE user_generation_quotas
    SET daily_count = 0,
        daily_reset_at = CURRENT_DATE + INTERVAL '1 day'
    WHERE user_id = p_user_id;
    v_quota.daily_count := 0;
  END IF;

  -- Reset monthly counter if needed
  IF v_quota.monthly_reset_at < NOW() THEN
    UPDATE user_generation_quotas
    SET monthly_count = 0,
        monthly_reset_at = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    WHERE user_id = p_user_id;
    v_quota.monthly_count := 0;
  END IF;

  -- Determine current limit
  IF v_quota.is_premium THEN
    v_current_limit := v_quota.premium_daily_limit;
  ELSE
    v_current_limit := v_quota.daily_limit;
  END IF;

  -- Check if under limit
  IF v_quota.daily_count >= v_current_limit THEN
    RETURN FALSE;
  END IF;

  -- Increment counters
  UPDATE user_generation_quotas
  SET daily_count = daily_count + 1,
      monthly_count = monthly_count + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM image_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_generation_quotas ENABLE ROW LEVEL SECURITY;

-- Policies for ai_generations
CREATE POLICY "Users can view their own generations"
  ON ai_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations"
  ON ai_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
  ON ai_generations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations"
  ON ai_generations FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for user_generation_quotas
CREATE POLICY "Users can view their own quota"
  ON user_generation_quotas FOR SELECT
  USING (auth.uid() = user_id);

-- Cache is read-only for users (managed by backend)
CREATE POLICY "Image cache is publicly readable"
  ON image_cache FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- No initial data needed

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE ai_generations IS 'Tracks all AI image generations with status and results';
COMMENT ON TABLE ai_generation_queue IS 'Priority queue for managing concurrent generation requests';
COMMENT ON TABLE image_cache IS 'Cache to avoid regenerating identical images';
COMMENT ON TABLE user_generation_quotas IS 'Per-user quotas and rate limiting';

COMMENT ON FUNCTION check_and_increment_quota IS 'Checks if user is under quota limit and increments counter';
COMMENT ON FUNCTION cleanup_expired_cache IS 'Removes expired cache entries to save storage';
