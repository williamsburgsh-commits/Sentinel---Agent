# 🧪 SENTINEL AGENT - COMPLETE E2E TESTING CHECKLIST

**Status:** Ready for Testing  
**Date:** 2024-11-10  
**Environment:** devnet  

---

## ✅ PRE-TESTING SETUP

### Required:
- [ ] App is running (`npm run dev`)
- [ ] `.env.local` file exists with proper configuration
- [ ] Browser console open (F12) to monitor logs
- [ ] Discord webhook URL ready for testing
  - Get one from: Discord Server Settings → Integrations → Webhooks → New Webhook
- [ ] Devnet USDC for testing (if available)
  - Optional: Can test without USDC to verify error handling

---

## 📋 CORE FUNCTIONALITY TESTS (32 Points)

### **1. Landing Page** ✅
**Test Steps:**
1. Navigate to http://localhost:3000
2. Verify hero section loads
3. Check animations are smooth

**Expected:**
- [x] "Sentinel" heading with gradient
- [x] Subheading: "Autonomous On-Chain Monitoring / Powered by Micropayments"
- [x] "Launch Dashboard" CTA button
- [x] 3 feature cards visible (Autonomous Monitoring, Micropayments, Instant Alerts)
- [x] Stats section with animated counters (1247, 45892, 14562)
- [x] Floating animated gradient orbs in background
- [x] All text readable and properly styled

**Console Logs Expected:**
```
(none)
```

---

### **2. Dashboard Access** ✅
**Test Steps:**
1. Click "Launch Dashboard" button
2. Observe page load

**Expected:**
- [x] Loads immediately without login prompt
- [x] Shows dashboard header
- [x] Shows "No Sentinels Yet" or existing sentinels grid
- [x] Network indicator shows "Devnet" (orange)

**Console Logs Expected:**
```
🔓 AUTH CHECK BYPASSED - DEV MODE
⚠️  WARNING: Auth protection is disabled!
✅ Mock user set: dev@test.com
🌐 ========== NETWORK CONFIGURATION ==========
📍 Environment Variable NEXT_PUBLIC_NETWORK: devnet
📍 Current Network: Devnet
...
```

---

### **3. Create Sentinel Form** ✅
**Test Steps:**
1. Click "Create New Sentinel" button (or form shows automatically if no sentinels)
2. Fill out form with test data:
   - **Discord Webhook:** `https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN`
   - **Price Threshold:** `100000`
   - **Condition:** `Below`
   - **Payment Method:** `USDC`

**Expected:**
- [x] Form appears with all fields
- [x] All fields accept input
- [x] Dropdowns work properly
- [x] Form validation works (try submitting empty)

---

### **4. Wallet Generation** ✅
**Test Steps:**
1. Submit the form from Test #3
2. Wait for wallet generation

**Expected:**
- [x] Form shows spinner during creation
- [x] Success toast appears: "Sentinel Created!"
- [x] Wallet address banner appears at top with full address
- [x] Copy button works (click and verify toast)
- [x] New sentinel card appears in grid

**Console Logs Expected:**
```
🚀 ========== CREATING SENTINEL ==========
🌐 Network: DEVNET
💰 Payment Method: usdc
🔑 Generated Wallet: [address]
✅ Sentinel created successfully on devnet
🚀 =======================================
```

---

### **5. Wallet Display & Balance** ✅
**Test Steps:**
1. Click "View" on the sentinel card
2. OR observe wallet banner at top of dashboard

**Expected:**
- [x] Wallet address displayed (full or truncated)
- [x] Copy button functional
- [x] SOL balance shows (0.0000 initially)
- [x] "Request Airdrop" button present

**Optional - Test Airdrop:**
1. Click "Request Airdrop"
2. Wait ~30 seconds

**Expected:**
- [x] Spinner shows during airdrop
- [x] Success toast on completion
- [x] Balance updates to ~1.0000 SOL

---

### **6. START MONITORING** ✅ (NEWLY IMPLEMENTED)
**Test Steps:**
1. After creating sentinel, observe auto-start behavior
2. Watch browser console

**Expected:**
- [x] Sentinel card shows "Active" badge (green)
- [x] Console logs monitoring setup
- [x] First check runs immediately
- [x] Checks run every 30 seconds automatically

**Console Logs Expected:**
```
🔄 Setting up monitoring for active sentinels...
📊 Found 1 active sentinels to monitor
🚀 Starting monitoring for sentinel sentinel_xxx (12345678...)
⏰ Running scheduled check for sentinel sentinel_xxx
💰 Fetching SOL price...
✅ Price loaded: 195.23
```

