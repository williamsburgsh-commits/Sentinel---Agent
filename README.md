# 🛡️ Sentinel
**Autonomous On-Chain Monitors, Powered by Micropayments**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000.svg)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-14F195?style=flat&logo=solana&logoColor=white)](https://solana.com/)

> 🎥 **Gitbook** | 🌐 **https://app.gitbook.com/o/NkcSMFHgRejbZkjuqxdr/s/IF6BM4S1ZOicDaWmAAsr/alignment-with-hackathon-prizes**

## 🌟 Overview

Sentinel enables users to deploy autonomous AI agents that monitor blockchain data 24/7. Each Sentinel has its own wallet, its own budget, and autonomously pays for real-time oracle data and AI analysis using Phantom CASH micropayments via the x402 protocol.

**Think of it as "Google Alerts for the blockchain"** - but trustless, autonomous, and powered by an agent economy where AI pays for what it consumes.

## ✨ Key Features

* **🤖 Autonomous Monitoring Agents** - Deploy self-executing monitors that watch for specific on-chain conditions
* **💰 CASH Micropayments** - Pay-per-request model using Phantom CASH for sub-cent transactions
* **🔐 x402 Protocol** - HTTP 402 "Payment Required" enables agents to pay for API access autonomously
* **📊 Switchboard Oracles** - Reliable, decentralized price feeds and on-chain data
* **🧠 AI-Powered Analysis** - Anthropic Claude analyzes market context when alerts trigger
* **👛 CDP Embedded Wallets** - Instant agent wallet creation with no seed phrases

## 🎬 How It Works

1. **Deploy** - Click "Deploy Sentinel" → CDP creates a dedicated wallet for your agent
2. **Fund** - Send $1 CASH to your Sentinel's wallet
3. **Configure** - Set your monitoring condition (e.g., "Alert when SOL < $150")
4. **Autonomous Loop** - Every 30 seconds
   - Agent requests data from Switchboard via x402
   - Server returns "402 Payment Required"
   - Agent pays 0.0001 CASH from its wallet
   - Receives verified oracle data
   - Checks condition → triggers AI analysis if met
5. **Alert** - Receive intelligent notification with Claude's market analysis

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Blockchain**: Solana Web3.js, Phantom CASH, x402 Protocol
- **Oracles**: Switchboard
- **AI**: Anthropic Claude (Sonnet 4)
- **Wallets**: Coinbase CDP Embedded Wallets
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 🚀 Quick Start
```bash
# Clone and install
git clone [your-repo-url]
cd sentinel
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Run locally
npm run dev
# Open http://localhost:3000
```

**Required Environment Variables:**
-  COINMARKETCAP_API_KEY` - Get from https://pro.coinmarketcap.com
- `NEXT_PUBLIC_MAINNET_RPC` - Get Helius key from https://helius.dev
- `DEEPSEEK_API_KEY` - Get from https://platform.deepseek.com
- `NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET` - Your Solana wallet address


See [SETUP.md](./SETUP.md) for detailed configuration.

## 🏆 Hackathon Submission

Built for **[Solana x402 Hackathon]** targeting six prize categories:

### 🥇 Best x402 Agent Application
Autonomous agents use HTTP 402 to pay for every data request - from Switchboard oracles to AI analysis. Each Sentinel independently signs and sends CASH micropayments, demonstrating agents as true economic actors.

### 🥇 Best Trustless Agent
Zero centralized control. Each Sentinel has its own CDP wallet, holds its own budget, and executes payments autonomously. Users never custody the agent's funds - the agent is fully self-sovereign with all payments verifiable on-chain.

### 🥇 Best Use of CASH
All micropayments use Phantom CASH. Agents pay 0.0001 CASH per data check - showcasing CASH's efficiency for sub-cent transactions impossible with traditional payment systems.

### 🥇 Dark Research Prize
*[Add your specific criteria here based on prize requirements]*

### 🥇 Best Use of Switchboard
Switchboard oracles power all price feeds via x402 micropayments. Roadmap includes NFT floor prices, DeFi APYs, and custom data feeds from Switchboard's decentralized network.

### 🥇 Best AgentPay Demo
Perfect agent payment paradigm: CDP wallets for identity, autonomous CASH budgets, pay-as-you-go pricing, and verifiable on-chain transactions. Demo shows live CASH payments on Solscan as agents autonomously purchase data.

--**6 Prize Categories Targeted**
## 🗺️ Roadmap

**Phase 1: Agent Economy** (Coming Soon)
- Agent-to-agent analysis marketplace
- Multi-model AI consensus (Claude + GPT-4 + others)

**Phase 2: Specialized Sentinels**
- DeFi Trader Sentinel (price movement alerts)
- NFT Collector Sentinel (floor price monitoring)
- DAO Treasurer Sentinel (balance tracking)
- Staker Sentinel (APY monitoring)

**Phase 3: Intelligence & Identity**
- Sentinel personality & memory
- On-chain performance reputation system

## 📸 Screenshots

[Add 2-3 key screenshots here showing: Dashboard, Sentinel creation, Live monitoring]

## 🙏 Acknowledgments

Built with technologies from:
- Solana Foundation
- Phantom Wallet
- Coinbase CDP
- Switchboard
- Anthropic
- x402 Protocol Team

## 📬 Contact

Created by itswilly31 - [Twitter/X : itswilly3 )
Email: williamsburg.sh@gmail.com
