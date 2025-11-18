/**
 * Unified data types for the Sentinel Agent application
 * These types work across browser (localStorage) and server (in-memory) contexts
 */

// ==================== SENTINELS ====================

export type SentinelStatus = 'unfunded' | 'ready' | 'monitoring' | 'paused';

export type WalletProvider = 'legacy' | 'cdp';

export interface Sentinel {
  id: string;
  user_id: string;
  wallet_address: string;
  
  // Wallet management metadata
  wallet_provider: WalletProvider; // 'legacy' for locally-managed keypairs, 'cdp' for CDP-managed wallets
  
  // CDP wallet fields (only present when wallet_provider === 'cdp')
  cdp_wallet_id?: string;
  cdp_wallet_address?: string;
  
  // Legacy wallet field (only present when wallet_provider === 'legacy')
  // DEPRECATED: Use getLegacyPrivateKey() helper instead of accessing directly
  legacy_private_key?: string; // base58 encoded for compatibility with runSentinelCheck
  
  threshold: number;
  condition: 'above' | 'below';
  payment_method: 'usdc' | 'cash';
  discord_webhook: string;
  network: 'devnet' | 'mainnet';
  is_active: boolean;
  status: SentinelStatus; // Current state of the sentinel
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export interface SentinelInsert {
  user_id: string;
  wallet_address: string;
  wallet_provider: WalletProvider;
  
  // CDP wallet fields (required when wallet_provider === 'cdp')
  cdp_wallet_id?: string;
  cdp_wallet_address?: string;
  
  // Legacy wallet field (required when wallet_provider === 'legacy')
  legacy_private_key?: string;
  
  threshold: number;
  condition: 'above' | 'below';
  payment_method: 'usdc' | 'cash';
  discord_webhook: string;
  network: 'devnet' | 'mainnet';
  is_active: boolean;
}

export interface SentinelUpdate {
  wallet_address?: string;
  wallet_provider?: WalletProvider;
  cdp_wallet_id?: string;
  cdp_wallet_address?: string;
  legacy_private_key?: string;
  threshold?: number;
  condition?: 'above' | 'below';
  payment_method?: 'usdc' | 'cash';
  discord_webhook?: string;
  network?: 'devnet' | 'mainnet';
  is_active?: boolean;
  status?: SentinelStatus;
  updated_at?: string;
}

// Sentinel configuration type for creating sentinels
export interface SentinelConfig {
  wallet_address: string;
  wallet_provider: WalletProvider;
  
  // CDP wallet fields
  cdp_wallet_id?: string;
  cdp_wallet_address?: string;
  
  // Legacy wallet field
  legacy_private_key?: string;
  
  threshold: number;
  condition: 'above' | 'below';
  payment_method: 'usdc' | 'cash';
  discord_webhook: string;
  network: 'devnet' | 'mainnet';
}

// ==================== ACTIVITIES ====================

export interface Activity {
  id: string;
  user_id: string;
  sentinel_id: string;
  price: number;
  cost: number;
  settlement_time: number | null;
  payment_method: string | null;
  transaction_signature: string | null;
  triggered: boolean;
  status: string;
  created_at: string; // ISO 8601 timestamp
}

export interface ActivityInsert {
  sentinel_id: string;
  user_id: string;
  price: number;
  cost: number;
  settlement_time?: number | null;
  payment_method?: string | null;
  transaction_signature?: string | null;
  triggered?: boolean;
  status?: string;
}

// ==================== AI ANALYSES ====================

export interface AIAnalysisRow {
  id: string;
  sentinel_id: string;
  user_id: string;
  analysis_text: string;
  confidence_score: number;
  sentiment: string;
  cost: number;
  created_at: string; // ISO 8601 timestamp
}

export interface AIAnalysisInsert {
  sentinel_id: string;
  user_id: string;
  analysis_text: string;
  confidence_score: number;
  sentiment: string;
  cost: number;
}

// ==================== STATS ====================

export interface ActivityStats {
  total_checks: number;
  total_spent: number;
  alerts_triggered: number;
  success_rate: number;
  avg_cost: number;
  last_check?: string;
}

// ==================== PROFILES ====================

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}
