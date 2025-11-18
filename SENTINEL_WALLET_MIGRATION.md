# Sentinel Wallet Metadata Migration

## Overview

The sentinel data model has been refactored to support both legacy locally-managed keypairs and Coinbase Developer Platform (CDP) managed wallets. This migration maintains full backward compatibility with existing sentinels.

## What Changed

### Type Definitions

#### Before (`types/data.ts`)
```typescript
export interface Sentinel {
  id: string;
  user_id: string;
  wallet_address: string;
  private_key: string; // base58 encoded
  // ... other fields
}
```

#### After (`types/data.ts`)
```typescript
export type WalletProvider = 'legacy' | 'cdp';

export interface Sentinel {
  id: string;
  user_id: string;
  wallet_address: string;
  
  // Wallet management metadata
  wallet_provider: WalletProvider; // Required field
  
  // CDP wallet fields (only when wallet_provider === 'cdp')
  cdp_wallet_id?: string;
  cdp_wallet_address?: string;
  
  // Legacy wallet field (only when wallet_provider === 'legacy')
  legacy_private_key?: string; // base58 encoded
  
  // ... other fields
}
```

### Key Changes

1. **New Required Field**: `wallet_provider` - Identifies whether the sentinel uses a `'legacy'` or `'cdp'` wallet
2. **Renamed Field**: `private_key` → `legacy_private_key` (now optional)
3. **New Optional Fields**: `cdp_wallet_id` and `cdp_wallet_address` for CDP-managed wallets

## Automatic Migration

All existing sentinels are **automatically migrated** when loaded from storage:

- The `getSentinelsFromStorage()` function in `lib/data-store.ts` detects old-format sentinels
- Adds `wallet_provider: 'legacy'` to existing sentinels
- Renames `private_key` to `legacy_private_key`
- Saves migrated data back to storage
- Migration is transparent and happens once per sentinel

### Migration Flow

```typescript
// Old format (before migration)
{
  id: 'sentinel_123',
  wallet_address: 'ABC123...',
  private_key: 'xyz789...',
  // ... other fields
}

// New format (after migration)
{
  id: 'sentinel_123',
  wallet_address: 'ABC123...',
  wallet_provider: 'legacy',
  legacy_private_key: 'xyz789...', // Renamed from private_key
  // ... other fields
}
```

## Helper Functions

New utility functions in `lib/sentinel-wallet-helpers.ts` provide safe access to wallet credentials:

### Type Guards

```typescript
import { isLegacyWallet, isCDPWallet } from '@/lib/sentinel-wallet-helpers';

if (isLegacyWallet(sentinel)) {
  // Handle legacy wallet
}

if (isCDPWallet(sentinel)) {
  // Handle CDP wallet
}
```

### Safe Private Key Access

```typescript
import { getLegacyPrivateKey } from '@/lib/sentinel-wallet-helpers';

// For Sentinel (types/data.ts)
const privateKey = getLegacyPrivateKey(sentinel);
if (privateKey) {
  // Use the private key
}

// For SentinelConfig (types/index.ts)
const privateKey = getLegacyPrivateKeyFromConfig(config);
if (privateKey) {
  // Use the private key
}
```

**Note**: These functions log deprecation warnings when the private key is accessed, encouraging migration to CDP-managed wallets.

### Get CDP Metadata

```typescript
import { getCDPWalletMetadata } from '@/lib/sentinel-wallet-helpers';

const cdpMetadata = getCDPWalletMetadata(sentinel);
if (cdpMetadata) {
  console.log('CDP Wallet ID:', cdpMetadata.walletId);
  console.log('CDP Wallet Address:', cdpMetadata.walletAddress);
}
```

## Updated Code Patterns

### Creating a Legacy Sentinel

```typescript
import { createSentinel } from '@/lib/data-store';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const keypair = Keypair.generate();
const walletAddress = keypair.publicKey.toBase58();
const privateKey = bs58.encode(keypair.secretKey);

const sentinelConfig = {
  wallet_address: walletAddress,
  wallet_provider: 'legacy', // Required
  legacy_private_key: privateKey, // Renamed field
  threshold: 100,
  condition: 'above',
  payment_method: 'usdc',
  discord_webhook: 'https://...',
  network: 'devnet',
};

const sentinel = await createSentinel(userId, sentinelConfig);
```

