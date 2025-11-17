# CDP Embedded Wallets - Architecture Diagrams

This document provides visual representations of the architecture changes when migrating from client-side signing to CDP server-side signing.

---

## Current Architecture (Client-Side Signing - INSECURE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER (Client-Side)                          │
│                                                                             │
│  ┌────────────────────────┐                                                │
│  │  User Creates Sentinel │                                                │
│  └───────────┬────────────┘                                                │
│              │                                                              │
│              ▼                                                              │
│  ┌────────────────────────────────────┐                                    │
│  │  lib/solana.ts                     │                                    │
│  │  createSentinelWallet()            │                                    │
│  │  - Generate keypair                │                                    │
│  │  - Return private key (base58)     │                                    │
│  └───────────┬────────────────────────┘                                    │
│              │                                                              │
│              ▼                                                              │
│  ┌────────────────────────────────────┐                                    │
│  │  localStorage                      │                                    │
│  │  - Store PRIVATE KEY in plaintext  │  ⚠️ XSS VULNERABILITY             │
│  │  - No encryption                   │                                    │
│  │  - Persistent in browser           │                                    │
│  └───────────┬────────────────────────┘                                    │
│              │                                                              │
│              ▼                                                              │
│  ┌────────────────────────────────────┐                                    │
│  │  Monitoring Service Runs           │                                    │
│  │  (every 30 seconds)                │                                    │
│  └───────────┬────────────────────────┘                                    │
│              │                                                              │
│              ▼                                                              │
│  ┌────────────────────────────────────┐                                    │
│  │  lib/payments.ts                   │                                    │
│  │  sendUSDCPayment(keypair, ...)     │                                    │
│  │  - Decode private key              │  ⚠️ KEY IN MEMORY                 │
│  │  - Sign transaction client-side    │                                    │
│  │  - Create transfer instruction     │                                    │
│  └───────────┬────────────────────────┘                                    │
│              │                                                              │
│              ▼                                                              │
│  ┌────────────────────────────────────┐                                    │
│  │  @solana/web3.js                   │                                    │
│  │  sendAndConfirmTransaction()       │                                    │
│  └───────────┬────────────────────────┘                                    │
└──────────────┼─────────────────────────────────────────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Solana Network RPC  │
    │  (devnet/mainnet)    │
    └──────────────────────┘

SECURITY ISSUES:
❌ Private keys exposed to XSS attacks (localStorage)
❌ Private keys in browser memory (debugger can extract)
❌ No authentication or authorization
❌ No rate limiting or spending limits
❌ No audit trail or transaction logging
❌ Single point of failure (if browser compromised, wallet drained)
```

---

## New Architecture (CDP Server-Side Signing - SECURE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER (Client-Side)                          │
│                                                                             │
│  ┌────────────────────────┐                                                │
│  │  User Creates Sentinel │                                                │
│  └───────────┬────────────┘                                                │
│              │                                                              │
│              ▼                                                              │
│  ┌────────────────────────────────────┐                                    │
│  │  POST /api/wallets/create          │                                    │
│  │  Authorization: Bearer <jwt>       │                                    │
│  └───────────┬────────────────────────┘                                    │
│              │                                                              │
└──────────────┼─────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────┴─────────────────────────────────────────────────────────────┐
│                          SERVER (API Routes)                                │
│                                                                             │
│  ┌────────────────────────────────────┐                                    │
│  │  /api/wallets/create               │                                    │
│  │  1. Validate session (JWT)         │  ✅ AUTHENTICATION                │
│  │  2. Check user_id from session     │                                    │
│  └───────────┬────────────────────────┘                                    │
│              │                                                              │
│              ▼                                                              │
│  ┌────────────────────────────────────┐                                    │
│  │  lib/cdp-client.ts                 │                                    │
│  │  getCDPClient()                    │                                    │
│  │  - Use server-side API key         │  ✅ KEYS NEVER IN BROWSER         │
│  │  - Network-aware (dev/prod)        │                                    │
│  └───────────┬────────────────────────┘                                    │
│              │                                                              │
│              ▼                                                              │
│  ┌────────────────────────────────────┐                                    │
│  │  CDP SDK                           │                                    │
│  │  cdp.wallets.create()              │                                    │
│  │  - Creates wallet with MPC         │                                    │
│  │  - Returns wallet ID + address     │                                    │
│  └───────────┬────────────────────────┘                                    │
│              │                                                              │
│              ▼                                                              │
│  ┌────────────────────────────────────┐                                    │
│  │  Database                          │                                    │
│  │  INSERT INTO cdp_wallets           │                                    │
│  │  - id (wallet_id)                  │  ✅ METADATA ONLY                 │
│  │  - user_id                         │                                    │
│  │  - address                         │                                    │
│  │  - network                         │                                    │
│  └───────────┬────────────────────────┘                                    │
│              │                                                              │
│              ▼                                                              │
│  ┌────────────────────────────────────┐                                    │
│  │  Response to Browser               │                                    │
│  │  { walletId, address, network }    │                                    │
│  └───────────┬────────────────────────┘                                    │
└──────────────┼─────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────┴─────────────────────────────────────────────────────────────┐
│                              BROWSER (Client-Side)                          │
│                                                                             │
│  ┌────────────────────────────────────┐                                    │
│  │  localStorage                      │                                    │
│  │  - Store WALLET ID only            │  ✅ NO PRIVATE KEY                │
│  │  - Store address for display       │                                    │
│  └────────────────────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────┘

SECURITY BENEFITS:
✅ Private keys never leave CDP infrastructure (MPC custody)
✅ Authentication required for all operations
✅ User ownership validated on every request
✅ Rate limiting and spending limits enforced
✅ Full audit trail in database
✅ No single point of failure (MPC key splitting)
```

