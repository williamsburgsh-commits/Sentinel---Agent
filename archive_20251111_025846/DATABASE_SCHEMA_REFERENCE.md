# 📊 Database Schema Reference - Sentinel Agent

Complete database structure with all tables, columns, and relationships.

---

## 🎯 Quick Overview

**4 Main Tables:**
1. **profiles** - User information
2. **sentinels** - Price monitoring configurations
3. **activities** - Price check logs
4. **ai_analyses** - AI market analysis results

---

## 📋 Table Details

### 1. **profiles** Table

User profile information linked to Supabase Auth.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,                    -- Links to auth.users
  email TEXT,                            -- User email
  full_name TEXT,                        -- Display name
  avatar_url TEXT,                       -- Profile picture URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `profiles_email_idx` on `email`

**Relationships:**
- `profiles.id` → `auth.users.id` (CASCADE DELETE)

---

### 2. **sentinels** Table ⭐ Updated with Network Field

Sentinel configurations for SOL price monitoring.

```sql
CREATE TABLE public.sentinels (
  id UUID PRIMARY KEY,                    -- Sentinel unique ID
  user_id UUID NOT NULL,                  -- Owner of this sentinel
  wallet_address TEXT NOT NULL,           -- Solana wallet address
  private_key TEXT NOT NULL,              -- Encrypted private key
  threshold DECIMAL(20, 2) NOT NULL,      -- Price threshold in USD
  condition TEXT NOT NULL,                -- 'above' or 'below'
  payment_method TEXT NOT NULL,           -- 'usdc' or 'cash'
  discord_webhook TEXT NOT NULL,          -- Discord alert URL
  network TEXT NOT NULL DEFAULT 'devnet', -- ⭐ NEW: 'devnet' or 'mainnet'
  is_active BOOLEAN DEFAULT true,         -- Monitoring enabled?
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT sentinels_condition_check 
    CHECK (condition IN ('above', 'below')),
  CONSTRAINT sentinels_payment_check 
    CHECK (payment_method IN ('usdc', 'cash')),
  CONSTRAINT sentinels_network_check 
    CHECK (network IN ('devnet', 'mainnet'))
);
```

**Indexes:**
- `sentinels_user_id_idx` on `user_id`
- `sentinels_is_active_idx` on `is_active`
- `sentinels_user_active_idx` on `(user_id, is_active)`
- `sentinels_created_at_idx` on `created_at DESC`
- ⭐ `sentinels_network_idx` on `network`
- ⭐ `sentinels_user_network_idx` on `(user_id, network)`
- ⭐ `sentinels_user_network_active_idx` on `(user_id, network, is_active)`

**Relationships:**
- `sentinels.user_id` → `auth.users.id` (CASCADE DELETE)

**Key Points:**
- ⭐ **Network field** prevents devnet sentinels from operating on mainnet
- Each sentinel is bound to the network it was created on
- Private keys are stored as base64-encoded strings (consider encryption at rest)

---

### 3. **activities** Table

Activity logs for each price check performed by sentinels.

