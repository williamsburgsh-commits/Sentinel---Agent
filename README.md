# 🔍 Sentinel - Autonomous On-Chain Monitors

> **Micropowered Intelligence for the Decentralized Web**

Sentinel is a decentralized monitoring platform that leverages the x402 protocol for micropayments, enabling autonomous, self-funding on-chain monitoring agents. Monitor any on-chain condition, get real-time alerts, and execute actions - all powered by secure, trustless smart contracts.

## ✨ Features

- **🚀 Autonomous Agents**: Self-funding sentinels that monitor on-chain conditions 24/7
- **💸 Micropayments**: Pay-per-use model using the x402 protocol for efficient resource allocation
- **🔔 Real-time Alerts**: Get instant notifications via Discord when conditions are met
- **📊 Price Monitoring**: Track asset prices with sub-second precision using Switchboard oracles
- **🤖 AI-Powered Analysis**: Optional AI-driven market insights and trend analysis
- **🔒 Non-Custodial**: Your keys, your funds - fully self-sovereign operation

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Blockchain**: Solana, x402 Protocol, Switchboard Oracles
- **AI**: DeepSeek API for market analysis
- **Infra**: Vercel, Helius RPC
- **Notifications**: Discord Webhooks

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sentinel-agent.git
   cd sentinel-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and fill in your API keys:
   ```env
   # Required
   COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
   
   # Optional (for production)
   DEEPSEEK_API_KEY=your_deepseek_api_key
   DISCORD_WEBHOOK_URL=your_discord_webhook_url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** to view it in your browser

## 🏗 How It Works

1. **Deploy**: Create a new sentinel with your monitoring parameters
2. **Fund**: Deposit USDC or CASH tokens to fund the sentinel's operations
3. **Monitor**: The sentinel continuously checks the specified conditions
4. **Alert**: When conditions are met, you receive an instant notification
5. **Renew**: Sentinels automatically renew using micropayments from successful alerts

## 🏛 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Blockchain    │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   (Solana)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                      ▲                      ▲
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User          │    │   Price Feeds   │    │   x402 Protocol │
│   Interface     │    │   (Switchboard) │    │   (Micropayments)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎥 Demo

[![Watch the demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://youtu.be/YOUR_VIDEO_ID)

## 🗺 Roadmap

### Phase 1: Core Monitoring (Current)
- [x] Price monitoring for Solana tokens
- [x] Discord notifications
- [x] Self-funding sentinels

### Phase 2: Enhanced Features
- [ ] Wallet Activity Sentinel
- [ ] DeFi Position Monitoring
- [ ] NFT Floor Price Alerts
- [ ] Cross-chain Monitoring

### Phase 3: Advanced Capabilities
- [ ] AI-Powered Market Analysis
- [ ] Automated Strategy Execution
- [ ] Multi-signature Approvals
- [ ] DAO Governance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using Next.js and Solana
- Special thanks to the x402 protocol team for their innovative micropayments solution
- Inspired by the need for decentralized, trustless monitoring in DeFi
