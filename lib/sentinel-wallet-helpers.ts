/**
 * Sentinel Wallet Helper Utilities
 * 
 * Provides type guards and safe access helpers for sentinel wallet metadata.
 * Use these utilities instead of directly accessing wallet fields to ensure
 * proper handling of both legacy and CDP-managed wallets.
 */

import type { Sentinel } from '@/types/data';
import type { SentinelConfig } from '@/types';

/**
 * Type guard to check if a sentinel uses a legacy locally-managed wallet
 */
export function isLegacyWallet(sentinel: Sentinel | SentinelConfig): boolean {
  if ('wallet_provider' in sentinel) {
    return sentinel.wallet_provider === 'legacy';
  }
  if ('walletProvider' in sentinel) {
    return sentinel.walletProvider === 'legacy';
  }
  return false;
}

/**
 * Type guard to check if a sentinel uses a CDP-managed wallet
 */
export function isCDPWallet(sentinel: Sentinel | SentinelConfig): boolean {
  if ('wallet_provider' in sentinel) {
    return sentinel.wallet_provider === 'cdp';
  }
  if ('walletProvider' in sentinel) {
    return sentinel.walletProvider === 'cdp';
  }
  return false;
}

/**
 * Safely retrieve the legacy private key from a sentinel
 * Logs a deprecation warning when accessed
 * 
 * @param sentinel - The sentinel to get the private key from
 * @returns The base58-encoded private key, or null if not a legacy wallet
 */
export function getLegacyPrivateKey(sentinel: Sentinel): string | null {
  if (!isLegacyWallet(sentinel)) {
    console.warn(
      `[DEPRECATED] Attempted to access legacy private key on non-legacy wallet (provider: ${sentinel.wallet_provider})`,
      { sentinelId: sentinel.id }
    );
    return null;
  }

  if (!sentinel.legacy_private_key) {
    console.error(
      `[ERROR] Legacy wallet missing private key!`,
      { sentinelId: sentinel.id, walletAddress: sentinel.wallet_address }
    );
    return null;
  }

  // Log deprecation warning
  console.warn(
    `[DEPRECATED] Accessing legacy_private_key directly. Consider migrating to CDP-managed wallets.`,
    { sentinelId: sentinel.id }
  );

  return sentinel.legacy_private_key;
}

/**
 * Safely retrieve the legacy private key from a SentinelConfig (types/index.ts)
 * Logs a deprecation warning when accessed
 * 
 * @param config - The sentinel config to get the private key from
 * @returns The base58-encoded private key, or null if not a legacy wallet
 */
export function getLegacyPrivateKeyFromConfig(config: SentinelConfig): string | null {
  if (!isLegacyWallet(config)) {
    console.warn(
      `[DEPRECATED] Attempted to access legacy private key on non-legacy wallet (provider: ${config.walletProvider})`,
      { configId: config.id }
    );
    return null;
  }

  if (!config.legacyPrivateKey) {
    console.error(
      `[ERROR] Legacy wallet missing private key!`,
      { configId: config.id, walletAddress: config.walletAddress }
    );
    return null;
  }

  // Log deprecation warning
  console.warn(
    `[DEPRECATED] Accessing legacyPrivateKey directly. Consider migrating to CDP-managed wallets.`,
    { configId: config.id }
  );

  return config.legacyPrivateKey;
}

/**
 * Get CDP wallet metadata from a sentinel
 * 
 * @param sentinel - The sentinel to get CDP metadata from
 * @returns CDP wallet metadata, or null if not a CDP wallet
 */
export function getCDPWalletMetadata(
  sentinel: Sentinel
): { walletId: string; walletAddress: string } | null {
  if (!isCDPWallet(sentinel)) {
    return null;
  }

  if (!sentinel.cdp_wallet_id || !sentinel.cdp_wallet_address) {
    console.error(
      `[ERROR] CDP wallet missing required metadata!`,
      { 
        sentinelId: sentinel.id, 
        hasWalletId: !!sentinel.cdp_wallet_id,
        hasWalletAddress: !!sentinel.cdp_wallet_address
      }
    );
    return null;
  }

  return {
    walletId: sentinel.cdp_wallet_id,
    walletAddress: sentinel.cdp_wallet_address,
  };
}

/**
 * Get a display-friendly wallet provider name
 */
export function getWalletProviderDisplayName(sentinel: Sentinel | SentinelConfig): string {
  if (isLegacyWallet(sentinel)) {
    return 'Local Keypair';
  }
  if (isCDPWallet(sentinel)) {
    return 'Coinbase CDP';
  }
  return 'Unknown';
}
