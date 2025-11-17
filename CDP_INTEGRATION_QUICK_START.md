# CDP Embedded Wallets - Quick Start Guide

This is a condensed reference guide for implementing CDP embedded wallets in Sentinel Agent. For detailed explanations, see [CDP_EMBEDDED_WALLETS_RESEARCH.md](./CDP_EMBEDDED_WALLETS_RESEARCH.md).

---

## Critical Security Issues in Current Implementation

### ❌ Current Problems

1. **Private keys stored in localStorage** → Vulnerable to XSS attacks
2. **Client-side transaction signing** → Keys exposed in browser memory
3. **No authentication/authorization** → Anyone with localStorage access can use wallets
4. **No rate limiting** → Vulnerable to wallet draining attacks
5. **No audit trail** → Can't track who performed actions

### ✅ CDP Solutions

1. **Server-side key custody** → Keys never leave CDP secure infrastructure
2. **MPC key management** → Keys split across multiple parties (no single point of failure)
3. **Session-based authentication** → User must authenticate to sign transactions
4. **Built-in rate limiting** → CDP enforces limits, we add application-level limits
5. **Comprehensive logging** → All operations logged by Coinbase and in our database

---

## Architecture Change

### Current (Insecure)
```
Browser → localStorage (private key) → client-side signing → Solana network
```

### New (Secure)
```
Browser → API route → validate session → CDP SDK signing → Solana network
       ↓
  Store wallet ID only (not private key)
```

---

## Implementation Checklist

### 1. Environment Setup

```bash
# Install CDP SDK
npm install @coinbase/coinbase-sdk

# Add to .env.local
CDP_API_KEY_SANDBOX=your-sandbox-key
CDP_API_SECRET_SANDBOX=your-sandbox-secret
CDP_API_KEY_PRODUCTION=your-production-key
CDP_API_SECRET_PRODUCTION=your-production-secret
CDP_WEBHOOK_SECRET=your-webhook-secret
```

### 2. Create CDP Client

```typescript
// lib/cdp-client.ts
import { Coinbase } from '@coinbase/coinbase-sdk';
import { getCurrentNetwork } from './networks';

export function getCDPClient() {
  const network = getCurrentNetwork();
  
  if (network.name === 'devnet') {
    return new Coinbase({
      apiKey: process.env.CDP_API_KEY_SANDBOX!,
      apiSecret: process.env.CDP_API_SECRET_SANDBOX!,
      environment: 'sandbox'
    });
  } else {
    return new Coinbase({
      apiKey: process.env.CDP_API_KEY_PRODUCTION!,
      apiSecret: process.env.CDP_API_SECRET_PRODUCTION!,
      environment: 'production'
    });
  }
}
```

### 3. Create Wallet API Route

```typescript
// app/api/wallets/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCDPClient } from '@/lib/cdp-client';
import { getCurrentNetwork } from '@/lib/networks';

export async function POST(request: NextRequest) {
  // 1. Validate session
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Create wallet with CDP
    const cdp = getCDPClient();
    const network = getCurrentNetwork();
    
    const wallet = await cdp.wallets.create({
      network: network.name === 'devnet' ? 'solana-devnet' : 'solana-mainnet'
    });

    // 3. Store wallet metadata in database
    await db.insertWallet({
      id: wallet.id,
      address: wallet.address,
      userId: session.user.id,
      network: network.name,
      createdAt: new Date()
    });

    // 4. Return only non-sensitive data
    return NextResponse.json({
      walletId: wallet.id,
      address: wallet.address,
      network: network.name
    });
  } catch (error) {
    console.error('Wallet creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create wallet' },
      { status: 500 }
    );
  }
}
```

### 4. Create Sign Payment API Route

