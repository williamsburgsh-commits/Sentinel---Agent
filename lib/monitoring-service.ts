/**
 * Monitoring Service
 * 
 * Centralized service to manage active sentinel monitoring
 * Runs price checks at regular intervals for active sentinels
 * Uses HTTP 402 payment protocol for price data access
 */

import type { Sentinel } from '@/types/data';
import { createActivity } from './data-store';
import { showErrorToast, showSuccessToast } from './toast';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { checkPriceWith402 } from './x402-client';

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
 * Run a single price check for a sentinel using HTTP 402 protocol
 */
async function runCheck(sentinel: Sentinel): Promise<void> {
  const startTime = Date.now();
  
  try {
    console.log(`🔍 Running HTTP 402 check for sentinel ${sentinel.id}`);

    // Reconstruct sentinel keypair for payment
    const sentinelKeypair = Keypair.fromSecretKey(bs58.decode(sentinel.private_key));
    console.log('🔐 Sentinel wallet:', sentinelKeypair.publicKey.toBase58());

    // Prepare sentinel configuration
    const sentinelConfig = {
      id: sentinel.id,
      userId: sentinel.user_id,
      walletAddress: sentinel.wallet_address,
      privateKey: sentinel.private_key,
      threshold: sentinel.threshold,
      condition: sentinel.condition,
      discordWebhook: sentinel.discord_webhook,
      isActive: true,
      paymentMethod: sentinel.payment_method,
      network: sentinel.network,
    };

    // Use HTTP 402 client to handle payment flow
    console.log('💳 Initiating HTTP 402 payment flow...');
    const data = await checkPriceWith402(sentinelConfig, sentinelKeypair);
    
    const totalTime = Date.now() - startTime;
    console.log(`⚡ Total check time: ${totalTime}ms`);

    // Handle different response formats
    let activity;
    if (data.activity) {
      // Response includes activity object
      activity = data.activity;
      activity.settlementTimeMs = totalTime;
    } else if (data.price !== undefined) {
      // Build activity from response fields
      activity = {
        price: data.price,
        cost: 0.0003,
        triggered: false, // Determined below
        status: 'success',
        transactionSignature: data.txSignature,
        timestamp: new Date(),
        settlementTimeMs: totalTime,
      };
      
      // Check if threshold triggered
      if (sentinel.condition === 'above' && data.price > sentinel.threshold) {
        activity.triggered = true;
      } else if (sentinel.condition === 'below' && data.price < sentinel.threshold) {
        activity.triggered = true;
      }
    } else {
      throw new Error('Invalid response format from check-price endpoint');
    }

    // Save activity to local storage
    await createActivity(sentinel.id, sentinel.user_id, {
      price: activity.price,
      cost: activity.cost,
      triggered: activity.triggered,
      status: activity.status,
      transaction_signature: activity.transactionSignature,
      payment_method: sentinel.payment_method,
      settlement_time: activity.settlementTimeMs,
    });

    console.log(`✅ Check completed for sentinel ${sentinel.id}`, activity);

    // Show alert if triggered
    if (activity.triggered) {
      showSuccessToast(
        'Price Alert Triggered!',
        `SOL is ${sentinel.condition} ${sentinel.threshold}`
      );
    }
  } catch (error) {
    console.error(`❌ Check failed for sentinel ${sentinel.id}:`, error);
    
    // Handle insufficient balance error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isInsufficientBalance = errorMessage.toLowerCase().includes('insufficient');
    
    // Log failed check
    await createActivity(sentinel.id, sentinel.user_id, {
      price: 0,
      cost: 0.0003,
      triggered: false,
      status: 'failed',
      payment_method: sentinel.payment_method,
      error_message: errorMessage,
    });

    // Show error toast with appropriate message
    if (isInsufficientBalance) {
      showErrorToast(
        'Insufficient Balance',
        'Please fund your sentinel wallet to continue monitoring'
      );
      // Auto-pause sentinel on insufficient balance
      stopMonitoring(sentinel.id);
    } else {
      showErrorToast(
        'Check Failed',
        errorMessage
      );
    }
  }
}
