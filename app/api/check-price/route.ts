import { NextRequest, NextResponse } from 'next/server';
import { runSentinelCheck } from '@/lib/sentinel';
import { SentinelConfig } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const sentinelConfig: SentinelConfig = body;

    // Validate that we have a valid config
    if (!sentinelConfig || !sentinelConfig.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid sentinel configuration.' },
        { status: 400 }
      );
    }

    // Run the sentinel check
    const activity = await runSentinelCheck(sentinelConfig);

    // Return success response with activity
    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error('Error running sentinel check:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run sentinel check.' },
      { status: 500 }
    );
  }
}
