-- ============================================
-- SENTINEL AGENT - COMPLETE SUPABASE SCHEMA
-- ============================================
-- This script is idempotent and safe to run multiple times
-- Uses IF NOT EXISTS to prevent errors on re-runs

-- ============================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. CREATE TABLES
-- ============================================

-- Profiles Table
-- Stores user profile information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'profiles_email_idx') THEN
    CREATE INDEX profiles_email_idx ON public.profiles(email);
  END IF;
END $$;

-- Sentinels Table
-- Stores sentinel configurations for price monitoring
CREATE TABLE IF NOT EXISTS public.sentinels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  private_key TEXT NOT NULL, -- Encrypted wallet private key
  threshold DECIMAL(20, 2) NOT NULL, -- Price threshold in USD
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('usdc', 'cash')),
  discord_webhook TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'sentinels_user_id_idx') THEN
    CREATE INDEX sentinels_user_id_idx ON public.sentinels(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'sentinels_is_active_idx') THEN
    CREATE INDEX sentinels_is_active_idx ON public.sentinels(is_active);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'sentinels_user_active_idx') THEN
    CREATE INDEX sentinels_user_active_idx ON public.sentinels(user_id, is_active);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'sentinels_created_at_idx') THEN
    CREATE INDEX sentinels_created_at_idx ON public.sentinels(created_at DESC);
  END IF;
END $$;

-- Activities Table
-- Stores monitoring activity logs and price check results
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sentinel_id UUID NOT NULL REFERENCES public.sentinels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price DECIMAL(20, 8) NOT NULL, -- SOL price at time of check
  cost DECIMAL(20, 8) NOT NULL, -- Cost of the check in USD
  settlement_time INTEGER, -- Time taken for settlement in ms
  payment_method TEXT, -- Payment method used (usdc/cash)
  transaction_signature TEXT, -- Solana transaction signature
  triggered BOOLEAN DEFAULT false, -- Whether alert was triggered
  status TEXT DEFAULT 'success', -- Status: success, error, pending
  error_message TEXT, -- Error message if status is error
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'activities_sentinel_id_idx') THEN
    CREATE INDEX activities_sentinel_id_idx ON public.activities(sentinel_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'activities_user_id_idx') THEN
    CREATE INDEX activities_user_id_idx ON public.activities(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'activities_created_at_idx') THEN
    CREATE INDEX activities_created_at_idx ON public.activities(created_at DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'activities_triggered_idx') THEN
    CREATE INDEX activities_triggered_idx ON public.activities(triggered);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'activities_user_created_idx') THEN
    CREATE INDEX activities_user_created_idx ON public.activities(user_id, created_at DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'activities_sentinel_created_idx') THEN
    CREATE INDEX activities_sentinel_created_idx ON public.activities(sentinel_id, created_at DESC);
  END IF;
END $$;

-- ============================================
-- 3. CREATE FUNCTIONS
-- ============================================

-- Function to automatically create profile on user signup
-- NOTE: SECURITY DEFINER is required here because this trigger runs on auth.users
-- which is a system table. The function only inserts into profiles table with
-- the new user's own ID, so it's safe and necessary for the signup flow.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CREATE TRIGGERS
-- ============================================

-- Trigger to create profile on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update updated_at on sentinels
DROP TRIGGER IF EXISTS on_sentinels_updated ON public.sentinels;
CREATE TRIGGER on_sentinels_updated
  BEFORE UPDATE ON public.sentinels
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentinels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- SENTINELS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own sentinels" ON public.sentinels;
DROP POLICY IF EXISTS "Users can insert their own sentinels" ON public.sentinels;
DROP POLICY IF EXISTS "Users can update their own sentinels" ON public.sentinels;
DROP POLICY IF EXISTS "Users can delete their own sentinels" ON public.sentinels;

-- Users can view their own sentinels
CREATE POLICY "Users can view their own sentinels"
  ON public.sentinels
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sentinels
CREATE POLICY "Users can insert their own sentinels"
  ON public.sentinels
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sentinels
CREATE POLICY "Users can update their own sentinels"
  ON public.sentinels
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sentinels
CREATE POLICY "Users can delete their own sentinels"
  ON public.sentinels
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ACTIVITIES POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.activities;

-- Users can view their own activities
CREATE POLICY "Users can view their own activities"
  ON public.activities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own activities
CREATE POLICY "Users can insert their own activities"
  ON public.activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sentinels TO authenticated;
GRANT SELECT, INSERT ON public.activities TO authenticated;

