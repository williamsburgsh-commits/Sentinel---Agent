# ✅ TODO: Apply Mainnet Fixes

This checklist helps you apply the mainnet fixes to your Sentinel Agent application.

## Prerequisites

- [ ] Supabase project set up
- [ ] Access to Supabase SQL Editor
- [ ] Local development environment running

---

## Step 1: Database Migration (Required)

**Time**: ~5 minutes

- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Open `supabase/migrations/add_network_to_sentinels.sql`
- [ ] Copy the SQL and run it
- [ ] Verify: Run `SELECT * FROM sentinels LIMIT 5;` and confirm `network` column exists

**Expected Result**: All existing sentinels have `network = 'devnet'`

---

## Step 2: Environment Configuration (Required)

**Time**: ~2 minutes

### For Local Development

- [ ] Create or edit `.env.local` in project root
- [ ] Add line: `NEXT_PUBLIC_NETWORK=devnet` (for testing)
- [ ] Or: `NEXT_PUBLIC_NETWORK=mainnet` (for production - careful!)
- [ ] Save file

### For Vercel Deployment

- [ ] Go to Vercel project dashboard
- [ ] Settings → Environment Variables
- [ ] Add `NEXT_PUBLIC_NETWORK` = `mainnet` (or `devnet`)
- [ ] Redeploy application

---

## Step 3: Restart Application (Required)

**Time**: ~1 minute

- [ ] Stop dev server (Ctrl+C)
- [ ] Run `npm run dev` again
- [ ] Open browser to `http://localhost:3000`

---

## Step 4: Verification (Critical)

**Time**: ~5 minutes

### Check Browser Console

Open browser console (F12) and verify you see:

- [ ] ✅ "🌐 ========== NETWORK CONFIGURATION =========="
- [ ] ✅ "📍 Current Network: Mainnet" (or Devnet)
- [ ] ✅ "📍 Is Mainnet: true" (if mainnet) or "false" (if devnet)
- [ ] ✅ No errors in console

### Check Dashboard UI

- [ ] ✅ Network indicator badge visible in top right
- [ ] ✅ Badge shows correct network (Green "MAINNET" or Orange "DEVNET")
- [ ] ✅ If mainnet: Red warning banner shows at top
- [ ] ✅ Sentinels load without errors

### Check Sentinel Loading

In console, verify:

- [ ] ✅ "📦 ========== LOADING SENTINELS =========="
- [ ] ✅ "🌐 Loading sentinels for network: MAINNET" (or DEVNET)
- [ ] ✅ "✅ Loaded X sentinels on mainnet" (or devnet)

---

## Step 5: Test Sentinel Creation (Recommended)

**Time**: ~3 minutes

### On Devnet (Safe - Free Tokens)

- [ ] Ensure `NEXT_PUBLIC_NETWORK=devnet`
- [ ] Click "Create New Sentinel"
- [ ] Fill form (webhook, threshold, condition)
- [ ] Click "Deploy Sentinel"
- [ ] Verify success toast appears
- [ ] Check console logs for creation logs
- [ ] Verify sentinel appears in dashboard

### On Mainnet (Optional - Real Money!)

⚠️ **WARNING**: This costs real USDC!

- [ ] Ensure `NEXT_PUBLIC_NETWORK=mainnet`
- [ ] Click "Create New Sentinel"
- [ ] Fill form
- [ ] **Confirmation modal should appear**
- [ ] Read the warning carefully
- [ ] Understand costs
- [ ] Click "I Understand, Proceed"
- [ ] Verify sentinel created with `network='mainnet'`

---

## Step 6: Test Network Switching (Optional)

**Time**: ~5 minutes

### Test A: Devnet → Mainnet Switch

- [ ] Start with `NEXT_PUBLIC_NETWORK=devnet`
- [ ] Create a sentinel on devnet
- [ ] Note the sentinel ID
- [ ] Change to `NEXT_PUBLIC_NETWORK=mainnet`
- [ ] Restart dev server
- [ ] ✅ Verify: Devnet sentinel is NOT shown
- [ ] Check console: "⚠️ Found 1 sentinels on OTHER network"
- [ ] Dashboard should show empty state or only mainnet sentinels

### Test B: Mainnet → Devnet Switch (If you have mainnet sentinels)

- [ ] Start with `NEXT_PUBLIC_NETWORK=mainnet`
- [ ] Change to `NEXT_PUBLIC_NETWORK=devnet`
- [ ] Restart dev server
- [ ] ✅ Verify: Mainnet sentinels are NOT shown
- [ ] Only devnet sentinels appear

---

## Step 7: Check Logging (Optional but Recommended)

**Time**: ~2 minutes

### When Creating Sentinel

Verify console shows:

