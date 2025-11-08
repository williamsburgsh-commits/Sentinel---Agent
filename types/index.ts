/**
 * Configuration for a Sentinel price monitor
 */
export interface SentinelConfig {
  id: string;
  walletAddress: string;
  privateKey: string;
  threshold: number;
  condition: 'above' | 'below';
  discordWebhook: string;
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
}
