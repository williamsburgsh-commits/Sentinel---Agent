# Quick Setup Instructions for Mainnet Fixes

Follow these steps to apply the mainnet fixes to your Sentinel Agent application.

## Step 1: Run Database Migration

Open your **Supabase SQL Editor** and run this migration:

```sql
-- Add network field to sentinels table
ALTER TABLE public.sentinels 
ADD COLUMN IF NOT EXISTS network TEXT NOT NULL DEFAULT 'devnet' 
CHECK (network IN ('devnet', 'mainnet'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS sentinels_network_idx ON public.sentinels(network);
CREATE INDEX IF NOT EXISTS sentinels_user_network_idx ON public.sentinels(user_id, network);
CREATE INDEX IF NOT EXISTS sentinels_user_network_active_idx ON public.sentinels(user_id, network, is_active);

-- Add column comment
COMMENT ON COLUMN public.sentinels.network IS 'Solana network this sentinel was created for (devnet/mainnet). Sentinels cannot operate across networks.';

-- Verify migration
SELECT id, user_id, wallet_address, network, is_active, created_at 
FROM public.sentinels 
ORDER BY created_at DESC 
LIMIT 10;
```

**Expected Result**: All existing sentinels will have `network = 'devnet'` (correct, since they were created before this feature).

---

## Step 2: Set Environment Variable

### For Local Development

Create or edit `.env.local` in your project root:

```bash
# For Devnet (testing with fake tokens)
NEXT_PUBLIC_NETWORK=devnet

# OR for Mainnet (REAL MONEY!)
NEXT_PUBLIC_NETWORK=mainnet

# Optional: Use premium RPC for better reliability on mainnet
NEXT_PUBLIC_MAINNET_RPC=https://your-helius-rpc-url
NEXT_PUBLIC_DEVNET_RPC=https://api.devnet.solana.com
```

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   ```
   Key: NEXT_PUBLIC_NETWORK
   Value: mainnet  (or devnet)
   ```
4. Redeploy your application

---

## Step 3: Restart Development Server

```bash
# Stop the dev server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Step 4: Verify the Fix

Open your browser to `http://localhost:3000` and check the console:

### ✅ You Should See These Logs:

```
🌐 ========== NETWORK CONFIGURATION ==========
📍 Environment Variable NEXT_PUBLIC_NETWORK: mainnet
📍 Current Network: Mainnet
📍 Is Mainnet: true
📍 Warning Enabled: true
🌐 ============================================
```

### ✅ On the Dashboard:

1. **Network Indicator Badge**:
   - **Green badge** with "MAINNET" (if on mainnet)
   - **Orange badge** with "DEVNET" (if on devnet)

2. **Warning Banner** (mainnet only):
   - Red banner: "⚠️ MAINNET MODE ACTIVE - Real funds will be used for all transactions!"

3. **Sentinel Loading**:
   ```
   📦 ========== LOADING SENTINELS ==========
   👤 User ID: your-user-id
   🌐 Loading sentinels for network: MAINNET
   ✅ Loaded 0 sentinels on mainnet
   📦 =======================================
   ```

---

## Step 5: Test Sentinel Creation

### On Mainnet (CAREFUL - Real Money!)

1. Click **"Create New Sentinel"**
2. Fill in the form (webhook URL, threshold, etc.)
3. **Confirmation modal will appear** (mainnet only)
4. Review the estimated costs
5. Click **"I Understand, Proceed"**

**Expected Console Output**:
```
🚀 ========== CREATING SENTINEL ==========
🌐 Network: MAINNET
💰 Payment Method: usdc
📊 Threshold: 100000 above
🔑 Generated Wallet: 7xKq...
✅ Sentinel created successfully on mainnet
🚀 =======================================
```

### On Devnet (Safe to Test)

Same flow, but:
- No confirmation modal
- Orange badge instead of green
- "Test tokens" message

---

## Step 6: Test Network Switching

### Test Case 1: Devnet → Mainnet
1. Set `NEXT_PUBLIC_NETWORK=devnet`
2. Create a sentinel on devnet
3. Change to `NEXT_PUBLIC_NETWORK=mainnet`
4. Restart server
5. **Verify**: Devnet sentinel is hidden
6. Check console: "⚠️ Found 1 sentinels on OTHER network (hidden)"

