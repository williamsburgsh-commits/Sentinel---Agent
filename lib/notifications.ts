/**
 * Send an alert to Discord via webhook
 * @param webhookUrl - Discord webhook URL
 * @param title - Alert title
 * @param currentPrice - Current SOL price
 * @param threshold - Price threshold that was crossed
 * @param timestamp - When the alert was triggered
 * @param customMessage - Optional custom message to add to the alert
 */
export async function sendDiscordAlert(
  webhookUrl: string,
  title: string,
  currentPrice: number,
  threshold: number,
  timestamp: Date,
  customMessage?: string
): Promise<void> {
  const embed = {
    embeds: [
      {
        title: `🚨 ${title}`,
        description: customMessage || 'A price threshold has been crossed!',
        color: 0xff0000, // Red color
        fields: [
          {
            name: '💰 Current Price',
            value: `$${currentPrice.toFixed(2)} USD`,
            inline: true,
          },
          {
            name: '🎯 Threshold',
            value: `$${threshold.toFixed(2)} USD`,
            inline: true,
          },
          {
            name: '📊 Difference',
            value: `${currentPrice > threshold ? '📈' : '📉'} $${Math.abs(currentPrice - threshold).toFixed(2)} USD`,
            inline: true,
          },
        ],
        timestamp: timestamp.toISOString(),
        footer: {
          text: '⚡ Sentinel Price Alert System',
        },
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(embed),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Discord alert sent successfully');
  } catch (error) {
    console.error('❌ Failed to send Discord alert:', error);
    throw error;
  }
}
