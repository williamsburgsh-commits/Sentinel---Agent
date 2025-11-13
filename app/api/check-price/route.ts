import { NextRequest, NextResponse } from 'next/server';
import { getSOLPrice } from '@/lib/switchboard';
import { verifyUSDCPayment } from '@/lib/payments';
import { getOraclePublicKey } from '@/lib/treasury';

import { isMainnet } from '@/lib/networks';

// Payment configuration
const PAYMENT_AMOUNT = 0.0003; // 0.0003 USDC/CASH per price check
const PAYMENT_TOKEN = isMainnet() ? 'CASH' : 'USDC'; // Use CASH on Mainnet, USDC on Devnet

interface PriceResponse {
  price: number;
  timestamp: number;
  source: string;
  currency: string;
  paid: boolean;
  txSignature?: string;
}

interface PaymentRequiredResponse {
  amount: number;
  recipient: string;
  token: string;
  message: string;
}

/**
 * Verify if the payment proof is valid
 */
async function verifyPayment(proof: string): Promise<boolean> {
  try {
    return await verifyUSDCPayment(proof);
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
}

/**
 * Get the current price with payment verification
 */
async function getPriceWithPayment(txSignature?: string): Promise<PriceResponse> {
  // If no payment proof, return payment required
  if (!txSignature) {
    throw new Error('Payment required');
  }

  // Verify the payment
  const isPaymentValid = await verifyPayment(txSignature);
  if (!isPaymentValid) {
    throw new Error('Invalid payment proof');
  }

  // Get the current price
  const price = await getSOLPrice();
  
  return {
    price,
    timestamp: Math.floor(Date.now() / 1000),
    source: 'switchboard',
    currency: 'USD',
    paid: true,
    txSignature
  };
}

export async function GET(request: NextRequest) {
  const paymentProof = request.headers.get('x-payment-proof');
  const recipientWallet = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET || getOraclePublicKey().toString();
  
  try {
    // Try to get price with payment verification
    const priceData = await getPriceWithPayment(paymentProof || undefined);
    
    return NextResponse.json(priceData);
    
  } catch (error) {
    console.log('Payment required or verification failed:', error);
    
    // Prepare payment required response
    const paymentResponse: PaymentRequiredResponse = {
      amount: PAYMENT_AMOUNT,
      recipient: recipientWallet,
      token: PAYMENT_TOKEN,
      message: 'Payment required to access price data'
    };
    
    // Create response with 402 status
    return new NextResponse(JSON.stringify(paymentResponse), {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Solana-Payment',
        'X-Payment-Required': PAYMENT_AMOUNT.toString(),
        'X-Payment-Token': PAYMENT_TOKEN,
        'X-Payment-Recipient': recipientWallet
      }
    });
  }
}

export async function POST(request: NextRequest) {
  const paymentProof = request.headers.get('x-payment-proof');
  const recipientWallet = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_WALLET || getOraclePublicKey().toString();
  
  try {
    // First verify payment
    const priceData = await getPriceWithPayment(paymentProof || undefined);
    
    // If we get here, payment is valid
    return NextResponse.json({
      success: true,
      data: priceData,
      message: 'Payment verified, sentinel check completed'
    });
    
  } catch (error) {
    console.log('Payment required or verification failed:', error);
    
    // Prepare payment required response
    const paymentResponse: PaymentRequiredResponse = {
      amount: PAYMENT_AMOUNT,
      recipient: recipientWallet,
      token: PAYMENT_TOKEN,
      message: 'Payment required to access sentinel data'
    };
    
    // Create response with 402 status
    return new NextResponse(JSON.stringify(paymentResponse), {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Solana-Payment',
        'X-Payment-Required': PAYMENT_AMOUNT.toString(),
        'X-Payment-Token': PAYMENT_TOKEN,
        'X-Payment-Recipient': recipientWallet
      }
    });
  }
}
