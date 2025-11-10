# Network Configuration Integration Guide 🌐

## Overview

Complete devnet/mainnet support with safety features, cost warnings, and network switching capabilities.

---

## ✅ **Components Created**

### **1. `lib/networks.ts`** - Network Configuration
- Devnet and Mainnet configurations
- RPC endpoints, token mints, Switchboard oracles
- Safety limits and validation
- Explorer URL generation
- Network detection utilities

### **2. `components/NetworkIndicator.tsx`** - Visual Network Badge
- Shows current network (Devnet/Mainnet)
- Color-coded badges (orange/green)
- Warning icon for mainnet
- Hover tooltip with details

### **3. `components/MainnetConfirmationModal.tsx`** - Safety Modal
- Confirms mainnet deployment
- Shows cost estimates
- Requires checkbox confirmations
- Prevents accidental mainnet usage

### **4. `MAINNET_COSTS.md`** - Cost Documentation
- Detailed cost breakdowns
- Usage examples
- Best practices
- ROI considerations

### **5. `.env.local.example`** - Updated Environment Variables
- Network selection
- Devnet/Mainnet RPC endpoints
- Configuration examples

---

## 🚀 **Quick Start**

### **Step 1: Update Environment Variables**

Create or update `.env.local`:

```bash
# Network Configuration
NEXT_PUBLIC_NETWORK=devnet  # or 'mainnet'

# RPC Endpoints
NEXT_PUBLIC_DEVNET_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_MAINNET_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### **Step 2: Add NetworkIndicator to Header**

Update your dashboard header:

```tsx
import NetworkIndicator from '@/components/NetworkIndicator';

// In your header component
<div className="flex items-center gap-4">
  <NetworkIndicator />
  {/* Other header items */}
</div>
```

### **Step 3: Add Mainnet Confirmation to Sentinel Creation**

Update dashboard page:

```tsx
import { isMainnet } from '@/lib/networks';
import MainnetConfirmationModal from '@/components/MainnetConfirmationModal';

const [showMainnetModal, setShowMainnetModal] = useState(false);

const handleCreateSentinel = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Check if on mainnet
  if (isMainnet()) {
    setShowMainnetModal(true);
    return;
  }
  
  // Proceed with creation for devnet
  await createSentinelNow();
};

const createSentinelNow = async () => {
  // Your existing sentinel creation logic
};

// In JSX
<MainnetConfirmationModal
  isOpen={showMainnetModal}
  onClose={() => setShowMainnetModal(false)}
  onConfirm={() => {
    setShowMainnetModal(false);
    createSentinelNow();
  }}
  estimatedCostPerCheck={0.0001}
  checksPerDay={1440} // Based on check frequency
/>
```

### **Step 4: Update Solana Connection**

Update `lib/solana.ts` or wherever you create connections:

```tsx
import { Connection } from '@solana/web3.js';
import { getCurrentNetwork } from '@/lib/networks';

export function getSolanaConnection(): Connection {
  const network = getCurrentNetwork();
  return new Connection(network.rpcUrl, 'confirmed');
}
```

### **Step 5: Update Payment Logic**

Update `lib/payments.ts`:

```tsx
import { getTokenMint, validatePaymentAmount, isMainnet } from '@/lib/networks';

export async function makePayment(amount: number, method: 'usdc' | 'cash') {
  // Validate amount
  const validation = validatePaymentAmount(amount);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Show warning for mainnet
  if (validation.warning) {
    console.warn(validation.warning);
  }
  
  // Get correct mint address
  const mintAddress = getTokenMint(method);
  
  // Mainnet safety check
  if (isMainnet()) {
    console.warn('🚨 MAINNET TRANSACTION - REAL FUNDS WILL BE USED');
  }
  
  // Proceed with payment...
}
```

### **Step 6: Update Explorer Links**

Update anywhere you show transaction links:

```tsx
import { getExplorerUrl } from '@/lib/networks';

// For transactions
const txUrl = getExplorerUrl(signature, 'tx');

// For addresses
const addressUrl = getExplorerUrl(walletAddress, 'address');

// Use in JSX
<a href={txUrl} target="_blank" rel="noopener noreferrer">
  View Transaction
</a>
```

---

## 🔧 **Advanced Integration**

### **Network-Specific Styling**

Add visual warnings when on mainnet:

```tsx
import { getNetworkDisplayInfo } from '@/lib/networks';

function DashboardPage() {
  const networkInfo = getNetworkDisplayInfo();
  
  return (
    <div className={networkInfo.isMainnet ? 'border-2 border-red-500/30' : ''}>
      {networkInfo.showWarning && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg mb-4">
          <p className="text-red-400 font-semibold">
            ⚠️ MAINNET MODE - Real funds will be used!
          </p>
        </div>
      )}
      
      {/* Rest of dashboard */}
    </div>
  );
}
```

### **Cost Estimation**

Calculate costs before showing confirmation:

```tsx
function calculateCosts(checkFrequencyMinutes: number) {
  const checksPerDay = (24 * 60) / checkFrequencyMinutes;
  const costPerCheck = 0.0001; // USDC
  const dailyCost = checksPerDay * costPerCheck;
  const monthlyCost = dailyCost * 30;
  
  return {
    checksPerDay,
    costPerCheck,
    dailyCost,
    monthlyCost,
  };
}

