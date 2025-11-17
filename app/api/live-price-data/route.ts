import { NextResponse } from 'next/server';

// Generate fallback price data for graceful degradation
function generateFallbackPriceData() {
  const now = Date.now();
  const basePrice = 150; // Reasonable SOL price
  const activities = [];
  
  // Generate 24 hourly data points (last 24 hours)
  for (let i = 23; i >= 0; i--) {
    const timestamp = now - (i * 60 * 60 * 1000);
    // Add some realistic variation (+/- 5%)
    const variation = (Math.random() - 0.5) * (basePrice * 0.1);
    const price = basePrice + variation;
    
    activities.push({
      price: Math.round(price * 100) / 100,
      created_at: new Date(timestamp).toISOString(),
      triggered: false,
    });
  }
  
  return activities;
}

export async function GET() {
  try {
    console.log('📡 Fetching live SOL price data from CoinGecko...');
    
    // Fetch from CoinGecko API (server-side, no CORS issues)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=1&interval=hourly',
      {
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout to prevent build hangs
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ CoinGecko API returned ${response.status}, using fallback data`);
      const fallbackActivities = generateFallbackPriceData();
      
      return NextResponse.json({
        success: true,
        activities: fallbackActivities,
        count: fallbackActivities.length,
        fallback: true,
        message: 'Using simulated data - CoinGecko API unavailable',
      });
    }

    const data = await response.json();
    
    // Transform to our format
    const activities = data.prices.map((p: [number, number]) => ({
      price: p[1],
      created_at: new Date(p[0]).toISOString(),
      triggered: false,
    }));

    console.log(`✅ Fetched ${activities.length} price points from CoinGecko`);
    console.log(`💰 Price range: ${Math.min(...activities.map((a: { price: number }) => a.price)).toFixed(2)} - ${Math.max(...activities.map((a: { price: number }) => a.price)).toFixed(2)}`);

    return NextResponse.json({
      success: true,
      activities,
      count: activities.length,
      fallback: false,
    });

  } catch (error) {
    // Graceful degradation - return fallback data instead of error
    console.warn('⚠️ Error fetching live price data, using fallback:', error instanceof Error ? error.message : 'Unknown error');
    
    const fallbackActivities = generateFallbackPriceData();
    
    return NextResponse.json({
      success: true,
      activities: fallbackActivities,
      count: fallbackActivities.length,
      fallback: true,
      message: 'Using simulated data - API unavailable during build',
    });
  }
}