### Test Case 2: Mainnet → Devnet
1. Set `NEXT_PUBLIC_NETWORK=mainnet`
2. Create a sentinel on mainnet (⚠️ costs real money)
3. Change to `NEXT_PUBLIC_NETWORK=devnet`
4. Restart server
5. **Verify**: Mainnet sentinel is hidden

---

## Common Issues & Solutions

### Issue 1: "Dashboard still shows nothing on mainnet"

**Diagnosis**:
Check console logs. If you see:
```
✅ Loaded 0 sentinels on mainnet
```

**Solution**: You don't have any sentinels created on mainnet yet. This is **correct behavior**!
- Your devnet sentinels are hidden (by design)
- Create a new sentinel on mainnet

### Issue 2: "Old sentinels disappeared"

**Diagnosis**: Did you switch networks?

**Solution**: 
- Devnet sentinels only show on devnet
- Mainnet sentinels only show on mainnet
- This is **intentional** - sentinels cannot operate across networks

Check console for:
```
⚠️ Found 2 sentinels on OTHER network (hidden)
💡 Switch network to see those sentinels
```

### Issue 3: "Migration failed"

**Error**: Column already exists

**Solution**: The migration is idempotent. If you see errors about existing columns, check:
```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sentinels' AND column_name = 'network';
```

If it exists, you're good! Skip the `ALTER TABLE` command.

### Issue 4: "No USDC balance on mainnet"

**This is expected!** Mainnet uses real USDC.

**Solution**:
1. **Fund your sentinel wallet** with real USDC
2. Get the wallet address from the dashboard (shown on sentinel card)
3. Send USDC from your personal wallet
4. Or use devnet for testing (free tokens)

---

## Safety Checklist

Before using mainnet:

- [ ] ✅ I understand mainnet uses **REAL MONEY**
- [ ] ✅ I have set `NEXT_PUBLIC_NETWORK=mainnet` correctly
- [ ] ✅ I see the **green MAINNET badge**
- [ ] ✅ I see the **red warning banner**
- [ ] ✅ I have read the **mainnet confirmation modal**
- [ ] ✅ I understand the **estimated costs**
- [ ] ✅ I am using a **premium RPC** (Helius/Alchemy)
- [ ] ✅ I have **funded the sentinel wallet** with real USDC

---

## Rollback Instructions

If you need to revert:

### 1. Rollback Database (OPTIONAL - not recommended)
```sql
-- Only if absolutely necessary
ALTER TABLE public.sentinels DROP COLUMN IF EXISTS network;
```

### 2. Rollback Environment
```bash
# Just change the env variable
NEXT_PUBLIC_NETWORK=devnet
```

### 3. Rollback Code
```bash
# If you cloned from git
git checkout main  # or your previous branch
```

---

## Next Steps

After verifying everything works:

1. **Deploy to Production** (if using Vercel):
   ```bash
   git add .
   git commit -m "Add mainnet support with network separation"
   git push
   ```

2. **Set Vercel Environment Variables**:
   - `NEXT_PUBLIC_NETWORK=mainnet`
   - `NEXT_PUBLIC_MAINNET_RPC=your-premium-rpc-url`

3. **Monitor First Mainnet Sentinel**:
   - Watch console logs
   - Verify transactions on Solscan
   - Check USDC balance is decreasing correctly

4. **Consider Premium RPC**:
   - Helius (recommended): https://helius.xyz
   - Free tier: 100k requests/month
   - Much more reliable than public RPC

---

## Support

If you encounter issues:

1. **Check Console Logs**: All operations are heavily logged
2. **Check Network Badge**: Is it showing the right network?
3. **Check Database**: Run query to see sentinels and their networks
4. **Check Environment**: `console.log(process.env.NEXT_PUBLIC_NETWORK)`

For more details, see `MAINNET_FIXES.md`.

---

## Success Criteria

You'll know it's working when:

✅ Dashboard loads without errors on mainnet  
✅ Network indicator shows correct network  
✅ Sentinels are filtered by current network  
✅ Old devnet sentinels are hidden on mainnet  
✅ New sentinels can be created on mainnet  
✅ Console shows network-specific logging  
✅ USDC transactions use correct mint address  
✅ Switchboard oracle uses correct endpoint  

**Congratulations! Your Sentinel Agent now supports both devnet and mainnet! 🎉**