```sql
CREATE TABLE public.activities (
  id UUID PRIMARY KEY,                     -- Activity unique ID
  sentinel_id UUID NOT NULL,               -- Which sentinel performed check
  user_id UUID NOT NULL,                   -- Sentinel owner
  price DECIMAL(20, 8) NOT NULL,           -- SOL price at check time
  cost DECIMAL(20, 8) NOT NULL,            -- Cost in USDC/CASH
  settlement_time INTEGER,                 -- Payment time (ms)
  payment_method TEXT,                     -- 'usdc' or 'cash'
  transaction_signature TEXT,              -- Solana tx signature
  triggered BOOLEAN DEFAULT false,         -- Alert sent?
  status TEXT DEFAULT 'success',           -- 'success', 'error', 'pending'
  error_message TEXT,                      -- Error details if failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `activities_sentinel_id_idx` on `sentinel_id`
- `activities_user_id_idx` on `user_id`
- `activities_created_at_idx` on `created_at DESC`
- `activities_triggered_idx` on `triggered`
- `activities_status_idx` on `status`
- `activities_user_created_idx` on `(user_id, created_at DESC)`
- `activities_sentinel_created_idx` on `(sentinel_id, created_at DESC)`

**Relationships:**
- `activities.sentinel_id` → `sentinels.id` (CASCADE DELETE)
- `activities.user_id` → `auth.users.id` (CASCADE DELETE)

**Key Points:**
- Tracks every price check performed
- Records cost and payment method
- Stores transaction signatures for verification
- `triggered` = true when threshold met and alert sent

---

### 4. **ai_analyses** Table

AI-powered market analysis from DeepSeek.

```sql
CREATE TABLE public.ai_analyses (
  id UUID PRIMARY KEY,                     -- Analysis unique ID
  sentinel_id UUID NOT NULL,               -- Which sentinel
  user_id UUID NOT NULL,                   -- Sentinel owner
  analysis_text TEXT NOT NULL,             -- Natural language analysis
  confidence_score INTEGER NOT NULL,       -- 0-100 confidence level
  sentiment TEXT NOT NULL,                 -- 'bullish', 'neutral', 'bearish'
  cost DECIMAL(10, 6) DEFAULT 0.0008,      -- DeepSeek API cost
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT ai_analyses_confidence_check 
    CHECK (confidence_score >= 0 AND confidence_score <= 100),
  CONSTRAINT ai_analyses_sentiment_check 
    CHECK (sentiment IN ('bullish', 'neutral', 'bearish'))
);
```

**Indexes:**
- `ai_analyses_sentinel_id_idx` on `sentinel_id`
- `ai_analyses_user_id_idx` on `user_id`
- `ai_analyses_created_at_idx` on `created_at DESC`
- `ai_analyses_sentiment_idx` on `sentiment`
- `ai_analyses_confidence_idx` on `confidence_score DESC`
- `ai_analyses_sentinel_created_idx` on `(sentinel_id, created_at DESC)`

**Relationships:**
- `ai_analyses.sentinel_id` → `sentinels.id` (CASCADE DELETE)
- `ai_analyses.user_id` → `auth.users.id` (CASCADE DELETE)

**Key Points:**
- Runs automatically after 3 new activities
- Analyzes price patterns using DeepSeek AI
- Provides sentiment and confidence predictions
- Can trigger Discord alerts for high-confidence predictions

---

## 🔗 Relationships Diagram

```
auth.users (Supabase Auth)
    │
    ├─► profiles (1:1)
    │       id (PK) = auth.users.id
    │
    ├─► sentinels (1:many)
    │       │
    │       ├─► activities (1:many)
    │       │       └── Records each price check
    │       │
    │       └─► ai_analyses (1:many)
    │               └── AI market predictions
    │
    ├─► activities (1:many)
    │       └── Direct link for user queries
    │
    └─► ai_analyses (1:many)
            └── Direct link for user queries
