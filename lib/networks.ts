/**
 * Network Configuration for Solana Devnet and Mainnet
 * 
 * This file contains all network-specific settings including:
 * - RPC endpoints
 * - Token mint addresses (USDC, CASH)
 * - Switchboard oracle program IDs
 * - Explorer URLs
 * - Network metadata
 */

export type NetworkType = 'devnet' | 'mainnet';

export interface NetworkConfig {
  name: string;
  displayName: string;
  rpcUrl: string;
  cluster: 'devnet' | 'mainnet-beta';
  explorerUrl: string;
  
  // Token mint addresses
  tokens: {
    usdc: {
      mint: string;
      decimals: number;
      symbol: string;
    };
    cash?: {
      mint: string;
      decimals: number;
      symbol: string;
    };
  };
  
  // Switchboard Oracle Configuration
  switchboard: {
    programId: string;
    feedAddress: string; // SOL/USD price feed
  };
  
  // Safety limits
  limits: {
    maxSinglePayment: number; // Maximum USDC/CASH per transaction
    warningThreshold: number; // Show warning above this amount
  };
  
  // Visual indicators
  ui: {
    badgeColor: string;
    warningEnabled: boolean;
  };
}

// ============================================
// DEVNET CONFIGURATION
// ============================================
export const DEVNET_CONFIG: NetworkConfig = {
  name: 'devnet',
  displayName: 'Devnet',
  rpcUrl: process.env.NEXT_PUBLIC_DEVNET_RPC || 'https://api.devnet.solana.com',
  cluster: 'devnet',
  explorerUrl: 'https://solscan.io',
  
  tokens: {
    usdc: {
      // Devnet USDC mint (test tokens) - Official SPL Token Faucet USDC
      mint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
      decimals: 6,
      symbol: 'USDC',
    },
    // CASH not available on devnet
  },
  
  switchboard: {
    // Switchboard V2 Devnet Program
    programId: 'SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f',
    // SOL/USD Price Feed on Devnet
    feedAddress: 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR',
  },
  
  limits: {
    maxSinglePayment: 100, // 100 USDC max on devnet (test tokens)
    warningThreshold: 10,
  },
  
  ui: {
    badgeColor: 'orange',
    warningEnabled: false,
  },
};

// ============================================
// MAINNET CONFIGURATION
// ============================================
export const MAINNET_CONFIG: NetworkConfig = {
  name: 'mainnet',
  displayName: 'Mainnet',
  // Use Helius or other premium RPC for mainnet reliability
  rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC || 'https://api.mainnet-beta.solana.com',
  cluster: 'mainnet-beta',
  explorerUrl: 'https://solscan.io',
  
  tokens: {
    usdc: {
      // Official USDC mint on Mainnet
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
      symbol: 'USDC',
    },
    cash: {
      // CASH token mint on Mainnet (verify this address!)
      mint: 'CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT',
      decimals: 6,
      symbol: 'CASH',
    },
  },
  
  switchboard: {
    // Switchboard V2 Mainnet Program
    programId: 'SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f',
    // SOL/USD Price Feed on Mainnet
    feedAddress: 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR',
  },
  
  limits: {
    maxSinglePayment: 0.001, // 0.001 USDC/CASH max per transaction (SAFETY LIMIT)
    warningThreshold: 0.0001, // Warn above 0.0001 USDC
  },
  
  ui: {
    badgeColor: 'green',
    warningEnabled: true,
  },
};

// ============================================
// NETWORK SELECTION
// ============================================

/**
 * Get the current network configuration based on environment variable
 * Defaults to devnet for safety
 */
export function getCurrentNetwork(): NetworkConfig {
  const networkEnv = (process.env.NEXT_PUBLIC_NETWORK || 'devnet').toLowerCase();
  
  if (networkEnv === 'mainnet') {
    console.warn('🚨 MAINNET MODE ACTIVE - REAL FUNDS WILL BE USED! 🚨');
    return MAINNET_CONFIG;
  }
  
  console.log('🧪 Devnet mode active - using test tokens');
  return DEVNET_CONFIG;
}

/**
 * Check if currently on mainnet
 */
export function isMainnet(): boolean {
  return getCurrentNetwork().name === 'mainnet';
}

/**
 * Check if currently on devnet
 */
export function isDevnet(): boolean {
  return getCurrentNetwork().name === 'devnet';
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerUrl(signature: string, type: 'tx' | 'address' = 'tx'): string {
  const network = getCurrentNetwork();
  const cluster = network.cluster === 'mainnet-beta' ? '' : `?cluster=${network.cluster}`;
  
  if (type === 'tx') {
    return `${network.explorerUrl}/tx/${signature}${cluster}`;
  } else {
    return `${network.explorerUrl}/address/${signature}${cluster}`;
  }
}

/**
 * Get token mint address for payment method
 */
export function getTokenMint(paymentMethod: 'usdc' | 'cash'): string {
  const network = getCurrentNetwork();
  
  if (paymentMethod === 'cash') {
    if (!network.tokens.cash) {
      throw new Error(`CASH token not available on ${network.displayName}`);
    }
    return network.tokens.cash.mint;
  }
  
  return network.tokens.usdc.mint;
}

/**
 * Validate payment amount against network limits
 */
export function validatePaymentAmount(amount: number): { valid: boolean; error?: string; warning?: string } {
  const network = getCurrentNetwork();
  
  if (amount > network.limits.maxSinglePayment) {
    return {
      valid: false,
      error: `Payment amount ${amount} exceeds maximum allowed ${network.limits.maxSinglePayment} on ${network.displayName}`,
    };
  }
  
  if (network.ui.warningEnabled && amount > network.limits.warningThreshold) {
    return {
      valid: true,
      warning: `⚠️ You are about to spend ${amount} USDC on MAINNET (real money!)`,
    };
  }
  
  return { valid: true };
}

/**
 * Get network display info for UI
 */
export function getNetworkDisplayInfo() {
  const network = getCurrentNetwork();
  return {
    name: network.displayName,
    color: network.ui.badgeColor,
    isMainnet: network.name === 'mainnet',
    showWarning: network.ui.warningEnabled,
  };
}

// Export current network as default
export const CURRENT_NETWORK = getCurrentNetwork();
