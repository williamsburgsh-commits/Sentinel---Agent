# CDP SDK Integration Guide

This document describes the Coinbase Developer Platform (CDP) SDK integration in Sentinel Agent.

## Overview

Sentinel Agent now includes platform-level support for Coinbase Developer Platform (CDP) and OnchainKit. This integration prepares the application to leverage CDP's embedded wallet services and provides a foundation for future Coinbase-powered features.

## Architecture

### Server-Side: CDP Client (`lib/cdp-client.ts`)

The CDP client provides server-side access to the Coinbase Developer Platform API. It includes:

- **Lazy initialization**: Client is created on first use, not at module load time
- **Graceful degradation**: Missing configuration logs warnings but doesn't break the app
- **Environment validation**: Checks for required environment variables and provides descriptive errors
- **Fail-fast startup validation**: `validateCDPOnStartup()` can be called to check configuration early

#### Key Functions

```typescript
// Get the CDP client (returns configured or unconfigured client)
const client = getCDPClient();

// Check if CDP is properly configured
if (isCDPConfigured()) {
  // CDP features available
}

// Get configuration error (if any)
const error = getCDPConfigError();

// Get API configuration for use with CDP SDK
const config = getCDPApiConfig(); // Throws if not configured

// Validate on server startup
validateCDPOnStartup(); // Logs status to console
```

### Client-Side: OnchainKit Provider (`components/OnchainKitProvider.tsx`)

The OnchainKit provider wraps the entire application, making Coinbase wallet features available to all components.

- **Integrated in root layout**: All pages automatically have access to OnchainKit context
- **Dark mode theme**: Matches Sentinel Agent's design system
- **Configuration logging**: Warns if `NEXT_PUBLIC_CDP_API_KEY` is not set

#### Implementation

```tsx
import { OnchainKitProvider } from '@/components/OnchainKitProvider';

// Already integrated in app/layout.tsx
<OnchainKitProvider>
  {children}
</OnchainKitProvider>
```

## Environment Variables

### Required for CDP Features

#### Server-Side (Keep Private)
```env
CDP_API_KEY=your_cdp_api_key_here
CDP_API_SECRET=your_cdp_api_secret_here
CDP_PROJECT_ID=your_cdp_project_id_here
CDP_BASE_URL=https://api.developer.coinbase.com
```

#### Client-Side (Public)
```env
NEXT_PUBLIC_CDP_API_KEY=your_cdp_public_api_key_here
```

### Getting CDP Credentials

1. Visit [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com/)
2. Sign in or create a Coinbase account
3. Create a new project
4. Navigate to project settings
5. Copy your credentials:
   - API Key (server-side)
   - API Secret (server-side, keep secure!)
   - Project ID (server-side)
   - Public API Key (client-side, safe to expose)

### Security Notes

⚠️ **NEVER** commit these values to version control
⚠️ **NEVER** expose `CDP_API_SECRET` in client-side code
⚠️ Only `NEXT_PUBLIC_CDP_API_KEY` should be public

## Dependencies

The following packages were added to support CDP integration:

```json
{
  "@coinbase/onchainkit": "^1.1.2",
  "wagmi": "^2.19.4",
  "viem": "^2.39.2"
}
```

Install with:
```bash
npm install @coinbase/onchainkit wagmi viem --legacy-peer-deps
```

Note: `--legacy-peer-deps` is required due to React 18.2 compatibility.

## Graceful Degradation

The CDP integration is designed to be **optional**. The application will continue to function normally without CDP configuration:

### Without CDP Configuration
- ✅ App builds and runs normally
- ✅ Existing Solana wallet features work
- ✅ Payment system (x402) works
- ✅ Sentinel monitoring works
- ⚠️ Console warnings about missing CDP config
- ❌ CDP-specific features unavailable

### With CDP Configuration
- ✅ All features above
- ✅ Access to CDP embedded wallet services
- ✅ OnchainKit UI components available
- ✅ Future CDP-powered features enabled

## Integration with Solana

While OnchainKit is primarily designed for EVM chains (Ethereum, Base, etc.), the CDP server SDK can be used for cross-chain wallet management. The integration provides:

