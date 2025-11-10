import { NextResponse } from 'next/server';
import { getOraclePublicKey } from '@/lib/treasury';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const debug = searchParams.get('debug');
    
    const oracleAddress = getOraclePublicKey();
    
    // Debug mode: show localStorage contents
    if (debug === 'true') {
      // This will be empty on server, but useful for client-side debugging
      return NextResponse.json({
        success: true,
        oracleAddress: oracleAddress.toString(),
        message: 'Debug mode - check browser console for localStorage data',
        instructions: [
          'Open browser console (F12)',
          'Run: localStorage.getItem("sentinel_agent_sentinels")',
          'This will show all stored sentinels',
          'Check the "network" field of each sentinel',
        ],
      });
    }
    
    return NextResponse.json({
      success: true,
      oracleAddress: oracleAddress.toString(),
      message: 'This is the wallet address that will receive payments from sentinels',
      tip: 'Add ?debug=true to see localStorage debug info',
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get oracle address' 
      },
      { status: 500 }
    );
  }
}
