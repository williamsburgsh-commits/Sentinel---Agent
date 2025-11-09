# Mainnet Costs & Economics 💰

## Overview

Running Sentinel on Solana Mainnet involves **real costs** using actual USDC or CASH tokens. This document provides detailed cost breakdowns and best practices for managing expenses.

---

## 🔍 Cost Components

### 1. **Price Check Costs**
Each price check requires payment to the Switchboard oracle network.

| Payment Method | Cost per Check | Notes |
|---------------|----------------|-------|
| **USDC** | ~$0.0001 | Stablecoin, predictable costs |
| **CASH** | ~$0.0001 | Alternative payment token |

### 2. **Solana Network Fees**
Every transaction on Solana incurs a small network fee.

| Transaction Type | Fee (SOL) | Fee (USD) |
|-----------------|-----------|-----------|
| Price Check | ~0.000005 | ~$0.0005 |
| Wallet Creation | ~0.00001 | ~$0.001 |

**Note:** Fees vary based on network congestion. Prices shown assume SOL = $100.

---

## 📊 Cost Examples

### **Example 1: Conservative Monitoring**
- **Check Frequency:** Every 5 minutes
- **Checks per Day:** 288
- **Daily Cost:** ~$0.0288 USDC + ~$0.144 SOL fees
- **Monthly Cost:** ~$0.86 USDC + ~$4.32 SOL fees
- **Total Monthly:** ~$5.18

### **Example 2: Standard Monitoring**
- **Check Frequency:** Every 1 minute
- **Checks per Day:** 1,440
- **Daily Cost:** ~$0.144 USDC + ~$0.72 SOL fees
- **Monthly Cost:** ~$4.32 USDC + ~$21.60 SOL fees
- **Total Monthly:** ~$25.92

### **Example 3: High-Frequency Monitoring**
- **Check Frequency:** Every 30 seconds
- **Checks per Day:** 2,880
- **Daily Cost:** ~$0.288 USDC + ~$1.44 SOL fees
- **Monthly Cost:** ~$8.64 USDC + ~$43.20 SOL fees
- **Total Monthly:** ~$51.84

### **Example 4: Ultra High-Frequency**
- **Check Frequency:** Every 10 seconds
- **Checks per Day:** 8,640
- **Daily Cost:** ~$0.864 USDC + ~$4.32 SOL fees
- **Monthly Cost:** ~$25.92 USDC + ~$129.60 SOL fees
- **Total Monthly:** ~$155.52

---

## 💡 Cost Optimization Strategies

### **1. Adjust Check Frequency**
- **Low volatility periods:** Check every 5-10 minutes
- **High volatility periods:** Check every 30-60 seconds
- **Overnight hours:** Reduce frequency or pause

### **2. Use Multiple Sentinels Wisely**
- Each sentinel has independent costs
- Running 5 sentinels at 1-minute intervals = 5x the cost
- Consider if you really need multiple price thresholds

### **3. Pause When Not Needed**
- Pause sentinels during weekends or holidays
- Resume only when actively monitoring
- No costs incurred while paused

### **4. Set Realistic Thresholds**
- Avoid setting thresholds that trigger too frequently
- Each alert costs the same as a regular check
- Balance between responsiveness and cost

---

## 🛡️ Safety Features

### **Built-in Protections:**

✅ **Maximum Payment Cap:** 0.001 USDC/CASH per transaction
✅ **Warning Threshold:** Alert when spending >0.0001 USDC
✅ **Mainnet Confirmation:** Required before creating sentinels
✅ **Network Indicator:** Always visible in UI
✅ **Cost Estimates:** Shown before deployment

### **Manual Safeguards:**

1. **Start Small:** Test with 0.01 USDC first
2. **Monitor Spending:** Check activity logs regularly
3. **Set Budgets:** Decide max daily/monthly spend
4. **Use Alerts:** Get notified of unusual activity
5. **Regular Reviews:** Audit sentinel performance weekly

---

## 💳 Funding Your Wallet

### **Minimum Balances Required:**

| Asset | Minimum | Recommended | Purpose |
|-------|---------|-------------|---------|
| **SOL** | 0.01 | 0.1 | Transaction fees |
| **USDC** | $1 | $10 | Price check payments |
| **CASH** | $1 | $10 | Alternative payment |

### **How to Fund:**

1. **Get SOL:**
   - Buy on exchanges (Coinbase, Binance, Kraken)
   - Transfer to your sentinel wallet
   - Keep extra for fees

2. **Get USDC:**
   - Buy USDC on exchanges
   - Use Solana-native USDC (SPL token)
   - Mint address: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

3. **Get CASH (if using):**
   - Acquire CASH tokens
   - Verify mint address matches mainnet config
   - Mint address: `CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT`

---

## 📈 ROI Considerations

### **When Mainnet Makes Sense:**

✅ **Trading/Arbitrage:** Price alerts for profitable trades
✅ **Risk Management:** Protect large positions
✅ **Market Analysis:** Real-time data for decisions
✅ **Automated Strategies:** Integration with trading bots

### **When to Use Devnet Instead:**