1. **Platform-level context**: OnchainKit provider is available throughout the app
2. **Server-side CDP client**: Can be used for wallet creation and management
3. **Future extensibility**: Foundation for CDP-powered features in Solana ecosystem

Current implementation uses Base chain for OnchainKit provider (imported from `viem/chains`), but server-side CDP operations can work with multiple chains.

## Startup Validation

The application includes startup validation to check all configuration:

```typescript
import { validateStartup } from '@/lib/startup';

// In API routes or server components
validateStartup();
```

This will log the status of:
- ✅ Solana network configuration
- ✅ RPC endpoints
- ✅ Payment recipient wallet
- ✅ CoinMarketCap API
- ⚠️ DeepSeek API (optional)
- ✅/⚠️ CDP configuration (optional)

## Usage Examples

### Server-Side: Using CDP Client

```typescript
import { getCDPClient, isCDPConfigured } from '@/lib/cdp-client';

export async function POST(request: Request) {
  // Check if CDP is available
  if (!isCDPConfigured()) {
    return Response.json({
      success: false,
      error: 'CDP not configured'
    });
  }
  
  // Get CDP client
  const cdpClient = getCDPClient();
  
  // Use CDP API (example)
  // const wallet = await createWallet(cdpClient.config);
  
  return Response.json({ success: true });
}
```

### Client-Side: Using OnchainKit Components

```typescript
'use client';

import { ConnectWallet } from '@coinbase/onchainkit';

export function WalletButton() {
  return <ConnectWallet />;
}
```

## Troubleshooting

### Build Errors

**Problem**: Build fails with "Can't resolve 'wagmi'" or similar
**Solution**: Install all required dependencies:
```bash
npm install @coinbase/onchainkit wagmi viem --legacy-peer-deps
```

**Problem**: "Package path ./chains is not exported"
**Solution**: Import chains from `viem/chains`, not `@coinbase/onchainkit/chains`
```typescript
// ✅ Correct
import { base } from 'viem/chains';

// ❌ Incorrect
import { base } from '@coinbase/onchainkit/chains';
```

### Runtime Warnings

**Problem**: Console shows "CDP SDK not configured" warnings
**Solution**: Either:
1. Add CDP credentials to `.env.local` (see Environment Variables section)
2. Ignore warnings if you don't need CDP features (app will work normally)

**Problem**: OnchainKit components don't render
**Solution**: Check that `NEXT_PUBLIC_CDP_API_KEY` is set in `.env.local`

## Testing

### Verify CDP Integration

1. **Check build succeeds**:
```bash
npm run build
```

2. **Check dev server starts**:
```bash
npm run dev
```

3. **Check console logs**:
   - Without CDP config: Should see warnings but no errors
   - With CDP config: Should see "✅ CDP SDK configured successfully"

4. **Check OnchainKit provider**:
   - Open browser console
   - Should see "✅ OnchainKit provider initialized with API key" (if configured)
   - Or "⚠️ NEXT_PUBLIC_CDP_API_KEY not configured" (if not configured)

## Future Roadmap

The CDP integration prepares Sentinel Agent for:

1. **Embedded Wallets**: Let users create wallets without seed phrases
2. **Cross-Chain Support**: Extend monitoring to EVM chains
3. **Fiat On-Ramp**: Direct fiat-to-crypto funding for sentinels
4. **Identity Features**: Coinbase-verified user profiles
5. **Smart Wallet Features**: Multi-sig, spending limits, automation

## References

- [CDP Documentation](https://docs.cdp.coinbase.com/)
- [OnchainKit Documentation](https://onchainkit.xyz/)
- [CDP Portal](https://portal.cdp.coinbase.com/)
- [Viem Documentation](https://viem.sh/)
- [Wagmi Documentation](https://wagmi.sh/)

## Support

For CDP-specific issues:
- Check [CDP Docs](https://docs.cdp.coinbase.com/)
- Visit [Coinbase Developer Discord](https://discord.gg/cdp)

For Sentinel Agent issues:
- See [SETUP.md](./SETUP.md) for general configuration
- See [README.md](./README.md) for project overview
