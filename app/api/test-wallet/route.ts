import { NextResponse } from 'next/server';
import { getOraclePublicKey } from '@/lib/treasury';

export async function GET() {
  try {
    const oracleKey = getOraclePublicKey();
    const address = oracleKey.toBase58();
    
    return NextResponse.json({
      success: true,
      paymentRecipient: address,
      isYourWallet: address === '6wWBskoWAGy8eW3WDDYf7tmtVArPeQZLmUqE7ipw56Be',
      message: address === '6wWBskoWAGy8eW3WDDYf7tmtVArPeQZLmUqE7ipw56Be' 
        ? '✅ Payments will go to YOUR wallet!' 
        : '❌ WARNING: Payments going to different wallet!',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
