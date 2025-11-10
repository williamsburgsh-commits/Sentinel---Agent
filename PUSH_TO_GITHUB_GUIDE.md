# 📤 How to Push Mainnet Fixes to GitHub

## ⚡ Quick Method (After Git is Installed)

### Step 1: Configure Git (First Time Only)
```powershell
cd "C:\Users\dell\Desktop\sentinel agent"

# Set your Git username and email
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 2: Add and Commit Changes
```powershell
# Add all files
git add .

# Commit with message
git commit -m "Fix mainnet issues - Add network separation and comprehensive logging"
```

### Step 3: Push to GitHub
```powershell
# Push to main branch
git push origin main

# Or if your default branch is 'master':
git push origin master
```

---

## 🎯 Alternative Methods

### Option 1: Use the PowerShell Script

After installing Git, run:
```powershell
cd "C:\Users\dell\Desktop\sentinel agent"
.\push-to-github.ps1
```

**Note**: Edit the script first to add your name and email!

---

### Option 2: GitHub Desktop (Easiest GUI)

1. **Download GitHub Desktop**: https://desktop.github.com/
2. **Install and sign in** with your GitHub account
3. **Add repository**: File → Add Local Repository → Select "sentinel agent" folder
4. **Commit**: Write commit message in left panel → Click "Commit to main"
5. **Push**: Click "Push origin" button at top

---

### Option 3: VS Code (If you have it)

1. **Open folder** in VS Code
2. **Source Control** icon (left sidebar, looks like branches)
3. **Stage all changes** (+ icon next to "Changes")
4. **Write commit message** in text box
5. **Commit** (checkmark icon)
6. **Push** (... menu → Push)

---

### Option 4: Manual Upload via GitHub Web

If you can't install Git:

1. Go to: https://github.com/williamsburgsh-commits/Sentinel---Agent
2. Click "Add file" → "Upload files"
3. **Drag and drop** these files:
   - `lib/database.ts`
   - `app/dashboard/page.tsx`
   - `lib/solana.ts`
   - `lib/switchboard.ts`
   - `lib/payments.ts`
   - `types/index.ts`
   - `supabase/migrations/add_network_to_sentinels.sql`
   - `MAINNET_FIXES.md`
   - `MAINNET_SETUP_INSTRUCTIONS.md`
   - `MAINNET_FIXES_SUMMARY.md`
   - `TODO_APPLY_MAINNET_FIXES.md`
4. Write commit message: "Fix mainnet issues - Add network separation"
5. Click "Commit changes"

**Note**: This method is tedious and doesn't show proper git history.

---

## 📋 Files Changed (Summary)

### New Files (5):
- `supabase/migrations/add_network_to_sentinels.sql`
- `MAINNET_FIXES.md`
- `MAINNET_SETUP_INSTRUCTIONS.md`
- `MAINNET_FIXES_SUMMARY.md`
- `TODO_APPLY_MAINNET_FIXES.md`
- `push-to-github.ps1`
- `PUSH_TO_GITHUB_GUIDE.md`

### Modified Files (6):
- `lib/database.ts`
- `app/dashboard/page.tsx`
- `lib/solana.ts`
- `lib/switchboard.ts`
- `lib/payments.ts`
- `types/index.ts`

---

## 🔐 Authentication

If Git asks for authentication:

### Option A: Personal Access Token (Recommended)
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo` (full control)
4. Copy the token
5. When Git asks for password, paste the token

### Option B: GitHub CLI
```powershell
# Install GitHub CLI
winget install --id GitHub.cli

# Authenticate
gh auth login
```

---

## ✅ Verify Push

After pushing, verify at:
```
https://github.com/williamsburgsh-commits/Sentinel---Agent/commits/main
```

You should see your new commit at the top.

---

## 🐛 Troubleshooting

### Error: "fatal: not a git repository"
```powershell
# Initialize git repo
git init
git remote add origin https://github.com/williamsburgsh-commits/Sentinel---Agent.git
git fetch
git checkout main
```

### Error: "Permission denied"
You need to authenticate. See "Authentication" section above.

### Error: "Git is not recognized"
Git not installed or PowerShell needs restart. Close and reopen PowerShell.

### Error: "Updates were rejected"
```powershell
# Pull first, then push
git pull origin main --rebase
git push origin main
```

---

## 📝 Commit Message

I've prepared a detailed commit message for you:

```
🔧 Fix mainnet issues - Add network separation

- Add network field to sentinels table (devnet/mainnet separation)
- Update database functions to filter by network
- Add comprehensive logging for network operations
- Fix RPC endpoints to use dynamic configuration
- Update USDC mint addresses for mainnet
- Fix Switchboard oracle to use network-specific config
- Add network compatibility checks on dashboard
- Update sentinel creation to include network field
- Improve transaction error handling for mainnet
- Add detailed documentation for mainnet setup

Changes:
- Database migration for network field
- 6 core files updated with network awareness
- 5 documentation files added
- Comprehensive logging throughout

All 10 mainnet issues resolved ✅
```

---

## 🚀 After Pushing

Once pushed to GitHub:

1. **Vercel Auto-Deploy** (if connected):
   - Vercel will automatically detect changes
   - New deployment will start
   - Check Vercel dashboard

2. **Manual Deploy** (if needed):
   - Go to Vercel dashboard
   - Click "Deploy" on your project
   - Select latest commit

3. **Test on Production**:
   - Wait for deployment to complete
   - Visit your production URL
   - Check network indicator
   - Verify console logs

---

## 🎉 Next Steps

After successful push:

1. ✅ Run database migration on production Supabase
2. ✅ Set environment variable on Vercel (`NEXT_PUBLIC_NETWORK`)
3. ✅ Test production deployment
4. ✅ Create new sentinel on production (if mainnet)

---

Choose the method that works best for you! Git installation is recommended for future development. 🚀

