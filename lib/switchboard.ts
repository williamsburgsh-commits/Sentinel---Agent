import { AggregatorAccount, SwitchboardProgram } from '@switchboard-xyz/solana.js';
import { PublicKey } from '@solana/web3.js';
import { getSolanaConnection } from './solana';
import { getCurrentNetwork } from './networks';
/**
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
    console.error('❌ Switchboard fallback failed:', error);
  }
  
  // Final fallback to simulated price
  console.log('⚠️ Using simulated price as last resort');
  return getSimulatedPrice();
}

    const program = await SwitchboardProgram.load(connection);
    
    // Load the aggregator account
    const aggregatorAccount = new AggregatorAccount(program, feedAddress);
    
    // Fetch the latest value
    const result = await aggregatorAccount.fetchLatestValue();
    
    if (result) {
      const price = result.toNumber();
      console.log('✅ Switchboard price fetched:', price);
      return price;
    }
    
    // Fallback to simulated price if result is null
    console.warn('⚠️  Switchboard returned null, using simulated price');
    return getSimulatedPrice();
  } catch (error) {
    console.warn('❌ Failed to fetch SOL price from Switchboard, using simulated price:', error);
    return getSimulatedPrice();
  }
}

/**
 * Generate a simulated SOL price for demo purposes
 * @returns A random price around current market price (190-210 range)
 */
function getSimulatedPrice(): number {
  // More realistic price range based on current SOL market price
  return Math.random() * (210 - 190) + 190;
}
