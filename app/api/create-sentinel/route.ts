import { NextRequest, NextResponse } from 'next/server';
import { SentinelConfig } from '@/types';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { threshold, condition, discordWebhook, paymentMethod = 'usdc', network = 'devnet', userId } = body;

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

    if (paymentMethod !== 'usdc' && paymentMethod !== 'cash') {
      return NextResponse.json(
        { success: false, error: 'Invalid payment method. Must be "usdc" or "cash".' },
        { status: 400 }
      );
    }

    // Using the provided wallet for testing
    const publicKey = '2JJesYGBgDTFkgBGfJG6srKekK2RiVeYAS8ngeT5ZhKS';
    const privateKey = '5hRPQjuibgFZS1cQqt9TatgcWQhbhLrrtbJjgVBTM7m7F4Jq9opvAugWPQkw8MEe56bNish2GxPWAxRpAmWmkvix';

    // Create Sentinel configuration
    const sentinelConfig: SentinelConfig = {
      id: randomUUID(),
      userId,
      walletAddress: publicKey,
      privateKey: privateKey,
      threshold,
      condition,
      discordWebhook,
      paymentMethod, // Include payment method (defaults to 'usdc')
      network, // Include network (defaults to 'devnet')
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
