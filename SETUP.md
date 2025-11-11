# Sentinel Agent - Setup Guide

Welcome to Sentinel Agent! This guide will help you set up all the necessary API keys and configurations to get started.

## Table of Contents
1. [Helius RPC Key](#1-helius-rpc-key)
2. [Discord Webhook](#2-discord-webhook)
3. [Devnet SOL](#3-devnet-sol)
4. [Environment Variables](#4-environment-variables)
5. [Troubleshooting](#5-troubleshooting)

## 1. Helius RPC Key

### What is it used for?
The Helius RPC key is used to interact with the Solana blockchain, specifically for monitoring transactions and wallet activities.

### Steps to get your Helius RPC key:
1. Go to [helius.dev](https://www.helius.dev/)
2. Click on "Get Started" or "Sign Up"
3. Create a free account using your email
4. Once logged in, navigate to the dashboard
5. Create a new app and select "Devnet" as your network
6. Copy your API key (it should look like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## 2. Discord Webhook

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

## 3. Devnet SOL

### What is it used for?
Devnet SOL is needed for testing transactions on the Solana devnet without using real SOL.

### Steps to get Devnet SOL:
1. Go to [faucet.solana.com](https://faucet.solana.com/)
2. Enter your Solana wallet address (you can get this from your wallet provider like Phantom or Solflare)
3. Complete the CAPTCHA
4. Click "Request SOL"
5. You should receive 1 SOL in your devnet wallet

## 4. Environment Variables

### Setting up `.env.local`:
1. In the root directory of the project, create a new file called `.env.local`
2. Copy the following template and fill in your details:

```env
# Helius RPC Configuration
NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY

# Discord Webhook
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here

# Wallet Configuration (for testing)
PRIVATE_KEY=your_wallet_private_key

# App Configuration
NEXT_PUBLIC_APP_ENV=development
```

3. Replace `YOUR_HELIUS_API_KEY` with the key you got from Helius
4. Replace `your_discord_webhook_url_here` with your Discord webhook URL
5. (Optional) Add your wallet's private key for testing (make sure to use a test wallet, not your main wallet)

## 5. Troubleshooting

### Common Issues and Solutions:

#### 1. Invalid Discord Webhook URL
- **Symptom**: Messages are not being sent to Discord
- **Solution**:
  - Make sure you copied the entire webhook URL
  - Check that the webhook is still active in your Discord server settings
  - Try creating a new webhook

#### 2. RPC Connection Errors
- **Symptom**: Cannot connect to Solana network
- **Solution**:
  - Verify your Helius API key is correct
  - Check if you're using the correct RPC URL (devnet vs mainnet)
  - Make sure your internet connection is stable

#### 3. Insufficient SOL Balance
- **Symptom**: Transactions are failing
- **Solution**:
  - Get more devnet SOL from the faucet
  - Make sure you're using the correct network (devnet for testing)

#### 4. Environment Variables Not Loading
- **Symptom**: App crashes or shows undefined values
- **Solution**:
  - Make sure your `.env.local` file is in the root directory
  - Ensure variable names in `.env.local` match those in your code
  - Restart your development server after making changes to `.env.local`

### Need Help?
If you encounter any other issues, please open an issue on our GitHub repository with the following information:
- What you were trying to do
- The error message you received
- Steps to reproduce the issue
- Your environment (OS, Node.js version, etc.)

Happy coding! 🚀