---

## Transaction Signing Flow (CDP)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Sentinel Monitoring Loop                            │
│                         (runs every 30 seconds)                             │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
                  ┌─────────────────────────────┐
                  │  Need to run price check    │
                  │  (requires 0.0003 payment)  │
                  └────────────┬────────────────┘
                               │
                               ▼
┌──────────────────────────────┴──────────────────────────────────────────────┐
│                              BROWSER                                        │
│                                                                             │
│  ┌────────────────────────────────────┐                                    │
│  │  lib/monitoring-service.ts         │                                    │
│  │  runSentinelCheck(sentinel)        │                                    │
│  └───────────┬────────────────────────┘                                    │
│              │                                                              │
│              ▼                                                              │
│  ┌────────────────────────────────────┐                                    │
│  │  POST /api/sign-payment            │                                    │
│  │  Authorization: Bearer <jwt>       │                                    │
│  │  Body: {                           │                                    │
│  │    walletId: "cdp-wallet-123"      │  ✅ WALLET ID (not private key)   │
│  │    recipient: "5tM..."             │                                    │
│  │    amount: 0.0003                  │                                    │
│  │    token: "USDC"                   │                                    │
│  │  }                                 │                                    │
│  └───────────┬────────────────────────┘                                    │
└──────────────┼─────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────┴─────────────────────────────────────────────────────────────┐
│                          SERVER (API Routes)                                │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  /api/sign-payment                                                 │    │
│  │                                                                    │    │
│  │  STEP 1: Validate Session                                         │    │
│  │  ┌──────────────────────────────────────────┐                     │    │
│  │  │ session = await getServerSession()       │                     │    │
│  │  │ if (!session) return 401                 │  ✅ AUTH REQUIRED   │    │
│  │  └──────────────────────────────────────────┘                     │    │
│  │                                                                    │    │
│  │  STEP 2: Validate Wallet Ownership                                │    │
│  │  ┌──────────────────────────────────────────┐                     │    │
│  │  │ wallet = await db.getWallet(walletId)    │                     │    │
│  │  │ if (wallet.userId !== session.user.id)   │  ✅ AUTHORIZATION   │    │
│  │  │   return 403 Forbidden                   │                     │    │
│  │  └──────────────────────────────────────────┘                     │    │
│  │                                                                    │    │
│  │  STEP 3: Validate Payment Parameters                              │    │
│  │  ┌──────────────────────────────────────────┐                     │    │
│  │  │ if (amount > MAX_AMOUNT) return 400      │                     │    │
│  │  │ if (!whitelisted(recipient)) return 400  │  ✅ VALIDATION      │    │
│  │  └──────────────────────────────────────────┘                     │    │
│  │                                                                    │    │
│  │  STEP 4: Check Rate Limits                                        │    │
│  │  ┌──────────────────────────────────────────┐                     │    │
│  │  │ txCount = await db.countRecentTx(wallet) │                     │    │
│  │  │ if (txCount >= RATE_LIMIT) return 429    │  ✅ RATE LIMITING   │    │
│  │  └──────────────────────────────────────────┘                     │    │
│  │                                                                    │    │
│  │  STEP 5: Check Spending Limits                                    │    │
│  │  ┌──────────────────────────────────────────┐                     │    │
│  │  │ spent = await db.getHourlySpending(...)  │                     │    │
│  │  │ if (spent + amount > LIMIT) return 429   │  ✅ SPENDING LIMIT  │    │
│  │  └──────────────────────────────────────────┘                     │    │
│  │                                                                    │    │
│  │  STEP 6: Sign Transaction with CDP                                │    │
│  │  ┌──────────────────────────────────────────┐                     │    │
│  │  │ cdp = getCDPClient()                     │                     │    │
│  │  │ transaction = buildTransferTx(...)       │                     │    │
│  │  │ signedTx = await cdp.wallets.sign({      │                     │    │
│  │  │   walletId,                              │                     │    │
│  │  │   transaction                            │                     │    │
│  │  │ })                                       │                     │    │
│  │  └──────────────┬───────────────────────────┘                     │    │
│  │                 │                                                  │    │
│  └─────────────────┼──────────────────────────────────────────────────┘    │
│                    │                                                       │
└────────────────────┼───────────────────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │  Coinbase Developer Platform (CDP) │
        │                                    │
        │  ┌──────────────────────────────┐  │
        │  │  MPC Key Custody             │  │
        │  │  - Key share 1 (CDP secure)  │  │
        │  │  - Key share 2 (CDP secure)  │  │
        │  │  - Key share 3 (user device) │  │
        │  │                              │  │
        │  │  Both CDP shares + user      │  │
        │  │  required to sign            │  │  ✅ NO SINGLE POINT OF FAILURE
        │  └──────────────┬───────────────┘  │
        │                 │                  │
        │                 ▼                  │
        │  ┌──────────────────────────────┐  │
        │  │  Sign Transaction            │  │
        │  │  - Validate parameters       │  │
        │  │  - Combine key shares        │  │
        │  │  - Sign with private key     │  │
        │  │  - Return signature          │  │
        │  └──────────────┬───────────────┘  │
        └─────────────────┼──────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │  Response: { signature: "..." } │
        └─────────────────┬───────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────────────────┐
