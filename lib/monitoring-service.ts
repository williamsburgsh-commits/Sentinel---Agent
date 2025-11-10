/**
 * Monitoring Service
 * 
 * Centralized service to manage active sentinel monitoring
 * Runs price checks at regular intervals for active sentinels
 */

import type { Sentinel } from '@/types/data';
import { createActivity } from './data-store';
import { showErrorToast, showSuccessToast } from './toast';

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

    // Call the API endpoint to run the check
    const response = await fetch('/api/check-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Check failed');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Check failed');
    }

    // Save activity to local storage
    if (data.activity) {
      await createActivity(sentinel.id, sentinel.user_id, {
        price: data.activity.price,
        cost: data.activity.cost,
        triggered: data.activity.triggered,
        status: data.activity.status,
        transaction_signature: data.activity.transactionSignature,
        payment_method: sentinel.payment_method,
        settlement_time: data.activity.settlementTimeMs,
      });
    }

    console.log(`✅ Check completed for sentinel ${sentinel.id}`, data.activity);

    // Show alert if triggered
    if (data.activity?.triggered) {
      showSuccessToast(
        'Price Alert Triggered!',
        `SOL is ${sentinel.condition} $${sentinel.threshold}`
      );
    }
  } catch (error) {
    console.error(`❌ Check failed for sentinel ${sentinel.id}:`, error);
    
    // Log failed check
    await createActivity(sentinel.id, sentinel.user_id, {
      price: 0,
      cost: 0.0001,
      triggered: false,
      status: 'failed',
      payment_method: sentinel.payment_method,
    });

    // Show error toast
    showErrorToast(
      'Check Failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
