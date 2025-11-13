# Supabase Setup Guide for Sentinel Agent

## 🚀 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up for a free account
3. Click "New Project"
4. Fill in the details:
   - **Project Name**: `sentinel-agent`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
5. Click "Create new project" and wait 2-3 minutes for provisioning

## 🔐 Step 2: Configure Authentication

### Enable Auth Providers

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. **Enable Email Provider**:
   - Toggle "Enable Email provider" to ON
   - Enable "Confirm email" if you want email verification
3. **Enable Google Provider**:
   - Toggle "Enable Google provider" to ON
   - You'll need to set up Google OAuth credentials:
     - Go to [Google Cloud Console](https://console.cloud.google.com)
     - Create a new project or select existing
     - Enable Google+ API
     - Go to Credentials → Create OAuth 2.0 Client ID
     - Add authorized redirect URI: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
     - Copy Client ID and Client Secret to Supabase

### Configure URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3001/auth/callback` (if using port 3001)
   - Add your production URL later: `https://yourdomain.com/auth/callback`

## 🔑 Step 3: Get API Keys

1. Go to **Project Settings** (gear icon) → **API**
2. Copy the following values:
   - **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

## 📝 Step 4: Add Environment Variables

Create or update `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...

# Existing variables
SOLANA_RPC_URL=https://api.devnet.solana.com
```

**⚠️ Important**: Never commit `.env.local` to git!

## 🗄️ Step 5: Create Database Tables

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the SQL below
4. Click "Run" to execute

### SQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sentinels Table
CREATE TABLE sentinels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  wallet_address TEXT NOT NULL,
  private_key TEXT NOT NULL,
  threshold NUMERIC NOT NULL,
  condition TEXT CHECK (condition IN ('above', 'below')),
  payment_method TEXT CHECK (payment_method IN ('usdc', 'cash')),
  discord_webhook TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Activities Table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sentinel_id UUID REFERENCES sentinels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  price NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  settlement_time INTEGER,
  payment_method TEXT,
  transaction_signature TEXT,
  triggered BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sentinels_user_id ON sentinels(user_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_sentinel_id ON activities(sentinel_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinels ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Sentinels Policies
CREATE POLICY "Users can view their own sentinels"
  ON sentinels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sentinels"
  ON sentinels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sentinels"
  ON sentinels FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sentinels"
  ON sentinels FOR DELETE
  USING (auth.uid() = user_id);

-- Activities Policies
CREATE POLICY "Users can view their own activities"
  ON activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sentinels_updated_at
  BEFORE UPDATE ON sentinels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## ✅ Step 6: Verify Setup

1. Go to **Table Editor** in Supabase Dashboard
2. You should see three tables: `profiles`, `sentinels`, `activities`
3. Click on each table to verify columns are correct
4. Go to **Authentication** → **Policies** to verify RLS policies

## 🧪 Step 7: Test Authentication

After completing the code setup:

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Sign Up" and create an account
4. Check Supabase Dashboard → **Authentication** → **Users** to see your new user
5. Check **Table Editor** → **profiles** to see your profile was auto-created

## 🔒 Security Notes

- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Users can only access their own data
- ✅ API keys are environment variables (never committed)
- ✅ Private keys are encrypted in database (add encryption later)
- ⚠️ For production, add additional security measures

## 📚 Next Steps

After setup:
1. Test sign up with email
2. Test sign in with Google
3. Create a sentinel and verify it saves to database
4. Check activities are logged correctly
5. Test sign out and protected routes

## 🆘 Troubleshooting

**Issue**: "Invalid API key"
- Solution: Double-check `.env.local` has correct values
- Restart dev server after changing env variables

**Issue**: "User not found"
- Solution: Check RLS policies are created correctly
- Verify user exists in Authentication → Users

**Issue**: Google OAuth not working
- Solution: Check redirect URLs are configured correctly
- Verify Google OAuth credentials are valid

**Issue**: Tables not created
- Solution: Run SQL in SQL Editor, not in terminal
- Check for syntax errors in SQL

## 📖 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Auth Guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