```typescript
// app/api/sign-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCDPClient } from '@/lib/cdp-client';
import { validatePaymentAmount } from '@/lib/networks';

// Rate limiting
const RATE_LIMIT_PER_HOUR = 100;
const SPENDING_LIMIT_PER_HOUR = 0.1; // 0.1 USDC

export async function POST(request: NextRequest) {
  // 1. Validate session
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { walletId, recipient, amount, token } = await request.json();

  // 2. Validate wallet ownership
  const wallet = await db.getWallet(walletId);
  if (!wallet || wallet.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Validate amount
  const validation = validatePaymentAmount(amount);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // 4. Check rate limit
  const recentTxCount = await db.countRecentTransactions(walletId, '1 hour');
  if (recentTxCount >= RATE_LIMIT_PER_HOUR) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // 5. Check spending limit
  const hourlySpend = await db.getHourlySpending(walletId);
  if (hourlySpend + amount > SPENDING_LIMIT_PER_HOUR) {
    return NextResponse.json({ error: 'Spending limit exceeded' }, { status: 429 });
  }

  // 6. Validate recipient (whitelist for security)
  const allowedRecipients = [process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET];
  if (!allowedRecipients.includes(recipient)) {
    return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 });
  }

  try {
    // 7. Build transaction
    const transaction = buildTransferTransaction({
      recipient,
      amount,
      token
    });

    // 8. Sign with CDP
    const cdp = getCDPClient();
    const signedTx = await cdp.wallets.signTransaction({
      walletId,
      transaction
    });

    // 9. Broadcast to network
    const signature = await cdp.transactions.broadcast(signedTx);

    // 10. Log transaction
    await db.insertTransaction({
      walletId,
      signature,
      amount,
      token,
      recipient,
      status: 'pending',
      createdAt: new Date()
    });

    // 11. Update spending counter
    await db.incrementSpending(walletId, amount);

    return NextResponse.json({
      signature,
      status: 'pending'
    });
  } catch (error) {
    console.error('Transaction signing failed:', error);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return NextResponse.json(
        { error: 'Insufficient wallet balance' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to sign transaction' },
      { status: 500 }
    );
  }
}
```

### 5. Update Client Code

```typescript
// lib/payments.ts (NEW VERSION)

// REMOVE: Direct signing functions (sendUSDCPayment, sendCASHPayment)
// REPLACE WITH: API calls to /api/sign-payment

export async function sendPayment(
  walletId: string,
  recipient: string,
  amount: number,
  token: 'usdc' | 'cash'
): Promise<string> {
  const response = await fetch('/api/sign-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletId, recipient, amount, token })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Payment failed');
  }

  const { signature } = await response.json();
  return signature;
}
```

```typescript
// components/CreateSentinel.tsx (UPDATE)

async function createSentinel() {
  // OLD: const { keypair, publicKey } = createSentinelWallet();
  
  // NEW: Create CDP wallet via API
  const response = await fetch('/api/wallets/create', { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to create wallet');
  }
  
  const wallet = await response.json();
  
  // Store wallet ID (not private key!)
  const sentinel = {
    id: crypto.randomUUID(),
    name: sentinelName,
    walletId: wallet.walletId, // CDP wallet ID
    walletAddress: wallet.address,
    threshold,
    condition,
    // ... other fields
  };
  
  await createSentinel(sentinel);
}
```

### 6. Update Monitoring Service

```typescript
// lib/monitoring-service.ts (UPDATE)

async function runSentinelCheck(sentinel: Sentinel) {
  // OLD: Get private key from localStorage and sign client-side
  // const keypair = getWalletFromPrivateKey(sentinel.privateKey);
  
  // NEW: Call server-side signing API
  try {
    const signature = await sendPayment(
      sentinel.walletId, // Not private key!
      process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET!,
      0.0003,
      sentinel.paymentMethod || 'usdc'
    );
    
    // Continue with price check using payment proof
    const priceResponse = await checkPriceWith402(sentinel, signature);
    
    // ... rest of logic
  } catch (error) {
    if (error.message.includes('Rate limit')) {
      // Auto-pause sentinel
      await pauseSentinel(sentinel.id);
      console.log('Sentinel auto-paused due to rate limit');
    }
    throw error;
  }
}
```

---

## Database Schema Updates

```sql
-- Add CDP wallet ID to sentinels table
ALTER TABLE sentinels ADD COLUMN cdp_wallet_id VARCHAR(255);
ALTER TABLE sentinels DROP COLUMN private_key; -- Remove after migration

-- Create CDP wallets table
CREATE TABLE cdp_wallets (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL,
  address VARCHAR(255) NOT NULL,
  network VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create transaction logs table
CREATE TABLE transaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id VARCHAR(255) NOT NULL,
  signature VARCHAR(255) NOT NULL UNIQUE,
  amount DECIMAL(18, 6) NOT NULL,
  token VARCHAR(10) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- pending, confirmed, failed
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  FOREIGN KEY (wallet_id) REFERENCES cdp_wallets(id)
);

-- Create spending limits table
CREATE TABLE spending_limits (
  wallet_id VARCHAR(255) PRIMARY KEY,
  daily_limit DECIMAL(18, 6) NOT NULL DEFAULT 0.1,
  hourly_limit DECIMAL(18, 6) NOT NULL DEFAULT 0.05,
  daily_spending DECIMAL(18, 6) NOT NULL DEFAULT 0,
  hourly_spending DECIMAL(18, 6) NOT NULL DEFAULT 0,
  last_daily_reset TIMESTAMP DEFAULT NOW(),
  last_hourly_reset TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (wallet_id) REFERENCES cdp_wallets(id)
);
```

