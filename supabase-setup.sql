-- Dreams table
CREATE TABLE IF NOT EXISTS public.dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  dream_text TEXT NOT NULL,
  interpretation JSONB,
  is_shared BOOLEAN DEFAULT FALSE,
  share_id UUID DEFAULT gen_random_uuid(),
  sentiment_score INTEGER,
  main_themes TEXT[],
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;

-- 1. Policy: Users can read their own dreams (active only)
DROP POLICY IF EXISTS "Users can read own dreams" ON public.dreams;
CREATE POLICY "Users can read own dreams" ON public.dreams
  FOR SELECT USING (auth.uid() = user_id AND (deleted_at IS NULL));

-- 2. Policy: Users can insert their own dreams
DROP POLICY IF EXISTS "Users can insert own dreams" ON public.dreams;
CREATE POLICY "Users can insert own dreams" ON public.dreams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Policy: Users can update their own dreams (for toggling share or soft deleting)
DROP POLICY IF EXISTS "Users can update own dreams" ON public.dreams;
CREATE POLICY "Users can update own dreams" ON public.dreams
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Policy: Anyone can read shared dreams (for public share links - active only)
DROP POLICY IF EXISTS "Anyone can read shared dreams" ON public.dreams;
CREATE POLICY "Anyone can read shared dreams" ON public.dreams
  FOR SELECT USING (is_shared = true AND (deleted_at IS NULL));

-- 5. NEW Policy: Admin can see all dreams (including deleted)
DROP POLICY IF EXISTS "Admin can see all dreams" ON public.dreams;
CREATE POLICY "Admin can see all dreams" ON public.dreams
  FOR SELECT USING (auth.jwt() ->> 'email' = 'ashubham32@gmail.com');

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON public.dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_deleted ON public.dreams(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dreams_share_id ON public.dreams(share_id) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_dreams_shared ON public.dreams(is_shared) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_dreams_sentiment_score ON public.dreams(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_dreams_main_themes ON public.dreams USING GIN (main_themes);
