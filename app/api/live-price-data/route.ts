import { NextResponse } from 'next/server';

// Type definitions for CoinMarketCap API response
interface CoinMarketCapQuote {
  timestamp: string;
  quote: {
    USD: {
      close: number;
    };
  };
}

interface CoinMarketCapResponse {
  data: {
    SOL: Array<{
      quotes: CoinMarketCapQuote[];
    }>;
  };
}

// Prevent static generation and ensure the route is dynamic
export const dynamic = 'force-dynamic';

// Sample fallback data in case API fails
const SAMPLE_DATA = {
  prices: [
    [Date.now() - 86400000, 100],
    [Date.now(), 105]
  ],
  market_caps: [],
  total_volumes: []
};

export async function GET() {
  // In development, use sample data to prevent rate limiting
  const isDev = process.env.NODE_ENV === 'development';
  
  try {
    console.log('📡 Fetching live SOL price data...');
    
    let data;
    if (isDev) {
      console.log('🛠️ Using sample data in development mode');
      data = SAMPLE_DATA;
    } else {
      // Try to fetch from CoinMarketCap API
      const response = await fetch(
        'https://pro-api.coinmarketcap.com/v2/cryptocurrency/ohlcv/historical?symbol=SOL&count=24&interval=1h&convert=USD',
        {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY || '',
            'Accept': 'application/json',
            'Accept-Encoding': 'deflate, gzip',
          },
          cache: 'no-store',
          // Add timeout
          signal: AbortSignal.timeout(5000)
        }
      );

      if (!response.ok) {
        throw new Error(`CoinMarketCap API error: ${response.status}`);
      }
      
      const responseData: CoinMarketCapResponse = await response.json();
      
      // Transform CoinMarketCap response to match expected format
      if (responseData.data?.SOL) {
        const quotes = responseData.data.SOL[0]?.quotes || [];
        data = {
          prices: quotes.map((q) => [
            new Date(q.timestamp).getTime(),
            q.quote.USD.close
          ])
        };
      } else {
        throw new Error('Invalid CoinMarketCap response format');
      }
    }
    
    // Ensure we have valid price data
    if (!data?.prices || !Array.isArray(data.prices) || data.prices.length === 0) {
      console.warn('⚠️ No price data available, using fallback');
      data = SAMPLE_DATA;
    }

    // Transform to our format with proper error handling
    const activities = data.prices
      .filter((p: number[]): p is [number, number] => 
        Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number'
      )
      .map((p: [number, number]) => ({
        price: p[1] || 0,
        created_at: new Date(p[0] || Date.now()).toISOString(),
        triggered: false,
      }));

    console.log(`✅ Fetched ${activities.length} price points`);
    
    if (activities.length > 0) {
      const prices = activities.map(a => a.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      console.log(`💰 Price range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`);
    }

    return NextResponse.json({
      success: true,
      activities,
      count: activities.length,
      isSampleData: isDev,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching live price data:', error);
    
    // Return sample data in production to prevent build failures
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Using fallback data due to error');
      const activities = SAMPLE_DATA.prices
        .filter((p): p is [number, number] => 
          Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number'
        )
        .map((p) => ({
          price: p[1],
          created_at: new Date(p[0]).toISOString(),
          triggered: false,
        }));
      
      return NextResponse.json({
        success: true,
        activities,
        count: activities.length,
        isFallback: true,
        error: error instanceof Error ? error.message : 'Using fallback data'
      });
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch live price data',
      },
      { status: 500 }
    );
  }
}