---

## Security Checklist

- [ ] API keys stored as server-side environment variables (not `NEXT_PUBLIC_`)
- [ ] All API routes require authentication (session validation)
- [ ] Wallet ownership validated before any operation
- [ ] Rate limiting implemented (per-wallet and per-user)
- [ ] Spending limits enforced (hourly and daily)
- [ ] Recipient addresses whitelisted (no arbitrary transfers)
- [ ] Amount validation on server-side (don't trust client)
- [ ] Transaction logs saved to database
- [ ] Webhook handler implemented for status updates
- [ ] Error messages don't expose sensitive information
- [ ] Logging doesn't include private keys or API secrets
- [ ] HTTPS enforced in production
- [ ] CORS configured properly (don't allow all origins)

---

## Testing Checklist

### Unit Tests
- [ ] CDP client initialization
- [ ] Wallet creation with valid credentials
- [ ] Transaction signing with valid parameters
- [ ] Error handling for invalid API keys
- [ ] Error handling for insufficient funds

### Integration Tests
- [ ] POST /api/wallets/create (authenticated)
- [ ] POST /api/wallets/create (unauthenticated → 401)
- [ ] POST /api/sign-payment (valid request → 200)
- [ ] POST /api/sign-payment (unauthorized wallet → 403)
- [ ] POST /api/sign-payment (rate limit exceeded → 429)
- [ ] POST /api/sign-payment (spending limit exceeded → 429)
- [ ] POST /api/sign-payment (invalid recipient → 400)

### E2E Tests
- [ ] Create user account
- [ ] Create CDP wallet
- [ ] Fund wallet with test tokens
- [ ] Create sentinel with CDP wallet
- [ ] Start monitoring
- [ ] Verify autonomous checks run successfully
- [ ] Verify payments are logged to database
- [ ] Verify rate limiting works
- [ ] Verify auto-pause on insufficient funds

---

## Migration Checklist

### Phase 1: Preparation
- [ ] Sign up for CDP developer account
- [ ] Create sandbox and production projects
- [ ] Generate API keys (keep separate)
- [ ] Add CDP SDK to package.json
- [ ] Update environment variables
- [ ] Update database schema

### Phase 2: Implementation
- [ ] Create `lib/cdp-client.ts`
- [ ] Create `/api/wallets/create` route
- [ ] Create `/api/sign-payment` route
- [ ] Update `lib/payments.ts` to use API
- [ ] Update `components/CreateSentinel.tsx`
- [ ] Update `lib/monitoring-service.ts`
- [ ] Add feature flag for gradual rollout

### Phase 3: Testing
- [ ] Test wallet creation in sandbox
- [ ] Test transaction signing
- [ ] Test error handling
- [ ] Test rate limiting
- [ ] Run E2E tests
- [ ] Security audit

### Phase 4: Migration
- [ ] Enable CDP for new users (feature flag)
- [ ] Monitor for errors
- [ ] Create balance transfer tool for existing users
- [ ] Gradually migrate existing users
- [ ] Communicate timeline to users

### Phase 5: Cleanup
- [ ] Remove legacy signing code
- [ ] Remove private key storage
- [ ] Update documentation
- [ ] Set up production monitoring

---

## Common Mistakes to Avoid

1. ❌ Exposing API keys with `NEXT_PUBLIC_` prefix
2. ❌ Not validating wallet ownership before signing
3. ❌ Trusting client-side validation
4. ❌ Not implementing rate limiting
5. ❌ Not logging transactions to database
6. ❌ Mixing sandbox and production configs
7. ❌ Not handling CDP API errors
8. ❌ Ignoring webhook notifications

---

## Key Resources

- **CDP Portal**: https://portal.cdp.coinbase.com/
- **CDP Docs**: https://docs.cdp.coinbase.com/
- **Embedded Wallets Guide**: https://docs.cdp.coinbase.com/wallets/docs/embedded-wallets
- **MPC Wallets**: https://docs.cdp.coinbase.com/wallets/docs/mpc-wallets
- **Solana Support**: https://docs.cdp.coinbase.com/wallets/docs/solana
- **SDK Reference**: https://docs.cdp.coinbase.com/sdk
- **CDP Discord**: https://discord.gg/cdp
- **GitHub**: https://github.com/coinbase/coinbase-sdk-nodejs

---

## Support

For implementation questions:
- CDP Discord: https://discord.gg/cdp
- GitHub Issues: https://github.com/coinbase/coinbase-sdk-nodejs/issues
- Email: developers@coinbase.com

---

**Last Updated**: 2024-01-15
