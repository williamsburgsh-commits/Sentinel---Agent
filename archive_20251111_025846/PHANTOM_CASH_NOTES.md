# Phantom CASH Integration Notes

## Overview

**Phantom CASH** is a USD-pegged stablecoin launched by Phantom on September 30, 2025, built on Bridge's Open Issuance platform (acquired by Stripe). It transforms Phantom from a crypto wallet into a comprehensive payment platform, enabling seamless integration of traditional finance with blockchain-based payments.

**Current Status:** Launched on Solana blockchain (with plans to expand to other chains)

## What is Phantom CASH?

Phantom CASH is a stablecoin designed specifically for consumer payments and micropayments within the Phantom ecosystem. It's the first stablecoin built on Stripe's Bridge Open Issuance platform.

### Key Characteristics:
- **Peg:** 1 CASH = 1 USD
- **Blockchain:** Solana (initial deployment)
- **Backing:** USD reserves
- **Issuer:** Phantom (via Bridge infrastructure)
- **Users:** 15+ million Phantom wallet users

## How CASH Differs from Regular USDC Transfers

### Traditional USDC Transfers:
- Standard SPL token transfers on Solana
- Requires token account creation for recipients
- Subject to standard Solana transaction fees (~0.000005 SOL)
- Uses existing USDC mint address: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

### Phantom CASH:
- **Native Integration:** Built directly into Phantom wallet UI
- **Simplified UX:** No need to manage token accounts manually
- **Instant Settlement:** Real-time transaction confirmation
- **Lower Friction:** Streamlined payment flows for consumers
- **Direct Deposit:** Can receive funds via direct deposit from US bank accounts
- **Fiat On/Off Ramps:** Integrated with debit cards and Apple Pay
- **Yield Generation:** Users can earn yield on CASH balances
- **Payment Cards:** Virtual and physical debit cards (Visa-backed)

## Key Benefits for Micropayments

### 1. **Instant Settlement**
- Near-instant transaction finality on Solana (~400ms)
- No waiting for bank confirmations or clearing periods
- Ideal for real-time micropayment scenarios (e.g., pay-per-API-call)

### 2. **Lower Fees**
- Solana network fees: ~$0.00001 per transaction
- No interchange fees for stablecoin transfers
- **Revenue Model:** Builders/businesses keep 100% of net revenues (unlike traditional stablecoins)
- Significantly cheaper than credit card processing (2-3%)

### 3. **Programmable Payments**
- Smart contract integration on Solana
- Automated payment flows
- Conditional payments based on oracle data
- Perfect for HTTP 402 micropayment models

### 4. **Global Reach**
- Borderless payments without currency conversion
- 24/7 availability (no banking hours)
- Access to global Solana ecosystem

### 5. **Reduced Fraud Risk**
- Blockchain transparency and immutability
- No chargebacks (unlike credit cards)
- Cryptographic security

## SDK and API Integration

### Phantom Wallet SDK

**Official Documentation:**
- Main Docs: https://docs.phantom.com/
- Developer Portal: https://docs.phantom.app/

**Available SDKs:**
1. **Browser SDK** - For vanilla JavaScript/TypeScript web apps
2. **React SDK** - React hooks for seamless integration
3. **React Native SDK** - For iOS/Android mobile apps

**Installation (React SDK):**
```bash
npm install @phantom/wallet-sdk
# or
yarn add @phantom/wallet-sdk
```

**Key Features:**
- Multi-chain support (Solana, Ethereum, Bitcoin, Sui, Polygon, Base)
- Native transaction handling
- TypeScript support
- Multiple provider types (browser extension, embedded wallets)

### Bridge API (for CASH Issuance/Management)

**Bridge Platform:** https://www.bridge.xyz/

Bridge provides the underlying infrastructure for CASH stablecoin operations:
- **Orchestration API** - Move, store, and accept stablecoins
- **Issuance API** - Issue custom stablecoins
- **Cross-Border Payments** - Global money movement
- **Wallet Infrastructure** - Custodial wallet solutions

**Use Cases:**
- Accept stablecoin payments
- Issue branded stablecoins
- Global treasury management
- Employee payments in digital dollars

### Solana Pay Protocol

**Official Site:** https://solanapay.com/
**Documentation:** https://solana.com/developers/guides/getstarted/intro-to-x402

Solana Pay is an open-source payments framework that CASH can leverage:
- **Instant Transactions** - Near-zero latency
- **Near-Zero Fees** - Minimal gas costs
- **QR Code Payments** - Easy mobile integration
- **Transfer Request URLs** - Interoperable payment links
- **Transaction Requests** - Smart contract interactions

**Key for Micropayments:**
- Supports pay-per-request models
- HTTP 402 payment flows
- MCP (Model Context Protocol) monetization
- Perfect for API/tool access payments

## Setup Steps for Integration

### Phase 1: Research & Planning
1. ✅ Review Phantom CASH documentation
2. ✅ Understand differences from USDC
3. ✅ Identify use case (micropayments for price checks)
4. ⏳ Determine if CASH is available on Solana devnet (likely mainnet-only)

### Phase 2: Development Environment
1. **Install Phantom Wallet SDK**
   ```bash
   npm install @phantom/wallet-sdk
   ```

2. **Install Solana Web3.js** (if not already installed)
   ```bash
   npm install @solana/web3.js @solana/spl-token
   ```

3. **Get CASH Token Mint Address**
   - Research current CASH mint address on Solana
   - Likely different from USDC mint
   - May need to request from Phantom developer support

### Phase 3: Wallet Integration
1. **Connect to Phantom Wallet**
   - Use Phantom SDK to detect wallet
   - Request connection permission
   - Get user's public key