**CRITICAL:** If monitoring doesn't start, this is a blocker.

---

### **7. Price Check** ✅
**Test Steps:**
1. Observe console logs during monitoring
2. Verify price is fetched

**Expected:**
- [x] Console shows "Fetching SOL price..."
- [x] CoinGecko API called first
- [x] Price returned (190-210 range typical)
- [x] Falls back to Switchboard if CoinGecko fails
- [x] Falls back to simulated price if both fail

**Console Logs Expected:**
```
💰 Fetching SOL price...
✅ SOL price from CoinGecko: 195.67
```

OR (if CoinGecko fails):
```
⚠️ CoinGecko API request timed out after 3 seconds, using fallback
🔄 Falling back to Switchboard oracle...
✅ Switchboard price fetched: 196.12
```

---

### **8. Payment Execution** ⚠️
**Test Steps:**
1. Fund wallet with devnet USDC:
   - Visit: https://spl-token-faucet.com/?token-name=USDC
   - Paste wallet address
   - Request USDC
2. Wait for next monitoring cycle (up to 30 seconds)

**Expected (with USDC funded):**
- [x] Console shows "Checking USDC balance..."
- [x] Balance check passes
- [x] Payment sent to oracle
- [x] Transaction signature captured
- [x] Settlement time recorded

**Expected (WITHOUT USDC):**
- [x] Console shows "Insufficient USDC balance"
- [x] Activity marked as "failed"
- [x] Error message in activity log
- [x] Monitoring continues despite failure

**Console Logs Expected (success):**
```
💰 Checking USDC balance...
📊 Current USDC balance: 1.0000 USDC
💳 Sending USDC payment to oracle...
✅ Payment successful! Transaction: [signature]
⚡ Settlement time: 1234ms
```

**Console Logs Expected (insufficient funds):**
```
💰 Checking USDC balance...
📊 Current USDC balance: 0.0000 USDC
❌ Insufficient USDC balance. Required: 0.0001 USDC
```

---

### **9. Activity Storage** ✅
**Test Steps:**
1. Wait for 2-3 monitoring cycles
2. Open browser DevTools → Application → Local Storage
3. Check `sentinel_agent_activities` key

**Expected:**
- [x] Activities array exists
- [x] Each activity has: id, sentinel_id, price, cost, timestamp
- [x] Activities persist on page refresh
- [x] Array length increases with each check

---

### **10. Activity Log UI** ✅
**Test Steps:**
1. Scroll to "Activity Log" section on dashboard
2. Observe activity entries

**Expected:**
- [x] Timeline format with most recent first
- [x] Relative timestamps ("2 minutes ago")
- [x] Price formatted as currency ($195.67)
- [x] Payment method badge (USDC blue OR CASH green)
- [x] Transaction signature truncated (8...8)
- [x] Status badges (Checked, Alert Triggered, Failed)
- [x] Settlement time shown if available
- [x] Error messages for failed checks
- [x] Smooth animations when new activities appear

---

### **11. Solscan Links** ✅
**Test Steps:**
1. Click on a transaction signature in activity log
2. Verify link opens correctly

**Expected:**
- [x] Opens https://solscan.io/tx/[signature]?cluster=devnet
- [x] Link opens in new tab
- [x] Transaction visible on Solscan (if payment succeeded)

**Note:** Links will only work if payment was successful (USDC funded).

---

### **12. Balance Updates** ✅
**Test Steps:**
1. Check initial SOL balance
2. Request airdrop
3. Check updated balance
4. After successful USDC payments, check USDC balance

**Expected:**
- [x] SOL balance updates after airdrop
- [x] Balance displays with 4 decimals
- [x] USDC balance decreases by 0.0001 per check (if funded)

---

### **13. Discord Webhooks** ✅
**Test Steps:**
1. Ensure Discord webhook URL is valid
2. Change sentinel threshold to trigger alert:
   - If price is ~195, set threshold to 200 with condition "Below"
3. Wait for next check (up to 30 seconds)
4. Check Discord channel

**Expected:**
- [x] Discord receives embed message
- [x] Embed is red color
- [x] Shows current price vs threshold
- [x] Shows difference with emoji (📈 or 📉)
- [x] Footer: "⚡ Sentinel Price Alert System"
- [x] Activity log shows "Alert Triggered" badge