- [ ] "🚀 ========== CREATING SENTINEL =========="
- [ ] "🌐 Network: MAINNET" (or DEVNET)
- [ ] "💰 Payment Method: usdc" (or cash)
- [ ] "🔑 Generated Wallet: 7xK..."
- [ ] "✅ Sentinel created successfully on mainnet"

### When Loading Dashboard

Verify console shows:

- [ ] Network configuration block
- [ ] RPC connection info
- [ ] Sentinel loading with network
- [ ] No errors or warnings (except expected network switching warnings)

---

## Troubleshooting Checklist

If things don't work:

### Issue: Dashboard shows nothing

- [ ] Check console logs - what network is detected?
- [ ] Run SQL: `SELECT network, COUNT(*) FROM sentinels GROUP BY network;`
- [ ] Do you have sentinels on the current network?
- [ ] Try creating a new sentinel

### Issue: Wrong network showing

- [ ] Check `.env.local` file - is `NEXT_PUBLIC_NETWORK` set correctly?
- [ ] Did you restart the dev server after changing env?
- [ ] Check console: "📍 Environment Variable NEXT_PUBLIC_NETWORK:"
- [ ] Try: `console.log(process.env.NEXT_PUBLIC_NETWORK)` in browser console

### Issue: Migration failed

- [ ] Check error message
- [ ] Does `network` column already exist?
- [ ] Run: `SELECT column_name FROM information_schema.columns WHERE table_name='sentinels';`
- [ ] If `network` exists, migration already ran successfully

### Issue: TypeScript errors

- [ ] Run `npm install` to ensure all dependencies installed
- [ ] Check for any missing imports
- [ ] Restart TypeScript server in your IDE

---

## Post-Migration Checklist

After everything is working:

- [ ] ✅ Database has `network` column
- [ ] ✅ Environment variable set correctly
- [ ] ✅ Dashboard loads on correct network
- [ ] ✅ Network indicator shows correct badge
- [ ] ✅ Console logs show network info
- [ ] ✅ Can create sentinels on current network
- [ ] ✅ Sentinels filtered by network
- [ ] ✅ Network switching works correctly

---

## Deployment Checklist (For Production)

When deploying to production:

- [ ] Run database migration on production Supabase
- [ ] Set Vercel environment variable `NEXT_PUBLIC_NETWORK=mainnet`
- [ ] Optional: Set `NEXT_PUBLIC_MAINNET_RPC` to premium RPC URL
- [ ] Deploy to Vercel
- [ ] Verify production deployment shows mainnet badge
- [ ] Test creating a sentinel (⚠️ costs real money!)
- [ ] Monitor first few transactions

---

## Safety Reminders ⚠️

Before using mainnet:

- [ ] I understand mainnet uses **REAL MONEY**
- [ ] I have verified the environment variable is set correctly
- [ ] I see the **mainnet warning banner** on dashboard
- [ ] I have read the **confirmation modal** carefully
- [ ] I understand the **cost per transaction** (shown in modal)
- [ ] I have **funded the sentinel wallet** with real USDC
- [ ] I am using a **premium RPC** endpoint (recommended)

---

## Rollback Plan

If you need to revert changes:

### 1. Environment Variable
- [ ] Change `NEXT_PUBLIC_NETWORK=devnet`
- [ ] Restart server
- [ ] All devnet sentinels will show again

### 2. Code Rollback (if needed)
- [ ] `git checkout main` (or previous branch)
- [ ] `npm install`
- [ ] Restart server

### 3. Database Rollback (NOT RECOMMENDED)
```sql
-- Only if absolutely necessary
-- This will delete network information!
ALTER TABLE public.sentinels DROP COLUMN IF EXISTS network;
```

---

## Success Criteria

You'll know it's working when:

✅ Network configuration logs appear on dashboard load  
✅ Network indicator badge shows correct network  
✅ Sentinels load for current network only  
✅ Can create sentinels with network field  
✅ Network switching hides sentinels from other network  
✅ Console shows comprehensive logging  
✅ USDC transactions use correct mint address  

---

## Documentation Reference

For more details, see:

1. **MAINNET_FIXES_SUMMARY.md** - Quick overview of all changes
2. **MAINNET_FIXES.md** - Detailed technical documentation  
3. **MAINNET_SETUP_INSTRUCTIONS.md** - Step-by-step guide

---

## Completion Sign-Off

Once everything is working:

- [ ] ✅ All steps completed
- [ ] ✅ Verification passed
- [ ] ✅ Tests passed
- [ ] ✅ Ready for production (if deploying)

**Date Completed**: _______________

**Tested By**: _______________

**Notes**: _______________

---

**Congratulations! Your Sentinel Agent now fully supports mainnet! 🎉**