2. **Check CASH Balance**
   - Query CASH token account
   - Display balance in UI
   - Monitor for changes

3. **Implement CASH Transfers**
   - Create transfer instructions
   - Sign with user's wallet
   - Confirm transaction

### Phase 4: Micropayment Flow
1. **HTTP 402 Implementation**
   - Return 402 status when payment required
   - Include payment details in response
   - Accept CASH payment transaction signature
   - Verify payment on-chain
   - Provide requested data/service

2. **Oracle Payment Integration**
   - Replace USDC payment with CASH
   - Update payment amount handling
   - Modify transaction signature verification
   - Test end-to-end flow

### Phase 5: Testing
1. **Testnet/Devnet Testing**
   - Verify CASH availability on devnet
   - Test with small amounts
   - Validate transaction confirmation

2. **Mainnet Preparation**
   - Security audit of payment flow
   - Error handling for failed payments
   - Rate limiting and abuse prevention

## Configuration Requirements

### API Keys & Credentials

**Phantom Wallet SDK:**
- ❌ No API key required for basic wallet connection
- ✅ Uses browser extension or mobile app
- ✅ User authorization via wallet UI

**Bridge API (if using issuance features):**
- ✅ Requires Bridge account
- ✅ API keys from Bridge dashboard
- ✅ KYC/compliance requirements for issuance
- 💰 Pricing based on usage

**Solana RPC:**
- ✅ RPC endpoint for Solana network
- ✅ Can use public endpoints or private providers (QuickNode, Helius, etc.)
- ✅ Rate limits vary by provider

### Environment Variables

```env
# Solana Network
SOLANA_NETWORK=mainnet-beta  # or devnet for testing
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# CASH Token
CASH_MINT_ADDRESS=<to_be_determined>

# Oracle Wallet (for receiving payments)
ORACLE_PRIVATE_KEY=<your_private_key>

# Bridge API (if needed)
BRIDGE_API_KEY=<your_bridge_api_key>
BRIDGE_API_SECRET=<your_bridge_api_secret>

# Payment Configuration
PAYMENT_AMOUNT_CASH=0.0001  # Amount per price check
```

## Important Considerations

### Current Limitations
1. **Mainnet Only:** CASH may only be available on Solana mainnet (not devnet)
2. **Phantom Users:** Requires users to have Phantom wallet with CASH balance
3. **Documentation:** CASH-specific developer docs may be limited (newly launched)
4. **Token Address:** Need to verify official CASH mint address

### Migration from USDC to CASH
- **Backward Compatibility:** Keep USDC support as fallback
- **User Choice:** Allow users to choose payment token
- **Gradual Rollout:** Test with subset of users first
- **Balance Checking:** Implement CASH balance verification before payment

### Compliance & Legal
- **Regulatory Status:** Monitor CASH regulatory compliance
- **Terms of Service:** Review Phantom and Bridge terms
- **User Agreements:** Update user-facing terms for CASH payments
- **Tax Implications:** Consider tax reporting for micropayments

## Next Steps

### Immediate Actions:
1. ✅ Document CASH research findings
2. ⏳ Contact Phantom developer support for:
   - Official CASH mint address
   - Devnet availability
   - Developer resources
   - Integration best practices
3. ⏳ Review Phantom SDK documentation in detail
4. ⏳ Prototype CASH balance checking
5. ⏳ Test CASH transfer on mainnet with small amounts

### Future Enhancements:
- Implement CASH as primary payment method
- Add automatic CASH/USDC fallback
- Display CASH balance alongside USDC
- Integrate Solana Pay QR codes
- Support multiple stablecoins (CASH, USDC, USDT)
- Implement yield generation on CASH balances

## Resources

### Official Documentation
- **Phantom Developer Docs:** https://docs.phantom.com/
- **Phantom Help Center:** https://help.phantom.com/
- **Bridge Platform:** https://www.bridge.xyz/
- **Solana Pay:** https://solanapay.com/
- **Solana Developers:** https://solana.com/developers

### News & Announcements
- **Phantom CASH Launch:** September 30, 2025
- **Stripe Bridge Acquisition:** Enables Open Issuance platform
- **Shopify Integration:** Solana Pay approved for millions of businesses

### Community & Support
- **Phantom Discord:** (check official website)
- **Phantom Twitter:** @phantom
- **Solana Discord:** For general Solana development questions
- **Bridge Support:** support@bridge.xyz (likely)

## Notes for Implementation

### Why Consider CASH over USDC?
1. **Native Integration:** Better UX for Phantom users (15M+ users)
2. **Revenue Model:** Keep 100% of net revenues vs. traditional stablecoin fees
3. **Future Features:** Access to Phantom's payment ecosystem (cards, direct deposit)
4. **Lower Friction:** Simplified payment flows reduce user drop-off
5. **Brand Alignment:** Phantom is leading Solana wallet with strong ecosystem

### When to Use USDC Instead:
1. **Devnet Testing:** If CASH not available on devnet
2. **Broader Compatibility:** USDC accepted by more wallets/exchanges
3. **Liquidity:** USDC has deeper liquidity pools
4. **Established Infrastructure:** More mature tooling and documentation

### Hybrid Approach:
- Support both CASH and USDC
- Let users choose preferred payment token
- Default to CASH for Phantom users
- Fallback to USDC for other wallets
- Monitor adoption and adjust strategy

---

**Document Version:** 1.0  
**Last Updated:** November 9, 2025  
**Status:** Research Phase - No Implementation Yet  
**Next Review:** After contacting Phantom developer support
