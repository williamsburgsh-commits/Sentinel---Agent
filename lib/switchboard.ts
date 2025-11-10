import { AggregatorAccount, SwitchboardProgram } from '@switchboard-xyz/solana.js';
import { PublicKey } from '@solana/web3.js';
import { getSolanaConnection } from './solana';
import { getCurrentNetwork } from './networks';

/**
 * Get the current SOL/USD price from CoinGecko API
 * @returns The current SOL price in USD
 */
export async function getSOLPrice(): Promise<number> {
  try {
    // Try CoinGecko API first (free, no API key needed) with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout (reduced)
    
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
        {
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store', // Disable caching to avoid issues
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
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.warn('⏱️ CoinGecko API request timed out after 3 seconds, using fallback');
      } else {
        console.warn('❌ CoinGecko fetch error:', fetchError);
      }
    }
    
    // Fallback to Switchboard if CoinGecko fails
    console.log('🔄 Falling back to Switchboard oracle...');
    return await getSwitchboardPrice();
  } catch (error) {
    console.warn('❌ Failed to fetch SOL price, using simulated price:', error);
    return getSimulatedPrice();
  }
}

/**
 * Get SOL price from Switchboard oracle (fallback)
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
