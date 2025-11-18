/**
 * Application Startup Initialization
 * 
 * This module runs validation checks on startup to ensure
 * required services are properly configured.
 */

import { validateCDPOnStartup } from './cdp-client';

/**
 * Run all startup validations
 * Call this in API routes or server components to validate configuration
 */
export function validateStartup(): void {
  console.log('🚀 Starting Sentinel Agent...');
  console.log('📋 Validating configuration...');
  
  // Validate Solana network configuration
  const network = process.env.NEXT_PUBLIC_NETWORK || 'devnet';
  console.log(`📡 Network: ${network}`);
  
  if (network === 'mainnet') {
    console.warn('⚠️  MAINNET MODE - Real funds will be used!');
  }
  
  // Validate RPC endpoint
  const rpcUrl = network === 'mainnet' 
    ? process.env.NEXT_PUBLIC_MAINNET_RPC 
    : process.env.NEXT_PUBLIC_DEVNET_RPC;
  
  if (!rpcUrl) {
    console.error(`❌ Missing RPC endpoint for ${network}`);
    console.error(`   Set NEXT_PUBLIC_${network.toUpperCase()}_RPC in .env.local`);
  } else {
    console.log(`✅ RPC endpoint configured`);
  }
  
  // Validate payment recipient
  if (!process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET) {
    console.error('❌ NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET not set');
    console.error('   Payment functionality will not work');
  } else {
    console.log('✅ Payment recipient configured');
  }
  
  // Validate CoinMarketCap (required for price feeds)
  if (!process.env.COINMARKETCAP_API_KEY) {
    console.error('❌ COINMARKETCAP_API_KEY not set');
    console.error('   Price feeds will fall back to simulated data');
  } else {
    console.log('✅ CoinMarketCap API key configured');
  }
  
  // Validate DeepSeek (optional)
  if (!process.env.DEEPSEEK_API_KEY) {
    console.warn('⚠️  DEEPSEEK_API_KEY not set (optional)');
    console.warn('   AI analysis will use fallback messages');
  } else {
    console.log('✅ DeepSeek API key configured');
  }
  
  // Validate CDP configuration
  validateCDPOnStartup();
  
  console.log('✅ Startup validation complete\n');
}

/**
 * Get configuration summary for debugging
 */
export function getConfigSummary() {
  return {
    network: process.env.NEXT_PUBLIC_NETWORK || 'devnet',
    rpcConfigured: !!(
      process.env.NEXT_PUBLIC_NETWORK === 'mainnet' 
        ? process.env.NEXT_PUBLIC_MAINNET_RPC 
        : process.env.NEXT_PUBLIC_DEVNET_RPC
    ),
    paymentRecipientConfigured: !!process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET,
    coinmarketcapConfigured: !!process.env.COINMARKETCAP_API_KEY,
    deepseekConfigured: !!process.env.DEEPSEEK_API_KEY,
    cdpConfigured: !!(
      process.env.CDP_API_KEY && 
      process.env.CDP_API_SECRET && 
      process.env.CDP_PROJECT_ID
    ),
  };
}
