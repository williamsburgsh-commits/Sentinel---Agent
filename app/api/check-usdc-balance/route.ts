import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { checkUSDCBalance } from '@/lib/payments';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validate wallet address
    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(walletAddress);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Check USDC balance
    const balance = await checkUSDCBalance(publicKey);

    return NextResponse.json({
      success: true,
      balance,
      walletAddress,
    });
  } catch (error) {
    console.error('Error checking USDC balance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check USDC balance' },
      { status: 500 }
    );
  }
}
