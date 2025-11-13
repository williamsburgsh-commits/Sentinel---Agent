# 🔧 Sentinel Setup Guide

This guide will walk you through setting up all the required API keys and configurations for the Sentinel monitoring platform.

## 📋 Table of Contents
1. [Helius RPC Setup](#-helius-rpc-setup)
2. [Discord Webhook Setup](#-discord-webhook-setup)
3. [Getting Devnet SOL](#-getting-devnet-sol)
4. [Environment Configuration](#-environment-configuration)
5. [Troubleshooting](#-troubleshooting)

---

## 🌐 Helius RPC Setup

Sentinel uses Helius for reliable Solana RPC connections. Here's how to get your API key:

1. **Create a Helius Account**
   - Go to [helius.dev](https://www.helius.dev/)
   - Click "Get Started" or "Sign Up"
   - Complete the registration process

2. **Get Your API Key**
   - Log in to your Helius dashboard
   - Navigate to "API Keys" in the sidebar
   - Click "Create New API Key"
   - Select the "Devnet" network
   - Name your key (e.g., "Sentinel-Dev")
   - Copy the generated API key

3. **API Key Usage**
   - This key will be used to connect to the Solana devnet
   - Store it in your `.env.local` file as `NEXT_PUBLIC_DEVNET_RPC`

---

## 💬 Discord Webhook Setup

To receive alerts in your Discord server:

1. **Create a New Channel** (Optional but recommended)
   - In your Discord server, right-click in the channel list
   - Select "Create Channel"
   - Name it "alerts" or "sentinel-alerts"

2. **Create a Webhook**
   - Go to Server Settings (click the server name → Server Settings)
   - Select "Integrations" in the left sidebar
   - Click "Create Webhook"
   - Choose the channel you want notifications in
   - Click "Copy Webhook URL"
   - (Optional) Customize the webhook name and avatar

3. **Test Your Webhook**
   - You can test it by sending a message using the webhook URL
   - Make sure the webhook has permission to post in the selected channel

---

## 💧 Getting Devnet SOL

You'll need SOL on devnet for testing:

1. **Get a Wallet Address**
   - Use Phantom, Solflare, or any Solana wallet
   - Switch to Devnet in your wallet settings
   - Copy your wallet address

2. **Request Devnet SOL**
   - Go to [faucet.solana.com](https://faucet.solana.com/)
   - Paste your wallet address
   - Click "Request SOL"
   - You should receive 1 SOL (enough for thousands of transactions)

3. **Verify Balance**
   - Check your wallet to confirm the SOL was received
   - If needed, you can request more SOL (up to 5 SOL per day)

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the root of your project with these variables:

```env
# Required API Keys
NEXT_PUBLIC_DEVNET_RPC=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key

# Discord Webhook (for alerts)
NEXT_PUBLIC_DISCORD_WEBHOOK_URL=your_discord_webhook_url

# Optional (for AI features)
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### What Each Key Does:

- `NEXT_PUBLIC_DEVNET_RPC`: Connects to Solana devnet via Helius
- `COINMARKETCAP_API_KEY`: Fetches real-time price data
- `NEXT_PUBLIC_DISCORD_WEBHOOK_URL`: Sends alerts to your Discord server
- `DEEPSEEK_API_KEY`: Enables AI-powered market analysis (optional)

---

## 🛠 Troubleshooting

### Common Issues and Solutions

#### ❌ RPC Connection Errors
- **Symptom**: "Failed to connect to Solana devnet"
- **Solution**:
  1. Verify your Helius API key is correct
  2. Check if you've exceeded your request limit
  3. Try using a different RPC endpoint

#### ❌ Invalid Discord Webhook
- **Symptom**: Alerts not appearing in Discord
- **Solution**:
  1. Verify the webhook URL is correct
  2. Check if the webhook was deleted or expired
  3. Ensure the bot has permission to post in the channel

#### ❌ Insufficient SOL Balance
- **Symptom**: Transactions failing with "Insufficient SOL"
- **Solution**:
  1. Get more devnet SOL from the faucet
  2. Make sure you're on the correct network (devnet)

#### ❌ API Rate Limiting
- **Symptom**: "Too many requests" errors
- **Solution**:
  1. Wait a few minutes and try again
  2. Consider upgrading your API plan if needed
  3. Implement proper request throttling in your code

---

## 🎉 Setup Complete!

You've successfully set up all the required API keys and configurations. You can now start using Sentinel to monitor on-chain conditions and receive alerts.

For additional help, check out our [GitHub Issues](https://github.com/yourusername/sentinel-agent/issues) or join our [Discord community](https://discord.gg/yourdiscord).

Happy monitoring! 🚀