```

**Cascade Deletes:**
- Delete user → deletes profiles, sentinels, activities, ai_analyses
- Delete sentinel → deletes activities, ai_analyses

---

## 🔐 Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data.

### profiles Policies:
- ✅ `Users can view their own profile` (SELECT)
- ✅ `Users can update their own profile` (UPDATE)
- ✅ `Users can insert their own profile` (INSERT)

### sentinels Policies:
- ✅ `Users can view their own sentinels` (SELECT)
- ✅ `Users can insert their own sentinels` (INSERT)
- ✅ `Users can update their own sentinels` (UPDATE)
- ✅ `Users can delete their own sentinels` (DELETE)

### activities Policies:
- ✅ `Users can view their own activities` (SELECT)
- ✅ `Users can insert their own activities` (INSERT)

### ai_analyses Policies:
- ✅ `Users can view their own analyses` (SELECT)
- ✅ `Users can insert their own analyses` (INSERT)

**Security Note:** All policies check `auth.uid() = user_id`

---

## 📊 Views

### sentinel_stats View

Aggregated statistics for each sentinel.

```sql
CREATE VIEW sentinel_stats AS
SELECT 
  s.id AS sentinel_id,
  s.user_id,
  s.wallet_address,
  s.network,                               -- ⭐ Includes network
  s.is_active,
  s.threshold,
  s.condition,
  s.payment_method,
  COUNT(a.id) AS total_checks,
  SUM(a.cost) AS total_spent,
  SUM(CASE WHEN a.triggered THEN 1 ELSE 0 END) AS alerts_triggered,
  AVG(a.cost) AS avg_cost_per_check,
  MAX(a.created_at) AS last_check_time,
  SUM(CASE WHEN a.status = 'success' THEN 1 ELSE 0 END)::FLOAT / 
    NULLIF(COUNT(a.id), 0) * 100 AS success_rate,
  s.created_at AS sentinel_created_at
FROM sentinels s
LEFT JOIN activities a ON s.id = a.sentinel_id
GROUP BY s.id, s.user_id, s.wallet_address, s.network, 
         s.is_active, s.threshold, s.condition, s.payment_method, s.created_at;
```

**Usage:**
```sql
-- Get all stats for current user's sentinels
SELECT * FROM sentinel_stats;

-- Get stats for mainnet sentinels only
SELECT * FROM sentinel_stats WHERE network = 'mainnet';
```

---

## 🛠️ Utility Functions

### get_active_sentinel_count(p_user_id UUID)
Returns count of active sentinels for a user.

```sql
SELECT public.get_active_sentinel_count(auth.uid());
-- Returns: INTEGER
```

### get_user_total_spent(p_user_id UUID)
Returns total amount spent on oracle queries.

```sql
SELECT public.get_user_total_spent(auth.uid());
-- Returns: DECIMAL (in USDC/CASH)
```

### deactivate_all_user_sentinels(p_user_id UUID, p_network TEXT)
Deactivates all sentinels (optionally filtered by network).

```sql
-- Deactivate all sentinels
SELECT public.deactivate_all_user_sentinels(auth.uid());

-- Deactivate only mainnet sentinels
SELECT public.deactivate_all_user_sentinels(auth.uid(), 'mainnet');
```

### get_sentinel_count_by_network(p_user_id UUID) ⭐ NEW
Returns sentinel count grouped by network.

```sql
SELECT * FROM public.get_sentinel_count_by_network(auth.uid());
-- Returns: TABLE(network TEXT, count BIGINT)
-- Example result:
--   network  | count
--   devnet   | 5
--   mainnet  | 2
```

---

## 🔄 Triggers

### on_auth_user_created
- **Table:** `auth.users`
- **Event:** AFTER INSERT
- **Action:** Creates profile automatically
- **Function:** `handle_new_user()`

### on_profiles_updated
- **Table:** `profiles`
- **Event:** BEFORE UPDATE
- **Action:** Updates `updated_at` timestamp
- **Function:** `handle_updated_at()`

### on_sentinels_updated
- **Table:** `sentinels`
- **Event:** BEFORE UPDATE
- **Action:** Updates `updated_at` timestamp
- **Function:** `handle_updated_at()`

---

## 📏 Data Types & Constraints

### Column Sizes

| Column | Type | Notes |
|--------|------|-------|
| `threshold` | DECIMAL(20, 2) | Max: $999,999,999,999,999,999.99 |
| `price` | DECIMAL(20, 8) | High precision for crypto prices |
| `cost` | DECIMAL(20, 8) | High precision for micropayments |
| `ai_cost` | DECIMAL(10, 6) | Typical: $0.0008 per analysis |
| `settlement_time` | INTEGER | Milliseconds (ms) |
| `confidence_score` | INTEGER | 0-100 range |

### CHECK Constraints

```sql
-- sentinels table
CHECK (condition IN ('above', 'below'))
CHECK (payment_method IN ('usdc', 'cash'))
CHECK (network IN ('devnet', 'mainnet'))  -- ⭐ NEW

