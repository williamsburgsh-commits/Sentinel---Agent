# Sentinel Agent - Setup Guide

Welcome to Sentinel Agent! This guide will help you set up all the necessary API keys and configurations to get started.

## Table of Contents
1. [Coinbase Developer Platform (CDP)](#1-coinbase-developer-platform-cdp)
2. [Helius RPC Key](#2-helius-rpc-key)
3. [CoinMarketCap API Key](#3-coinmarketcap-api-key)
4. [DeepSeek API Key](#4-deepseek-api-key)
5. [Discord Webhook](#5-discord-webhook)
6. [Devnet SOL](#6-devnet-sol)
7. [Environment Variables](#7-environment-variables)
8. [Troubleshooting](#8-troubleshooting)

## 1. Coinbase Developer Platform (CDP)

### What is it used for?
CDP enables embedded wallet functionality for your Sentinel agents. Each agent can have its own secure wallet created and managed through the CDP infrastructure.

### Steps to get your CDP credentials:
1. Go to [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com/)
2. Sign in with your Coinbase account or create a new one
3. Create a new project
4. Navigate to your project settings
5. Copy the following credentials:
   - **API Key** (for server-side operations)
   - **API Secret** (keep this secure!)
   - **Project ID**
   - **Public API Key** (for client-side OnchainKit components)

### Important Notes:
- CDP_API_KEY, CDP_API_SECRET, and CDP_PROJECT_ID should NEVER be exposed in client-side code
- NEXT_PUBLIC_CDP_API_KEY is safe for client-side use and enables OnchainKit UI components
- If you don't configure CDP, embedded wallet features will not be available, but the app will continue to work with existing Solana wallets

## 2. Helius RPC Key

### What is it used for?
The Helius RPC key is used to interact with the Solana blockchain, specifically for monitoring transactions and wallet activities.

### Steps to get your Helius RPC key:
1. Go to [helius.dev](https://www.helius.dev/)
2. Click on "Get Started" or "Sign Up"
3. Create a free account using your email
4. Once logged in, navigate to the dashboard
5. Create a new app and select "Devnet" as your network
6. Copy your API key (it should look like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## 3. CoinMarketCap API Key

### What is it used for?
CoinMarketCap provides real-time cryptocurrency price data for SOL and other tokens.

### Steps to get your CoinMarketCap API key:
1. Go to [pro.coinmarketcap.com](https://pro.coinmarketcap.com/)
2. Click "Get Your Free API Key Now"
3. Create a free account
4. Navigate to the API section in your dashboard
5. Copy your API key
6. Free tier includes 10,000 calls per month (sufficient for testing)

## 4. DeepSeek API Key

### What is it used for?
DeepSeek provides AI analysis for market conditions and sentinel alerts.

### Steps to get your DeepSeek API key:
1. Go to [platform.deepseek.com](https://platform.deepseek.com/)
2. Create an account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and save it securely

### Important Notes:
- DeepSeek API is optional - the app will gracefully degrade without it
- Without DeepSeek, you'll see basic alerts without AI-powered analysis

## 5. Discord Webhook

### What is it used for?
The Discord webhook allows the bot to send notifications to your Discord server when specific events occur.

### Steps to create a Discord webhook:
1. Open your Discord server where you want to receive notifications
2. Click on the server name (top-left) and select "Server Settings"
3. Go to "Integrations" in the left sidebar
4. Click on "Create Webhook"
5. Give your webhook a name (e.g., "Sentinel Bot")
6. Choose a channel where notifications will be sent
7. Click "Copy Webhook URL" (it should look like `https://discord.com/api/webhooks/...`)
8. Click "Save"

### Important Notes:
- Discord webhook is optional for basic functionality

## 6. Devnet SOL

### What is it used for?
Devnet SOL is needed for testing transactions on the Solana devnet without using real SOL.

### Steps to get Devnet SOL:
1. Go to [faucet.solana.com](https://faucet.solana.com/)
2. Enter your Solana wallet address (you can get this from your wallet provider like Phantom or Solflare)
3. Complete the CAPTCHA
4. Click "Request SOL"
5. You should receive 1 SOL in your devnet wallet

## 7. Environment Variables

### Setting up `.env.local`:
1. In the root directory of the project, create a new file called `.env.local`
2. Copy the following template and fill in your details:

```env
# Solana Network Configuration
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_DEVNET_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_MAINNET_RPC=your_mainnet_rpc_url_here
NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET=your_payment_recipient_wallet_address_here

# Switchboard Configuration
NEXT_PUBLIC_SWITCHBOARD_PROGRAM=your_switchboard_program_id_here

# API Keys (Server-side only - DO NOT prefix with NEXT_PUBLIC_)
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Coinbase Developer Platform (CDP) - Embedded Wallets
# Get these from: https://portal.cdp.coinbase.com/
# Server-side credentials (keep private)
CDP_API_KEY=your_cdp_api_key_here
CDP_API_SECRET=your_cdp_api_secret_here
CDP_PROJECT_ID=your_cdp_project_id_here
CDP_BASE_URL=https://api.developer.coinbase.com
# Client-side API key (public, for OnchainKit UI components)
NEXT_PUBLIC_CDP_API_KEY=your_cdp_public_api_key_here

# Optional
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
```

3. Replace the placeholder values with your actual API keys and credentials
4. For mainnet deployment, change `NEXT_PUBLIC_NETWORK` to `mainnet` and configure a premium RPC endpoint

### Important Security Notes:
- **NEVER** commit `.env.local` to version control
- **NEVER** prefix server-side secrets with `NEXT_PUBLIC_`
- Only `NEXT_PUBLIC_CDP_API_KEY` should be public (it's safe for client-side usage)
- CDP_API_SECRET is particularly sensitive - keep it secure!

## 8. Troubleshooting

### Common Issues and Solutions:

#### 1. CDP Configuration Errors
- **Symptom**: "CDP SDK not configured" warnings in console
- **Solution**:
  - Verify all CDP environment variables are set correctly
  - Check that CDP_API_KEY, CDP_API_SECRET, and CDP_PROJECT_ID are present
  - Ensure there are no extra spaces or quotes in your .env.local
  - If you don't need embedded wallets, you can ignore these warnings

#### 2. Missing API Keys
- **Symptom**: Price feed errors or AI analysis not working
- **Solution**:
  - Check that COINMARKETCAP_API_KEY is set (required for price feeds)
  - DEEPSEEK_API_KEY is optional - app will show basic alerts without it
  - Verify API keys are valid and not expired

#### 3. Invalid Discord Webhook URL
- **Symptom**: Messages are not being sent to Discord
- **Solution**:
  - Make sure you copied the entire webhook URL
  - Check that the webhook is still active in your Discord server settings
  - Try creating a new webhook

#### 4. RPC Connection Errors
- **Symptom**: Cannot connect to Solana network
- **Solution**:
  - Verify your RPC URL is correct
  - Check if you're using the correct network (devnet vs mainnet)
  - Make sure your internet connection is stable
  - Consider using a premium RPC provider like Helius or QuickNode

#### 5. Insufficient SOL Balance
- **Symptom**: Transactions are failing
- **Solution**:
  - Get more devnet SOL from the faucet
  - Make sure you're using the correct network (devnet for testing)
  - Check that your wallet has enough USDC/CASH for micropayments

#### 6. Environment Variables Not Loading
- **Symptom**: App crashes or shows undefined values
- **Solution**:
  - Make sure your `.env.local` file is in the root directory
  - Ensure variable names in `.env.local` match those in your code
  - Restart your development server after making changes to `.env.local`
  - Check that there are no syntax errors in `.env.local`

#### 7. Build Errors with OnchainKit
- **Symptom**: Build fails with OnchainKit-related errors
- **Solution**:
  - OnchainKit provider wraps the app but won't break functionality
  - Check that @coinbase/onchainkit is properly installed
  - Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

### Need Help?
If you encounter any other issues, please open an issue on our GitHub repository with the following information:
- What you were trying to do
- The error message you received
- Steps to reproduce the issue
- Your environment (OS, Node.js version, etc.)

Happy coding! 🚀
