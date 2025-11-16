import { NextRequest, NextResponse } from 'next/server';
import { getSOLPrice } from '@/lib/switchboard';
import { verifyUSDCPayment } from '@/lib/payments';
import { sendDiscordAlert } from '@/lib/notifications';
import { SentinelConfig } from '@/types';

/**
 * HTTP 402 Payment Protocol Configuration
 */
const PAYMENT_AMOUNT = 0.0003; // 0.0003 CASH per check
const PAYMENT_TOKEN = 'CASH';

/**
 * GET /api/check-price
 * Returns current SOL price without payment requirement (for display purposes)
 */
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

/**
 * POST /api/check-price
 * Implements HTTP 402 Payment Required protocol
 * 
 * Flow:
 * 1. Check for X-Payment-Proof header
 * 2. If not present: return 402 with payment details
 * 3. If present: verify payment and return price data
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 ========== POST /api/check-price ==========');
    
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

    // Check for payment proof header
    const paymentProof = request.headers.get('X-Payment-Proof');
    console.log('🔑 X-Payment-Proof header:', paymentProof ? 'Present' : 'Not present');

    // Step 1: If no payment proof, return 402 Payment Required
    if (!paymentProof) {
      console.log('💳 No payment proof - returning 402 Payment Required');
      
      // Get payment recipient from environment
      const recipient = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET;
      
      if (!recipient) {
        console.error('❌ NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET not configured');
        return NextResponse.json({
          success: false,
          error: 'Payment recipient not configured',
        });
      }

      console.log('💰 Payment details:');
      console.log('   - Amount:', PAYMENT_AMOUNT, PAYMENT_TOKEN);
      console.log('   - Recipient:', recipient);
      console.log('   - Token:', PAYMENT_TOKEN);

      // Return 402 with payment details
      const response = NextResponse.json(
        {
          amount: PAYMENT_AMOUNT,
          recipient,
          token: PAYMENT_TOKEN,
          message: 'Payment required to access price data',
        },
        { status: 402 }
      );

      // Add payment-related headers
      response.headers.set('WWW-Authenticate', 'Solana-Payment');
      response.headers.set('X-Payment-Required', PAYMENT_AMOUNT.toString());
      response.headers.set('X-Payment-Token', PAYMENT_TOKEN);

      return response;
    }

    // Step 2: Payment proof provided, verify it
    console.log('✅ Payment proof provided, verifying...');
    console.log('🔗 Transaction signature:', paymentProof);

    const isPaymentValid = await verifyUSDCPayment(paymentProof);
    
    if (!isPaymentValid) {
      console.error('❌ Payment verification failed');
      return NextResponse.json(
        {
          amount: PAYMENT_AMOUNT,
          recipient: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET,
          token: PAYMENT_TOKEN,
          message: 'Payment verification failed',
          error: 'The provided transaction signature could not be verified. Please ensure the payment was sent correctly.',
        },
        { status: 402 }
      );
    }

    console.log('✅ Payment verified successfully!');

    // Step 3: Fetch price data
    console.log('📊 Fetching price data from oracle...');
    const currentPrice = await getSOLPrice();
    console.log('💵 Current SOL price: $', currentPrice);

    // Step 4: Check if threshold condition is met
    let triggered = false;
    if (sentinelConfig.condition === 'above' && currentPrice > sentinelConfig.threshold) {
      triggered = true;
      console.log(`🚨 Alert triggered! Price ${currentPrice} is above threshold ${sentinelConfig.threshold}`);
    } else if (sentinelConfig.condition === 'below' && currentPrice < sentinelConfig.threshold) {
      triggered = true;
      console.log(`🚨 Alert triggered! Price ${currentPrice} is below threshold ${sentinelConfig.threshold}`);
    } else {
      console.log(`✅ No alert. Price ${currentPrice} is within threshold.`);
    }

    // Step 4.5: Send Discord alert if triggered and webhook configured
    if (triggered && sentinelConfig.discordWebhook) {
      try {
        const alertTitle = sentinelConfig.condition === 'above'
          ? 'Price Above Threshold Alert'
          : 'Price Below Threshold Alert';

        console.log('📢 Sending Discord alert...');
        await sendDiscordAlert(
          sentinelConfig.discordWebhook,
          alertTitle,
          currentPrice,
          sentinelConfig.threshold,
          new Date()
        );
        console.log('✅ Discord alert sent successfully');
      } catch (error) {
        console.error('❌ Failed to send Discord alert:', error);
        // Continue execution even if alert fails
      }
    }

    // Step 5: Return success response with price data
    const timestamp = new Date();
    const activity = {
      timestamp,
      price: currentPrice,
      cost: PAYMENT_AMOUNT,
      triggered,
      transactionSignature: paymentProof,
      status: 'success' as const,
      paymentMethod: sentinelConfig.paymentMethod || 'cash',
      settlementTimeMs: undefined, // Calculated by client
    };

    console.log('✅ Returning price data with payment confirmation');
    console.log('🎉 ========== REQUEST COMPLETE ==========');

    // Return 200 with price data
    return NextResponse.json({
      price: currentPrice,
      timestamp: timestamp.getTime(),
      source: 'oracle',
      currency: 'USD',
      paid: true,
      txSignature: paymentProof,
      success: true,
      activity,
    });
  } catch (error) {
    console.error('❌ Error in check-price endpoint:', error);
    
    // Return error details in response (always 200 with success: false)
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to process request.';
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
    });
  }
}
