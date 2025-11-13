-- ============================================
-- SENTINEL AGENT - COMPLETE SUPABASE SCHEMA
-- ============================================
-- Updated: November 2025
-- Includes mainnet/devnet network separation
-- 
-- This script is idempotent and safe to run multiple times
-- Uses IF NOT EXISTS and DROP IF EXISTS to prevent errors
-- Includes ALL tables: profiles, sentinels, activities, ai_analyses
--
-- Run this in your Supabase SQL Editor to set up the complete database
-- ============================================

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

-- ==========================================
-- PROFILES TABLE
-- ==========================================
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

COMMENT ON TABLE public.profiles IS 'User profile information linked to auth.users';
COMMENT ON COLUMN public.profiles.id IS 'User ID from auth.users';
COMMENT ON COLUMN public.profiles.email IS 'User email address';

-- ==========================================
-- SENTINELS TABLE
-- ==========================================
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
  network TEXT NOT NULL DEFAULT 'devnet' CHECK (network IN ('devnet', 'mainnet')), -- NEW: Network separation
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
  
  -- NEW: Network-specific indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'sentinels_network_idx') THEN
    CREATE INDEX sentinels_network_idx ON public.sentinels(network);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'sentinels_user_network_idx') THEN
    CREATE INDEX sentinels_user_network_idx ON public.sentinels(user_id, network);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'sentinels_user_network_active_idx') THEN
    CREATE INDEX sentinels_user_network_active_idx ON public.sentinels(user_id, network, is_active);
  END IF;
END $$;

COMMENT ON TABLE public.sentinels IS 'Sentinel configurations for SOL price monitoring';
COMMENT ON COLUMN public.sentinels.wallet_address IS 'Solana wallet address for this sentinel';
COMMENT ON COLUMN public.sentinels.private_key IS 'Encrypted private key (base64 encoded)';
COMMENT ON COLUMN public.sentinels.threshold IS 'Price threshold in USD to trigger alert';
COMMENT ON COLUMN public.sentinels.condition IS 'Alert when price goes above or below threshold';
COMMENT ON COLUMN public.sentinels.payment_method IS 'Payment method for oracle fees (USDC or CASH)';
COMMENT ON COLUMN public.sentinels.network IS 'Solana network (devnet/mainnet). Sentinels cannot operate across networks.';
COMMENT ON COLUMN public.sentinels.is_active IS 'Whether this sentinel is actively monitoring';

-- ==========================================
-- ACTIVITIES TABLE
-- ==========================================
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
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'activities_status_idx') THEN
    CREATE INDEX activities_status_idx ON public.activities(status);
  END IF;
END $$;

COMMENT ON TABLE public.activities IS 'Activity logs for sentinel price checks';
COMMENT ON COLUMN public.activities.price IS 'SOL/USD price at time of check';
COMMENT ON COLUMN public.activities.cost IS 'Cost of oracle query in USDC/CASH';
COMMENT ON COLUMN public.activities.settlement_time IS 'Payment settlement time in milliseconds';
COMMENT ON COLUMN public.activities.triggered IS 'Whether price threshold was met and alert sent';
COMMENT ON COLUMN public.activities.transaction_signature IS 'Solana transaction signature for payment';