// Use in modal
const costs = calculateCosts(checkFrequency);
<MainnetConfirmationModal
  estimatedCostPerCheck={costs.costPerCheck}
  checksPerDay={costs.checksPerDay}
  {...}
/>
```

### **Network Switching**

Add ability to switch networks (requires restart):

```tsx
function NetworkSettings() {
  const currentNetwork = getCurrentNetwork().name;
  
  return (
    <div>
      <p>Current Network: {currentNetwork}</p>
      <p className="text-sm text-gray-400">
        To switch networks, update NEXT_PUBLIC_NETWORK in .env.local and restart the app
      </p>
    </div>
  );
}
```

---

## 🛡️ **Safety Features**

### **1. Payment Limits**

```typescript
// Devnet: 100 USDC max
// Mainnet: 0.001 USDC max (safety limit)

const validation = validatePaymentAmount(amount);
if (!validation.valid) {
  // Show error, prevent transaction
}
```

### **2. Mainnet Warnings**

```typescript
if (isMainnet()) {
  console.warn('🚨 MAINNET MODE ACTIVE - REAL FUNDS WILL BE USED! 🚨');
}
```

### **3. Confirmation Modal**

- Requires two checkbox confirmations
- Shows estimated costs
- Cannot proceed without acknowledgment

### **4. Visual Indicators**

- Network badge always visible
- Mainnet shows warning icon
- Different colors for each network

---

## 📋 **Testing Checklist**

### **Devnet Testing:**
- [ ] Set `NEXT_PUBLIC_NETWORK=devnet`
- [ ] Verify orange badge shows "Devnet"
- [ ] Create sentinel without confirmation modal
- [ ] Verify test tokens are used
- [ ] Check Solscan links include `?cluster=devnet`
- [ ] Confirm no real funds are used

### **Mainnet Testing:**
- [ ] Set `NEXT_PUBLIC_NETWORK=mainnet`
- [ ] Verify green badge shows "Mainnet" with warning icon
- [ ] Attempt to create sentinel
- [ ] Confirmation modal appears
- [ ] Cost estimates are shown
- [ ] Both checkboxes required
- [ ] Start with 0.01 USDC test
- [ ] Monitor wallet balance
- [ ] Verify real USDC is deducted
- [ ] Check Solscan links (no cluster param)

---

## 🔑 **Environment Variables Reference**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_NETWORK` | Yes | `devnet` | Network to use (`devnet` or `mainnet`) |
| `NEXT_PUBLIC_DEVNET_RPC` | No | Solana public RPC | Devnet RPC endpoint |
| `NEXT_PUBLIC_MAINNET_RPC` | For mainnet | Solana public RPC | Mainnet RPC (use paid endpoint!) |

---

## 💰 **Cost Management**

### **Monitor Spending:**

```tsx
// Get user's total spent
const stats = await getActivityStats(userId);
console.log(`Total spent: $${stats.total_spent}`);

// Calculate daily average
const dailyAvg = stats.total_spent / 30;
console.log(`Daily average: $${dailyAvg}`);
```

### **Set Budgets:**

```tsx
const DAILY_BUDGET = 1.0; // $1 per day
const MONTHLY_BUDGET = 30.0; // $30 per month

if (stats.total_spent > MONTHLY_BUDGET) {
  // Pause sentinels or alert user
}
```

---

## 🚨 **Common Issues**

### **Issue: "CASH token not available on devnet"**
**Solution:** CASH is only available on mainnet. Use USDC on devnet.

### **Issue: RPC rate limiting**
**Solution:** Use a paid RPC endpoint (Helius, QuickNode) for mainnet.

### **Issue: Insufficient SOL for fees**
**Solution:** Ensure wallet has at least 0.01 SOL for transaction fees.

### **Issue: Payment exceeds maximum**
**Solution:** Mainnet has 0.001 USDC limit. This is a safety feature.

---

## 📚 **Additional Resources**

- **Network Config:** `lib/networks.ts`
- **Cost Documentation:** `MAINNET_COSTS.md`
- **Environment Setup:** `.env.local.example`
- **Solscan Explorer:** https://solscan.io
- **Helius RPC:** https://helius.dev
- **QuickNode RPC:** https://quicknode.com

---

## ✅ **Implementation Checklist**

- [ ] Created `.env.local` with network configuration
- [ ] Added `NetworkIndicator` to app header
- [ ] Integrated `MainnetConfirmationModal` in sentinel creation
- [ ] Updated Solana connection to use network config
- [ ] Updated payment logic with validation
- [ ] Updated explorer links to use `getExplorerUrl`
- [ ] Added network-specific styling/warnings
- [ ] Tested thoroughly on devnet
- [ ] Tested carefully on mainnet with small amounts
- [ ] Documented costs and budgets
- [ ] Set up monitoring and alerts

---

## 🎯 **Best Practices**

1. **Always test on devnet first**
2. **Start mainnet with minimal funds** ($5-10)
3. **Monitor costs daily**
4. **Use paid RPC for mainnet** (reliability)
5. **Set spending budgets**
6. **Pause sentinels when not needed**
7. **Review activity logs regularly**
8. **Keep SOL balance for fees**
9. **Document wallet credentials securely**
10. **Have a cost optimization plan**

---

**The network configuration system is production-ready with comprehensive safety features!** 🚀

For questions or issues, refer to `MAINNET_COSTS.md` or the main documentation.
