# Mainnet Fixes - Complete Implementation Guide

This document details all fixes implemented to resolve mainnet-related issues in the Sentinel Agent application.

## 🚨 Problem Summary

The dashboard worked fine on **devnet** but showed nothing after switching to **mainnet**. This was caused by:

1. **Network Field Missing**: Sentinels created on devnet were being loaded on mainnet (wrong network)
2. **Hardcoded Addresses**: Some code had hardcoded devnet addresses
3. **Insufficient Logging**: No visibility into which network was being used
4. **No Network Filtering**: Database queries didn't filter by network

---

## ✅ Fixes Implemented

### 1. Database Migration - Network Field Added

**File**: `supabase/migrations/add_network_to_sentinels.sql`

**What Changed**:
- Added `network` column to `sentinels` table (VARCHAR with CHECK constraint: 'devnet' or 'mainnet')
- Added indexes for fast network-based filtering
- Set default to 'devnet' for backward compatibility

**Why This Matters**:
- Sentinels created on devnet have devnet wallet addresses and won't work on mainnet
- Each sentinel must track which network it was created for
- Dashboard now filters sentinels by current network

**Action Required**:
```sql
-- Run this in Supabase SQL Editor
ALTER TABLE public.sentinels 
ADD COLUMN IF NOT EXISTS network TEXT NOT NULL DEFAULT 'devnet' 
CHECK (network IN ('devnet', 'mainnet'));

CREATE INDEX IF NOT EXISTS sentinels_network_idx ON public.sentinels(network);
```

---

### 2. Environment Variable Verification

**What to Check**:
```bash
# In your .env.local file:
NEXT_PUBLIC_NETWORK=mainnet  # or 'devnet'

# For mainnet, also set (optional but recommended):
NEXT_PUBLIC_MAINNET_RPC=https://your-helius-or-alchemy-rpc-url
```

**Logging Added**:
The dashboard now logs on mount:
```
🌐 ========== NETWORK CONFIGURATION ==========
📍 Environment Variable NEXT_PUBLIC_NETWORK: mainnet
📍 Current Network: Mainnet
📍 Is Mainnet: true
📍 Warning Enabled: true
🌐 ============================================
```

---

### 3. RPC Endpoint Dynamic Configuration

**Files Changed**:
- `lib/solana.ts` - Updated to log RPC configuration
- `lib/switchboard.ts` - Fixed to use dynamic network configuration
- `lib/payments.ts` - Updated verification to use current network

**Before** (❌ Wrong):
```typescript
// Hardcoded devnet connection
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
```

**After** (✅ Correct):
```typescript
// Dynamic connection based on environment
const connection = getSolanaConnection(); // Uses NEXT_PUBLIC_NETWORK
```

**Logging Output**:
```
🔌 Solana RPC Connection:
  - Network: MAINNET
  - RPC URL: https://api.mainnet-beta.solana.com
  - Cluster: mainnet-beta
```

---

### 4. USDC Mint Address Switching

**File**: `lib/networks.ts`

**Configuration**:
```typescript
DEVNET_CONFIG: {
  tokens: {
    usdc: {
      mint: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', // Devnet USDC
    }
  }
}

MAINNET_CONFIG: {
  tokens: {
    usdc: {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Official USDC
    }
  }
}
```

**Now Logs**:
```
💳 ========== USDC PAYMENT (MAINNET) ==========
🌐 Network: MAINNET
🪙 USDC Mint Address: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

---

### 5. Sentinel Network Compatibility

**Files Changed**:
- `lib/database.ts` - Updated to filter by network
- `app/dashboard/page.tsx` - Updated to load only current network sentinels

**Key Changes**:

#### Database Functions Updated:
```typescript
// Now accepts network parameter
getSentinels(userId: string, network?: 'devnet' | 'mainnet')
deactivateAllSentinels(userId: string, network?: 'devnet' | 'mainnet')