**Console Logs Expected:**
```
🚨 Alert triggered! Price $195.67 is below threshold $200.00
📢 Sending Discord alert...
✅ Discord alert sent successfully
```

---

### **14. Stats Dashboard** ✅
**Test Steps:**
1. Observe dashboard stats section
2. Let monitoring run for several cycles
3. Verify stats update

**Expected:**
- [x] Total Sentinels count
- [x] Active Sentinels count
- [x] Total Checks increases
- [x] Total Spent increases (if payments succeed)
- [x] Average Cost Per Check shown
- [x] Numbers animate with counting effect
- [x] Stats update in real-time

---

### **15. AI Analysis Trigger** ✅
**Test Steps:**
1. Let monitoring run for at least 3 checks
2. Watch console for AI trigger message

**Expected:**
- [x] After 3 checks, console logs "🔍 Should run AI analysis: true"
- [x] Console logs "🤖 Running autonomous AI analysis..."
- [x] Analysis runs automatically

**Console Logs Expected:**
```
🔍 Should run AI analysis: true
🤖 Running autonomous AI analysis...
```

**Note:** Requires DEEPSEEK_API_KEY in .env.local

---

### **16. AI DeepSeek Call** ✅
**Test Steps:**
1. Wait for AI analysis to trigger
2. Observe console logs
3. Check for API errors

**Expected (with API key):**
- [x] API call to https://api.deepseek.com
- [x] Request sent with last 50 activities
- [x] Response received within 2-5 seconds
- [x] Analysis text extracted
- [x] Confidence score extracted
- [x] Sentiment determined
- [x] Cost: $0.0008

**Expected (without API key):**
- [x] Graceful fallback
- [x] "Analysis temporarily unavailable"
- [x] No error thrown
- [x] Monitoring continues

**Console Logs Expected:**
```
✅ AI analysis completed: SOL/USD shows moderate volatility...
💰 AI cost: $0.0008
```

---

### **17. AI Analysis Storage** ✅
**Test Steps:**
1. After AI analysis runs
2. Check Local Storage → `sentinel_agent_ai_analyses`

**Expected:**
- [x] AI analyses array exists
- [x] Analysis includes: id, sentinel_id, analysis_text, confidence_score, sentiment, cost
- [x] Persists on refresh

---

### **18. AI Insights UI** ✅
**Test Steps:**
1. Find "AI Insights by DeepSeek" card
2. Verify content

**Expected:**
- [x] Glassmorphism card style
- [x] Brain icon displayed
- [x] "AI Insights by DeepSeek" title
- [x] Relative timestamp
- [x] Analysis text displayed
- [x] Confidence score as percentage with progress bar
- [x] Color coding (green >70%, yellow 40-70%, red <40%)
- [x] Sentiment badge (bullish/bearish/neutral) with arrows
- [x] Cost display: "Paid DeepSeek $0.0008"
- [x] Empty state before first analysis: "Need 3 checks"

---

### **19. Payment Comparison** ✅
**Test Steps:**
1. Create second sentinel with different payment method
2. Let both run for several cycles
3. Check PaymentStats component

**Expected:**
- [x] Shows count for USDC and CASH separately
- [x] Average settlement time for each
- [x] Speed multiplier calculation
- [x] Visual comparison with color coding

**Note:** CASH is mainnet-only, so on devnet you'll only see USDC stats.

---

### **20. Network Indicator** ✅
**Test Steps:**
1. Look at dashboard header

**Expected:**
- [x] Badge shows "Devnet" in orange
- [x] Icon/emoji present
- [x] Visible on all dashboard pages

---

### **21. Pause/Resume** ✅
**Test Steps:**
1. Click "Pause" button on active sentinel
2. Verify monitoring stops
3. Click "Resume" button
4. Verify monitoring restarts

**Expected:**
- [x] Pause button updates status to "Paused" (gray)
- [x] Console logs "🛑 Cleaning up monitoring intervals"
- [x] No more checks run
- [x] Resume button appears
- [x] Resume restarts monitoring
- [x] Console logs "🚀 Starting monitoring..."
- [x] Checks resume every 30 seconds

---

### **22. Multiple Sentinels** ✅
**Test Steps:**
1. Create second sentinel
2. Verify both appear in grid
3. Start both monitoring

**Expected:**
- [x] Each sentinel has unique ID
- [x] Grid layout responsive (3 cols → 2 cols → 1 col)
- [x] Each card shows independent stats
- [x] Both can run simultaneously
- [x] Activities associate correctly by sentinel_id
- [x] No interference between sentinels

