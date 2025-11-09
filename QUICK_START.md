# 🚀 Quick Start Guide - Network Configuration

## ⚡ **TL;DR**

All network features are implemented! Switch between devnet and mainnet by changing one environment variable.

---

## 🎯 **Quick Setup**

### **1. Create `.env.local`**
```bash
# Copy the example file
cp .env.local.example .env.local
```

### **2. Configure for Devnet (Recommended)**
```bash
# .env.local
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_DEVNET_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### **3. Run the App**
```bash
npm run dev
```

### **4. Look for the Network Badge**
- **Orange "Devnet"** = Safe testing mode ✅
- **Green "Mainnet"** = Real money mode ⚠️

---

## 🔄 **Switch Networks**

### **To Devnet (Testing):**
```bash
# .env.local
NEXT_PUBLIC_NETWORK=devnet
```
- Restart app
- Orange badge appears
- Test tokens only
- No confirmation modals

### **To Mainnet (Production):**
```bash
# .env.local
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_MAINNET_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```
- Restart app
- Green badge appears
- Red warning banner
- Confirmation modal required
- Real funds used

---

## 🛡️ **Safety Features**

### **Automatic Protection:**
✅ Payment limits (0.001 USDC max on mainnet)
✅ Confirmation modal before mainnet deployment
✅ Visual warnings throughout UI
✅ Cost estimates shown upfront
✅ Two-checkbox confirmation required

### **What You'll See on Mainnet:**
1. Green "Mainnet" badge with warning icon
2. Red banner: "MAINNET MODE ACTIVE"
3. Confirmation modal with cost breakdown
4. Console warnings in browser DevTools

---

## 💰 **Quick Cost Reference**

| Check Frequency | Daily Cost | Monthly Cost |
|----------------|------------|--------------|
| Every 10 min | ~$0.03 | ~$2-3 |
| Every 5 min | ~$0.06 | ~$5-6 |
| Every 1 min | ~$0.30 | ~$25-30 |

*Includes oracle costs + network fees*

---

## 📋 **Testing Checklist**

### **Before Going to Mainnet:**
- [ ] Tested all features on devnet
- [ ] Understand the costs (see `MAINNET_COSTS.md`)
- [ ] Have paid RPC endpoint (Helius/QuickNode)
- [ ] Funded wallet with minimal amount ($5-10)
- [ ] Documented wallet credentials securely
- [ ] Set monthly spending budget

### **First Mainnet Test:**
- [ ] Start with 0.01 USDC only
- [ ] Create one sentinel
- [ ] Monitor for 24 hours
- [ ] Check costs in activity log
- [ ] Verify everything works
- [ ] Then scale up gradually

---

## 🔧 **Troubleshooting**

### **"Network badge not showing"**
- Check if `NetworkIndicator` is in dashboard header
- Verify `.env.local` exists and has `NEXT_PUBLIC_NETWORK`

### **"Confirmation modal not appearing on mainnet"**
- Verify `NEXT_PUBLIC_NETWORK=mainnet` in `.env.local`
- Restart the dev server
- Check browser console for errors

### **"Payment exceeds maximum"**
- Mainnet has 0.001 USDC limit (safety feature)
- This is intentional to prevent accidents
- Adjust check frequency if needed

### **"RPC rate limiting"**
- Use paid RPC endpoint for mainnet
- Get from Helius.dev or QuickNode.com
- Free RPCs are unreliable for production

---

## 📚 **Full Documentation**

| Document | Purpose |
|----------|---------|
| `NETWORK_INTEGRATION.md` | Complete integration guide |
| `MAINNET_COSTS.md` | Detailed cost analysis |
| `SECURITY_FIXES.md` | Security improvements |
| `IMPLEMENTATION_COMPLETE.md` | What was implemented |
| `QUICK_START.md` | This file |

---

## ⚙️ **Key Files**

| File | What It Does |
|------|--------------|
| `lib/networks.ts` | Network configuration |
| `lib/solana.ts` | Solana connection |
| `lib/payments.ts` | Payment handling |
| `components/NetworkIndicator.tsx` | Network badge |
| `components/MainnetConfirmationModal.tsx` | Safety modal |
| `app/dashboard/page.tsx` | Dashboard with network features |

---

## 🎨 **UI Elements**

### **Network Indicator (Header)**
```
┌─────────────────┐
│ 🌐 Devnet  ●   │  ← Orange badge
└─────────────────┘

┌─────────────────┐
│ ⚠️ Mainnet ●   │  ← Green badge + warning
└─────────────────┘
```

### **Mainnet Warning Banner**
```
┌────────────────────────────────────────────┐
│ ⚠️ MAINNET MODE ACTIVE - Real funds used! │
└────────────────────────────────────────────┘
```

### **Confirmation Modal**
```
┌──────────────────────────────────────┐
│ ⚠️ Mainnet Deployment Warning       │
│                                      │
│ Cost Estimates:                      │
│ Per Check:  $0.0001                  │
│ Per Day:    $0.144                   │
│ Per Month:  $4.32                    │
│                                      │
│ ☑ I understand real funds used      │
│ ☑ I accept the financial risk       │
│                                      │
│ [Cancel] [Deploy on Mainnet]        │
└──────────────────────────────────────┘
```

---

## 🚨 **Important Warnings**

### **DO:**
✅ Test thoroughly on devnet first
✅ Start mainnet with small amounts
✅ Monitor costs daily
✅ Use paid RPC endpoints
✅ Keep SOL for transaction fees
✅ Document wallet credentials

### **DON'T:**
❌ Skip devnet testing
❌ Deploy to mainnet without understanding costs
❌ Use free RPC for mainnet production
❌ Share wallet private keys
❌ Ignore activity logs
❌ Deploy without budget limits

---

## 💡 **Pro Tips**

1. **Always check the badge** - Know which network you're on
2. **Read the modal** - Cost estimates are accurate
3. **Start small** - Test with 0.01 USDC first
4. **Monitor actively** - Check activity logs daily
5. **Set budgets** - Know your monthly limit
6. **Use devnet** - Free testing forever

---

## 🎯 **Success Indicators**

### **You're Ready for Mainnet When:**
✅ All features work perfectly on devnet
✅ You understand the cost structure
✅ You have a paid RPC endpoint configured
✅ You've set a monthly budget
✅ You have SOL for transaction fees
✅ You're comfortable with the risks

### **You Should Stay on Devnet If:**
⚠️ Still learning how the app works
⚠️ Testing new features
⚠️ Experimenting with configurations
⚠️ Not ready for real costs
⚠️ Don't have budget allocated

---

## 📞 **Need Help?**

1. Check the documentation files
2. Review inline code comments
3. Look at example configurations
4. Test on devnet first
5. Start with minimal amounts

---

## ✅ **Quick Verification**

After setup, verify:
- [ ] App starts without errors
- [ ] Network badge is visible
- [ ] Badge shows correct network
- [ ] Can create sentinel on devnet
- [ ] Confirmation modal works on mainnet
- [ ] Explorer links have correct cluster

---

**You're all set!** 🎉

The network configuration system is fully implemented and ready to use. Start with devnet, test thoroughly, then carefully move to mainnet when ready.

**Remember: Devnet = Free Testing, Mainnet = Real Money** 💰
