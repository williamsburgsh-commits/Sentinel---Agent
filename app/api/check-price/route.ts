import { NextRequest, NextResponse } from 'next/server';
import { runSentinelCheck } from '@/lib/sentinel';
import { getSOLPrice } from '@/lib/switchboard';
import { SentinelConfig } from '@/types';

export async function GET() {
  try {
    // Get the current SOL price
    const price = await getSOLPrice();

    return NextResponse.json({
      success: true,
      price,
    });
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    
    // Return error details in response (always 200 with success: false)
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to fetch SOL price.';
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('Failed to parse request body:', jsonError);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body.',
      });
    }
    
    const sentinelConfig: SentinelConfig = body;

    // Validate that we have a valid config
    if (!sentinelConfig || !sentinelConfig.id) {
      return NextResponse.json({
        success: false,
        error: 'Invalid sentinel configuration.',
      });
    }

    // Run the sentinel check
    const activity = await runSentinelCheck(sentinelConfig);

    // AI Analysis is now on-demand via /api/ai-analysis endpoint
    // Users click "Analyze Now" button and pay 0.04 USDC per analysis

    // Return success response with activity
    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error('Error running sentinel check:', error);
    
    // Return error details in response (always 200 with success: false)
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to run sentinel check.';
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
    });
  }
}
