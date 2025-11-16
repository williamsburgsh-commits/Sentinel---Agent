/**
 * HTTP 402 Payment Required Client
 * 
 * Implements the client-side logic for HTTP 402 payment protocol
 * Used for pay-per-use oracle price data access
 * 
 * Flow:
 * 1. Make initial request without payment proof
 * 2. Receive 402 response with payment details
 * 3. Send payment using Solana/CASH
 * 4. Retry request with payment proof header
 * 5. Receive 200 response with data
 */

import { Keypair, PublicKey } from '@solana/web3.js';
import { sendCASHPayment, sendUSDCPayment } from './payments';
import { getCurrentNetwork, getAvailableTokens, isDevnet } from './networks';

export interface X402PaymentDetails {
  amount: number;
  recipient: string;
  token: 'CASH' | 'USDC';
  availableTokens?: Array<'USDC' | 'CASH'>;
  message: string;
}

export interface X402Response<T> {
  success: boolean;
  data?: T;
  error?: string;
  paymentDetails?: X402PaymentDetails;
}

/**
 * Make a request with HTTP 402 payment protocol support
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @param payerKeypair - Keypair to use for payment
 * @param paymentMethod - Payment method (usdc or cash)
 * @returns Response data or throws error
 */
export async function fetchWith402<T>(
  url: string,
  options: RequestInit,
  payerKeypair: Keypair,
  paymentMethod: 'usdc' | 'cash' = 'usdc'
): Promise<T> {
  // Get network configuration
  const network = getCurrentNetwork();
  const availableTokens = getAvailableTokens();
  
  console.log('🔄 ========== HTTP 402 PAYMENT FLOW ==========');
  console.log('🌐 Network:', network.displayName.toUpperCase());
  console.log('🪙 Available tokens:', availableTokens.join(', '));
  console.log('💳 Preferred payment method:', paymentMethod.toUpperCase());
  console.log('📍 Step 1: Initial request without payment proof');
  
  try {
    // Step 1: Make initial request without payment proof
    const initialResponse = await fetch(url, options);
    console.log('📥 Response status:', initialResponse.status);
    
    // Step 2: Check if payment is required (402)
    if (initialResponse.status === 402) {
      console.log('💳 Step 2: Payment required (402 received)');
      
      // Parse payment details from response
      const paymentDetails = await initialResponse.json() as X402PaymentDetails;
      console.log('💰 Payment details:', paymentDetails);
      
      // Validate payment details
      if (!paymentDetails.amount || !paymentDetails.recipient || !paymentDetails.token) {
        throw new Error('Invalid payment details in 402 response');
      }
      
      // Determine which token to use based on network and preferences
      let tokenToUse: 'USDC' | 'CASH';
      
      if (isDevnet()) {
        // On devnet, only USDC is available
        tokenToUse = 'USDC';
        console.log('🧪 Devnet detected - forcing USDC payment');
      } else {
        // On mainnet, respect paymentMethod preference if available
        const availableTokensFromServer = paymentDetails.availableTokens || ['USDC'];
        
        if (paymentMethod === 'cash' && availableTokensFromServer.includes('CASH')) {
          tokenToUse = 'CASH';
          console.log('💰 Mainnet - using CASH payment (user preference)');
        } else {
          tokenToUse = 'USDC';
          console.log('💵 Mainnet - using USDC payment');
        }
      }
      
      // Step 3: Send payment
      console.log(`💸 Step 3: Sending ${paymentDetails.amount} ${tokenToUse} payment to ${paymentDetails.recipient}`);
      const recipientPublicKey = new PublicKey(paymentDetails.recipient);
      
      let txSignature: string;
      const paymentStartTime = Date.now();
      
      if (tokenToUse === 'CASH') {
        txSignature = await sendCASHPayment(
          payerKeypair,
          recipientPublicKey,
          paymentDetails.amount
        );
      } else {
        txSignature = await sendUSDCPayment(
          payerKeypair,
          recipientPublicKey,
          paymentDetails.amount
        );
      }
      
      const paymentTime = Date.now() - paymentStartTime;
      console.log('✅ Payment sent successfully!');
      console.log('🪙 Token used:', tokenToUse);
      console.log('🔗 Transaction signature:', txSignature);
      console.log('⚡ Payment time:', paymentTime, 'ms');
      
      // Step 4: Retry request with payment proof header
      console.log('🔄 Step 4: Retrying request with payment proof header');
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-Payment-Proof': txSignature,
          'X-Payment-Token-Used': tokenToUse,
        },
      });
      
      console.log('📥 Retry response status:', retryResponse.status);
      
      // Step 5: Handle retry response
      if (retryResponse.status === 402) {
        // Payment verification failed
        const errorData = await retryResponse.json();
        console.error('❌ Payment verification failed:', errorData);
        throw new Error(errorData.error || 'Payment verification failed');
      }
      
      if (!retryResponse.ok) {
        const errorData = await retryResponse.json();
        console.error('❌ Request failed after payment:', errorData);
        throw new Error(errorData.error || 'Request failed after payment');
      }
      
      const data = await retryResponse.json();
      console.log('✅ Step 5: Success! Received data after payment');
      console.log('🎉 ========== HTTP 402 FLOW COMPLETE ==========');
      
      return data as T;
    }
    
    // No payment required, return data directly
    if (!initialResponse.ok) {
      const errorData = await initialResponse.json();
      throw new Error(errorData.error || 'Request failed');
    }
    
    const data = await initialResponse.json();
    return data as T;
  } catch (error) {
    console.error('❌ HTTP 402 request failed:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('Insufficient')) {
        throw new Error(`Payment failed: ${error.message}`);
      } else if (error.message.includes('Network')) {
        throw new Error(`Network error: ${error.message}`);
      } else if (error.message.includes('verification failed')) {
        throw new Error('Payment verification failed. The oracle rejected your payment. Please check your transaction and try again.');
      } else {
        throw error;
      }
    }
    
    throw new Error('HTTP 402 request failed: Unknown error');
  }
}

export interface CheckPriceResponse {
  price: number;
  timestamp: number;
  source: string;
  currency: string;
  paid: boolean;
  txSignature: string;
  tokenUsed?: 'USDC' | 'CASH';
  success: boolean;
  activity?: {
    timestamp: Date;
    price: number;
    cost: number;
    triggered: boolean;
    transactionSignature: string;
    status: 'success' | 'failed';
    paymentMethod: 'usdc' | 'cash';
    settlementTimeMs?: number;
  };
}

export interface SentinelCheckConfig {
  id: string;
  userId: string;
  walletAddress: string;
  privateKey: string;
  threshold: number;
  condition: 'above' | 'below';
  discordWebhook: string;
  isActive: boolean;
  paymentMethod: 'usdc' | 'cash';
  network: 'devnet' | 'mainnet';
}

/**
 * Helper function specifically for price check endpoint
 * 
 * @param sentinelConfig - Sentinel configuration
 * @param payerKeypair - Keypair for payment
 * @returns Check response with activity data
 */
export async function checkPriceWith402(
  sentinelConfig: SentinelCheckConfig,
  payerKeypair: Keypair
): Promise<CheckPriceResponse> {
  return fetchWith402<CheckPriceResponse>(
    '/api/check-price',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sentinelConfig),
    },
    payerKeypair,
    sentinelConfig.paymentMethod || 'usdc'
  );
}
