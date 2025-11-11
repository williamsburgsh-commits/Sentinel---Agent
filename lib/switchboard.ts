import { AggregatorAccount, SwitchboardProgram } from '@switchboard-xyz/solana.js';
import { PublicKey } from '@solana/web3.js';
import { getSolanaConnection } from './solana';
import { getCurrentNetwork } from './networks';
import { getSOLPriceCoinMarketCap } from './coinmarketcap';

/**
 * Get the current SOL/USD price from multiple sources with fallback chain
 * Priority: CoinMarketCap -> Switchboard -> CoinGecko -> Simulated
 * @returns The current SOL price in USD
 */
export async function getSOLPrice(): Promise<number> {
  try {
    // Try CoinMarketCap API first (primary source with caching)
    console.log('🔄 Attempting to fetch price from CoinMarketCap...');
    const cmcResult = await getSOLPriceCoinMarketCap();
    
    if (cmcResult.success && cmcResult.price) {
      console.log('✅ SOL price from CoinMarketCap:', cmcResult.price, cmcResult.cached ? '(cached)' : '(fresh)');
      return cmcResult.price;
    }
    
    console.warn('⚠️ CoinMarketCap failed:', cmcResult.error);
    
    // Fallback to Switchboard oracle
    console.log('🔄 Falling back to Switchboard oracle...');
    try {
      const switchboardPrice = await getSwitchboardPrice();
      if (switchboardPrice > 0) {
        return switchboardPrice;
      }
    } catch (switchboardError) {
      console.warn('❌ Switchboard failed:', switchboardError);
    }
    
    // Second fallback to CoinGecko (deprecated but still available)
    console.log('🔄 Falling back to CoinGecko...');
    try {
      const coinGeckoPrice = await getCoinGeckoPrice();
      if (coinGeckoPrice > 0) {
        return coinGeckoPrice;
      }
    } catch (coinGeckoError) {
      console.warn('❌ CoinGecko failed:', coinGeckoError);
    }
    
    // Final fallback to simulated price
    console.warn('⚠️ All price sources failed, using simulated price');
    return getSimulatedPrice();
  } catch (error) {
    console.warn('❌ Failed to fetch SOL price, using simulated price:', error);
    return getSimulatedPrice();
  }
}

/**
 * Get SOL price from CoinGecko API (deprecated, second fallback)
 * @returns The current SOL price in USD
 */
async function getCoinGeckoPrice(): Promise<number> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
  
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.solana && data.solana.usd) {
        console.log('✅ SOL price from CoinGecko:', data.solana.usd);
        return data.solana.usd;
      }
    }

    console.warn('⚠️ CoinGecko API response not OK, status:', response.status);
    return 0;
  } catch (fetchError) {
    clearTimeout(timeoutId);
    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
      console.warn('⏱️ CoinGecko API request timed out after 3 seconds');
    } else {
      console.warn('❌ CoinGecko fetch error:', fetchError);
    }
    return 0;
  }
}

/**
 * Get SOL price from Switchboard oracle (first fallback)
 * @returns The current SOL price in USD
 */
async function getSwitchboardPrice(): Promise<number> {
  try {
    // Get current network configuration
    const network = getCurrentNetwork();
    
    // LOG: Switchboard Configuration
    console.log('🔗 Switchboard Oracle Configuration:');
    console.log('  - Network:', network.name.toUpperCase());
    console.log('  - RPC URL:', network.rpcUrl);
    console.log('  - Program ID:', network.switchboard.programId);
    console.log('  - Feed Address:', network.switchboard.feedAddress);
    
    // Get dynamic connection based on network
    const connection = getSolanaConnection();
    
    // Use network-specific feed address
    const feedAddress = new PublicKey(network.switchboard.feedAddress);
    
    // Initialize Switchboard program
    const program = await SwitchboardProgram.load(connection);
    
    // Load the aggregator account
    const aggregatorAccount = new AggregatorAccount(program, feedAddress);
    
    // Fetch the latest value
    const result = await aggregatorAccount.fetchLatestValue();
    
    if (result) {
      const price = result.toNumber();
      console.log('✅ Switchboard price fetched:', price);
      return price;
    }
    
    // Fallback to simulated price if result is null
    console.warn('⚠️  Switchboard returned null, using simulated price');
    return getSimulatedPrice();
  } catch (error) {
    console.warn('❌ Failed to fetch SOL price from Switchboard, using simulated price:', error);
    return getSimulatedPrice();
  }
}

/**
 * Generate a simulated SOL price for demo purposes
 * @returns A random price around current market price (190-210 range)
 */
function getSimulatedPrice(): number {
  // More realistic price range based on current SOL market price
  return Math.random() * (210 - 190) + 190;
}
