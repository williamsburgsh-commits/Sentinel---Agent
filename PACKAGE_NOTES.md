# Package Dependencies Documentation

## Phantom CASH Integration Packages

The following packages were installed for Phantom wallet integration and future Phantom CASH payment support:

### Core Wallet Adapter Packages

**@solana/wallet-adapter-base** (v0.9.27)
- Base functionality for Solana wallet adapters
- Provides common interfaces and utilities
- Required by all wallet adapter implementations
- Used for: Core wallet connection logic

**@solana/wallet-adapter-phantom** (v0.9.28)
- Phantom-specific wallet adapter
- Enables connection to Phantom browser extension and mobile app
- Handles Phantom wallet detection and communication
- Used for: Direct Phantom wallet integration

**@solana/wallet-adapter-react** (v0.15.39)
- React hooks and context providers for wallet adapters
- Provides `useWallet()`, `useConnection()`, and other hooks
- Manages wallet state in React applications
- Used for: React component integration

**@solana/wallet-adapter-react-ui** (v0.9.39)
- Pre-built React UI components for wallet connection
- Includes wallet selection modal, connect button, etc.
- Styled components ready to use
- Used for: Quick UI implementation (optional)

**@solana/wallet-adapter-wallets** (v0.19.37)
- Collection of all supported wallet adapters
- Includes Phantom, Solflare, Ledger, and many others
- Allows users to choose from multiple wallets
- Used for: Multi-wallet support

### Purpose

These packages enable:
1. **Phantom Wallet Connection** - Connect to user's Phantom wallet
2. **CASH Balance Checking** - Query CASH token balances
3. **CASH Transfers** - Send CASH payments for micropayments
4. **Transaction Signing** - Sign transactions with Phantom
5. **Multi-Wallet Support** - Support other Solana wallets as fallback

### Future CASH Integration

While there is no dedicated Phantom CASH SDK yet (as of November 2025), these packages provide the foundation for:
- Detecting CASH token in Phantom wallet
- Transferring CASH tokens (similar to USDC/SPL tokens)
- Integrating with Phantom's payment features
- Supporting both CASH and USDC payments

### Related Packages (Already Installed)

**@solana/web3.js** (v1.95.0)
- Core Solana blockchain interaction library
- Used for transactions, RPC calls, and account management

**@solana/spl-token** (v0.3.9)
- SPL token program interaction
- Used for USDC and CASH token transfers
- Handles token accounts and transfers

**bs58** (v6.0.0)
- Base58 encoding/decoding
- Used for wallet private key handling

### Installation Command

```bash
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-base @solana/wallet-adapter-phantom @solana/wallet-adapter-wallets
```

### Known Issues

**@solana/wallet-adapter-react-ui and Next.js Compatibility:**
The UI package may cause build errors in Next.js due to `<Html>` component imports. Solutions:
1. **Option A:** Build custom wallet UI components (recommended)
2. **Option B:** Use dynamic imports with `ssr: false`
3. **Option C:** Configure Next.js to handle the package properly

For now, we'll build custom UI components instead of using the pre-built UI package.

### Next Steps

1. Create wallet adapter context provider
2. Implement custom Phantom wallet connection UI (not using react-ui package)
3. Add CASH token detection
4. Implement CASH payment flow
5. Test with Phantom wallet on mainnet

### Documentation References

- **Solana Wallet Adapter:** https://github.com/anza-xyz/wallet-adapter
- **Phantom Developer Docs:** https://docs.phantom.com/
- **Phantom CASH Notes:** See `PHANTOM_CASH_NOTES.md`

---

**Last Updated:** November 9, 2025