-- ==========================================
-- AI ANALYSES TABLE
-- ==========================================
-- Stores autonomous AI analysis results from DeepSeek
-- Used for pattern recognition and price prediction insights
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sentinel_id UUID NOT NULL REFERENCES public.sentinels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_text TEXT NOT NULL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  sentiment TEXT NOT NULL CHECK (sentiment IN ('bullish', 'neutral', 'bearish')),
  cost DECIMAL(10, 6) DEFAULT 0.0008, -- DeepSeek API cost
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ai_analyses_sentinel_id_idx') THEN
    CREATE INDEX ai_analyses_sentinel_id_idx ON public.ai_analyses(sentinel_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ai_analyses_user_id_idx') THEN
    CREATE INDEX ai_analyses_user_id_idx ON public.ai_analyses(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ai_analyses_created_at_idx') THEN
    CREATE INDEX ai_analyses_created_at_idx ON public.ai_analyses(created_at DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ai_analyses_sentiment_idx') THEN
    CREATE INDEX ai_analyses_sentiment_idx ON public.ai_analyses(sentiment);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ai_analyses_confidence_idx') THEN
    CREATE INDEX ai_analyses_confidence_idx ON public.ai_analyses(confidence_score DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ai_analyses_sentinel_created_idx') THEN
    CREATE INDEX ai_analyses_sentinel_created_idx ON public.ai_analyses(sentinel_id, created_at DESC);
  END IF;
END $$;

COMMENT ON TABLE public.ai_analyses IS 'AI-powered market analysis results from DeepSeek';
COMMENT ON COLUMN public.ai_analyses.analysis_text IS 'Natural language analysis of price patterns';
COMMENT ON COLUMN public.ai_analyses.confidence_score IS 'AI confidence level (0-100)';
COMMENT ON COLUMN public.ai_analyses.sentiment IS 'Market sentiment prediction (bullish/neutral/bearish)';
COMMENT ON COLUMN public.ai_analyses.cost IS 'Cost of DeepSeek API call';

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
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PROFILES POLICIES
-- ==========================================

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

-- ==========================================
-- SENTINELS POLICIES
-- ==========================================

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

-- ==========================================
-- ACTIVITIES POLICIES
-- ==========================================

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

-- ==========================================
-- AI ANALYSES POLICIES
-- ==========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.ai_analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON public.ai_analyses;

-- Users can view their own AI analyses
CREATE POLICY "Users can view their own analyses"
  ON public.ai_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own AI analyses
CREATE POLICY "Users can insert their own analyses"
  ON public.ai_analyses
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
GRANT SELECT, INSERT ON public.ai_analyses TO authenticated;

-- Grant permissions on sequences (for auto-increment)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- 7. HELPFUL VIEWS (OPTIONAL)
-- ============================================

-- View for sentinel statistics (respects RLS)
CREATE OR REPLACE VIEW public.sentinel_stats 
WITH (security_invoker=true) AS
SELECT 
  s.id AS sentinel_id,
  s.user_id,
  s.wallet_address,
  s.network,
  s.is_active,
  s.threshold,
  s.condition,
  s.payment_method,
  COUNT(a.id) AS total_checks,
  SUM(a.cost) AS total_spent,
  SUM(CASE WHEN a.triggered THEN 1 ELSE 0 END) AS alerts_triggered,
  AVG(a.cost) AS avg_cost_per_check,
  MAX(a.created_at) AS last_check_time,
  SUM(CASE WHEN a.status = 'success' THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(a.id), 0) * 100 AS success_rate,
  s.created_at AS sentinel_created_at
FROM public.sentinels s
LEFT JOIN public.activities a ON s.id = a.sentinel_id
GROUP BY s.id, s.user_id, s.wallet_address, s.network, s.is_active, s.threshold, s.condition, s.payment_method, s.created_at;

-- Grant select on view
GRANT SELECT ON public.sentinel_stats TO authenticated;

-- Enable RLS on the view (inherits from underlying tables)
ALTER VIEW public.sentinel_stats SET (security_invoker = true);

COMMENT ON VIEW public.sentinel_stats IS 'Aggregated statistics for each sentinel with activity metrics';

-- ============================================
-- 8. UTILITY FUNCTIONS
-- ============================================

-- Function to get user's active sentinel count
CREATE OR REPLACE FUNCTION public.get_active_sentinel_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
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
CREATE OR REPLACE FUNCTION public.get_user_total_spent(p_user_id UUID)
RETURNS DECIMAL AS $$
BEGIN
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

-- Function to deactivate all user sentinels on a specific network
CREATE OR REPLACE FUNCTION public.deactivate_all_user_sentinels(p_user_id UUID, p_network TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;
  
  IF p_network IS NULL THEN
    -- Deactivate all sentinels regardless of network
    UPDATE public.sentinels
    SET is_active = false, updated_at = NOW()
    WHERE user_id = p_user_id AND is_active = true;
  ELSE
    -- Deactivate only sentinels on specific network
    UPDATE public.sentinels
    SET is_active = false, updated_at = NOW()
    WHERE user_id = p_user_id AND network = p_network AND is_active = true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Function to get sentinel count by network
CREATE OR REPLACE FUNCTION public.get_sentinel_count_by_network(p_user_id UUID)
RETURNS TABLE(network TEXT, count BIGINT) AS $$
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;
  
  RETURN QUERY
  SELECT s.network, COUNT(*)
  FROM public.sentinels s
  WHERE s.user_id = p_user_id
  GROUP BY s.network;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

COMMENT ON FUNCTION public.get_sentinel_count_by_network IS 'Get count of sentinels grouped by network (devnet/mainnet)';

-- ============================================
-- 9. VERIFICATION QUERIES
-- ============================================

-- Check tables exist
SELECT 'Tables Check' AS check_type, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'sentinels', 'activities', 'ai_analyses')
ORDER BY table_name;

-- Check RLS is enabled
SELECT 'RLS Check' AS check_type, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'sentinels', 'activities', 'ai_analyses');

-- Check policies exist
SELECT 'Policies Check' AS check_type, tablename, COUNT(*) AS policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Check indexes exist (especially network indexes)
SELECT 'Indexes Check' AS check_type, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'sentinels'
  AND indexname LIKE '%network%';

-- ============================================
-- SETUP COMPLETE! 🎉
-- ============================================

-- Your Supabase database is now ready for the Sentinel Agent application!
-- 
-- ✅ Tables created:
--    • profiles - User profile information
--    • sentinels - Price monitoring configurations (with network field)
--    • activities - Price check logs and results
--    • ai_analyses - DeepSeek AI analysis results
-- 
-- ✅ Features enabled:
--    • Row Level Security (RLS) on all tables
--    • Automatic profile creation on signup
--    • Updated_at timestamp triggers
--    • Network separation (devnet/mainnet)
--    • Performance indexes
--    • Helper functions and views
-- 
-- 📊 Database Structure:
--    profiles (1) ─┬─ sentinels (many) ─┬─ activities (many)
--                  │                     └─ ai_analyses (many)
--                  └─ activities (many)
--                  └─ ai_analyses (many)
-- 
-- 🌐 Network Support:
--    Sentinels are now network-specific (devnet/mainnet)
--    Each sentinel tracks which network it was created for
--    Prevents devnet sentinels from operating on mainnet
-- 
-- 📝 Next Steps:
--    1. Copy Supabase URL and anon key to .env.local:
--       NEXT_PUBLIC_SUPABASE_URL=your-project-url
--       NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
--    
--    2. Set network environment variable:
--       NEXT_PUBLIC_NETWORK=devnet (or mainnet)
--    
--    3. Enable Email authentication in Supabase Dashboard:
--       Authentication → Providers → Email
--    
--    4. Add DeepSeek API key (optional, for AI features):
--       DEEPSEEK_API_KEY=your-api-key
--    
--    5. Test the application:
--       - Create a user account
--       - Create a sentinel
--       - Check activities after 3 price checks
--       - View AI analysis (if enabled)
-- 
-- 🔒 Security Notes:
--    • All tables have RLS enabled
--    • Users can only access their own data
--    • Private keys should be encrypted (consider adding encryption at rest)
--    • Use environment-specific Supabase projects (dev vs prod)
-- 
-- 📚 Documentation:
--    See MAINNET_SETUP_INSTRUCTIONS.md for detailed setup guide
--    See SUPABASE_SETUP.md for Supabase-specific configuration
-- 
-- ============================================

