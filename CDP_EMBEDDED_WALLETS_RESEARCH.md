# CDP Embedded Wallets Best Practices Research

## Executive Summary

This document summarizes research on Coinbase Developer Platform (CDP) embedded wallets best practices to inform the integration strategy for Sentinel Agent. The findings focus on security, architecture patterns, and migration strategies from the current client-side keypair management to a secure server-side signing model.

---

## Table of Contents

1. [What are CDP Embedded Wallets?](#what-are-cdp-embedded-wallets)
2. [Key Best Practices](#key-best-practices)
3. [Security Considerations](#security-considerations)
4. [Architecture Patterns](#architecture-patterns)
5. [Migration Strategy](#migration-strategy)
6. [Testing and Environment Setup](#testing-and-environment-setup)
7. [Common Pitfalls](#common-pitfalls)
8. [References](#references)

---

## What are CDP Embedded Wallets?

CDP Embedded Wallets are Coinbase's solution for integrating cryptocurrency wallets directly into applications without requiring users to manage private keys or seed phrases. Key features include:

- **Server-side key custody**: Private keys never exposed to client
- **MPC (Multi-Party Computation)**: Keys split across multiple parties for security
- **Secure enclave storage**: Hardware-level security for key material
- **User-friendly recovery**: Email/social login recovery mechanisms
- **Gasless transactions**: Optional gas sponsorship by application
- **Multi-chain support**: Works across EVM chains, Solana, and others

**Relevance to Sentinel Agent**: Currently, Sentinel Agent stores private keys in localStorage and performs client-side signing, which exposes keys to XSS attacks and makes wallet recovery difficult. CDP Embedded Wallets would provide enterprise-grade security while maintaining the autonomous sentinel monitoring use case.

---

## Key Best Practices

### 1. **Server-Side Signing is Mandatory**

**Best Practice**: Never expose private keys or signing operations to the client. All transaction signing must happen server-side through secure APIs.

**Current State in Sentinel Agent**:
- ❌ Private keys stored as base58 in localStorage (`lib/data-store.ts`)
- ❌ Client-side signing in `lib/payments.ts` (`sendUSDCPayment`, `sendCASHPayment`)
- ❌ Keypairs passed directly to signing functions from browser context

**Recommended Change**:
- ✅ Move signing logic to API routes (e.g., `/api/sign-transaction`)
- ✅ Store wallet identifiers (not keys) client-side
- ✅ Client requests server to sign transactions with payment parameters
- ✅ Server validates request, signs with CDP SDK, returns signed transaction
- ✅ Client broadcasts signed transaction (or server does both)

**Example Flow**:
```typescript
// Client: Request transaction signature
const response = await fetch('/api/sign-payment', {
  method: 'POST',
  body: JSON.stringify({
    walletId: sentinel.walletId, // Not private key!
    recipient: recipientAddress,
    amount: 0.0003,
    token: 'USDC'
  })
});

// Server: Sign transaction with CDP SDK
const { signature } = await cdp.wallets.signTransaction({
  walletId: request.walletId,
  transaction: buildTransferTx(...)
});
```

---

### 2. **Implement Proper Authentication and Authorization**

**Best Practice**: Tie wallet access to authenticated user sessions. Use JWT tokens or session cookies to validate requests.

**Current State in Sentinel Agent**:
- ⚠️ No authentication system found (Supabase commented out?)
- ⚠️ Anyone with localStorage access can use sentinel wallets

**Recommended Change**:
- ✅ Implement session-based authentication (Supabase, Auth0, or Clerk)
- ✅ Associate wallets with user accounts (user_id -> wallet_id mapping)
- ✅ Validate user owns the wallet before signing transactions
- ✅ Implement rate limiting per user to prevent abuse

**Example Authorization**:
```typescript
// /api/sign-payment route
export async function POST(request: NextRequest) {
  // 1. Validate session
  const session = await getServerSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validate wallet ownership
  const { walletId } = await request.json();
  const wallet = await db.getWallet(walletId);
  if (wallet.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Sign transaction
  const signature = await cdp.wallets.signTransaction({...});
  return NextResponse.json({ signature });
}
```

---

### 3. **Separate Wallet Creation from Transaction Signing**

**Best Practice**: Create wallets server-side during onboarding. Return only the wallet identifier to the client.

**Current State in Sentinel Agent**:
- ❌ Wallets created client-side: `createSentinelWallet()` in `lib/solana.ts`
- ❌ Full keypair returned to client and stored in localStorage

**Recommended Change**:
- ✅ Move wallet creation to `/api/wallets/create` endpoint
- ✅ CDP SDK creates wallet server-side
- ✅ Store wallet metadata (ID, address, user_id) in database
- ✅ Return only wallet address and ID to client

**Example Wallet Creation**:
```typescript
// /api/wallets/create route
export async function POST(request: NextRequest) {
  const session = await getServerSession(request);
  if (!session) return unauthorized();

  // Create wallet with CDP SDK
  const wallet = await cdp.wallets.create({
    userId: session.user.id,
    network: 'solana-devnet' // or solana-mainnet
  });

  // Store in database
  await db.insertWallet({
    id: wallet.id,
    address: wallet.address,
    userId: session.user.id,
    network: wallet.network,
    createdAt: new Date()
  });

  // Return only non-sensitive data
  return NextResponse.json({
    walletId: wallet.id,
    address: wallet.address,
    network: wallet.network
  });
}
```

---

### 4. **Implement Transaction Validation and Limits**

**Best Practice**: Validate all transaction parameters server-side before signing. Implement spending limits and anomaly detection.

**Current State in Sentinel Agent**:
- ✅ Network-aware payment validation (`lib/networks.ts` - `validatePaymentAmount`)
- ⚠️ Validation happens client-side (can be bypassed)
- ❌ No rate limiting on payment frequency
- ❌ No anomaly detection (unusual spending patterns)

**Recommended Change**:
- ✅ Move validation to API routes (never trust client)
- ✅ Implement rate limiting per wallet (e.g., max 100 checks/hour)
- ✅ Add spending limits (e.g., max 0.1 USDC per hour)
- ✅ Alert on unusual patterns (sudden spike in requests)

**Example Validation**:
```typescript
// /api/sign-payment route
export async function POST(request: NextRequest) {
  const { walletId, amount, recipient } = await request.json();

  // 1. Validate amount
  if (amount > MAX_PAYMENT_AMOUNT) {
    return NextResponse.json({ error: 'Amount exceeds limit' }, { status: 400 });
  }

  // 2. Check rate limit
  const recentTxCount = await db.countRecentTransactions(walletId, '1 hour');
  if (recentTxCount >= RATE_LIMIT_PER_HOUR) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // 3. Validate recipient (whitelist for security)
  if (!ALLOWED_RECIPIENTS.includes(recipient)) {
    return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 });
  }

  // 4. Check spending limit
  const hourlySpend = await db.getHourlySpending(walletId);
  if (hourlySpend + amount > SPENDING_LIMIT_PER_HOUR) {
    return NextResponse.json({ error: 'Spending limit exceeded' }, { status: 400 });
  }

  // 5. Sign transaction
  const signature = await cdp.wallets.signTransaction({...});
  return NextResponse.json({ signature });
}
```

---

### 5. **Use Environment-Specific Configuration**

**Best Practice**: Separate development, staging, and production configurations. Never hardcode API keys or use production keys in development.

**Current State in Sentinel Agent**:
- ✅ Network-aware configuration (`lib/networks.ts`)
- ✅ Separate devnet/mainnet RPC endpoints
- ⚠️ Payment recipient hardcoded in `.env.local` (should be per-network)

**Recommended Change**:
- ✅ Use CDP sandbox for development/testing
- ✅ Separate API keys for dev/prod (`CDP_API_KEY_DEV`, `CDP_API_KEY_PROD`)
- ✅ Network-specific payment recipients
- ✅ Feature flags for gradual rollout

**Example Configuration**:
```typescript
// lib/cdp-config.ts
export function getCDPConfig() {
  const network = getCurrentNetwork();
  
  if (network.name === 'devnet') {
    return {
      apiKey: process.env.CDP_API_KEY_SANDBOX!,
      apiSecret: process.env.CDP_API_SECRET_SANDBOX!,
      environment: 'sandbox',
      network: 'solana-devnet',
      paymentRecipient: process.env.PAYMENT_RECIPIENT_DEVNET!
    };
  } else {
    return {
      apiKey: process.env.CDP_API_KEY_PRODUCTION!,
      apiSecret: process.env.CDP_API_SECRET_PRODUCTION!,
      environment: 'production',
      network: 'solana-mainnet',
      paymentRecipient: process.env.PAYMENT_RECIPIENT_MAINNET!
    };
  }
}
```

---

### 6. **Implement Robust Error Handling and Retry Logic**

**Best Practice**: Handle network errors, timeout errors, and rate limiting gracefully. Implement exponential backoff for retries.

**Current State in Sentinel Agent**:
- ✅ Good error handling in `lib/payments.ts` (try/catch with user-friendly messages)
- ✅ Transaction retry logic (maxRetries: 3)
- ⚠️ No exponential backoff
- ⚠️ No circuit breaker pattern for repeated failures

**Recommended Change**:
- ✅ Implement exponential backoff for CDP API calls
- ✅ Add circuit breaker to prevent cascade failures
- ✅ Log errors to monitoring service (Sentry, Datadog)
- ✅ Graceful degradation (pause sentinel on repeated failures)

**Example Retry Logic**:
```typescript
async function signTransactionWithRetry(params: SignParams, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await cdp.wallets.signTransaction(params);
    } catch (error) {
      lastError = error;
      
      // Don't retry on validation errors
      if (error.code === 'INVALID_PARAMS') {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retry ${attempt}/${maxRetries} after ${delay}ms`);
        await sleep(delay);
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}
```

---

### 7. **Secure Key Management with MPC and Encryption**

**Best Practice**: Use CDP's MPC (Multi-Party Computation) to split keys across multiple parties. Never store complete keys in a single location.

**CDP Architecture**:
- Key shares distributed across Coinbase infrastructure
- User's device holds one share (encrypted)
- Coinbase secure enclave holds another share
- Both parties must participate to sign (no single point of failure)

**Migration Strategy**:
- Export existing sentinel wallet balances before migration
- Create new CDP wallets for users
- Optionally: Keep old wallets as "legacy" with read-only access
- Transfer funds from old wallets to new CDP wallets
- Deprecate old wallet creation flow

---

### 8. **Implement User-Friendly Recovery Mechanisms**

**Best Practice**: Provide email/social login recovery. Never rely solely on seed phrases for embedded wallets.

**CDP Recovery Options**:
1. **Email verification**: User proves ownership via email
2. **Biometric authentication**: Device-level security
3. **Social login**: Google, Apple, etc.
4. **Passkey**: WebAuthn for phishing resistance

**Sentinel Agent Recommendation**:
- Link CDP wallets to Supabase user accounts
- Allow recovery via Supabase email verification
- Optional: 2FA for high-value accounts
- Automatic backup of wallet metadata (not keys) to user profile

---

### 9. **Monitor and Log All Wallet Operations**

**Best Practice**: Comprehensive logging and monitoring for security and debugging.

**What to Log**:
- ✅ Wallet creation events (user_id, timestamp, network)
- ✅ Transaction signing requests (amount, recipient, user_id)
- ✅ Transaction results (success/failure, signature, error)
- ✅ Authentication failures (potential security incidents)
- ✅ Rate limit violations (potential abuse)

**What NOT to Log**:
- ❌ Private keys or key shares
- ❌ API secrets or auth tokens
- ❌ Full transaction payloads (may contain sensitive data)

**Example Logging**:
```typescript
// /api/sign-payment route
export async function POST(request: NextRequest) {
  const session = await getServerSession(request);
  const { walletId, amount, recipient } = await request.json();
  
  // Log request
  await logger.info('Transaction signing requested', {
    userId: session.user.id,
    walletId,
    amount,
    recipient,
    timestamp: new Date().toISOString()
  });
  
  try {
    const signature = await cdp.wallets.signTransaction({...});
    
    // Log success
    await logger.info('Transaction signed successfully', {
      userId: session.user.id,
      walletId,
      signature,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ signature });
  } catch (error) {
    // Log failure
    await logger.error('Transaction signing failed', {
      userId: session.user.id,
      walletId,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
}
```

---

### 10. **Optimize for Autonomous Operations**

**Best Practice**: For autonomous agents like Sentinel, implement "pre-approved" transaction patterns to avoid manual approval.

**Sentinel Agent Use Case**:
- Sentinels make autonomous micropayments for oracle checks
- User pre-approves spending up to a limit (e.g., 0.1 USDC/day)
- No user interaction required for each payment
- Server signs automatically if within approved limits

**Implementation**:
```typescript
// Database: store spending limits per sentinel
interface SentinelSpendingLimit {
  sentinelId: string;
  dailyLimit: number; // e.g., 0.1 USDC
  currentSpending: number;
  lastReset: Date;
}

// /api/sign-payment route
export async function POST(request: NextRequest) {
  const { sentinelId, amount } = await request.json();
  
  // Check spending limit
  const limit = await db.getSentinelSpendingLimit(sentinelId);
  
  // Reset daily counter if needed
  if (isNewDay(limit.lastReset)) {
    await db.resetSentinelSpending(sentinelId);
    limit.currentSpending = 0;
  }
  
  // Validate against limit
  if (limit.currentSpending + amount > limit.dailyLimit) {
    return NextResponse.json(
      { error: 'Daily spending limit exceeded. Sentinel paused.' },
      { status: 429 }
    );
  }
  
  // Sign transaction
  const signature = await cdp.wallets.signTransaction({...});
  
  // Update spending counter
  await db.incrementSentinelSpending(sentinelId, amount);
  
  return NextResponse.json({ signature });
}
```

---

## Security Considerations

### Critical Security Issues in Current Implementation

1. **Private Keys in LocalStorage**
   - ❌ Vulnerable to XSS attacks
   - ❌ No encryption at rest
   - ❌ Survives browser close (persistent attack surface)
   - ✅ **Solution**: Move to server-side CDP custody

2. **Client-Side Signing**
   - ❌ Private keys loaded into browser memory
   - ❌ Can be extracted via debugger or memory dump
   - ❌ No transaction validation before signing
   - ✅ **Solution**: Server-side signing with validation

3. **No Authentication/Authorization**
   - ❌ Anyone with localStorage access can use wallets
   - ❌ No audit trail of who performed actions
   - ❌ Can't revoke access or lock accounts
   - ✅ **Solution**: Session-based auth with user-wallet mapping

4. **No Rate Limiting**
   - ❌ Attacker could drain wallet with rapid requests
   - ❌ No protection against DoS attacks
   - ✅ **Solution**: Rate limiting per wallet and per user

5. **Hardcoded Payment Recipient**
   - ⚠️ Single point of failure if key compromised
   - ⚠️ No multi-signature protection
   - ✅ **Solution**: Use CDP multi-sig for treasury wallet

### CDP Security Benefits

1. **MPC Key Custody**: Keys split across multiple parties
2. **Secure Enclave**: Hardware-level protection
3. **No Single Point of Failure**: Compromising one share doesn't expose key
4. **Audit Logging**: All operations logged by Coinbase
5. **Compliance Ready**: SOC 2, ISO 27001 certified infrastructure

---

## Architecture Patterns

### Current Architecture (Client-Side Signing)

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│                                                             │
│  ┌─────────────────┐         ┌──────────────────┐         │
│  │  localStorage   │────────▶│  lib/payments.ts │         │
│  │  (private keys) │         │  (client signing)│         │
│  └─────────────────┘         └──────────┬───────┘         │
│                                          │                  │
│                                          ▼                  │
│                              ┌────────────────────┐         │
│                              │ Solana Network RPC │         │
│                              │  (send transaction)│         │
│                              └────────────────────┘         │
└─────────────────────────────────────────────────────────────┘

Problems:
- Private keys exposed in browser (XSS risk)
- No authentication or authorization
- Can't rotate keys without user action
- No audit trail
```

### Recommended Architecture (CDP Server-Side Signing)

```
┌──────────────────────────────┐         ┌──────────────────────────────┐
│         Browser              │         │          Server              │
│                              │         │                              │
│  ┌────────────────────┐      │         │  ┌────────────────────┐     │
│  │ Authenticated      │──────┼────────▶│  │ /api/sign-payment  │     │
│  │ Session (JWT)      │      │         │  │ (validates request)│     │
│  └────────────────────┘      │         │  └─────────┬──────────┘     │
│                              │         │            │                 │
│  ┌────────────────────┐      │         │            ▼                 │
│  │ localStorage        │      │         │  ┌────────────────────┐     │
│  │ (wallet ID only)    │      │         │  │ CDP SDK            │     │
│  └────────────────────┘      │         │  │ (signs with MPC)   │     │
│                              │         │  └─────────┬──────────┘     │
└──────────────────────────────┘         │            │                 │
                                         │            ▼                 │
                                         │  ┌────────────────────┐     │
                                         │  │ Solana RPC         │     │
                                         │  │ (broadcast signed) │     │
                                         │  └────────────────────┘     │
                                         └──────────────────────────────┘

Benefits:
- Private keys never leave CDP secure infrastructure
- Authentication/authorization enforced
- Centralized validation and rate limiting
- Full audit trail
- Key rotation without user action
```

### API Route Design

#### 1. Create Wallet
```
POST /api/wallets/create
Authorization: Bearer <jwt>

Response:
{
  "walletId": "cdp-wallet-123",
  "address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "network": "solana-devnet"
}
```

#### 2. Get Wallet Balance
```
GET /api/wallets/:walletId/balance
Authorization: Bearer <jwt>

Response:
{
  "sol": 0.5,
  "usdc": 1.234,
  "cash": 0
}
```

#### 3. Sign Payment Transaction
```
POST /api/sign-payment
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "walletId": "cdp-wallet-123",
  "recipient": "5tM...",
  "amount": 0.0003,
  "token": "USDC"
}

Response:
{
  "signature": "3Bxs...",
  "transaction": "base64-encoded-tx"
}
```

#### 4. Get Transaction History
```
GET /api/wallets/:walletId/transactions
Authorization: Bearer <jwt>

Response:
{
  "transactions": [
    {
      "signature": "3Bxs...",
      "timestamp": "2024-01-15T10:30:00Z",
      "amount": 0.0003,
      "token": "USDC",
      "status": "confirmed"
    }
  ]
}
```

---

## Migration Strategy

### Phase 1: Preparation (Week 1-2)

1. **Set up CDP Developer Account**
   - Sign up at https://portal.cdp.coinbase.com/
   - Create sandbox and production projects
   - Generate API keys (keep separate for dev/prod)
   - Configure webhook endpoints for transaction notifications

2. **Add CDP SDK Dependencies**
   ```bash
   npm install @coinbase/coinbase-sdk
   npm install @coinbase/wallet-sdk # Optional: For connect button
   ```

3. **Environment Configuration**
   ```env
   # .env.local
   CDP_API_KEY_SANDBOX=your-sandbox-api-key
   CDP_API_SECRET_SANDBOX=your-sandbox-secret
   CDP_API_KEY_PRODUCTION=your-production-api-key
   CDP_API_SECRET_PRODUCTION=your-production-secret
   CDP_WEBHOOK_SECRET=your-webhook-secret
   ```

4. **Database Schema Updates**
   ```sql
   -- Add cdp_wallet_id to sentinels table
   ALTER TABLE sentinels ADD COLUMN cdp_wallet_id VARCHAR(255);
   
   -- Create wallet metadata table
   CREATE TABLE cdp_wallets (
     id VARCHAR(255) PRIMARY KEY,
     user_id UUID NOT NULL,
     address VARCHAR(255) NOT NULL,
     network VARCHAR(50) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     FOREIGN KEY (user_id) REFERENCES users(id)
   );
   
   -- Create transaction log table
   CREATE TABLE transaction_logs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     wallet_id VARCHAR(255) NOT NULL,
     signature VARCHAR(255) NOT NULL,
     amount DECIMAL(18, 6) NOT NULL,
     token VARCHAR(10) NOT NULL,
     recipient VARCHAR(255) NOT NULL,
     status VARCHAR(50) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     FOREIGN KEY (wallet_id) REFERENCES cdp_wallets(id)
   );
   ```

### Phase 2: Parallel Implementation (Week 3-4)

1. **Implement CDP Integration (Server-Side)**
   - Create `lib/cdp-client.ts` for SDK initialization
   - Create `/api/wallets/create` for wallet creation
   - Create `/api/sign-payment` for transaction signing
   - Implement validation and rate limiting

2. **Update Client Components**
   - Update sentinel creation flow to use new API
   - Store wallet ID instead of private key
   - Update payment functions to call `/api/sign-payment`
   - Add loading states and error handling

3. **Feature Flag System**
   ```typescript
   // lib/feature-flags.ts
   export function useCDPWallets(): boolean {
     return process.env.NEXT_PUBLIC_USE_CDP_WALLETS === 'true';
   }
   ```

4. **Dual Path Support**
   ```typescript
   // components/CreateSentinel.tsx
   async function createSentinel() {
     if (useCDPWallets()) {
       // New CDP path
       const wallet = await fetch('/api/wallets/create').then(r => r.json());
       setSentinel({ ...config, walletId: wallet.id, address: wallet.address });
     } else {
       // Legacy path (existing code)
       const { keypair, publicKey } = createSentinelWallet();
       // ... existing logic
     }
   }
   ```

### Phase 3: Testing and Validation (Week 5)

1. **Test CDP Integration**
   - Create test wallets in sandbox
   - Verify transaction signing works
   - Test error handling (insufficient funds, rate limits)
   - Verify webhook notifications

2. **Security Audit**
   - Review all API routes for authorization
   - Check rate limiting implementation
   - Verify logging doesn't expose sensitive data
   - Test for SQL injection, XSS, CSRF

3. **Performance Testing**
   - Measure transaction signing latency
   - Test concurrent request handling
   - Verify rate limit thresholds are reasonable

### Phase 4: Migration (Week 6-7)

1. **User Communication**
   - Announce migration timeline
   - Explain benefits (security, recovery)
   - Provide migration instructions

2. **Gradual Rollout**
   - Enable CDP for new users first (feature flag)
   - Monitor error rates and performance
   - Gradually migrate existing users

3. **Legacy Wallet Handling**
   - Keep legacy wallets functional (read-only)
   - Provide balance transfer tool
   - Set deprecation timeline (e.g., 3 months)

4. **Data Migration**
   ```typescript
   // Migration script
   async function migrateUserWallet(userId: string) {
     // 1. Get user's legacy wallet from localStorage
     const legacyWallet = await getLegacyWallet(userId);
     
     // 2. Create new CDP wallet
     const cdpWallet = await cdp.wallets.create({ userId, network: 'solana-devnet' });
     
     // 3. Transfer funds from legacy to CDP wallet
     const balance = await getSOLBalance(legacyWallet.publicKey);
     if (balance > 0) {
       await transferFunds(legacyWallet, cdpWallet.address, balance);
     }
     
     // 4. Update user record
     await db.updateUser(userId, { cdpWalletId: cdpWallet.id });
     
     // 5. Mark legacy wallet as deprecated
     await db.deprecateLegacyWallet(legacyWallet.publicKey);
   }
   ```

### Phase 5: Cleanup (Week 8)

1. **Remove Legacy Code**
   - Delete client-side signing functions
   - Remove localStorage private key storage
   - Delete `createSentinelWallet()` and related functions

2. **Update Documentation**
   - Update README with CDP integration details
   - Document new API routes
   - Update security documentation

3. **Monitor Production**
   - Set up alerts for errors
   - Monitor transaction success rates
   - Track user feedback

---

## Testing and Environment Setup

### Development Environment

1. **CDP Sandbox**
   - Use sandbox API keys for all development
   - Sandbox wallets are free and isolated from mainnet
   - Test transactions are instant and cost nothing
   - Sandbox URL: `https://api.sandbox.cdp.coinbase.com`

2. **Local Testing**
   ```bash
   # .env.local (development)
   NEXT_PUBLIC_NETWORK=devnet
   CDP_API_KEY_SANDBOX=your-sandbox-key
   CDP_API_SECRET_SANDBOX=your-sandbox-secret
   NEXT_PUBLIC_USE_CDP_WALLETS=true
   ```

3. **Test Data**
   - Create test users with known credentials
   - Pre-fund test wallets with devnet SOL/USDC
   - Mock Discord webhooks to avoid spam

### Testing Strategies

1. **Unit Tests**
   ```typescript
   // lib/cdp-client.test.ts
   describe('CDP Client', () => {
     it('should create wallet with valid credentials', async () => {
       const wallet = await cdp.wallets.create({
         userId: 'test-user-123',
         network: 'solana-devnet'
       });
       expect(wallet.id).toBeDefined();
       expect(wallet.address).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
     });
     
     it('should fail with invalid API key', async () => {
       const badClient = new CDPClient({ apiKey: 'invalid' });
       await expect(badClient.wallets.create({...})).rejects.toThrow('Unauthorized');
     });
   });
   ```

2. **Integration Tests**
   ```typescript
   // app/api/sign-payment/route.test.ts
   describe('POST /api/sign-payment', () => {
     it('should sign transaction for authenticated user', async () => {
       const session = createTestSession();
       const response = await POST(createRequest({
         headers: { Authorization: `Bearer ${session.token}` },
         body: { walletId: 'test-wallet', amount: 0.0003, recipient: 'test-recipient' }
       }));
       
       expect(response.status).toBe(200);
       const data = await response.json();
       expect(data.signature).toBeDefined();
     });
     
     it('should reject unauthenticated requests', async () => {
       const response = await POST(createRequest({
         body: { walletId: 'test-wallet', amount: 0.0003 }
       }));
       
       expect(response.status).toBe(401);
     });
     
     it('should enforce rate limits', async () => {
       const session = createTestSession();
       const requests = Array(101).fill(null).map(() => 
         POST(createRequest({
           headers: { Authorization: `Bearer ${session.token}` },
           body: { walletId: 'test-wallet', amount: 0.0003, recipient: 'test-recipient' }
         }))
       );
       
       const responses = await Promise.all(requests);
       const rateLimited = responses.filter(r => r.status === 429);
       expect(rateLimited.length).toBeGreaterThan(0);
     });
   });
   ```

3. **End-to-End Tests**
   ```typescript
   // e2e/sentinel-monitoring.spec.ts
   describe('Sentinel Monitoring with CDP', () => {
     it('should create sentinel, fund wallet, and run autonomous checks', async () => {
       // 1. Create user and CDP wallet
       const user = await createTestUser();
       const wallet = await createCDPWallet(user.id);
       
       // 2. Fund wallet with test USDC
       await fundWallet(wallet.address, 1); // 1 USDC
       
       // 3. Create sentinel
       const sentinel = await createSentinel({
         name: 'Test Sentinel',
         walletId: wallet.id,
         threshold: 100,
         condition: 'above'
       });
       
       // 4. Start monitoring
       await startMonitoring(sentinel.id);
       
       // 5. Wait for autonomous checks
       await waitFor(30_000); // 30 seconds
       
       // 6. Verify checks ran
       const activities = await getActivities(sentinel.id);
       expect(activities.length).toBeGreaterThan(0);
       
       // 7. Verify payments succeeded
       activities.forEach(activity => {
         expect(activity.status).toBe('success');
         expect(activity.transactionSignature).toBeDefined();
       });
       
       // 8. Verify balance decreased
       const finalBalance = await getWalletBalance(wallet.id);
       expect(finalBalance.usdc).toBeLessThan(1);
     });
   });
   ```

### Staging Environment

1. **CDP Production API with Devnet/Testnet**
   - Use production CDP API
   - Connect to Solana devnet (not mainnet)
   - Simulate real conditions without real funds
   - URL: `https://api.cdp.coinbase.com`

2. **Configuration**
   ```bash
   # .env.staging
   NEXT_PUBLIC_NETWORK=devnet
   CDP_API_KEY_PRODUCTION=your-production-key
   CDP_API_SECRET_PRODUCTION=your-production-secret
   NEXT_PUBLIC_USE_CDP_WALLETS=true
   ```

### Production Environment

1. **CDP Production with Mainnet**
   - Use production API keys
   - Connect to Solana mainnet
   - Real funds at risk
   - Enable all security features

2. **Configuration**
   ```bash
   # .env.production
   NEXT_PUBLIC_NETWORK=mainnet
   CDP_API_KEY_PRODUCTION=your-production-key
   CDP_API_SECRET_PRODUCTION=your-production-secret
   NEXT_PUBLIC_USE_CDP_WALLETS=true
   ```

3. **Production Monitoring**
   - Set up Sentry or Datadog for error tracking
   - Configure Grafana dashboards for metrics
   - Set up PagerDuty alerts for critical failures
   - Monitor transaction success rates

---

## Common Pitfalls

### 1. **Exposing API Keys Client-Side**

❌ **Wrong**:
```typescript
// components/CreateWallet.tsx (client component)
const apiKey = process.env.NEXT_PUBLIC_CDP_API_KEY; // Exposed to browser!
const wallet = await cdp.wallets.create({ apiKey });
```

✅ **Correct**:
```typescript
// app/api/wallets/create/route.ts (server-only)
const apiKey = process.env.CDP_API_KEY; // Server-side only
const wallet = await cdp.wallets.create({ apiKey });
```

### 2. **Not Validating User Ownership**

❌ **Wrong**:
```typescript
// /api/sign-payment route
export async function POST(request: NextRequest) {
  const { walletId } = await request.json();
  
  // No ownership check! Anyone can sign for any wallet
  const signature = await cdp.wallets.signTransaction({ walletId });
  return NextResponse.json({ signature });
}
```

✅ **Correct**:
```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(request);
  const { walletId } = await request.json();
  
  // Verify user owns the wallet
  const wallet = await db.getWallet(walletId);
  if (wallet.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const signature = await cdp.wallets.signTransaction({ walletId });
  return NextResponse.json({ signature });
}
```

### 3. **Trusting Client-Side Validation**

❌ **Wrong**:
```typescript
// Client side
if (amount <= MAX_AMOUNT) {
  await fetch('/api/sign-payment', { body: JSON.stringify({ amount }) });
}

// Server side - trusts client validation
export async function POST(request: NextRequest) {
  const { amount } = await request.json();
  // No server-side validation!
  const signature = await cdp.wallets.signTransaction({ amount });
}
```

✅ **Correct**:
```typescript
// Server side - always validate
export async function POST(request: NextRequest) {
  const { amount } = await request.json();
  
  // Server-side validation
  if (amount > MAX_AMOUNT) {
    return NextResponse.json({ error: 'Amount exceeds limit' }, { status: 400 });
  }
  
  const signature = await cdp.wallets.signTransaction({ amount });
}
```

### 4. **Not Handling CDP API Errors**

❌ **Wrong**:
```typescript
const signature = await cdp.wallets.signTransaction({ walletId, transaction });
// Assume success, no error handling
```

✅ **Correct**:
```typescript
try {
  const signature = await cdp.wallets.signTransaction({ walletId, transaction });
  return NextResponse.json({ signature });
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return NextResponse.json(
      { error: 'Insufficient wallet balance' },
      { status: 400 }
    );
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  } else if (error.code === 'NETWORK_ERROR') {
    return NextResponse.json(
      { error: 'Network error. Please try again.' },
      { status: 503 }
    );
  } else {
    console.error('CDP signing error:', error);
    return NextResponse.json(
      { error: 'Failed to sign transaction' },
      { status: 500 }
    );
  }
}
```

### 5. **Not Implementing Rate Limiting**

❌ **Wrong**:
```typescript
// No rate limiting - vulnerable to abuse
export async function POST(request: NextRequest) {
  const { walletId } = await request.json();
  const signature = await cdp.wallets.signTransaction({ walletId });
  return NextResponse.json({ signature });
}
```

✅ **Correct**:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour
});

export async function POST(request: NextRequest) {
  const { walletId } = await request.json();
  
  // Check rate limit
  const { success, remaining } = await ratelimit.limit(walletId);
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', remaining },
      { status: 429 }
    );
  }
  
  const signature = await cdp.wallets.signTransaction({ walletId });
  return NextResponse.json({ signature });
}
```

### 6. **Mixing Production and Development Configs**

❌ **Wrong**:
```typescript
// Using production API key with devnet network
const cdp = new CDPClient({
  apiKey: process.env.CDP_API_KEY_PRODUCTION,
  network: 'solana-devnet' // Mismatch!
});
```

✅ **Correct**:
```typescript
function getCDPClient() {
  const network = getCurrentNetwork();
  
  if (network.name === 'devnet') {
    return new CDPClient({
      apiKey: process.env.CDP_API_KEY_SANDBOX,
      apiSecret: process.env.CDP_API_SECRET_SANDBOX,
      environment: 'sandbox',
      network: 'solana-devnet'
    });
  } else {
    return new CDPClient({
      apiKey: process.env.CDP_API_KEY_PRODUCTION,
      apiSecret: process.env.CDP_API_SECRET_PRODUCTION,
      environment: 'production',
      network: 'solana-mainnet'
    });
  }
}
```

### 7. **Not Logging Transaction History**

❌ **Wrong**:
```typescript
// Sign transaction but don't log it
const signature = await cdp.wallets.signTransaction({ walletId, transaction });
return NextResponse.json({ signature });
```

✅ **Correct**:
```typescript
const signature = await cdp.wallets.signTransaction({ walletId, transaction });

// Log transaction to database
await db.insertTransaction({
  walletId,
  signature,
  amount,
  token,
  recipient,
  status: 'pending',
  createdAt: new Date()
});

// Update later via webhook when confirmed
return NextResponse.json({ signature });
```

### 8. **Ignoring Webhook Notifications**

CDP sends webhook notifications for transaction status updates. Not handling them means you miss failures and confirmations.

✅ **Implement Webhook Handler**:
```typescript
// app/api/webhooks/cdp/route.ts
import { verifyWebhookSignature } from '@coinbase/coinbase-sdk';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-cdp-signature');
  
  // Verify webhook authenticity
  const isValid = verifyWebhookSignature(
    body,
    signature,
    process.env.CDP_WEBHOOK_SECRET
  );
  
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(body);
  
  // Handle transaction status updates
  if (event.type === 'transaction.confirmed') {
    await db.updateTransaction(event.data.signature, {
      status: 'confirmed',
      confirmedAt: new Date()
    });
  } else if (event.type === 'transaction.failed') {
    await db.updateTransaction(event.data.signature, {
      status: 'failed',
      error: event.data.error,
      failedAt: new Date()
    });
  }
  
  return NextResponse.json({ received: true });
}
```

---

## References

### Official Coinbase Documentation

1. **CDP Developer Portal**: https://portal.cdp.coinbase.com/
   - Main portal for managing projects and API keys
   - Access to sandbox and production environments

2. **CDP API Documentation**: https://docs.cdp.coinbase.com/
   - Comprehensive API reference
   - SDK documentation for multiple languages
   - Integration guides and tutorials

3. **Embedded Wallets Guide**: https://docs.cdp.coinbase.com/wallets/docs/embedded-wallets
   - Overview of embedded wallet architecture
   - Security best practices
   - Integration examples

4. **MPC Wallets**: https://docs.cdp.coinbase.com/wallets/docs/mpc-wallets
   - Deep dive into Multi-Party Computation
   - Key management architecture
   - Recovery mechanisms

5. **Solana Support**: https://docs.cdp.coinbase.com/wallets/docs/solana
   - Solana-specific integration guide
   - Token support (SOL, USDC, SPL tokens)
   - Network configuration (devnet, mainnet)

6. **Security Best Practices**: https://docs.cdp.coinbase.com/security
   - API key management
   - Rate limiting recommendations
   - Webhook verification

7. **SDK Reference**: https://docs.cdp.coinbase.com/sdk
   - TypeScript/JavaScript SDK documentation
   - Code examples and snippets
   - Error handling guide

### Industry Best Practices

1. **OWASP Cryptographic Storage**: https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/09-Testing_for_Weak_Cryptography/04-Testing_for_Weak_Encryption
   - Encryption best practices
   - Key storage recommendations

2. **NIST Cryptographic Standards**: https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines
   - Industry-standard cryptographic practices
   - Key length recommendations

3. **Web3 Security Best Practices**: https://consensys.github.io/smart-contract-best-practices/
   - General Web3 security guidelines
   - Transaction signing patterns

4. **Solana Developer Docs**: https://docs.solana.com/
   - Solana-specific development patterns
   - Transaction structure and signing

### Community Resources

1. **CDP GitHub**: https://github.com/coinbase/coinbase-sdk-nodejs
   - Official SDK source code
   - Issue tracker for bug reports
   - Example projects and integrations

2. **CDP Discord**: https://discord.gg/cdp
   - Community support channel
   - Announcements and updates
   - Direct access to CDP team

3. **Solana Stack Exchange**: https://solana.stackexchange.com/
   - Q&A for Solana development
   - Transaction signing questions
   - Network configuration help

---

## Conclusion

Migrating Sentinel Agent to CDP Embedded Wallets will significantly improve security, user experience, and maintainability. The current client-side signing approach exposes private keys to XSS attacks and lacks proper authentication. CDP's server-side signing with MPC key custody provides enterprise-grade security while maintaining the autonomous monitoring use case.

### Key Takeaways

1. **Security First**: Never expose private keys to the client. All signing must happen server-side.

2. **Authentication Required**: Implement session-based authentication and validate wallet ownership on every request.

3. **Server-Side Validation**: Never trust client-side validation. Always re-validate on the server.

4. **Rate Limiting Essential**: Protect against abuse with per-wallet and per-user rate limits.

5. **Comprehensive Logging**: Log all wallet operations for security auditing and debugging.

6. **Gradual Migration**: Use feature flags and gradual rollout to minimize risk.

7. **Environment Isolation**: Keep sandbox and production configurations strictly separate.

8. **Error Handling**: Implement robust error handling with retry logic and user-friendly messages.

9. **Autonomous Patterns**: For sentinel use case, implement pre-approved spending limits to avoid manual approvals.

10. **Webhook Integration**: Use CDP webhooks for transaction status updates to keep your database in sync.

### Next Steps

1. **Immediate**: Set up CDP developer account and explore sandbox
2. **Week 1-2**: Prepare database schema and environment configuration
3. **Week 3-4**: Implement CDP integration alongside existing code (feature flag)
4. **Week 5**: Comprehensive testing in sandbox environment
5. **Week 6-7**: Gradual rollout to users with monitoring
6. **Week 8**: Remove legacy code and update documentation

### Support

For questions or issues during implementation:
- **CDP Discord**: https://discord.gg/cdp
- **GitHub Issues**: https://github.com/coinbase/coinbase-sdk-nodejs/issues
- **Email Support**: developers@coinbase.com

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-15  
**Author**: Sentinel Agent Development Team  
**Status**: Research Complete - Ready for Implementation