// Automatically includes network when creating
createSentinel(userId, {
  ...config,
  network: 'mainnet' // or 'devnet'
})
```

#### Dashboard Loading:
```typescript
// Only loads sentinels for current network
const currentNetwork = isMainnet() ? 'mainnet' : 'devnet';
const sentinels = await getSentinels(user.id, currentNetwork);
```

**User Experience**:
- ✅ Devnet sentinels don't show when on mainnet
- ✅ Mainnet sentinels don't show when on devnet
- ✅ Toast notification if sentinels exist on other network
- ✅ Clear logging showing which network sentinels are loaded from

---

### 6. Switchboard Oracle Configuration

**File**: `lib/switchboard.ts`

**Before** (❌ Hardcoded):
```typescript
const SOL_USD_FEED = new PublicKey('GvD...');  // Hardcoded devnet feed
```

**After** (✅ Dynamic):
```typescript
// Gets feed address from network config
const network = getCurrentNetwork();
const feedAddress = new PublicKey(network.switchboard.feedAddress);
```

**Note**: Both devnet and mainnet use the same Switchboard V2 program ID and feed address in this implementation. Verify with Switchboard docs if different feeds are needed.

---

### 7. Transaction Confirmation & Error Handling

**File**: `lib/payments.ts`

**Improvements**:
1. **Network-aware verification**:
   ```typescript
   const connection = getSolanaConnection(); // Not hardcoded to devnet
   const network = isMainnet() ? 'MAINNET' : 'DEVNET';
   ```

2. **Enhanced error messages**:
   ```typescript
   if (!transaction) {
     console.log('❌ Transaction not found on', network);
   }
   ```

3. **Mainnet safety checks**:
   ```typescript
   if (isMainnet()) {
     console.warn('🚨 MAINNET TRANSACTION - REAL FUNDS WILL BE USED! 🚨');
   }
   ```

---

### 8. Comprehensive Logging

All operations now log their network context:

#### On Dashboard Mount:
```
🌐 ========== NETWORK CONFIGURATION ==========
📍 Current Network: Mainnet
🌐 ============================================
```

#### When Loading Sentinels:
```
📦 ========== LOADING SENTINELS ==========
👤 User ID: abc-123
🌐 Loading sentinels for network: MAINNET
✅ Loaded 2 sentinels on mainnet
📦 =======================================
```

#### When Creating Sentinel:
```
🚀 ========== CREATING SENTINEL ==========
🌐 Network: MAINNET
💰 Payment Method: usdc
📊 Threshold: 100000 above
🔑 Generated Wallet: 7xK...
✅ Sentinel created successfully on mainnet
🚀 =======================================
```

#### When Making Payments:
```
💳 ========== USDC PAYMENT (MAINNET) ==========
🌐 Network: MAINNET
🪙 USDC Mint Address: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
📤 From: 7xK...
📥 To: 9yP...
💰 Amount: 0.0001 USDC
```

---

## 🎯 How to Switch Networks

### Option 1: Environment Variable (Recommended)

1. **Create/Edit `.env.local`**:
   ```bash
   # For Devnet (testing with fake tokens)
   NEXT_PUBLIC_NETWORK=devnet
   
   # For Mainnet (REAL MONEY!)
   NEXT_PUBLIC_NETWORK=mainnet
   NEXT_PUBLIC_MAINNET_RPC=https://your-premium-rpc-url
   ```

2. **Restart Dev Server**:
   ```bash
   npm run dev
   ```

3. **Check Console**: You should see the network logged on dashboard load

### Option 2: Deployment (Vercel)

In Vercel dashboard, set environment variable:
```
NEXT_PUBLIC_NETWORK = mainnet
```

---

## 🔍 Verification Checklist

After switching to mainnet, verify these in browser console:

- [ ] ✅ **Network Config Log** shows "Mainnet"
- [ ] ✅ **RPC URL** is mainnet (not devnet)
- [ ] ✅ **USDC Mint** is `EPjF...` (mainnet USDC)
- [ ] ✅ **Sentinels Loading** shows correct network
- [ ] ✅ **Network Indicator** displays green "MAINNET" badge
- [ ] ✅ **Warning Banner** shows "MAINNET MODE ACTIVE"
- [ ] ✅ **Devnet sentinels** are hidden (not shown)

---

## 🚨 Important Mainnet Warnings

### 1. Real Money
When on mainnet:
- All transactions use **REAL USDC** (not test tokens)
- Wallet balances must have real funds
- Transaction fees are real SOL

### 2. Safety Limits
Configured in `lib/networks.ts`:
```typescript
MAINNET_CONFIG: {
  limits: {
    maxSinglePayment: 0.001,     // Max 0.001 USDC per transaction
    warningThreshold: 0.0001,    // Warn above 0.0001 USDC
  }
}
```

### 3. Rate Limiting
Consider using a premium RPC provider for mainnet:
- **Helius**: https://helius.xyz
- **Alchemy**: https://alchemy.com
- **QuickNode**: https://quicknode.com

Public RPC endpoints have rate limits and may be unreliable.

---

## 📊 Database Schema Update

If you have existing data, run this migration:

```sql
-- Backup existing sentinels
CREATE TABLE sentinels_backup AS SELECT * FROM public.sentinels;

-- Add network column (defaults to devnet)
ALTER TABLE public.sentinels 
ADD COLUMN IF NOT EXISTS network TEXT NOT NULL DEFAULT 'devnet' 
CHECK (network IN ('devnet', 'mainnet'));

