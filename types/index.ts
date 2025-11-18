/**
 * Wallet provider type for sentinels
 */
export type WalletProvider = 'legacy' | 'cdp';

/**
 * Configuration for a Sentinel price monitor
 */
export interface SentinelConfig {
  id: string;
  userId: string;
  walletAddress: string;
  
  // Wallet management metadata
  walletProvider: WalletProvider;
  
  // CDP wallet fields (only present when walletProvider === 'cdp')
  cdpWalletId?: string;
  cdpWalletAddress?: string;
  
  // Legacy wallet field (only present when walletProvider === 'legacy')
  // DEPRECATED: Use getLegacyPrivateKey() helper instead of accessing directly
  legacyPrivateKey?: string;
  
  threshold: number;
  condition: 'above' | 'below';
  discordWebhook: string;
  paymentMethod: 'usdc' | 'cash'; // Payment method: USDC (default) or Phantom CASH
  network: 'devnet' | 'mainnet'; // Solana network this sentinel operates on
  isActive: boolean;
  createdAt: Date;
}

/**
 * Activity log entry for a Sentinel
 */
export interface SentinelActivity {
  timestamp: Date;
  price: number;
  cost: number;
  triggered: boolean;
  transactionSignature?: string; // Payment transaction signature (USDC or CASH)
  status?: 'success' | 'failed' | 'pending'; // Check status
  errorMessage?: string; // Error details if failed
  paymentMethod?: 'usdc' | 'cash'; // Payment method used for this check
  settlementTimeMs?: number; // Payment settlement time in milliseconds
}