│                         ▼                   SERVER                          │
│  ┌──────────────────────────────────────┐                                  │
│  │  /api/sign-payment (continued)       │                                  │
│  │                                      │                                  │
│  │  STEP 7: Broadcast Transaction       │                                  │
│  │  ┌────────────────────────────────┐  │                                  │
│  │  │ signature = await cdp           │  │                                  │
│  │  │   .transactions.broadcast(...)  │  │                                  │
│  │  └────────────────────────────────┘  │                                  │
│  │                                      │                                  │
│  │  STEP 8: Log Transaction             │                                  │
│  │  ┌────────────────────────────────┐  │                                  │
│  │  │ await db.insertTransaction({   │  │                                  │
│  │  │   walletId,                    │  │  ✅ AUDIT TRAIL                 │
│  │  │   signature,                   │  │                                  │
│  │  │   amount,                      │  │                                  │
│  │  │   token,                       │  │                                  │
│  │  │   recipient,                   │  │                                  │
│  │  │   status: 'pending',           │  │                                  │
│  │  │   createdAt: new Date()        │  │                                  │
│  │  │ })                             │  │                                  │
│  │  └────────────────────────────────┘  │                                  │
│  │                                      │                                  │
│  │  STEP 9: Update Spending Counter     │                                  │
│  │  ┌────────────────────────────────┐  │                                  │
│  │  │ await db.incrementSpending(...)│  │                                  │
│  │  └────────────────────────────────┘  │                                  │
│  │                                      │                                  │
│  │  STEP 10: Return Response            │                                  │
│  │  ┌────────────────────────────────┐  │                                  │
│  │  │ return { signature, status }   │  │                                  │
│  │  └────────────┬───────────────────┘  │                                  │
│  └───────────────┼──────────────────────┘                                  │
└──────────────────┼─────────────────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────┴─────────────────────────────────────────────────────────┐
│                              BROWSER                                        │
│                                                                             │
│  ┌────────────────────────────────────┐                                    │
│  │  Receive Response                  │                                    │
│  │  { signature: "3Bxs..." }          │                                    │
│  └───────────┬────────────────────────┘                                    │
│              │                                                              │
│              ▼                                                              │
│  ┌────────────────────────────────────┐                                    │
│  │  Continue with HTTP 402 Flow       │                                    │
│  │  - Add X-Payment-Proof header      │                                    │
│  │  - Retry /api/check-price          │                                    │
│  │  - Receive price data              │                                    │
│  └────────────────────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────┘