-- Add indexes
CREATE INDEX IF NOT EXISTS sentinels_network_idx ON public.sentinels(network);
CREATE INDEX IF NOT EXISTS sentinels_user_network_idx ON public.sentinels(user_id, network);
CREATE INDEX IF NOT EXISTS sentinels_user_network_active_idx ON public.sentinels(user_id, network, is_active);

-- Verify
SELECT id, user_id, network, is_active, created_at FROM public.sentinels ORDER BY created_at DESC;
```

**Result**: All existing sentinels will have `network = 'devnet'` (correct, since they were created on devnet)

---

## 🐛 Troubleshooting

### Issue: "Dashboard shows nothing on mainnet"

**Check**:
1. Console logs - what network is detected?
2. Do you have sentinels created on mainnet?
3. Are you filtering by the right network?

**Solution**:
```typescript
// In console, check:
console.log(process.env.NEXT_PUBLIC_NETWORK);

// Should see in logs:
// "🌐 Loading sentinels for network: MAINNET"
// "✅ Loaded 0 sentinels on mainnet"  <- If 0, create new sentinel
```

### Issue: "Sentinels disappeared after switching"

**This is expected!** Sentinels are network-specific:
- Devnet sentinels only show on devnet
- Mainnet sentinels only show on mainnet

**Why**: Wallet addresses are network-specific. A devnet wallet can't operate on mainnet.

### Issue: "Payment failed on mainnet"

**Common causes**:
1. **No USDC balance** - Wallet needs real USDC
2. **No SOL balance** - Need SOL for transaction fees
3. **Wrong mint address** - Check console logs for mint address
4. **RPC error** - Try premium RPC provider

**Check logs for**:
```
🪙 USDC Mint Address: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v  <- Correct mainnet
🚨 MAINNET TRANSACTION - REAL FUNDS WILL BE USED! 🚨  <- Safety warning
```

---

## 📝 Summary of Files Changed

### Database
- `supabase/migrations/add_network_to_sentinels.sql` ⭐ NEW

### Core Libraries
- `lib/database.ts` - Added network filtering
- `lib/networks.ts` - Already correct (no changes needed)
- `lib/solana.ts` - Added logging
- `lib/switchboard.ts` - Fixed to use dynamic network
- `lib/payments.ts` - Updated verification for mainnet

### Frontend
- `app/dashboard/page.tsx` - Added network filtering and logging
- `components/NetworkIndicator.tsx` - Already correct
- `types/index.ts` - Added network field to SentinelConfig

### Documentation
- `MAINNET_FIXES.md` ⭐ NEW (this file)

---

## 🎉 Testing Procedure

### 1. Test Devnet (Safe)
```bash
# .env.local
NEXT_PUBLIC_NETWORK=devnet

# Should see:
# - Orange "DEVNET" badge
# - Test tokens message
# - Devnet sentinels loaded
```

### 2. Test Mainnet (CAREFUL!)
```bash
# .env.local
NEXT_PUBLIC_NETWORK=mainnet

# Should see:
# - Green "MAINNET" badge with pulse
# - Red warning banner
# - "REAL FUNDS ACTIVE" message
# - Only mainnet sentinels loaded (may be 0)
```

### 3. Test Network Switching
```bash
# Start on devnet, create sentinel
# Switch to mainnet
# Verify devnet sentinel is hidden
# Create new mainnet sentinel
# Switch back to devnet
# Verify mainnet sentinel is hidden, devnet sentinel is back
```

---

## 🔐 Security Considerations

1. **Private Keys**: Still stored in database. Consider encryption at rest.
2. **Mainnet Limits**: Safety limits enforced in code, but not blockchain-enforced.
3. **RPC URLs**: Don't commit real RPC URLs with API keys to git.
4. **User Confirmation**: Mainnet modal requires explicit confirmation before creating sentinels.

---

## 📚 Additional Resources

- [Solana Clusters](https://docs.solana.com/clusters)
- [USDC on Solana](https://www.circle.com/en/usdc-multichain/solana)
- [Switchboard Docs](https://docs.switchboard.xyz/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

---

## ✅ Verification Complete

After implementing these fixes, you should now have:

✅ Network-aware sentinel management  
✅ Proper mainnet/devnet separation  
✅ Comprehensive logging at every step  
✅ Safety checks for mainnet transactions  
✅ Database schema with network tracking  
✅ Dynamic RPC and mint address selection  
✅ Clear UI indicators for current network  

**The dashboard should now work correctly on both devnet and mainnet! 🎉**