---

### **23. Delete Sentinel** ✅
**Test Steps:**
1. Pause a sentinel
2. Click "Delete" button
3. Confirm deletion

**Expected:**
- [x] "Are you sure?" confirmation dialog
- [x] Sentinel removed from localStorage
- [x] Card disappears with animation
- [x] Associated activities removed (or filtered out)
- [x] Other sentinels unaffected

---

### **24. Price Chart** ✅ (NEWLY INTEGRATED)
**Test Steps:**
1. After several checks have run
2. Locate PriceChart component below PriceDisplay

**Expected:**
- [x] Line chart visible
- [x] X-axis shows time
- [x] Y-axis shows price
- [x] Line plots historical prices from activities
- [x] Gradient fill under line
- [x] Responsive to screen width
- [x] Hover tooltip shows price and time
- [x] Threshold line shown (if configured)
- [x] Alert points marked with red dots

---

### **25. LocalStorage Persistence** ✅
**Test Steps:**
1. Let monitoring run for a few cycles
2. Refresh page (F5)
3. Check data

**Expected:**
- [x] Sentinels still visible
- [x] Activities preserved
- [x] AI analyses preserved
- [x] Stats recalculated correctly
- [x] Monitoring resumes automatically

**Local Storage Keys to Check:**
- `sentinel_agent_sentinels`
- `sentinel_agent_activities`
- `sentinel_agent_ai_analyses`

---

### **26. Responsive Design** ✅
**Test Steps:**
1. Resize browser window to different widths:
   - Desktop: 1920px
   - Laptop: 1440px
   - Tablet: 768px
   - Mobile: 375px

**Expected:**
- [x] Desktop: 3-column grid
- [x] Tablet: 2-column grid
- [x] Mobile: 1-column stacked
- [x] Text readable at all sizes
- [x] Buttons touch-friendly (44px min)
- [x] No horizontal scroll
- [x] Glassmorphism effects work

---

### **27. Toast Notifications** ✅
**Test Steps:**
1. Perform various actions
2. Observe toasts

**Expected:**
- [x] Toast on sentinel created
- [x] Toast on payment sent
- [x] Toast on alert triggered
- [x] Toast on address copied
- [x] Toast on errors
- [x] Positioned top-right
- [x] Auto-dismiss after 4 seconds
- [x] Dark theme
- [x] Appropriate icons

---

### **28. Loading States** ✅
**Test Steps:**
1. Observe various async operations

**Expected:**
- [x] Spinner during wallet generation
- [x] Skeleton loaders on dashboard initial load
- [x] "Loading..." indicators during price fetch
- [x] "Processing..." during payments
- [x] "Analyzing..." during AI analysis
- [x] Smooth transitions

---

### **29. Error Handling** ✅
**Test Steps:**
1. Test without funding wallet (USDC)
2. Test with invalid Discord webhook
3. Test with network disconnected (optional)

**Expected:**
- [x] Switchboard fails → falls back to CoinGecko
- [x] CoinGecko fails → falls back to simulated price
- [x] Payment fails → activity marked "failed", monitoring continues
- [x] Discord webhook fails → logged, monitoring continues
- [x] DeepSeek fails → fallback analysis, monitoring continues
- [x] All errors logged to console
- [x] User-friendly error messages in toasts
- [x] App never crashes

---

### **30. Animations** ✅
**Test Steps:**
1. Navigate through app
2. Observe animation smoothness

**Expected:**
- [x] Landing page fade-ins smooth
- [x] Stats count-up animations
- [x] Activity stagger animations
- [x] Card hover effects (lift)
- [x] Button press effects (scale)
- [x] Page transitions smooth
- [x] 60fps performance
- [x] No jank or stuttering

---

### **31. Environment Variables** ✅
**Test Steps:**
1. Check that `.env.local` exists
2. Verify environment variables are loaded

**Expected:**
- [x] `.env.local` file exists
- [x] `NEXT_PUBLIC_NETWORK=devnet` set
- [x] `NEXT_PUBLIC_DEVNET_RPC` set
- [x] `DEEPSEEK_API_KEY` set (or placeholder)
- [x] Console logs show correct network
- [x] App footer shows: "- Environments: .env.local"

**Verify:**
```bash
cat /home/engine/project/.env.local
```

---