SECURITY LAYERS:
✅ Layer 1: Session Authentication (JWT)
✅ Layer 2: Wallet Ownership Validation
✅ Layer 3: Parameter Validation (amount, recipient)
✅ Layer 4: Rate Limiting (100 tx/hour per wallet)
✅ Layer 5: Spending Limits (0.1 USDC/hour per wallet)
✅ Layer 6: MPC Key Custody (no single point of failure)
✅ Layer 7: Transaction Logging (full audit trail)
```

---

## MPC Key Management (Multi-Party Computation)

```
Traditional Wallet (INSECURE):
┌────────────────────────────────────────┐
│         Single Private Key             │
│  (stored in one location)              │
│                                        │
│  Private Key: abc123...xyz             │
│                                        │
│  ⚠️ If compromised → Wallet drained    │
└────────────────────────────────────────┘


CDP MPC Wallet (SECURE):
┌────────────────────────────────────────────────────────────────────────────┐
│                         Private Key Split into Shares                      │
│                         (requires 2 of 3 to sign)                          │
└────────────────────────────────────────────────────────────────────────────┘

         ┌────────────────────┐
         │  Complete Key      │
         │  (never assembled) │
         └──────────┬─────────┘
                    │
      ┌─────────────┼─────────────┐
      │             │             │
      ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Share 1  │  │ Share 2  │  │ Share 3  │
│          │  │          │  │          │
│ abc123   │  │ def456   │  │ ghi789   │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│   CDP    │  │   CDP    │  │  User    │
│ Secure   │  │ Secure   │  │ Device   │
│ Enclave  │  │ Enclave  │  │ (backup) │
│   #1     │  │   #2     │  │          │
└──────────┘  └──────────┘  └──────────┘

Transaction Signing Process:
┌────────────────────────────────────────┐
│  1. User requests transaction          │
│     (via API route)                    │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│  2. CDP combines Share 1 + Share 2     │
│     (in secure enclave)                │
│     - Share 3 not needed for signing   │
│     - Share 3 used for recovery        │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│  3. Partial signatures generated       │
│     - Signature from Share 1           │
│     - Signature from Share 2           │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│  4. Partial signatures combined        │
│     Result: Complete signature         │
│     (equivalent to full private key)   │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│  5. Transaction broadcast to network   │
└────────────────────────────────────────┘

Security Benefits:
✅ No single point of failure
✅ Even if one share leaks, wallet is safe
✅ Shares stored in separate secure enclaves
✅ User can recover wallet with Share 3
✅ Coinbase cannot access wallet without user
✅ User cannot access wallet without Coinbase
```

---

## Data Flow Comparison

### Current: Private Key Storage

```
User Signs Up
     │
     ▼
Generate Keypair (client-side)
     │
     ▼
Store Private Key in localStorage
     │
     ├── ⚠️ Vulnerable to XSS
     ├── ⚠️ Vulnerable to browser extensions
     ├── ⚠️ Vulnerable to physical access
     └── ⚠️ No recovery mechanism
     │
     ▼
User Loses Browser Data?
     │
     └── ❌ Wallet Lost Forever
```

### CDP: Wallet ID Storage

```
User Signs Up
     │
     ▼
POST /api/wallets/create (authenticated)
     │
     ▼
CDP Creates MPC Wallet (server-side)
     │
     ├── Share 1 → CDP Secure Enclave #1
     ├── Share 2 → CDP Secure Enclave #2
     └── Share 3 → User Device (encrypted backup)
     │
     ▼
Store Wallet ID in localStorage
     │
     ├── ✅ Wallet ID is not sensitive
     ├── ✅ No XSS risk (ID alone is useless)
     ├── ✅ Physical access doesn't compromise wallet
     └── ✅ Recovery via email verification
     │
     ▼
User Loses Browser Data?
     │
     └── ✅ Recover via Email/Social Login
