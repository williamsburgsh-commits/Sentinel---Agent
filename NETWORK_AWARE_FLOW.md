# Network-Aware x402 Payment Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (lib/x402-client.ts)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. POST /api/check-price
                              │    (no X-Payment-Proof header)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SERVER (/api/check-price/route.ts)              │
│                                                                 │
│  Check Network:                                                 │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ getCurrentNetwork()                                  │      │
│  │ ├─ DEVNET → availableTokens = ["USDC"]            │      │
│  │ └─ MAINNET → availableTokens = ["USDC", "CASH"]   │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                                 │
│  Return 402 Payment Required:                                   │
│  {                                                              │
│    amount: 0.0003,                                             │
│    recipient: "...",                                           │
│    token: "USDC",                                              │
│    availableTokens: ["USDC"] or ["USDC", "CASH"],            │
│    message: "Payment required to access price data"            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 2. 402 Response
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (lib/x402-client.ts)                 │
│                                                                 │
│  Network Detection & Token Selection:                           │
│  ┌───────────────────────────────────────────────────┐        │
│  │ if (isDevnet()) {                                  │        │
│  │   tokenToUse = "USDC"  // FORCED                  │        │
│  │   log("🧪 Devnet - forcing USDC payment")        │        │
│  │ } else {  // MAINNET                              │        │
│  │   if (paymentMethod === 'cash' && CASH available) │        │
│  │     tokenToUse = "CASH"                           │        │
│  │     log("💰 Mainnet - using CASH (preference)")  │        │
│  │   } else {                                         │        │
│  │     tokenToUse = "USDC"                           │        │
│  │     log("💵 Mainnet - using USDC")               │        │
│  │   }                                                │        │
│  │ }                                                  │        │
│  └───────────────────────────────────────────────────┘        │
│                                                                 │
│  Send Payment:                                                  │
│  ┌───────────────────────────────────────────────────┐        │
│  │ if (tokenToUse === "CASH")                         │        │
│  │   signature = sendCASHPayment(...)                │        │
│  │ else                                               │        │
│  │   signature = sendUSDCPayment(...)                │        │
│  └───────────────────────────────────────────────────┘        │
│                                                                 │
│  Retry with Proof:                                              │
│  headers: {                                                     │
│    "X-Payment-Proof": signature,                               │
│    "X-Payment-Token-Used": tokenToUse  // "USDC" or "CASH"    │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 3. POST /api/check-price
                              │    (with X-Payment-Proof header)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SERVER (/api/check-price/route.ts)              │
│                                                                 │
│  Verify Payment:                                                │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ tokenUsed = headers.get("X-Payment-Token-Used")     │      │
│  │ isValid = verifyUSDCPayment(signature)              │      │
│  │ // Note: verifyUSDCPayment works for both tokens    │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                                 │
│  If Valid:                                                      │
│  ├─ Fetch price from oracle                                    │
│  ├─ Check if threshold triggered                               │
│  ├─ Send Discord alert if needed                               │
│  └─ Return 200 Success:                                        │
│     {                                                           │
│       price: 155.02,                                           │
│       timestamp: 1699564800,                                   │
│       source: "oracle",                                        │
│       currency: "USD",                                         │
│       paid: true,                                              │
│       txSignature: "...",                                      │
│       tokenUsed: "USDC" or "CASH",  // Echo back token used   │
│       success: true,                                           │
│       activity: { ... }                                        │
│     }                                                           │
│                                                                 │
│  If Invalid:                                                    │
│  └─ Return 402 Payment Failed                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 4. 200 Success Response
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (lib/x402-client.ts)                 │
│                                                                 │
│  Success!                                                       │
│  ├─ Received price data                                        │
│  ├─ Save activity to localStorage                              │
│  ├─ Update UI                                                  │
│  └─ Log: "✅ Step 5: Success! Received data after payment"    │
└─────────────────────────────────────────────────────────────────┘
```

## Network-Specific Behavior

### DEVNET (Test Network)

| Aspect | Behavior |
|--------|----------|
| **Available Tokens** | USDC only |
| **Payment Token** | Always USDC (forced) |
| **User Preference** | Ignored (CASH not available) |
| **USDC Mint** | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` |
| **Console Log** | `"🧪 Devnet detected - forcing USDC payment"` |
| **Safety** | Test tokens only, no real money |

### MAINNET (Production Network)

| Aspect | Behavior |
|--------|----------|
| **Available Tokens** | USDC and CASH |
| **Payment Token** | Respects user preference, defaults to USDC |
| **User Preference** | Honored (`paymentMethod: 'usdc'` or `'cash'`) |
| **USDC Mint** | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| **CASH Mint** | `CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH` |
| **Console Log (USDC)** | `"💵 Mainnet - using USDC payment"` |
| **Console Log (CASH)** | `"💰 Mainnet - using CASH payment (user preference)"` |
| **Safety** | Real money! Shows warnings |

## Key Headers

### Client → Server (Initial Request)
```
POST /api/check-price
Content-Type: application/json

(no X-Payment-Proof header)
```

### Server → Client (402 Response)
```
HTTP/1.1 402 Payment Required
WWW-Authenticate: Solana-Payment
X-Payment-Required: 0.0003
X-Payment-Token: USDC

{
  "amount": 0.0003,
  "recipient": "...",
  "token": "USDC",
  "availableTokens": ["USDC"] or ["USDC", "CASH"],
  "message": "Payment required to access price data"
}
```

### Client → Server (Retry with Proof)
```
POST /api/check-price
Content-Type: application/json
X-Payment-Proof: 5J7x...abc123
X-Payment-Token-Used: USDC

(same body as initial request)
```

### Server → Client (Success Response)
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "price": 155.02,
  "timestamp": 1699564800,
  "source": "oracle",
  "currency": "USD",
  "paid": true,
  "txSignature": "5J7x...abc123",
  "tokenUsed": "USDC",
  "success": true,
  "activity": { ... }
}
```

## Token Selection Logic

```typescript
// In lib/x402-client.ts - fetchWith402()

let tokenToUse: 'USDC' | 'CASH';

if (isDevnet()) {
  // DEVNET: Only USDC available, force it
  tokenToUse = 'USDC';
  console.log('🧪 Devnet detected - forcing USDC payment');
} else {
  // MAINNET: Both tokens available
  const availableTokensFromServer = paymentDetails.availableTokens || ['USDC'];
  
  if (paymentMethod === 'cash' && availableTokensFromServer.includes('CASH')) {
    // User wants CASH and it's available
    tokenToUse = 'CASH';
    console.log('💰 Mainnet - using CASH payment (user preference)');
  } else {
    // Default to USDC (safest option)
    tokenToUse = 'USDC';
    console.log('💵 Mainnet - using USDC payment');
  }
}

// Send payment using appropriate function
if (tokenToUse === 'CASH') {
  txSignature = await sendCASHPayment(payerKeypair, recipientPublicKey, amount);
} else {
  txSignature = await sendUSDCPayment(payerKeypair, recipientPublicKey, amount);
}
```

## Benefits of Network-Aware Design

1. **Safety First**: Defaults to USDC on all networks
2. **Devnet Protection**: Can't accidentally use unavailable CASH on devnet
3. **Mainnet Flexibility**: Supports both USDC and CASH when available
4. **Clear Logging**: Every step shows network and token being used
5. **Backward Compatible**: Existing USDC-only sentinels continue working
6. **Future Proof**: Easy to add new tokens per network
7. **Explicit Headers**: Server knows exactly which token client used
8. **Audit Trail**: Complete transaction logging for debugging
