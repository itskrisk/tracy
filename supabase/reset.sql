-- ============================================================
-- TRACY'S VAULT — HARD RESET & INITIAL SETUP SCRIPT
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── 1. WIPE ALL MEDIA AND STORAGE FILES ───────────────────────
TRUNCATE TABLE public.media_items RESTART IDENTITY CASCADE;
DELETE FROM storage.objects WHERE bucket_id = 'vault';

-- ── 2. ENSURE STORAGE BUCKET EXISTS ───────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('vault', 'vault', false, 5368709120)
ON CONFLICT (id) DO NOTHING;

-- ── 3. RESET TRACY'S ACCOUNT & FIRST-TIME SETUP TRIGGER ───────
DO $$
DECLARE
  v_user_id uuid;
  v_encrypted_pw text;
BEGIN
  -- Generate bcrypt hash for 'Tracy123!'
  v_encrypted_pw := extensions.crypt('Tracy123!', extensions.gen_salt('bf'));

  -- Find existing user
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'adedetracy481@gmail.com';

  IF v_user_id IS NOT NULL THEN
    -- Clear any old active sessions
    DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = v_user_id);
    DELETE FROM auth.sessions WHERE user_id = v_user_id;

    -- Update user credentials and re-enable first_login
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_pw,
      email = 'adedetracy481@gmail.com',
      raw_user_meta_data = jsonb_build_object('name', 'Tracy', 'first_login', true),
      raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', array['email']),
      email_confirmed_at = NOW(),
      updated_at = NOW()
    WHERE id = v_user_id;

    -- Update identity data
    UPDATE auth.identities
    SET 
      identity_data = jsonb_build_object('sub', v_user_id::text, 'email', 'adedetracy481@gmail.com', 'email_verified', true),
      last_sign_in_at = NOW(),
      updated_at = NOW()
    WHERE user_id = v_user_id;

  ELSE
    -- Create fresh user if not found
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'adedetracy481@gmail.com',
      v_encrypted_pw,
      NOW(),
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object('name', 'Tracy', 'first_login', true),
      NOW(),
      NOW()
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'adedetracy481@gmail.com', 'email_verified', true),
      'email',
      v_user_id::text,
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END $$;

-- ── 4. AUTO-CONFIRM FUTURE SIGNUPS ────────────────────────────
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

-- Done!
SELECT 'Vault Hard Reset Completed: Tracy account initialized with first_login=true' AS status;