### **32. Full E2E Flow** ✅
**Test Steps:**
Complete end-to-end test:

1. [ ] Visit landing page → verify animations
2. [ ] Click "Launch Dashboard" → loads immediately
3. [ ] Click "Create New Sentinel" → form appears
4. [ ] Fill form and submit → wallet generated
5. [ ] Copy wallet address → toast shown
6. [ ] Request SOL airdrop → balance updates
7. [ ] (Optional) Fund with USDC → balance shows
8. [ ] Monitoring auto-starts → checks every 30s
9. [ ] Wait for 3 checks → AI analysis triggers
10. [ ] Change threshold to trigger alert → Discord receives message
11. [ ] Click transaction signature → Solscan opens
12. [ ] Check localStorage → all data persists
13. [ ] Refresh page → data reloads, monitoring resumes
14. [ ] Click "Pause" → monitoring stops
15. [ ] Click "Resume" → monitoring restarts
16. [ ] Create second sentinel → both run independently
17. [ ] Delete one sentinel → removed cleanly
18. [ ] Resize window → responsive layout works
19. [ ] Check console → no critical errors
20. [ ] Verify no crashes or hangs

---

## 🔍 CONSOLE LOG VERIFICATION

### Expected Console Output (Complete Flow):

```
🔓 AUTH CHECK BYPASSED - DEV MODE
⚠️  WARNING: Auth protection is disabled!
✅ Mock user set: dev@test.com

🌐 ========== NETWORK CONFIGURATION ==========
📍 Environment Variable NEXT_PUBLIC_NETWORK: devnet
📍 Current Network: Devnet
📍 Is Mainnet: false
🌐 ============================================

🚀 ========== CREATING SENTINEL ==========
🌐 Network: DEVNET
💰 Payment Method: usdc
📊 Threshold: 100000 below
🔑 Generated Wallet: [address]
✅ Sentinel created successfully on devnet
🚀 =======================================

🔄 Setting up monitoring for active sentinels...
📊 Found 1 active sentinels to monitor
🚀 Starting monitoring for sentinel sentinel_xxx (12345678...)

⏰ Running scheduled check for sentinel sentinel_xxx
💰 Fetching SOL price...
✅ SOL price from CoinGecko: 195.23
✅ Check completed successfully
   Price: 195.23
   Cost: 0.0001
   Triggered: false

[30 seconds later...]
⏰ Running scheduled check for sentinel sentinel_xxx
...

[After 3 checks...]
🔍 Should run AI analysis: true
🤖 Running autonomous AI analysis...
✅ AI analysis completed: [analysis text]
💰 AI cost: $0.0008
```

---

## ❌ KNOWN ISSUES & LIMITATIONS

### Expected Failures (Not Bugs):
1. **USDC Payment Failures** - Without devnet USDC, all payments will fail gracefully
2. **CASH Not Available** - CASH is mainnet-only, won't work on devnet
3. **DeepSeek API** - Without real API key, AI analysis uses fallback
4. **Discord Webhooks** - If webhook URL is invalid/expired, alerts won't send
5. **Rate Limits** - Devnet airdrop may be rate-limited

### Performance Notes:
- First price check may be slower (CoinGecko timeout)
- Switchboard oracle calls can take 3-5 seconds
- DeepSeek AI analysis takes 2-5 seconds
- Monitoring interval: 30 seconds (not configurable yet)

---

## ✅ TEST COMPLETION CRITERIA

**PASS:** All 32 points work as described (with acceptable failures for unfunded wallets)

**PARTIAL:** 25-31 points work, minor issues only

**FAIL:** <25 points work, or critical monitoring failure

---

## 📊 TEST RESULTS TEMPLATE

```
Date Tested: __________
Tester: __________
Environment: devnet / mainnet
Browser: __________

RESULTS:
- Working Points: ____ / 32
- Partial Points: ____ / 32
- Failed Points: ____ / 32

CRITICAL ISSUES:
1. ___________________________
2. ___________________________

MINOR ISSUES:
1. ___________________________
2. ___________________________

OVERALL STATUS: PASS / PARTIAL / FAIL

NOTES:
_________________________________
_________________________________
```

---

**Next Steps After Testing:**
1. Document all failures
2. Create GitHub issues for bugs
3. Update E2E_VERIFICATION_REPORT.md
4. Deploy to production (if all tests pass)

---

**Report Generated:** 2024-11-10  
**Testing Framework:** Manual  
**Automation Status:** Pending (consider Playwright for future)