-- activities table
CHECK (status IN ('success', 'error', 'pending'))

-- ai_analyses table
CHECK (confidence_score >= 0 AND confidence_score <= 100)
CHECK (sentiment IN ('bullish', 'neutral', 'bearish'))
```

---

## 🎯 Common Queries

### Get User's Sentinels (with network filter)
```sql
SELECT * FROM sentinels 
WHERE user_id = auth.uid() 
  AND network = 'mainnet'  -- ⭐ Filter by network
ORDER BY created_at DESC;
```

### Get Recent Activities for a Sentinel
```sql
SELECT * FROM activities 
WHERE sentinel_id = '...' 
  AND user_id = auth.uid()
ORDER BY created_at DESC 
LIMIT 50;
```

### Get Latest AI Analysis
```sql
SELECT * FROM ai_analyses 
WHERE sentinel_id = '...' 
  AND user_id = auth.uid()
ORDER BY created_at DESC 
LIMIT 1;
```

### Get Total Spent by Payment Method
```sql
SELECT 
  payment_method,
  COUNT(*) AS check_count,
  SUM(cost) AS total_cost
FROM activities
WHERE user_id = auth.uid()
GROUP BY payment_method;
```

### Get Network Distribution
```sql
SELECT 
  network,
  COUNT(*) AS sentinel_count,
  SUM(CASE WHEN is_active THEN 1 ELSE 0 END) AS active_count
FROM sentinels
WHERE user_id = auth.uid()
GROUP BY network;
```

---

## 🚀 Setup Instructions

1. **Copy the schema file** to your clipboard:
   - File: `COMPLETE_SUPABASE_SCHEMA.sql`

2. **Open Supabase SQL Editor**:
   - Go to your Supabase project
   - Navigate to SQL Editor

3. **Paste and run** the complete schema

4. **Verify** the setup:
   - Check that all 4 tables exist
   - Verify RLS is enabled
   - Test by creating a user and sentinel

---

## 📝 Migration Notes

### From Old Schema (without network field)

If you have existing data without the `network` field:

```sql
-- The schema automatically adds network with DEFAULT 'devnet'
-- All existing sentinels will be marked as devnet (correct!)

-- Verify migration:
SELECT network, COUNT(*) 
FROM sentinels 
GROUP BY network;
```

### Network Field Migration Impact

- ✅ Existing sentinels default to `network = 'devnet'`
- ✅ This is correct since they were created on devnet
- ✅ When you switch to mainnet, create new sentinels
- ✅ Old devnet sentinels will be hidden on mainnet (by design)

---

## 🔍 Debugging Queries

### Check RLS Status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### List All Policies
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Check Indexes
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

### View Triggers
```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

---

## ⚠️ Important Notes

1. **Network Separation**: Sentinels are network-specific and cannot be transferred between devnet and mainnet

2. **Private Keys**: Stored as base64 strings. Consider adding encryption at rest for production

3. **RLS Always On**: All queries must be from authenticated users. Use service role key carefully

4. **Cascade Deletes**: Deleting a user deletes ALL their data (profiles, sentinels, activities, AI analyses)

5. **Performance**: Indexes are optimized for common queries. Add more if needed based on usage patterns

---

## 📚 Related Documentation

- `COMPLETE_SUPABASE_SCHEMA.sql` - Full SQL schema
- `SUPABASE_SETUP.md` - Supabase configuration guide
- `MAINNET_SETUP_INSTRUCTIONS.md` - Mainnet deployment guide
- `DATABASE_INTEGRATION.md` - Integration details

---

**Schema Version:** 2.0 (with mainnet support)  
**Last Updated:** November 2025  
**Compatibility:** Supabase PostgreSQL 15+

