# Network-Aware x402 Payment Protocol - Test Plan

## Overview
This document outlines how to test the network-aware HTTP 402 payment protocol implementation.

## What Changed

### 1. Updated CASH Mint Address
- Old: `CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT`
- New: `CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH` (correct Phantom CASH address)

### 2. Network-Aware Server (`/app/api/check-price/route.ts`)
- **Devnet**: Returns only `USDC` in `availableTokens` array
- **Mainnet**: Returns `['USDC', 'CASH']` in `availableTokens` array
- Accepts `X-Payment-Token-Used` header to know which token client used
- Returns `tokenUsed` field in successful response

### 3. Network-Aware Client (`lib/x402-client.ts`)
- **Devnet**: Forces USDC payment (logs "Devnet detected - forcing USDC payment")
- **Mainnet**: Respects `paymentMethod` preference (defaults to USDC)
- Sends `X-Payment-Token-Used` header with retry request
- Logs network, available tokens, and token used in console

## Test Cases

### Test 1: Devnet - USDC Only
**Setup:**
- Set `NEXT_PUBLIC_NETWORK=devnet` in `.env.local`
- Create a sentinel with any `paymentMethod` (usdc or cash)

**Expected Behavior:**
1. Initial request returns 402 with:
   ```json
   {
     "token": "USDC",
     "availableTokens": ["USDC"],
     ...
   }
   ```
2. Console logs show: `"🧪 Devnet detected - forcing USDC payment"`
3. Client sends USDC payment using `sendUSDCPayment()`
4. Retry request includes header: `X-Payment-Token-Used: USDC`
5. Successful response includes: `"tokenUsed": "USDC"`

**Console Output Should Include:**
```
🌐 Network: DEVNET
🪙 Available tokens: USDC
💳 Preferred payment method: CASH (or USDC)
🧪 Devnet detected - forcing USDC payment
💸 Step 3: Sending 0.0003 USDC payment to [recipient]
🪙 Token used: USDC
```

### Test 2: Mainnet - USDC Payment (Default)
**Setup:**
- Set `NEXT_PUBLIC_NETWORK=mainnet` in `.env.local`
- Create a sentinel with `paymentMethod: 'usdc'` (or no paymentMethod - defaults to usdc)

**Expected Behavior:**
1. Initial request returns 402 with:
   ```json
   {
     "token": "USDC",
     "availableTokens": ["USDC", "CASH"],
     ...
   }
   ```
2. Console logs show: `"💵 Mainnet - using USDC payment"`
3. Client sends USDC payment using `sendUSDCPayment()`
4. Retry request includes header: `X-Payment-Token-Used: USDC`
5. Successful response includes: `"tokenUsed": "USDC"`

**Console Output Should Include:**
```
🌐 Network: MAINNET
🪙 Available tokens: USDC, CASH
💳 Preferred payment method: USDC
💵 Mainnet - using USDC payment
💸 Step 3: Sending 0.0003 USDC payment to [recipient]
🪙 Token used: USDC
```

### Test 3: Mainnet - CASH Payment
**Setup:**
- Set `NEXT_PUBLIC_NETWORK=mainnet` in `.env.local`
- Create a sentinel with `paymentMethod: 'cash'`

**Expected Behavior:**
1. Initial request returns 402 with:
   ```json
   {
     "token": "USDC",
     "availableTokens": ["USDC", "CASH"],
     ...
   }
   ```
2. Console logs show: `"💰 Mainnet - using CASH payment (user preference)"`
3. Client sends CASH payment using `sendCASHPayment()`
4. Retry request includes header: `X-Payment-Token-Used: CASH`
5. Successful response includes: `"tokenUsed": "CASH"`
6. CASH uses correct mint: `CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH`

**Console Output Should Include:**
```
🌐 Network: MAINNET
🪙 Available tokens: USDC, CASH
💳 Preferred payment method: CASH
💰 Mainnet - using CASH payment (user preference)
💸 Step 3: Sending 0.0003 CASH payment to [recipient]
🪙 CASH Mint Address: CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH
🪙 Token used: CASH
```

### Test 4: Payment Verification Failure
**Expected Behavior:**
1. If payment verification fails, server returns 402 with network-aware error:
   - Devnet: `availableTokens: ["USDC"]`
   - Mainnet: `availableTokens: ["USDC", "CASH"]`

## Manual Testing Steps

### Devnet Testing
1. Start dev server: `npm run dev`
2. Create a new sentinel (will auto-start monitoring)
3. Open browser console
4. Watch for HTTP 402 flow logs every 30 seconds
5. Verify logs show "Devnet detected - forcing USDC payment"
6. Verify payment uses USDC token account
7. Check Solscan link uses `?cluster=devnet`

### Mainnet Testing (Use with Caution!)
⚠️ **WARNING: This uses real money!**

1. Set `NEXT_PUBLIC_NETWORK=mainnet`
2. Fund wallet with real USDC or CASH tokens
3. Create sentinel with desired payment method
4. Monitor console logs for network detection
5. Verify correct token is used
6. Check Solscan link uses mainnet (no cluster param)

## Acceptance Criteria

✅ Devnet returns `availableTokens: ["USDC"]`
✅ Mainnet returns `availableTokens: ["USDC", "CASH"]`
✅ Devnet forces USDC payment regardless of preference
✅ Mainnet respects user preference (usdc or cash)
✅ Server logs show network name in payment details
✅ Client logs show network, available tokens, and token used
✅ `X-Payment-Token-Used` header sent with retry request
✅ Response includes `tokenUsed` field
✅ CASH uses correct mint address on mainnet
✅ Payment amount enforced: 0.0003 for both tokens on both networks
✅ All errors logged with step-by-step details

## Key Files Modified

1. `/lib/networks.ts` - Added network-aware helper functions
2. `/app/api/check-price/route.ts` - Made 402 response network-aware
3. `/lib/x402-client.ts` - Made client payment flow network-aware

## Environment Variables Required

```bash
# Required
NEXT_PUBLIC_NETWORK=devnet  # or mainnet
NEXT_PUBLIC_DEVNET_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_MAINNET_RPC=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET=<wallet-address>

# Optional (server-side only)
COINMARKETCAP_API_KEY=<api-key>
DEEPSEEK_API_KEY=<api-key>
```
