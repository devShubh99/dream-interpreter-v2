-- Dreams table (Active)
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dreams Archive (Permanent History)
CREATE TABLE IF NOT EXISTS public.dreams_archive (
  id UUID PRIMARY KEY,
  user_id UUID, -- No FK to ensure persistence after user deletion
  user_email TEXT,
  dream_text TEXT NOT NULL,
  interpretation JSONB,
  is_shared BOOLEAN DEFAULT FALSE,
  share_id UUID,
  sentiment_score INTEGER,
  main_themes TEXT[],
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dreams_archive ENABLE ROW LEVEL SECURITY;

-- 1. Policy: Users can read their own active dreams
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

-- 4. Policy: Users can delete their own active dreams
DROP POLICY IF EXISTS "Users can delete own dreams" ON public.dreams;
CREATE POLICY "Users can delete own dreams" ON public.dreams
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Policy: Anyone can read shared dreams
DROP POLICY IF EXISTS "Anyone can read shared dreams" ON public.dreams;
CREATE POLICY "Anyone can read shared dreams" ON public.dreams
  FOR SELECT USING (is_shared = true);

-- 6. Policy: Admin can see everything in the archive
DROP POLICY IF EXISTS "Admin can see everything in archive" ON public.dreams_archive;
CREATE POLICY "Admin can see everything in archive" ON public.dreams_archive
  FOR SELECT USING (auth.jwt() ->> 'email' = 'ashubham32@gmail.com');

-- Archiving Function & Trigger
CREATE OR REPLACE FUNCTION public.handle_dream_archiving()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.dreams_archive (
      id, user_id, user_email, dream_text, interpretation, is_shared, share_id, sentiment_score, main_themes, created_at
    ) VALUES (
      NEW.id, NEW.user_id, NEW.user_email, NEW.dream_text, NEW.interpretation, NEW.is_shared, NEW.share_id, NEW.sentiment_score, NEW.main_themes, NEW.created_at
    );
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE public.dreams_archive SET
      user_id = NEW.user_id,
      user_email = NEW.user_email,
      dream_text = NEW.dream_text,
      interpretation = NEW.interpretation,
      is_shared = NEW.is_shared,
      share_id = NEW.share_id,
      sentiment_score = NEW.sentiment_score,
      main_themes = NEW.main_themes
    WHERE id = NEW.id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.dreams_archive SET
      deleted_at = NOW()
    WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_archive_dream ON public.dreams;
CREATE TRIGGER tr_archive_dream
AFTER INSERT OR UPDATE OR DELETE ON public.dreams
FOR EACH ROW EXECUTE FUNCTION public.handle_dream_archiving();

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON public.dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_share_id ON public.dreams(share_id) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_dreams_archive_deleted ON public.dreams_archive(deleted_at);
CREATE INDEX IF NOT EXISTS idx_dreams_sentiment_score ON public.dreams(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_dreams_main_themes ON public.dreams USING GIN (main_themes);
