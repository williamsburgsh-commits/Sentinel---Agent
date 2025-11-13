import { AggregatorAccount, SwitchboardProgram } from '@switchboard-xyz/solana.js';
import { PublicKey } from '@solana/web3.js';
import { getSolanaConnection } from './solana';
import { getCurrentNetwork } from './networks';

// CoinMarketCap API configuration
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const COINMARKETCAP_API_URL = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest';

/**
 * Get the current SOL/USD price from CoinMarketCap API
 * @returns The current SOL price in USD
 */
export async function getSOLPrice(): Promise<number> {
  // First try CoinMarketCap if API key is available
  if (COINMARKETCAP_API_KEY) {
    try {
      console.log('🔍 Fetching SOL price from CoinMarketCap...');
      const response = await fetch(
        `${COINMARKETCAP_API_URL}?symbol=SOL&convert=USD`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
            'Accept': 'application/json',
            'Accept-Encoding': 'deflate, gzip',
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(5000), // 5 second timeout
        }
      );

      if (response.ok) {
        const data = await response.json();
        const price = data?.data?.SOL?.[0]?.quote?.USD?.price;
        
        if (price) {
          console.log('✅ SOL price from CoinMarketCap:', price);
          return price;
        }
        console.warn('⚠️ Invalid CoinMarketCap response format:', data);
      } else {
        console.warn('⚠️ CoinMarketCap API error:', response.status, await response.text());
      }
    } catch (error) {
      console.warn('❌ CoinMarketCap fetch error:', error);
    }
  } else {
    console.warn('⚠️ CoinMarketCap API key not configured');
  }
  
  // Fallback to Switchboard if CoinMarketCap fails or no API key
  console.log('🔄 Falling back to Switchboard oracle...');
  try {
    const switchboardPrice = await getSwitchboardPrice();
    if (switchboardPrice) {
      return switchboardPrice;
    }
  } catch (error) {
    console.error('❌ Switchboard fallback failed:', error);
  }
  
  // Final fallback to simulated price
  console.log('⚠️ Using simulated price as last resort');
  return getSimulatedPrice();
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
