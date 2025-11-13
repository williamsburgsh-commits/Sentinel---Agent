# Simplified cleanup script for Sentinel repository
Write-Host "🚀 Starting repository cleanup..." -ForegroundColor Cyan

# Create backup directory with timestamp
$backupDir = "./archive_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir | Out-Null

# Files to remove
$filesToRemove = @(
    # SQL files
    "COMPLETE_SUPABASE_SCHEMA.sql",
    "supabase-complete-schema.sql",
    "supabase-schema-complete.sql",
    
    # Old documentation
    "DATABASE_INTEGRATION.md",
    "DATABASE_SCHEMA_REFERENCE.md",
    "DATA_LAYER_MIGRATION.md",
    "E2E_VERIFICATION_REPORT.md",
    "FIXES_SUMMARY.md",
    "FIX_VERIFICATION.md",
    "IMPLEMENTATION_COMPLETE.md",
    "IMPLEMENTATION_FIXES_SUMMARY.md",
    "IMPLEMENTATION_SUMMARY.md",
    "INTEGRATION_CHECKLIST.md",
    "MAINNET_COSTS.md",
    "MAINNET_FIXES.md",
    "MAINNET_FIXES_SUMMARY.md",
    "MAINNET_READINESS_REPORT.md",
    "MAINNET_SETUP_INSTRUCTIONS.md",
    "MONITORING-FIX.md",
    "MULTI_SENTINEL_SYSTEM.md",
    "NETWORK_INTEGRATION.md",
    "PACKAGE_NOTES.md",
    "PAYMENT_ENFORCEMENT_IMPLEMENTATION.md",
    "PHANTOM_CASH_NOTES.md",
    "PREMIUM_POLISH.md",
    "PUSH_TO_GITHUB_GUIDE.md",
    "QUICK_START.md",
    "SECURITY_FIXES.md",
    "SUPABASE_AUTH_REMOVAL_SUMMARY.md",
    "SUPABASE_SETUP.md",
    "TESTING_CHECKLIST.md",
    "TODO_APPLY_MAINNET_FIXES.md",
    "VERCEL_DEPLOYMENT.md",
    "VERCEL_ENV_TEMPLATE.txt",
    "VERCEL_SETUP_GUIDE.md",
    "push-to-github.ps1"
)

# Move files to backup directory
foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        $destination = Join-Path $backupDir $file
        $destinationDir = Split-Path -Parent $destination
        
        if (-not (Test-Path $destinationDir)) {
            New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
        }
        
        Move-Item -Path $file -Destination $destination -Force
        Write-Host "📦 Archived: $file" -ForegroundColor DarkGray
    }
}

# Create a .gitignore if it doesn't exist
if (-not (Test-Path ".gitignore")) {
    @"
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Backup directory
.backup
archive_*"@ | Out-File -FilePath ".gitignore" -Encoding utf8
    Write-Host "✅ Created .gitignore file" -ForegroundColor Green
}

Write-Host "\n✨ Cleanup complete!" -ForegroundColor Green
Write-Host "📁 Original files backed up to: $backupDir" -ForegroundColor Yellow
Write-Host "🚀 Your repository is now clean and ready to go!" -ForegroundColor Green

# Show final directory structure
tree /F /A