### Creating a CDP Sentinel (Future)

```typescript
// This pattern will be used when CDP wallet creation is implemented

const sentinelConfig = {
  wallet_address: cdpWalletAddress,
  wallet_provider: 'cdp', // Required
  cdp_wallet_id: 'wallet-uuid-123', // CDP wallet identifier
  cdp_wallet_address: cdpWalletAddress, // CDP wallet address
  threshold: 100,
  condition: 'above',
  payment_method: 'usdc',
  discord_webhook: 'https://...',
  network: 'mainnet',
};

const sentinel = await createSentinel(userId, sentinelConfig);
```

### Using Sentinels in Business Logic

```typescript
import { 
  isLegacyWallet, 
  isCDPWallet, 
  getLegacyPrivateKey 
} from '@/lib/sentinel-wallet-helpers';

async function processPayment(sentinel: Sentinel) {
  // Check wallet type first
  if (isCDPWallet(sentinel)) {
    // Use CDP SDK to sign transactions
    throw new Error('CDP wallets not yet supported');
  }
  
  if (!isLegacyWallet(sentinel)) {
    throw new Error(`Unknown wallet provider: ${sentinel.wallet_provider}`);
  }
  
  // Safely get private key
  const privateKey = getLegacyPrivateKey(sentinel);
  if (!privateKey) {
    throw new Error('Missing private key for legacy wallet');
  }
  
  // Use private key for signing
  const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
  // ... rest of payment logic
}
```

## Files Updated

### Type Definitions
- `types/data.ts` - Updated Sentinel, SentinelInsert, SentinelUpdate, SentinelConfig interfaces
- `types/index.ts` - Updated SentinelConfig interface

### Helper Utilities
- `lib/sentinel-wallet-helpers.ts` - New file with type guards and safe access functions

### Storage Layer
- `lib/data-store.ts` - Added automatic migration logic in `getSentinelsFromStorage()`
- `lib/data-store.ts` - Updated `createSentinel()` to use new fields

### Business Logic
- `lib/monitoring-service.ts` - Updated to use wallet helpers
- `lib/sentinel.ts` - Updated `runSentinelCheck()` to use wallet helpers
- `app/api/ai-analysis/route.ts` - Updated to use wallet helpers

### UI Components
- `app/dashboard/page.tsx` - Updated sentinel creation to use new fields

## Backward Compatibility

✅ **All existing sentinels remain fully functional**
- Old sentinels are automatically migrated on load
- No manual intervention required
- No data loss during migration
- Storage is updated transparently

## Deprecation Warnings

When legacy private keys are accessed, the following warning is logged:

```
[DEPRECATED] Accessing legacy_private_key directly. Consider migrating to CDP-managed wallets.
```

This encourages gradual migration to CDP-managed wallets while maintaining full functionality.

## Future Work

Once CDP wallet integration is complete:
1. Update UI to offer CDP wallet option during sentinel creation
2. Implement CDP signing for transactions
3. Add migration tool to convert legacy sentinels to CDP
4. Update documentation with CDP best practices

## Testing Checklist

- [x] Existing sentinels load correctly after migration
- [x] New legacy sentinels can be created with updated format
- [x] Monitoring service works with migrated sentinels
- [x] AI analysis works with migrated sentinels
- [x] Dashboard displays sentinels correctly
- [x] No TypeScript compilation errors
- [x] Deprecation warnings appear when accessing private keys
- [ ] CDP wallet creation (future)
- [ ] CDP transaction signing (future)

## Questions?

For implementation details, see:
- `lib/sentinel-wallet-helpers.ts` - Helper functions and type guards
- `lib/data-store.ts` - Migration logic in `getSentinelsFromStorage()`
- `types/data.ts` - Updated type definitions
