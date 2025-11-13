/**
 * Monitoring Service
 * 
 * Centralized service to manage active sentinel monitoring
 * Runs price checks at regular intervals for active sentinels
 */

import type { Sentinel } from '@/types/data';
import { createActivity } from './data-store';
import { showErrorToast, showSuccessToast } from './toast';
import { Keypair } from '@solana/web3.js';
import { fetchWithX402 } from './x402';
import bs58 from 'bs58';

// Store active monitoring intervals
const monitoringIntervals = new Map<string, NodeJS.Timeout>();

// Check interval: 30 seconds
const CHECK_INTERVAL = 30 * 1000;

/**
 * Start monitoring a sentinel
 */
export async function startMonitoring(sentinel: Sentinel): Promise<void> {
  // Don't start if already monitoring
  if (monitoringIntervals.has(sentinel.id)) {
    console.log(`⏭️ Sentinel ${sentinel.id} is already being monitored`);
    return;
  }

  console.log(`🚀 Starting monitoring for sentinel ${sentinel.id}`);

  // Run first check immediately
  await runCheck(sentinel);

  // Set up interval for subsequent checks
  const interval = setInterval(async () => {
    await runCheck(sentinel);
  }, CHECK_INTERVAL);

  monitoringIntervals.set(sentinel.id, interval);
}

/**
 * Stop monitoring a sentinel
 */
export function stopMonitoring(sentinelId: string): void {
  const interval = monitoringIntervals.get(sentinelId);
  
  if (interval) {
    clearInterval(interval);
    monitoringIntervals.delete(sentinelId);
    console.log(`⏸️ Stopped monitoring sentinel ${sentinelId}`);
  }
}

/**
 * Check if a sentinel is currently being monitored
 */
export function isMonitoring(sentinelId: string): boolean {
  return monitoringIntervals.has(sentinelId);
}

/**
 * Stop all monitoring
 */
export function stopAllMonitoring(): void {
  monitoringIntervals.forEach((interval, sentinelId) => {
    clearInterval(interval);
    console.log(`⏸️ Stopped monitoring sentinel ${sentinelId}`);
  });
  monitoringIntervals.clear();
}

/**
 * Get count of actively monitored sentinels
 */
export function getMonitoringCount(): number {
  return monitoringIntervals.size;
}

/**
 * Run a single price check for a sentinel
 */
async function runCheck(sentinel: Sentinel): Promise<void> {
  try {
    console.log(`🔍 Running check for sentinel ${sentinel.id}`);

    // Create keypair from private key
    const keypair = Keypair.fromSecretKey(bs58.decode(sentinel.private_key));
    
    // Call the API endpoint with X402 payment handling
    const response = await fetchWithX402('/api/check-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: sentinel.id,
        userId: sentinel.user_id,
        walletAddress: sentinel.wallet_address,
        threshold: sentinel.threshold,
        condition: sentinel.condition,
        discordWebhook: sentinel.discord_webhook,
        isActive: true,
        paymentMethod: sentinel.payment_method,
        network: sentinel.network,
      }),
    }, keypair); // Pass the keypair for payment signing

    // Response is already parsed by fetchWithX402
    interface CheckPriceResponse {
      success: boolean;
      error?: string;
      activity?: {
        price: number;
        cost?: number;
        transactionSignature?: string;
        txSignature?: string;
        status?: string;
        triggered?: boolean;
        settlementTimeMs?: number;
      };
    }
    const result = response as CheckPriceResponse;

    if (!result.success) {
      throw new Error(result.error || 'Check failed');
    }

    // Save activity to local storage
    if (result.activity) {
      const activity = result.activity;
      const activityData = {
        price: activity.price || 0,
        cost: activity.cost || 0.0003, // Default cost if not provided
        transaction_signature: activity.transactionSignature || activity.txSignature,
        payment_method: sentinel.payment_method || 'cash',
        status: activity.status || 'completed',
        triggered: activity.triggered || false,
        settlement_time: activity.settlementTimeMs || Date.now(),
      };

      await createActivity(sentinel.id, sentinel.user_id, activityData);

      console.log(`✅ Check completed for sentinel ${sentinel.id}`, activityData);

      // Show alert if triggered
      if (activity.triggered) {
        showSuccessToast(
          'Price Alert Triggered!',
          `SOL is ${sentinel.condition} $${sentinel.threshold}`
        );
      }
    }
  } catch (error) {
    console.error(`❌ Check failed for sentinel ${sentinel.id}:`, error);
    
    // Extract meaningful error message
    let errorMessage = 'Check failed';
    if (error instanceof Error) {
      // Handle payment specific errors
      if (error.message.includes('payment failed') || error.message.includes('Payment required')) {
        if (error.message.includes('Insufficient')) {
          errorMessage = `Insufficient ${sentinel.payment_method || 'CASH'} balance for payment`;
        } else if (error.message.includes('token account not found') || error.message.includes('AccountNotFound')) {
          errorMessage = `${sentinel.payment_method || 'CASH'} token account not found. Please ensure you have ${sentinel.payment_method || 'CASH'} in your wallet.`;
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = `Payment error: ${error.message}`;
        }
      } else {
        errorMessage = error.message;
      }
    }
    
    // Log failed check with error details
    type ActivityData = {
      price: number;
      cost: number;
      transaction_signature: string;
      payment_method: string;
      status: string;
      triggered: boolean;
      settlement_time: number;
      error?: string;  // Add error as an optional property
    };

    const activityData: ActivityData = {
      price: 0,
      cost: 0.0003, // Standard cost for failed payment attempt
      transaction_signature: '',
      payment_method: sentinel.payment_method || 'cash',
      status: 'failed',
      triggered: false,
      settlement_time: Date.now(),
      error: errorMessage
    };
    
    await createActivity(sentinel.id, sentinel.user_id, activityData);

    // Show error toast
    showErrorToast(
      'Check Failed',
      errorMessage
    );
  }
}
