# HTTP 402 Payment Protocol Testing Guide

This guide explains how to test the HTTP 402 payment protocol implementation in Sentinel Agent.

## Overview

The x402 protocol enables autonomous agents to pay for API access on a per-request basis using Solana/CASH micropayments.

## Flow

```
1. Client → Server: POST /api/check-price (no payment proof)
   ↓
2. Server → Client: 402 Payment Required
   {
     amount: 0.0003,
     recipient: "wallet_address",
     token: "CASH",
     message: "Payment required to access price data"
   }
   Headers:
   - WWW-Authenticate: "Solana-Payment"
   - X-Payment-Required: "0.0003"
   - X-Payment-Token: "CASH"
   ↓
3. Client: Sends 0.0003 CASH to recipient
   ↓
4. Client → Server: POST /api/check-price
   Headers:
   - X-Payment-Proof: "transaction_signature"
   ↓
5. Server: Verifies payment on-chain
   ↓
6. Server → Client: 200 OK
   {
     price: 155.02,
     timestamp: 1699564800,
     source: "oracle",
     currency: "USD",
     paid: true,
     txSignature: "...",
     success: true,
     activity: { ... }
   }
```

## Testing Steps

### Prerequisites

1. **Set up environment variables:**
   ```bash
   # .env.local
   NEXT_PUBLIC_NETWORK=devnet
   NEXT_PUBLIC_DEVNET_RPC=https://api.devnet.solana.com
   NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET=your_wallet_address_here
   COINMARKETCAP_API_KEY=your_api_key_here
   ```

2. **Fund your payment recipient wallet** with some devnet SOL and USDC for testing

### Manual Testing

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Create a Sentinel:**
   - Go to http://localhost:3000/dashboard
   - Click "Create New Sentinel"
   - Fill in the form and create
   - Note the wallet address

3. **Fund the Sentinel wallet:**
   - Visit https://spl-token-faucet.com/?token-name=USDC
   - Request devnet USDC to the Sentinel wallet
   - Wait for confirmation

4. **Activate monitoring:**
   - Go to the Sentinels page
   - Click "Activate" on your sentinel
   - Monitoring will start automatically

5. **Watch the console logs:**
   - Open browser DevTools console
   - You should see:
     ```
     🔄 ========== HTTP 402 PAYMENT FLOW ==========
     📍 Step 1: Initial request without payment proof
     📥 Response status: 402
     💳 Step 2: Payment required (402 received)
     💰 Payment details: { amount: 0.0003, recipient: "...", token: "CASH" }
     💸 Step 3: Sending 0.0003 CASH payment to ...
     ✅ Payment sent successfully!
     🔗 Transaction signature: ...
     ⚡ Payment time: XXX ms
     🔄 Step 4: Retrying request with payment proof header
     📥 Retry response status: 200
     ✅ Step 5: Success! Received data after payment
     🎉 ========== HTTP 402 FLOW COMPLETE ==========
     ```

### Server-Side Logs

On the server console (where you ran `npm run dev`), you should see:

```
🔍 ========== POST /api/check-price ==========
🔑 X-Payment-Proof header: Not present
💳 No payment proof - returning 402 Payment Required
💰 Payment details:
   - Amount: 0.0003 CASH
   - Recipient: your_wallet_address
   - Token: CASH

... (next request after payment) ...

🔍 ========== POST /api/check-price ==========
🔑 X-Payment-Proof header: Present
✅ Payment proof provided, verifying...
🔗 Transaction signature: ...
✅ Payment verified successfully!
📊 Fetching price data from oracle...
💵 Current SOL price: $ 155.02
✅ No alert. Price $155.02 is within threshold.
✅ Returning price data with payment confirmation
🎉 ========== REQUEST COMPLETE ==========
```

## Testing Different Scenarios

### Test 1: Payment Required (No Proof)
```bash
curl -X POST http://localhost:3000/api/check-price \
  -H "Content-Type: application/json" \
  -d '{"id":"test","threshold":100,"condition":"above"}'
```

Expected: HTTP 402 with payment details

### Test 2: Payment Verification Failure
```bash
curl -X POST http://localhost:3000/api/check-price \
  -H "Content-Type: application/json" \
  -H "X-Payment-Proof: invalid_signature" \
  -d '{"id":"test","threshold":100,"condition":"above"}'
```

Expected: HTTP 402 with error message

### Test 3: Successful Payment Flow
1. Make initial request (get 402)
2. Send payment using sendCASHPayment()
3. Retry with X-Payment-Proof header containing tx signature
4. Get 200 with price data

## Verification Checklist

✅ Initial request without payment returns 402
✅ Response includes payment details (amount, recipient, token)
✅ Response includes proper headers (WWW-Authenticate, X-Payment-Required, X-Payment-Token)
✅ Client sends payment automatically
✅ Client retries with X-Payment-Proof header
✅ Server verifies payment on-chain using verifyUSDCPayment()
✅ Valid payment returns 200 with price data
✅ Invalid payment signature returns 402 with error
✅ Monitoring loop handles payment flow without crashing
✅ All steps logged to console for debugging
✅ Works on devnet with USDC (CASH not available on devnet)
✅ Transaction signatures visible on Solscan

## Troubleshooting

### Issue: "Payment recipient not configured"
**Solution:** Set `NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET` in `.env.local`

### Issue: Payment verification always fails
**Solution:** 
- Ensure payment is sent to correct recipient
- Check network matches (devnet vs mainnet)
- Verify transaction is confirmed before retry
- Check RPC endpoint is working

### Issue: Insufficient balance errors
**Solution:**
- Fund Sentinel wallet with devnet USDC
- Check balance is at least 0.0003 per check
- Use balance checker component to verify

### Issue: Console logs not showing x402 flow
**Solution:**
- Check browser console is open
- Verify sentinel is active and monitoring
- Check server logs for endpoint errors
- Ensure network is set correctly

## Code References

- **Client implementation:** `/lib/x402-client.ts`
- **Server implementation:** `/app/api/check-price/route.ts`
- **Monitoring integration:** `/lib/monitoring-service.ts`
- **Payment functions:** `/lib/payments.ts`

## Network Configuration

### Devnet (Testing)
- Use USDC instead of CASH (CASH not available on devnet)
- Get USDC from: https://spl-token-faucet.com/?token-name=USDC
- USDC mint: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

### Mainnet (Production)
- Use CASH for micropayments
- CASH mint: `CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT`
- ⚠️ Real funds will be used!

## Expected Performance

- Initial 402 response: < 50ms
- Payment transaction: 400-800ms (Solana finality)
- Payment verification: 100-300ms
- Total flow: ~1-2 seconds end-to-end