-- Grant permissions on sequences (for auto-increment)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- 7. HELPFUL VIEWS (OPTIONAL)
-- ============================================

-- View for sentinel statistics
-- Note: This view respects RLS policies from underlying tables
CREATE OR REPLACE VIEW public.sentinel_stats 
WITH (security_invoker=true) AS
SELECT 
  s.id AS sentinel_id,
  s.user_id,
  s.wallet_address,
  s.is_active,
  COUNT(a.id) AS total_checks,
  SUM(a.cost) AS total_spent,
  SUM(CASE WHEN a.triggered THEN 1 ELSE 0 END) AS alerts_triggered,
  AVG(a.cost) AS avg_cost_per_check,
  MAX(a.created_at) AS last_check_time,
  SUM(CASE WHEN a.status = 'success' THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(a.id), 0) * 100 AS success_rate
FROM public.sentinels s
LEFT JOIN public.activities a ON s.id = a.sentinel_id
GROUP BY s.id, s.user_id, s.wallet_address, s.is_active;

-- Grant select on view
GRANT SELECT ON public.sentinel_stats TO authenticated;

-- Enable RLS on the view (inherits from underlying tables)
ALTER VIEW public.sentinel_stats SET (security_invoker = true);

-- ============================================
-- 8. UTILITY FUNCTIONS
-- ============================================

-- Function to get user's active sentinel count
-- Uses SECURITY INVOKER to respect RLS policies
CREATE OR REPLACE FUNCTION public.get_active_sentinel_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  -- Verify the requesting user matches the p_user_id
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;
  
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.sentinels
    WHERE user_id = p_user_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Function to get user's total spent
-- Uses SECURITY INVOKER to respect RLS policies
CREATE OR REPLACE FUNCTION public.get_user_total_spent(p_user_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  -- Verify the requesting user matches the p_user_id
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;
  
  RETURN (
    SELECT COALESCE(SUM(cost), 0)
    FROM public.activities
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Function to deactivate all user sentinels
-- Uses SECURITY INVOKER to respect RLS policies
CREATE OR REPLACE FUNCTION public.deactivate_all_user_sentinels(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Verify the requesting user matches the p_user_id
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;
  
  UPDATE public.sentinels
  SET is_active = false, updated_at = NOW()
  WHERE user_id = p_user_id AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- ============================================
-- 9. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================

-- Uncomment to insert sample data for testing
/*
-- Note: Replace 'YOUR_USER_ID' with an actual user ID from auth.users
DO $$
DECLARE
  test_user_id UUID := 'YOUR_USER_ID'; -- Replace with actual user ID
  test_sentinel_id UUID;
BEGIN
  -- Insert test sentinel
  INSERT INTO public.sentinels (
    user_id,
    wallet_address,
    private_key,
    threshold,
    condition,
    payment_method,
    discord_webhook,
    is_active
  ) VALUES (
    test_user_id,
    'TestWallet123456789',
    'encrypted_private_key_here',
    100000.00,
    'above',
    'usdc',
    'https://discord.com/api/webhooks/test',
    true
  )
  RETURNING id INTO test_sentinel_id;

  -- Insert test activities
  INSERT INTO public.activities (
    sentinel_id,
    user_id,
    price,
    cost,
    settlement_time,
    payment_method,
    triggered,
    status
  ) VALUES
    (test_sentinel_id, test_user_id, 95000.50, 0.0001, 150, 'usdc', false, 'success'),
    (test_sentinel_id, test_user_id, 98000.75, 0.0001, 145, 'usdc', false, 'success'),
    (test_sentinel_id, test_user_id, 101000.00, 0.0001, 160, 'usdc', true, 'success');
    
  RAISE NOTICE 'Sample data inserted successfully!';
END $$;
*/

-- ============================================
-- 10. VERIFICATION QUERIES
-- ============================================

-- Run these queries to verify the schema was created correctly

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'sentinels', 'activities')
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'sentinels', 'activities');

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check indexes exist
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'sentinels', 'activities')
ORDER BY tablename, indexname;

-- Check triggers exist
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- SETUP COMPLETE! 🎉
-- ============================================

-- Your Supabase database is now ready for the Sentinel Agent application!
-- 
-- Next steps:
-- 1. Copy your Supabase URL and anon key to .env.local
-- 2. Enable Email authentication in Supabase Dashboard
-- 3. (Optional) Enable Google OAuth in Supabase Dashboard
-- 4. Test by creating a user and sentinel through your app
-- 
-- For more information, see:
-- - SUPABASE_SETUP.md
-- - DATABASE_INTEGRATION.md