⚠️ **Testing:** Always test new configurations on devnet
⚠️ **Learning:** Experiment without financial risk
⚠️ **Development:** Build and debug features
⚠️ **Demonstrations:** Show functionality to others

---

## 🔧 Cost Monitoring

### **Track Your Spending:**

1. **Activity Logs:**
   - View all price checks in dashboard
   - See cost per check
   - Calculate daily totals

2. **Statistics:**
   - Total checks performed
   - Total USDC/CASH spent
   - Average cost per check
   - Alerts triggered

3. **Wallet Balance:**
   - Monitor SOL balance for fees
   - Track USDC/CASH remaining
   - Set up low-balance alerts

### **Cost Analysis Queries:**

```typescript
// Get total spent this month
const monthlyStats = await getActivityStats(userId);
console.log(`Monthly spend: $${monthlyStats.total_spent}`);

// Calculate daily average
const dailyAverage = monthlyStats.total_spent / 30;
console.log(`Daily average: $${dailyAverage}`);

// Estimate remaining budget
const remainingBudget = monthlyBudget - monthlyStats.total_spent;
console.log(`Budget remaining: $${remainingBudget}`);
```

---

## ⚠️ Important Warnings

### **🚨 CRITICAL:**

1. **Irreversible Transactions:** All mainnet transactions are final
2. **No Refunds:** Oracle payments cannot be reversed
3. **Network Fees:** SOL fees are consumed even if checks fail
4. **Price Volatility:** SOL price affects fee costs in USD
5. **Rate Limits:** Some RPC endpoints have rate limits

### **🔐 Security:**

- **Never share private keys:** Wallet keys are sensitive
- **Use hardware wallets:** For large amounts
- **Regular backups:** Save wallet credentials securely
- **Monitor activity:** Watch for unauthorized access
- **Separate wallets:** Don't use main trading wallet

---

## 📊 Cost Comparison: Devnet vs Mainnet

| Feature | Devnet | Mainnet |
|---------|--------|---------|
| **Token Value** | $0 (test tokens) | Real USD value |
| **Network Fees** | Free (test SOL) | ~$0.0005 per tx |
| **Oracle Costs** | Free | ~$0.0001 per check |
| **Risk Level** | Zero | Financial risk |
| **Best For** | Testing, learning | Production use |

---

## 🎯 Recommended Approach

### **Phase 1: Devnet Testing (1-2 weeks)**
1. Create sentinels on devnet
2. Test all features thoroughly
3. Verify Discord webhooks work
4. Understand cost patterns
5. Optimize check frequency

### **Phase 2: Mainnet Pilot (1 week)**
1. Fund wallet with minimal amounts ($5-10)
2. Create ONE sentinel only
3. Use conservative check frequency (5 min)
4. Monitor costs closely
5. Verify everything works as expected

### **Phase 3: Production Deployment**
1. Fund wallet adequately
2. Create additional sentinels as needed
3. Optimize based on pilot learnings
4. Set up monitoring and alerts
5. Regular cost reviews

---

## 📞 Support & Resources

### **Cost Calculators:**
- Use the in-app cost estimator before creating sentinels
- Calculate based on your specific check frequency
- Factor in both oracle costs and network fees

### **Monitoring Tools:**
- Solscan: https://solscan.io
- Solana Explorer: https://explorer.solana.com
- Wallet balance tracking in dashboard

### **Community:**
- Discord: Get help from other users
- GitHub: Report issues or suggestions
- Documentation: Detailed guides and FAQs

---

## 🔄 Regular Maintenance

### **Weekly Tasks:**
1. Review activity logs
2. Check wallet balances
3. Verify sentinel performance
4. Adjust check frequencies if needed
5. Pause unused sentinels

### **Monthly Tasks:**
1. Analyze total costs
2. Compare to budget
3. Optimize sentinel configurations
4. Review ROI on alerts
5. Plan next month's strategy

---

## 💰 Final Cost Summary

**Typical Monthly Costs for 1 Sentinel:**

| Check Frequency | Monthly Cost | Use Case |
|----------------|--------------|----------|
| Every 10 min | ~$2-3 | Casual monitoring |
| Every 5 min | ~$5-6 | Standard monitoring |
| Every 1 min | ~$25-30 | Active monitoring |
| Every 30 sec | ~$50-60 | High-frequency |

**Remember:** These are estimates. Actual costs depend on:
- SOL price volatility
- Network congestion
- Oracle pricing changes
- Number of sentinels
- Alert frequency

---

## ✅ Best Practices Checklist

- [ ] Tested thoroughly on devnet first
- [ ] Understand all cost components
- [ ] Set monthly budget limit
- [ ] Funded wallet with appropriate amounts
- [ ] Configured reasonable check frequencies
- [ ] Set up activity monitoring
- [ ] Created low-balance alerts
- [ ] Documented wallet credentials securely
- [ ] Reviewed security best practices
- [ ] Have a cost optimization plan

---

**Remember: Start small, monitor closely, and scale gradually!** 🚀

For questions or support, refer to the main documentation or community channels.
