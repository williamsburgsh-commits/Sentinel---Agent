/**
 * CoinMarketCap API integration for SOL/USD price feeds
 * Includes in-memory caching to avoid rate limits
 */

interface CachedPrice {
  price: number;
  timestamp: number;
}

interface CoinMarketCapResponse {
  data: {
    [key: string]: {
      quote: {
        USD: {
          price: number;
          last_updated: string;
        };
      };
    };
  };
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
  };
}

interface PriceResult {
  success: boolean;
  price?: number;
  error?: string;
  cached?: boolean;
}

// In-memory cache
let priceCache: CachedPrice | null = null;

// Cache duration: 5 minutes (300 seconds)
const CACHE_DURATION_MS = 5 * 60 * 1000;

// Solana's CoinMarketCap ID
const SOLANA_CMC_ID = '5426';

/**
 * Get SOL/USD price from CoinMarketCap API with caching
 * @returns Price result with success flag and price
 */
export async function getSOLPriceCoinMarketCap(): Promise<PriceResult> {
  try {
    // Check cache first
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION_MS) {
      console.log('✅ Using cached CoinMarketCap price:', priceCache.price);
      return {
        success: true,
        price: priceCache.price,
        cached: true,
      };
    }

    // Get API key from environment
    const apiKey = process.env.COINMARKETCAP_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ COINMARKETCAP_API_KEY not configured');
      return {
        success: false,
        error: 'CoinMarketCap API key not configured',
      };
    }

    console.log('🔄 Fetching SOL price from CoinMarketCap...');

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${SOLANA_CMC_ID}&convert=USD`,
        {
          method: 'GET',
          headers: {
            'X-CMC_PRO_API_KEY': apiKey,
            'Accept': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ CoinMarketCap API error:', response.status, errorText);
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          return {
            success: false,
            error: 'CoinMarketCap rate limit exceeded',
          };
        }
        
        return {
          success: false,
          error: `CoinMarketCap API returned status ${response.status}`,
        };
      }

      const data: CoinMarketCapResponse = await response.json();

      // Check for API-level errors
      if (data.status.error_code !== 0) {
        console.error('❌ CoinMarketCap API error:', data.status.error_message);
        return {
          success: false,
          error: data.status.error_message || 'Unknown CoinMarketCap API error',
        };
      }

      // Extract price from response
      const solanaData = data.data[SOLANA_CMC_ID];
      if (!solanaData || !solanaData.quote || !solanaData.quote.USD) {
        console.error('❌ Invalid CoinMarketCap response structure:', data);
        return {
          success: false,
          error: 'Invalid response structure from CoinMarketCap',
        };
      }

      const price = solanaData.quote.USD.price;
      
      if (typeof price !== 'number' || price <= 0) {
        console.error('❌ Invalid price from CoinMarketCap:', price);
        return {
          success: false,
          error: 'Invalid price value from CoinMarketCap',
        };
      }

      // Update cache
      priceCache = {
        price,
        timestamp: Date.now(),
      };

      console.log('✅ SOL price from CoinMarketCap:', price);
      return {
        success: true,
        price,
        cached: false,
      };

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.warn('⏱️ CoinMarketCap API request timed out after 5 seconds');
        return {
          success: false,
          error: 'CoinMarketCap API request timeout',
        };
      }
      
      console.error('❌ CoinMarketCap fetch error:', fetchError);
      return {
        success: false,
        error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
      };
    }

  } catch (error) {
    console.error('❌ Unexpected error in getSOLPriceCoinMarketCap:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    };
  }
}

/**
 * Clear the price cache (useful for testing or manual refresh)
 */
export function clearPriceCache(): void {
  priceCache = null;
  console.log('🗑️ CoinMarketCap price cache cleared');
}

/**
 * Get cache status information
 */
export function getCacheStatus(): { cached: boolean; age?: number; price?: number } {
  if (!priceCache) {
    return { cached: false };
  }
  
  const age = Date.now() - priceCache.timestamp;
  const expired = age >= CACHE_DURATION_MS;
  
  return {
    cached: !expired,
    age: Math.floor(age / 1000), // age in seconds
    price: priceCache.price,
  };
}
