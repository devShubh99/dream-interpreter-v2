-- ============================================
-- Dream Interpreter — Supabase Database Setup
-- Run this in your Supabase SQL Editor
-- ============================================

-- Dreams table
CREATE TABLE IF NOT EXISTS public.dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  dream_text TEXT NOT NULL,
  interpretation JSONB,
  is_shared BOOLEAN DEFAULT FALSE,
  share_id UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;

-- 1. Policy: Users can read their own dreams
DROP POLICY IF EXISTS "Users can read own dreams" ON public.dreams;
CREATE POLICY "Users can read own dreams" ON public.dreams
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Policy: Users can insert their own dreams
DROP POLICY IF EXISTS "Users can insert own dreams" ON public.dreams;
CREATE POLICY "Users can insert own dreams" ON public.dreams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Policy: Users can update their own dreams (for toggling share)
DROP POLICY IF EXISTS "Users can update own dreams" ON public.dreams;
CREATE POLICY "Users can update own dreams" ON public.dreams
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Policy: Users can delete their own dreams
DROP POLICY IF EXISTS "Users can delete own dreams" ON public.dreams;
CREATE POLICY "Users can delete own dreams" ON public.dreams
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Policy: Anyone can read shared dreams (for public share links)
DROP POLICY IF EXISTS "Anyone can read shared dreams" ON public.dreams;
CREATE POLICY "Anyone can read shared dreams" ON public.dreams
  FOR SELECT USING (is_shared = true);

-- 6. NEW Policy: Admin can see all dreams (REQUIRED for Admin Panel)
DROP POLICY IF EXISTS "Admin can see all dreams" ON public.dreams;
CREATE POLICY "Admin can see all dreams" ON public.dreams
  FOR SELECT USING (auth.jwt() ->> 'email' = 'ashubham328@gmail.com');

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON public.dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_share_id ON public.dreams(share_id) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_dreams_shared ON public.dreams(is_shared) WHERE is_shared = true;
