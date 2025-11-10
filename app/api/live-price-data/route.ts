import { NextResponse } from 'next/server';

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
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform to our format
    const activities = data.prices.map((p: [number, number]) => ({
      price: p[1],
      created_at: new Date(p[0]).toISOString(),
      triggered: false,
    }));

    console.log(`✅ Fetched ${activities.length} price points`);
    console.log(`💰 Price range: $${Math.min(...activities.map((a: { price: number }) => a.price)).toFixed(2)} - $${Math.max(...activities.map((a: { price: number }) => a.price)).toFixed(2)}`);

    return NextResponse.json({
      success: true,
      activities,
      count: activities.length,
    });

  } catch (error) {
    console.error('❌ Error fetching live price data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch live price data',
      },
      { status: 500 }
    );
  }
}
