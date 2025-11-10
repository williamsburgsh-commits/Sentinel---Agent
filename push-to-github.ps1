# Push Mainnet Fixes to GitHub
# Run this script after installing Git

Write-Host "🚀 Pushing Mainnet Fixes to GitHub..." -ForegroundColor Green
Write-Host ""

# Navigate to project directory
Set-Location "C:\Users\dell\Desktop\sentinel agent"

# Configure git if needed (replace with your details)
Write-Host "📝 Setting up Git configuration..." -ForegroundColor Yellow
git config user.name "Your Name"
git config user.email "your.email@example.com"

Write-Host ""
Write-Host "📦 Staging all changes..." -ForegroundColor Yellow

# Add all changed files
git add .

Write-Host ""
Write-Host "💾 Creating commit..." -ForegroundColor Yellow

# Commit with descriptive message
git commit -m "🔧 Fix mainnet issues - Add network separation

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

Fixes #issue-number (if applicable)
"

Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow

# Push to main branch (or master, depending on your repo)
git push origin main

Write-Host ""
Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 View your changes at:" -ForegroundColor Cyan
Write-Host "   https://github.com/williamsburgsh-commits/Sentinel---Agent" -ForegroundColor Cyan