```

---

## Rate Limiting Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Rate Limiting Layers                                │
└─────────────────────────────────────────────────────────────────────────────┘

Layer 1: CDP Rate Limiting (Managed by Coinbase)
┌────────────────────────────────────────────────────────────────────┐
│  - Protects CDP infrastructure                                     │
│  - Typically: 1000 requests/minute per API key                     │
│  - Returns HTTP 429 if exceeded                                    │
│  - Automatic backoff recommended                                   │
└────────────────────────────────────────────────────────────────────┘

Layer 2: Application Rate Limiting (Per Wallet)
┌────────────────────────────────────────────────────────────────────┐
│  - 100 transactions per hour per wallet                            │
│  - Stored in Redis or database                                     │
│  - Prevents single wallet from spamming                            │
│  - Returns HTTP 429 with helpful message                           │
│                                                                    │
│  Implementation:                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ const recentCount = await db.countRecentTx(walletId, '1h')  │ │
│  │ if (recentCount >= 100) {                                    │ │
│  │   return 429 'Rate limit exceeded'                           │ │
│  │ }                                                            │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

Layer 3: Spending Limits (Per Wallet)
┌────────────────────────────────────────────────────────────────────┐
│  - 0.1 USDC per hour per wallet                                    │
│  - 1.0 USDC per day per wallet                                     │
│  - Prevents wallet draining even if rate limit passed              │
│  - Auto-resets after time window                                   │
│                                                                    │
│  Implementation:                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ const hourlySpend = await db.getHourlySpending(walletId)    │ │
│  │ if (hourlySpend + amount > 0.1) {                           │ │
│  │   return 429 'Spending limit exceeded'                      │ │
│  │ }                                                           │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

Layer 4: Per-User Rate Limiting
┌────────────────────────────────────────────────────────────────────┐
│  - 500 requests per hour per user                                  │
│  - Prevents user with multiple wallets from abuse                  │
│  - Protects application resources                                  │
│                                                                    │
│  Implementation:                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ const userRequests = await redis.get(`rate:${userId}`)      │ │
│  │ if (userRequests >= 500) {                                  │ │
│  │   return 429 'Too many requests'                            │ │
│  │ }                                                           │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

Response when rate limited:
┌────────────────────────────────────────────────────────────────────┐
│  HTTP 429 Too Many Requests                                        │
│  {                                                                 │
│    "error": "Rate limit exceeded",                                │
│    "limit": 100,                                                  │
│    "remaining": 0,                                                │
│    "resetAt": "2024-01-15T11:30:00Z",                            │
│    "retryAfter": 1800  // seconds                                │
│  }                                                                 │
└────────────────────────────────────────────────────────────────────┘
```

---

## Webhook Event Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Transaction Status Updates via Webhooks                  │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: Transaction Submitted
┌──────────────────────────────────┐
│  /api/sign-payment               │
│  - Sign transaction with CDP     │
│  - Broadcast to network          │
│  - Save to DB (status: pending)  │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Database                        │
│  ┌────────────────────────────┐  │
│  │ id: tx-123                 │  │
│  │ signature: 3Bxs...         │  │
│  │ status: pending            │  │
│  │ created_at: 2024-01-15     │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘

Step 2: Transaction Confirmed (30 seconds later)
┌──────────────────────────────────┐
│  Solana Network                  │
│  - Transaction confirmed         │
│  - 31+ confirmations             │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  CDP Backend                     │
│  - Detects confirmation          │
│  - Triggers webhook event        │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  POST /api/webhooks/cdp          │
│  Headers:                        │
│  - X-CDP-Signature: abc123...    │
│  Body:                           │
│  {                               │
│    "type": "tx.confirmed",       │
│    "data": {                     │
│      "signature": "3Bxs...",     │
│      "status": "confirmed",      │
│      "confirmations": 32         │
│    }                             │
│  }                               │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Verify Webhook Signature        │
│  - Validate X-CDP-Signature      │
│  - Prevent spoofing              │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Update Database                 │
│  ┌────────────────────────────┐  │
│  │ UPDATE transactions        │  │
│  │ SET status = 'confirmed'   │  │
│  │ WHERE signature = '3Bxs'   │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘

Step 3: Transaction Failed (alternative path)
┌──────────────────────────────────┐
│  Solana Network                  │
│  - Transaction failed            │
│  - Insufficient funds / error    │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  POST /api/webhooks/cdp          │
│  Body:                           │
│  {                               │
│    "type": "tx.failed",          │
│    "data": {                     │
│      "signature": "3Bxs...",     │
│      "status": "failed",         │
│      "error": "Insufficient..."  │
│    }                             │
│  }                               │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Update Database + Alert User    │
│  ┌────────────────────────────┐  │
│  │ UPDATE transactions        │  │
│  │ SET status = 'failed',     │  │
│  │     error = 'Insufficient' │  │
│  │ WHERE signature = '3Bxs'   │  │
│  └────────────────────────────┘  │
│                                  │
│  - Auto-pause sentinel           │
│  - Send user notification        │
└──────────────────────────────────┘

Benefits:
✅ Real-time status updates
✅ No need to poll blockchain
✅ Immediate error detection
✅ Automatic retry logic possible
```

---

**Last Updated**: 2024-01-15  
**Related Documents**: CDP_EMBEDDED_WALLETS_RESEARCH.md, CDP_INTEGRATION_QUICK_START.md
