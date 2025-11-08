import { SentinelConfig, SentinelActivity } from '../types';
import { getSOLPrice } from './switchboard';
import { sendDiscordAlert } from './notifications';

/**
 * Run a price check for a Sentinel configuration
 * @param config - The Sentinel configuration to check
 * @returns Activity log entry with check results
 */
export async function runSentinelCheck(config: SentinelConfig): Promise<SentinelActivity> {
  const timestamp = new Date();
  const currentPrice = await getSOLPrice();
  const cost = 0.0001; // Cost in SOL for running the check
  
  // Determine if the condition is met
  let triggered = false;
  if (config.condition === 'above' && currentPrice > config.threshold) {
    triggered = true;
  } else if (config.condition === 'below' && currentPrice < config.threshold) {
    triggered = true;
  }
  
  // Send Discord alert if triggered and config is active
  if (triggered && config.isActive) {
    try {
      const alertTitle = config.condition === 'above' 
        ? 'Price Above Threshold Alert' 
        : 'Price Below Threshold Alert';
      
      await sendDiscordAlert(
        config.discordWebhook,
        alertTitle,
        currentPrice,
        config.threshold,
        timestamp
      );
    } catch (error) {
      console.error('Failed to send Discord alert:', error);
      // Continue execution even if alert fails
    }
  }
  
  // Return activity log
  return {
    timestamp,
    price: currentPrice,
    cost,
    triggered,
  };
}
