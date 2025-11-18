/// <reference types="next" />

declare namespace NodeJS {
  interface ProcessEnv {
    // Solana Network Configuration
    NEXT_PUBLIC_NETWORK: 'devnet' | 'mainnet';
    NEXT_PUBLIC_DEVNET_RPC: string;
    NEXT_PUBLIC_MAINNET_RPC: string;
    NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET: string;
    
    // Switchboard Configuration
    NEXT_PUBLIC_SWITCHBOARD_PROGRAM: string;
    
    // API Keys (Server-side only)
    COINMARKETCAP_API_KEY?: string;
    DEEPSEEK_API_KEY?: string;
    
    // Coinbase Developer Platform (CDP) - Server-side
    CDP_API_KEY?: string;
    CDP_API_SECRET?: string;
    CDP_PROJECT_ID?: string;
    CDP_BASE_URL?: string;
    
    // Coinbase Developer Platform (CDP) - Client-side
    NEXT_PUBLIC_CDP_API_KEY?: string;
    
    // Optional/Legacy
    DISCORD_WEBHOOK_URL?: string;
    PRIVATE_KEY?: string;
  }
}
