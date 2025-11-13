# 🚀 Vercel Mainnet Setup - Step by Step

## 📋 Environment Variables to Add

Copy these **5 variables** to Vercel:

```bash
# 1. Network Mode
NEXT_PUBLIC_NETWORK=mainnet

# 2. Mainnet RPC
NEXT_PUBLIC_MAINNET_RPC=https://api.mainnet-beta.solana.com

# 3. Devnet RPC (for future testing)
NEXT_PUBLIC_DEVNET_RPC=https://api.devnet.solana.com

# 4. Supabase URL (YOU FILL THIS IN)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co

# 5. Supabase Key (YOU FILL THIS IN)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 Step-by-Step Instructions

### Step 1: Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Settings** (gear icon on left)
4. Click **API** tab
5. Copy these two values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (under "Project API keys")

---

### Step 2: Add Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Click on your **Sentinel Agent** project
3. Click **Settings** (top nav)
4. Click **Environment Variables** (left sidebar)
5. For each variable, do this:

#### Variable 1: Network Mode
```
Click "Add"
Name:  NEXT_PUBLIC_NETWORK
Value: mainnet
Select: ✅ Production ✅ Preview ✅ Development
Click "Save"
```

#### Variable 2: Mainnet RPC
```
Click "Add"
Name:  NEXT_PUBLIC_MAINNET_RPC
Value: https://api.mainnet-beta.solana.com
Select: ✅ Production ✅ Preview ✅ Development
Click "Save"
```

#### Variable 3: Devnet RPC
```
Click "Add"
Name:  NEXT_PUBLIC_DEVNET_RPC
Value: https://api.devnet.solana.com
Select: ✅ Production ✅ Preview ✅ Development
Click "Save"
```

#### Variable 4: Supabase URL
```
Click "Add"
Name:  NEXT_PUBLIC_SUPABASE_URL
Value: [PASTE YOUR SUPABASE PROJECT URL HERE]
       ⚠️ MUST include https://
       Example: https://deepfiuklrwqveiydzjb.supabase.co
Select: ✅ Production ✅ Preview ✅ Development
Click "Save"
```

#### Variable 5: Supabase Anon Key
```
Click "Add"
Name:  NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [PASTE YOUR SUPABASE ANON KEY HERE]
       Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Select: ✅ Production ✅ Preview ✅ Development
Click "Save"
```

---

### Step 3: Redeploy

1. Go to **Deployments** tab (top nav)
2. Find the latest deployment
3. Click **...** (three dots on the right)
4. Click **Redeploy**
5. Wait for build to complete (~2-3 minutes)

---

### Step 4: Verify It Works

1. **Open your deployed site**
2. **Press F12** to open Developer Console
3. **Look for these logs**:

```
🌐 ========== NETWORK CONFIGURATION ==========
📍 Environment Variable NEXT_PUBLIC_NETWORK: mainnet
📍 Current Network: Mainnet
📍 Is Mainnet: true
📍 Warning Enabled: true
🌐 ============================================
```

4. **Check the UI**:
   - ✅ Green "MAINNET" badge in top right
   - ✅ Red warning banner: "MAINNET MODE ACTIVE"
   - ✅ No errors in console

---

## ✅ Success Checklist

After setup, you should have:

- [x] 5 environment variables added in Vercel
- [x] Redeployed successfully
- [x] Green "MAINNET" badge visible
- [x] Red warning banner showing
- [x] Console shows "Current Network: Mainnet"
- [x] No ERR_NAME_NOT_RESOLVED errors
- [x] Can access signup/login pages

---

## 🐛 Troubleshooting

### Problem: "ERR_NAME_NOT_RESOLVED"

**Cause:** Supabase URL missing `https://`

**Fix:**
```bash
❌ Wrong: deepfiuklrwqveiydzjb.supabase.co
✅ Right: https://deepfiuklrwqveiydzjb.supabase.co
```
Edit the variable in Vercel and redeploy.

---

### Problem: Dashboard redirects to login immediately

**Cause:** Not logged in OR session expired

**Fix:**
1. Go to `/auth/signup`
2. Create a new account
3. Check email for confirmation (if enabled)
4. Try logging in again

---

### Problem: Network shows "Devnet" instead of "Mainnet"

**Cause:** Environment variable not set or typo

**Fix:**
1. Check Vercel → Settings → Environment Variables
2. Verify `NEXT_PUBLIC_NETWORK` exists
3. Verify value is exactly: `mainnet` (no spaces, lowercase)
4. Redeploy

---

### Problem: Build fails with ESLint errors

**Cause:** Unused imports or TypeScript errors

**Fix:**
1. Check build logs in Vercel
2. Copy error message
3. This should be fixed already (we removed unused imports)
4. If new errors, let me know!

---

### Problem: "Auth timeout" error

**Cause:** Supabase credentials not loaded

**Fix:**
1. Verify both Supabase variables are set in Vercel
2. Check for typos in variable names
3. Ensure no extra spaces in values
4. Redeploy

---

## 📊 What Each Variable Does

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_NETWORK` | Sets mainnet or devnet mode | `mainnet` |
| `NEXT_PUBLIC_MAINNET_RPC` | Solana mainnet endpoint | `https://api.mainnet-beta.solana.com` |
| `NEXT_PUBLIC_DEVNET_RPC` | Solana devnet endpoint (for testing) | `https://api.devnet.solana.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public auth key from Supabase | `eyJhbGciOi...` |

---

## ⚠️ Important Reminders

### Mainnet = Real Money!

- 🚨 **Real USDC** will be used for transactions
- 🚨 **Real SOL** needed for gas fees
- 🚨 **Start small** - test with one sentinel
- 🚨 **Monitor transactions** on Solscan
- 🚨 **Safety limit** enforced: 0.001 USDC per transaction

### Public RPC Limitations

The free Solana mainnet RPC (`api.mainnet-beta.solana.com`) has:
- ✅ Free to use
- ⚠️ Rate limits (may be slow under load)
- ⚠️ No SLA or guarantees

**For production**, consider upgrading to:
- **Helius** - https://helius.xyz (100k requests/month free)
- **Alchemy** - https://alchemy.com
- **QuickNode** - https://quicknode.com

Then update `NEXT_PUBLIC_MAINNET_RPC` to your premium endpoint.

---

## 🎉 Next Steps After Setup

1. **Create test account** - Sign up on your deployed site
2. **Run database migration** - See `COMPLETE_SUPABASE_SCHEMA.sql`
3. **Create first sentinel** - Use LOW threshold to test
4. **Monitor console logs** - Check everything is working
5. **Verify on Solscan** - Check transactions are real
6. **Document costs** - Track how much you're spending

---

## 📚 Additional Resources

- `VERCEL_ENV_TEMPLATE.txt` - Copy-paste template
- `MAINNET_READINESS_REPORT.md` - Full audit report
- `MAINNET_SETUP_INSTRUCTIONS.md` - Detailed guide
- `COMPLETE_SUPABASE_SCHEMA.sql` - Database setup

---

## 🆘 Need Help?

If you're still stuck:

1. **Check browser console** - Copy any error messages
2. **Check Vercel logs** - Deployment → Functions → Logs
3. **Verify database** - Run test query in Supabase SQL Editor
4. **Share error details** - I can help debug specific issues

---

**You're ready to go! Set those 5 variables and deploy to mainnet! 🚀**

