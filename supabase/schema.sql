-- ============================================================
-- VAULT — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. MEDIA ITEMS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media_items (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         TEXT        NOT NULL DEFAULT '',
  filename      TEXT        NOT NULL DEFAULT '',
  type          TEXT        NOT NULL CHECK (type IN ('image', 'video', 'file')),
  file_category TEXT        CHECK (file_category IN ('pdf','doc','spreadsheet','archive','audio','code','other')),
  mime_type     TEXT,
  size          TEXT        NOT NULL DEFAULT '',
  raw_bytes     BIGINT      DEFAULT 0,
  date          TEXT        NOT NULL DEFAULT '',
  storage_path  TEXT,
  thumbnail_url TEXT        DEFAULT '',
  duration      TEXT,
  description   TEXT        DEFAULT '',
  is_favorite   BOOLEAN     DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select" ON public.media_items;
DROP POLICY IF EXISTS "owner_insert" ON public.media_items;
DROP POLICY IF EXISTS "owner_update" ON public.media_items;
DROP POLICY IF EXISTS "owner_delete" ON public.media_items;

CREATE POLICY "owner_select" ON public.media_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "owner_insert" ON public.media_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_update" ON public.media_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "owner_delete" ON public.media_items
  FOR DELETE USING (auth.uid() = user_id);

-- ── 3. STORAGE BUCKET ─────────────────────────────────────────
-- Create private 'vault' bucket (5 GB per file max)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('vault', 'vault', false, 5368709120)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can only access their own folder (userId/...)
DROP POLICY IF EXISTS "vault_upload"  ON storage.objects;
DROP POLICY IF EXISTS "vault_select"  ON storage.objects;
DROP POLICY IF EXISTS "vault_delete"  ON storage.objects;

CREATE POLICY "vault_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'vault'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "vault_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'vault'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "vault_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'vault'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- ── 4. AUTO-CONFIRM USERS (No email confirmation needed) ─────
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'ann@vault.com' OR email_confirmed_at IS NULL;

-- Automatically confirm any future user signups
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS trigger AS $$
BEGIN
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_new_user();

-- ── DONE ──────────────────────────────────────────────────────

