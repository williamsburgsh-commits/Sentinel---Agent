import { NextRequest, NextResponse } from 'next/server';
import { createSentinelWallet } from '@/lib/solana';
import { SentinelConfig } from '@/types';
import { randomUUID } from 'crypto';
import bs58 from 'bs58';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { threshold, condition, discordWebhook } = body;

    // Validate input
    if (typeof threshold !== 'number' || threshold <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid threshold. Must be a positive number.' },
        { status: 400 }
      );
    }

    if (condition !== 'above' && condition !== 'below') {
      return NextResponse.json(
        { success: false, error: 'Invalid condition. Must be "above" or "below".' },
        { status: 400 }
      );
    }

    if (!discordWebhook || typeof discordWebhook !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid Discord webhook URL.' },
        { status: 400 }
      );
    }

    // Generate new Solana wallet
    const { keypair, publicKey } = createSentinelWallet();
    const privateKey = bs58.encode(keypair.secretKey);

    // Create Sentinel configuration
    const sentinelConfig: SentinelConfig = {
      id: randomUUID(),
      walletAddress: publicKey,
      privateKey: privateKey,
      threshold,
      condition,
      discordWebhook,
      isActive: true,
      createdAt: new Date(),
    };

    // Return success response
    return NextResponse.json({
      success: true,
      sentinel: sentinelConfig,
    });
  } catch (error) {
    console.error('Error creating sentinel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sentinel.' },
      { status: 500 }
    );
  }
}
