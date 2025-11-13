import { Keypair, PublicKey } from '@solana/web3.js';
import { sendUSDCPayment, sendCASHPayment } from './payments';
import { isMainnet } from './networks';

export interface PaymentRequiredResponse {
  amount: number;
  recipient: string;
  token: string;
  message: string;
}

export interface PriceResponse {
  price: number;
  timestamp: number;
  source: string;
  currency: string;
  paid: boolean;
  txSignature?: string;
}

/**
 * Make a request with X402 payment handling
 * @param url - The URL to request
 * @param options - Fetch options
 * @param keypair - The keypair to use for payments
 * @param retry - Internal use only, tracks retry attempts
 * @returns The response data
 */
export async function fetchWithX402<T = {
  success: boolean;
  error?: string;
  data?: T;
  activity?: Record<string, unknown>;
}>(
  url: string,
  options: RequestInit = {},
  keypair: Keypair,
  retry = false
): Promise<T> {
  try {
    // Add headers if not present
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If payment required (402)
    if (response.status === 402) {
      if (retry) {
        throw new Error('Payment already attempted but still required');
      }

      const paymentDetails: PaymentRequiredResponse = await response.json();
      console.log('Payment required:', paymentDetails);

      // Process payment - use USDC on Devnet, CASH on Mainnet
      console.log(`Processing payment of ${paymentDetails.amount} ${isMainnet() ? 'CASH' : 'USDC'} to ${paymentDetails.recipient}`);
      
      let txSignature: string;
      
      if (isMainnet()) {
        txSignature = await sendCASHPayment(
          keypair,
          new PublicKey(paymentDetails.recipient),
          paymentDetails.amount
        );
      } else {
        // Use USDC on Devnet
        txSignature = await sendUSDCPayment(
          keypair,
          new PublicKey(paymentDetails.recipient),
          paymentDetails.amount
        );
      }

      console.log('Payment successful, tx:', txSignature);

      // Retry with payment proof
      headers.set('X-Payment-Proof', txSignature);
      return fetchWithX402(url, { ...options, headers }, keypair, true);
    }

    // For non-200 responses, throw an error
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    // Return the response data
    return response.json();
  } catch (error) {
    console.error('X402 fetch error:', error);
    throw error;
  }
}

/**
 * Get the current price with automatic payment handling
 * @param keypair - The keypair to use for payments
 * @returns The price data
 */
export async function getPriceWithX402(keypair: Keypair): Promise<PriceResponse> {
  return fetchWithX402<PriceResponse>('/api/check-price', {
    method: 'GET',
  }, keypair);
}
